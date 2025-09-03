/**
 * Subscription DB helpers
 *
 * upsertSubscription: idempotently write subscription state from Paddle events or actions.
 * Invariants: subscriptionId is the natural key; keep status and item ids in sync with provider.
 */
import { prisma } from '@/lib/prisma';
import { getTierByPriceId, getTierByProductId } from '@/constants/pricing-tier';

/**
 * SINGLE SUBSCRIPTION ENFORCEMENT SYSTEM
 *
 * This module ensures that customers can only have ONE active subscription at a time.
 * Key principles:
 *
 * 1. HIERARCHICAL PLANS: Starter → Pro → Advanced (levels 1, 2, 3)
 * 2. SINGLE ACTIVE SUBSCRIPTION: When a new subscription becomes active/trialing,
 *    all other active/trialing subscriptions are automatically canceled
 * 3. CURRENT TIER TRACKING: Customer.currentTier field tracks the active plan
 * 4. REAL-TIME UPDATES: Changes are applied immediately, not just via webhooks
 *
 * Behavior note (Paddle defaults):
 * - When plans are swapped (upgrade/downgrade), Paddle applies the new item immediately by default.
 * - Upgrades: billed immediately via proration.
 * - Downgrades: applied immediately (no charge today). We do not defer to period end here.
 *   If you need end-of-term downgrades, store a scheduled change and apply it at renewal.
 */

/**
 * Upsert subscription with SINGLE SUBSCRIPTION ENFORCEMENT
 *
 * This function enforces the business rule that customers can only have one active
 * subscription at a time. When a subscription becomes active or trialing:
 * 1. All other active/trialing subscriptions are canceled
 * 2. Customer's currentTier is updated to reflect the new plan
 * 3. Changes happen immediately (don't wait for webhooks)
 */
export async function upsertSubscription(data: {
  subscriptionId: string;
  subscriptionStatus: string;
  priceId?: string;
  productId?: string;
  scheduledChange?: string | null;
  paddleCustomerId: string;
}) {
  const normalizedStatus = (data.subscriptionStatus || '').toLowerCase();

  // First, find the customer by their Paddle ID
  const customer = await prisma.customer.findUnique({
    where: { paddleCustomerId: data.paddleCustomerId },
    include: { subscriptions: true },
  });

  if (!customer) {
    console.warn(`⚠️ Skipping subscription upsert: No local customer for Paddle ID ${data.paddleCustomerId}`);
    // Customer will be created on CustomerCreated webhook or user login sync
    return null;
  }

  // Determine current tier from price or product ID
  let currentTier: string | null = null;
  if (data.priceId) {
    const tier = getTierByPriceId(data.priceId);
    currentTier = tier?.id || null;
  } else if (data.productId) {
    const tier = getTierByProductId(data.productId);
    currentTier = tier?.id || null;
  }

  // SINGLE SUBSCRIPTION ENFORCEMENT: For active or trialing subscriptions,
  // ensure only one subscription exists per customer
  // IMPORTANT: Do not immediately change the customer's current tier if there is
  // a future scheduled change (e.g., a scheduled downgrade at period end).
  // Determine the effective date of any scheduled change. Prefer incoming payload,
  // but fall back to the existing DB record if not provided (e.g., item downgrade scheduled via app logic).
  const existingRecord = await prisma.subscription.findUnique({
    where: { subscriptionId: data.subscriptionId },
    select: { scheduledChange: true },
  });
  const scheduledEffectiveAtString =
    (data.scheduledChange !== undefined ? data.scheduledChange : existingRecord?.scheduledChange) ?? null;
  const scheduledEffectiveAt: Date | null = scheduledEffectiveAtString ? new Date(scheduledEffectiveAtString) : null;

  const shouldApplyTierNow =
    ['active', 'trialing'].includes(normalizedStatus) &&
    currentTier &&
    (!scheduledEffectiveAt || scheduledEffectiveAt.getTime() <= Date.now());

  if (shouldApplyTierNow) {
    // 1. Cancel all other active/trialing subscriptions for this customer
    await prisma.subscription.updateMany({
      where: {
        customerId: customer.id,
        subscriptionId: { not: data.subscriptionId },
        subscriptionStatus: { in: ['active', 'trialing'] },
      },
      data: {
        subscriptionStatus: 'canceled',
        updatedAt: new Date(),
      },
    });

    // 2. Update customer's current tier to reflect their new active plan
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        currentTier,
        updatedAt: new Date(),
      },
    });
  }

  // If subscription is being canceled or paused, clear the tier if it matches
  if (['canceled', 'paused'].includes(normalizedStatus)) {
    const existingSubscription = await prisma.subscription.findUnique({
      where: { subscriptionId: data.subscriptionId },
    });

    // Determine the tier associated with this subscription from payload or existing record
    let tierToCompare: string | null = null;
    if (currentTier) {
      tierToCompare = currentTier;
    } else if (existingSubscription?.priceId) {
      const tierFromExisting = getTierByPriceId(existingSubscription.priceId);
      tierToCompare = tierFromExisting?.id || null;
    } else if (existingSubscription?.productId) {
      const tierFromExisting = getTierByProductId(existingSubscription.productId);
      tierToCompare = tierFromExisting?.id || null;
    }

    if (tierToCompare && customer.currentTier === tierToCompare) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          currentTier: null,
          updatedAt: new Date(),
        },
      });
    }
  }

  return await prisma.subscription.upsert({
    where: {
      subscriptionId: data.subscriptionId,
    },
    update: {
      subscriptionStatus: normalizedStatus,
      priceId: data.priceId,
      productId: data.productId,
      scheduledChange: data.scheduledChange,
      customerId: customer.id,
      updatedAt: new Date(),
    },
    create: {
      subscriptionId: data.subscriptionId,
      subscriptionStatus: normalizedStatus,
      priceId: data.priceId,
      productId: data.productId,
      scheduledChange: data.scheduledChange,
      customerId: customer.id,
    },
  });
}

export async function getSubscriptionsByCustomerId(customerId: string) {
  return await prisma.subscription.findMany({
    where: {
      customerId,
    },
    include: {
      customer: true,
    },
  });
}

export async function getSubscriptionById(subscriptionId: string) {
  return await prisma.subscription.findUnique({
    where: {
      subscriptionId,
    },
    include: {
      customer: true,
    },
  });
}

// Get the active subscription for a customer
export async function getActiveSubscriptionByCustomerId(customerId: string) {
  return await prisma.subscription.findFirst({
    where: {
      customerId,
      subscriptionStatus: 'active',
    },
    include: {
      customer: true,
    },
  });
}

// Get customer with their current tier
export async function getCustomerWithTier(paddleCustomerId: string) {
  return await prisma.customer.findUnique({
    where: { paddleCustomerId },
    include: {
      user: true,
      subscriptions: {
        where: { subscriptionStatus: { in: ['active', 'trialing'] } },
      },
    },
  });
}

// Update customer's current tier based on subscription
export async function updateCustomerTier(paddleCustomerId: string, priceId?: string, productId?: string) {
  let currentTier: string | null = null;

  if (priceId) {
    const tier = getTierByPriceId(priceId);
    currentTier = tier?.id || null;
  } else if (productId) {
    const tier = getTierByProductId(productId);
    currentTier = tier?.id || null;
  }

  if (currentTier) {
    const customer = await prisma.customer.findUnique({
      where: { paddleCustomerId },
    });

    if (customer) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          currentTier,
          updatedAt: new Date(),
        },
      });
      console.log(`✅ Updated customer ${paddleCustomerId} tier to: ${currentTier}`);
      return currentTier;
    }
  }

  return null;
}

/**
 * HIERARCHICAL SUBSCRIPTION MANAGEMENT UTILITIES
 *
 * These functions support the single-subscription model where customers can only have
 * one active plan at a time, with plans organized in a hierarchy.
 */
