/**
 * Subscription Server Actions (plan change, cancel, resume, preview)
 *
 * Preconditions: Clerk session required; ownership checks enforced against Paddle customerId
 * Side effects: calls Paddle API, syncs local DB, sends emails, revalidates paths
 * Notes: Follows Paddle-default immediate swap semantics (see docs/guides/subscription-plan-changes.md)
 */
'use server';

import { validateUserSession } from '@/utils/database/auth';
import { upsertSubscription } from '@/utils/database/subscription';
import { Subscription } from '@paddle/paddle-node-sdk';
import { revalidatePath } from 'next/cache';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';
import { getTierByPriceId, compareTierHierarchy } from '@/constants/pricing-tier';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { sendPlanChangeEmail, sendPlanCancellationEmail, sendPlanResumeEmail } from '@/utils/email/send-email';
import { parseMoney } from '@/utils/paddle/parse-money';

const paddle = getPaddleInstance();

interface Error {
  error: string;
}

// ==== Internal helpers ====
async function getCurrentCustomerPaddleId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { clerkUserId: userId }, include: { customer: true } });
  return user?.customer?.paddleCustomerId ?? null;
}

async function getOwnedSubscriptionOrError(subscriptionId: string): Promise<{ subscription: Subscription } | Error> {
  const currentCustomerId = await getCurrentCustomerPaddleId();
  const current = await paddle.subscriptions.get(subscriptionId);
  if (!current) return { error: 'Subscription not found' };
  if (!currentCustomerId || current.customerId !== currentCustomerId) {
    return { error: 'Unauthorized: subscription does not belong to the current user' };
  }
  return { subscription: current as unknown as Subscription };
}

async function revalidateAllSubscriptionViews(): Promise<void> {
  revalidatePath('/dashboard/subscriptions');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/subscriptions/[subscriptionId]', 'page');
}

// NOTE: Avoid double invalidation. The API at /dashboard/subscriptions/force-refresh
// also revalidates paths, but calling both is redundant. Prefer local revalidatePath calls.

/**
 * Cancel subscription at the end of the current billing period
 * This schedules the cancellation but allows the user to resume before it takes effect
 */
export async function cancelSubscription(subscriptionId: string): Promise<Subscription | Error> {
  console.log('🚫 Canceling subscription', subscriptionId);
  try {
    await validateUserSession();

    // Ownership check: ensure the subscription belongs to the current user's customer
    const owned = await getOwnedSubscriptionOrError(subscriptionId);
    if ('error' in owned) return owned;

    const subscription = await paddle.subscriptions.cancel(subscriptionId, { effectiveFrom: 'next_billing_period' });

    if (subscription) {
      // UPDATE LOCAL DATABASE: Sync the scheduled cancellation to our database
      await upsertSubscription({
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        priceId: subscription.items[0]?.price?.id,
        productId: subscription.items[0]?.price?.productId,
        scheduledChange: subscription.scheduledChange?.effectiveAt,
        paddleCustomerId: subscription.customerId,
      });

      // SEND CANCELLATION EMAIL: Notify user about the cancellation
      try {
        const userWithCustomer = await prisma.user.findFirst({
          where: {
            customer: {
              paddleCustomerId: subscription.customerId,
            },
          },
        });

        if (userWithCustomer) {
          const planName = subscription.items[0]?.price?.product?.name || 'Premium Plan';
          const cancellationDate = new Date().toLocaleDateString();
          const accessEndDate = subscription.scheduledChange?.effectiveAt
            ? new Date(subscription.scheduledChange.effectiveAt).toLocaleDateString()
            : undefined;

          await sendPlanCancellationEmail({
            to: userWithCustomer.email,
            firstName: userWithCustomer.firstName || undefined,
            planName,
            cancellationDate,
            accessEndDate,
          });

          console.log(`✅ Cancellation email sent to: ${userWithCustomer.email}`);
        }
      } catch (emailError) {
        console.error('❌ Error sending cancellation email:', emailError);
        // Don't fail the operation for email errors
      }

      await revalidateAllSubscriptionViews();
    }

    return JSON.parse(JSON.stringify(subscription));
  } catch (e) {
    console.log('Error canceling subscription', e);
    return { error: 'Something went wrong, please try again later' };
  }
}

/**
 * Resume a canceled subscription before it becomes inactive
 * This undoes a scheduled cancellation and continues the subscription
 */
export async function resumeSubscription(subscriptionId: string): Promise<Subscription | Error> {
  console.log('🔍 Resuming subscription', subscriptionId);
  try {
    await validateUserSession();

    // Ownership check
    const owned = await getOwnedSubscriptionOrError(subscriptionId);
    if ('error' in owned) return owned;

    // For both trialing and active subscriptions with scheduled cancellations,
    // we need to remove the scheduled change using the update endpoint
    // The resume API is only for paused subscriptions
    console.log('🔄 Removing scheduled cancellation for subscription');
    const subscription = await paddle.subscriptions.update(subscriptionId, {
      scheduledChange: null,
    });

    if (subscription) {
      // UPDATE LOCAL DATABASE: Sync the removed scheduled change to our database
      await upsertSubscription({
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        priceId: subscription.items[0]?.price?.id,
        productId: subscription.items[0]?.price?.productId,
        scheduledChange: null, // This is now null since we removed the scheduled cancellation
        paddleCustomerId: subscription.customerId,
      });

      // SEND RESUME EMAIL: Notify user about the subscription resumption
      try {
        const userWithCustomer = await prisma.user.findFirst({
          where: {
            customer: {
              paddleCustomerId: subscription.customerId,
            },
          },
        });

        if (userWithCustomer) {
          const planName = subscription.items[0]?.price?.product?.name || 'Premium Plan';
          const resumeDate = new Date().toLocaleDateString();

          await sendPlanResumeEmail({
            to: userWithCustomer.email,
            firstName: userWithCustomer.firstName || undefined,
            planName,
            resumeDate,
          });

          console.log(`✅ Resume email sent to: ${userWithCustomer.email}`);
        }
      } catch (emailError) {
        console.error('❌ Error sending resume email:', emailError);
        // Don't fail the operation for email errors
      }

      await revalidateAllSubscriptionViews();
    }

    return JSON.parse(JSON.stringify(subscription));
  } catch (e) {
    console.log('Error resuming subscription', e);
    return { error: 'Something went wrong, please try again later' };
  }
}

/**
 * Update subscription plan with HIERARCHICAL TIER SYSTEM support
 *
 * Policy (kept simple to match Paddle defaults):
 * - We replace subscription items immediately via Paddle's update endpoint.
 * - Billing mode selection:
 *   - Trialing subscriptions: 'do_not_bill' (no immediate charge)
 *   - Tier downgrade OR annual→monthly (same tier): 'do_not_bill' (swap now, do not charge now)
 *   - All other upgrades (incl. monthly→annual and tier upgrades): 'prorated_immediately'
 *
 * Important assumptions and rationale:
 * - We intentionally follow Paddle's default behavior for plan swaps:
 *   - Upgrades apply immediately and are billed with proration.
 *   - Downgrades apply immediately by default (no proration charge today).
 * - We do NOT schedule item changes for end-of-term. Paddle applies item swaps immediately by default; using
 *   'do_not_bill' avoids immediate charges but does not defer the effective date.
 * - This behavior keeps the template simple and predictable for most integrations.
 * - Developers who need “end-of-term” semantics for annual→monthly can implement a local scheduler
 *   (see SUBSCRIPTION_PLAN_CHANGES.md) to stage the swap at renewal via webhook handling.
 *
 * References (Paddle docs):
 * - Replace products/prices (upgrade/downgrade): https://developer.paddle.com/build/subscriptions/replace-products-prices-upgrade-downgrade
 * - Proration behavior: https://developer.paddle.com/changelog/2024/proration-improvements
 *
 * Other features:
 * 1. IMMEDIATE TIER UPDATE: Update customer's current tier immediately after Paddle update
 * 2. HIERARCHY VALIDATION: Validate plan changes using tier hierarchy levels
 * 3. COMPREHENSIVE REFRESH: Invalidate caches and force UI refresh
 */
/**
 * Update a subscription's plan.
 *
 * Note: We follow Paddle defaults (immediate swaps). If you want end-of-term downgrades, see
 * SUBSCRIPTION_PLAN_CHANGES.md for an optional scheduler approach (not enabled by default).
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string,
): Promise<Subscription | Error> {
  try {
    await validateUserSession();

    // Ownership check
    const owned = await getOwnedSubscriptionOrError(subscriptionId);
    if ('error' in owned) return owned;
    const currentSubscription = owned.subscription;

    const currentPriceId = currentSubscription.items[0]?.price?.id;
    if (currentPriceId === newPriceId) {
      return { error: 'New plan is the same as current plan' };
    }

    // Validate tier hierarchy
    const currentTier = currentPriceId ? getTierByPriceId(currentPriceId) : null;
    const newTier = getTierByPriceId(newPriceId);

    if (!newTier) {
      return { error: 'Invalid pricing plan selected' };
    }

    // Optional: Add business logic for plan changes
    if (currentTier && newTier) {
      const comparison = compareTierHierarchy(newTier, currentTier);
      console.log(`Plan change: ${currentTier.name} → ${newTier.name} (${comparison})`);
    }

    // Choose billing strategy and scheduling behavior
    const isTrialing = currentSubscription.status === 'trialing';

    const currentTierLevel = currentTier?.hierarchyLevel ?? 0;
    const newTierLevel = newTier.hierarchyLevel;
    const isDowngrade = currentTier && newTierLevel < currentTierLevel;

    // Detect billing frequency changes within the SAME tier (monthly ↔ annual)
    const isSameTier = currentTier && newTier && currentTier.id === newTier.id;
    const currentIsMonthly = currentTier ? currentTier.priceId.month === currentPriceId : false;
    const newIsMonthly = newTier ? newTier.priceId.month === newPriceId : false;
    const isFrequencyChange = Boolean(isSameTier && currentIsMonthly !== newIsMonthly);
    const isYearlyToMonthly = Boolean(isFrequencyChange && !currentIsMonthly && newIsMonthly);

    // Note: Keep default Paddle behavior. No local scheduling of item changes.

    // Billing strategy (Paddle-default style, immediate item swaps):
    // - Trialing: do_not_bill
    // - Tier downgrade OR yearly→monthly same-tier: do_not_bill (apply downgrade now, do not charge now)
    // - Other upgrades (incl. monthly→annual, tier upgrades): prorated_immediately (bill prorated amount now)
    const prorationBillingMode = isTrialing
      ? 'do_not_bill'
      : isDowngrade || isYearlyToMonthly
        ? 'do_not_bill'
        : 'prorated_immediately';

    console.log(
      `Subscription status: ${currentSubscription.status}, new tier level: ${newTierLevel}, current tier level: ${currentTierLevel}, isDowngrade: ${!!isDowngrade}, isYearlyToMonthly: ${isYearlyToMonthly}, billing mode: ${prorationBillingMode}`,
    );

    const subscription = await paddle.subscriptions.update(subscriptionId, {
      items: [
        {
          priceId: newPriceId,
          quantity: 1,
        },
      ],
      prorationBillingMode,
    });

    if (subscription) {
      // Sync local subscription record immediately
      try {
        await upsertSubscription({
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          priceId: subscription.items[0]?.price?.id,
          productId: subscription.items[0]?.price?.productId,
          // Persist any scheduled change reported by Paddle (usually null for item swaps)
          scheduledChange: subscription.scheduledChange?.effectiveAt || null,
          paddleCustomerId: subscription.customerId,
        });
      } catch (syncError) {
        console.error('Error syncing subscription locally after update:', syncError);
      }

      // IMMEDIATE TIER UPDATE: Update customer's current tier immediately (don't wait for webhook)
      try {
        const customer = await prisma.customer.findUnique({
          where: { paddleCustomerId: subscription.customerId },
        });

        if (customer && newTier) {
          // Update tier immediately to reflect the change (Paddle-default immediate swap behavior)
          if (true) {
            await prisma.customer.update({
              where: { id: customer.id },
              data: {
                currentTier: newTier.id,
                updatedAt: new Date(),
              },
            });
            console.log(`✅ Updated customer tier to: ${newTier.name}`);
          }
        }
      } catch (tierUpdateError) {
        console.error('Error updating customer tier:', tierUpdateError);
        // Don't fail the entire operation if tier update fails
      }

      // SEND PLAN CHANGE EMAIL: Notify user about the plan change
      try {
        const userWithCustomer = await prisma.user.findFirst({
          where: {
            customer: {
              paddleCustomerId: subscription.customerId,
            },
          },
        });

        if (userWithCustomer && currentTier && newTier) {
          const isUpgrade = !isDowngrade;

          await sendPlanChangeEmail({
            to: userWithCustomer.email,
            firstName: userWithCustomer.firstName || undefined,
            oldPlan: currentTier.name,
            newPlan: newTier.name,
            isUpgrade,
            effectiveDate: isDowngrade ? 'End of current billing period' : new Date().toLocaleDateString(),
          });

          console.log(`✅ Plan change email sent to: ${userWithCustomer.email}`);
        }
      } catch (emailError) {
        console.error('❌ Error sending plan change email:', emailError);
        // Don't fail the operation for email errors
      }

      await revalidateAllSubscriptionViews();
    }
    return JSON.parse(JSON.stringify(subscription));
  } catch (e) {
    console.log('Error updating subscription plan', e);
    return { error: 'Something went wrong, please try again later' };
  }
}

/**
 * Preview proration totals for a plan change before applying it.
 *
 * Strategy:
 * 1) Try Paddle server-side preview (transactions.preview) with current subscription context.
 *    - If proration_billing_mode resolves to do_not_bill: show 0 today.
 *    - If totals are present: show the returned grand_total/total.
 * 2) If preview yields 0 (common in some sandbox scenarios), approximate the delta:
 *    - Pull old/new unit prices (lowest unit) via prices.get
 *    - Estimate remaining fraction of the current period
 *    - estimatedToday ≈ newUnitPrice - (oldUnitPrice × remainingFraction)
 *
 * This gives users a meaningful “today” estimate in confirmation while keeping the template simple.
 */
export async function previewPlanChange(
  subscriptionId: string,
  newPriceId: string,
): Promise<
  | {
      currency: string;
      todayTotal: string; // in lowest unit as string
      todayTotalFormatted: string;
      creditToBalance?: string; // in lowest unit as string
      creditToBalanceFormatted?: string;
      prorationMode: 'prorated_immediately' | 'do_not_bill';
    }
  | Error
> {
  try {
    await validateUserSession();

    const paddle = getPaddleInstance();
    const { userId } = await auth();
    const user = await prisma.user.findUnique({ where: { clerkUserId: userId || '' }, include: { customer: true } });
    const currentCustomerId = user?.customer?.paddleCustomerId;
    const currentSubscription = await paddle.subscriptions.get(subscriptionId);
    if (!currentSubscription) {
      return { error: 'Subscription not found' };
    }
    if (!currentCustomerId || currentSubscription.customerId !== currentCustomerId) {
      return { error: 'Unauthorized: subscription does not belong to the current user' };
    }

    const currentPriceId = currentSubscription.items[0]?.price?.id;
    if (currentPriceId === newPriceId) {
      return { error: 'New plan is the same as current plan' };
    }

    const currentTier = currentPriceId ? getTierByPriceId(currentPriceId) : null;
    const newTier = getTierByPriceId(newPriceId);
    if (!newTier) {
      return { error: 'Invalid pricing plan selected' };
    }

    const isTrialing = currentSubscription.status === 'trialing';
    const currentTierLevel = currentTier?.hierarchyLevel ?? 0;
    const newTierLevel = newTier.hierarchyLevel;
    const isDowngrade = currentTier && newTierLevel < currentTierLevel;

    const isSameTier = currentTier && newTier && currentTier.id === newTier.id;
    const currentIsMonthly = currentTier ? currentTier.priceId.month === currentPriceId : false;
    const newIsMonthly = newTier ? newTier.priceId.month === newPriceId : false;
    const isFrequencyChange = Boolean(isSameTier && currentIsMonthly !== newIsMonthly);
    const isYearlyToMonthly = Boolean(isFrequencyChange && !currentIsMonthly && newIsMonthly);

    const prorationBillingMode = isTrialing
      ? 'do_not_bill'
      : isDowngrade || isYearlyToMonthly
        ? 'do_not_bill'
        : 'prorated_immediately';

    const currency = currentSubscription.currencyCode || 'USD';

    // If we won't bill immediately, preview result is always $0 today
    if (prorationBillingMode === 'do_not_bill') {
      return {
        currency,
        todayTotal: '0',
        todayTotalFormatted: parseMoney('0', currency),
        prorationMode: 'do_not_bill',
      };
    }

    // Attempt a server-side transaction preview using the Paddle SDK
    // Types for preview are not guaranteed in all SDK versions; use a permissive shape
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const preview: any = await (
      paddle as unknown as { transactions: { preview: (args: unknown) => Promise<unknown> } }
    ).transactions.preview({
      items: [
        {
          priceId: newPriceId,
          quantity: 1,
        },
      ],
      customerId: currentSubscription.customerId,
      addressId: currentSubscription.addressId,
      subscriptionId,
    });

    // Safely extract totals from preview
    // Expected fields (strings in lowest unit): details.totals.total, details.totals.grand_total, details.totals.credit_to_balance
    const details = preview?.data?.details || {};
    const totals = details.totals || {};
    let todayTotal = (totals.grand_total || totals.total || '0') as string;
    const creditToBalance = (totals.credit_to_balance || undefined) as string | undefined;

    // Fallback: If preview returns 0, approximate prorated delta using period remaining and unit prices
    if (!todayTotal || todayTotal === '0') {
      try {
        const [oldPriceObj, newPriceObj] = await Promise.all([
          currentPriceId ? paddle.prices.get(currentPriceId) : Promise.resolve(null),
          paddle.prices.get(newPriceId),
        ]);

        type PriceLike = { unitPrice?: { amount?: string } } | null;
        const oldAmount: number = Number((oldPriceObj as PriceLike)?.unitPrice?.amount ?? 0);
        const newAmount: number = Number((newPriceObj as PriceLike)?.unitPrice?.amount ?? 0);

        const currentPeriod = (
          currentSubscription as unknown as {
            currentBillingPeriod?: { startsAt?: string; endsAt?: string };
          }
        )?.currentBillingPeriod;

        const periodStartMs = currentPeriod?.startsAt
          ? new Date(currentPeriod.startsAt).getTime()
          : currentSubscription.startedAt
            ? new Date(currentSubscription.startedAt).getTime()
            : Date.now();
        const periodEndMs = currentPeriod?.endsAt
          ? new Date(currentPeriod.endsAt).getTime()
          : currentSubscription.nextBilledAt
            ? new Date(currentSubscription.nextBilledAt).getTime()
            : Date.now();
        const nowMs = Date.now();
        const totalMs = Math.max(1, periodEndMs - periodStartMs);
        const remainingMs = Math.max(0, periodEndMs - nowMs);
        const remainingFraction = Math.max(0, Math.min(1, remainingMs / totalMs));

        // Approximate: charge = full new price - unused credit from old plan
        const estimatedToday = Math.max(0, Math.round(newAmount - oldAmount * remainingFraction));
        todayTotal = String(estimatedToday);
      } catch {
        // If approximation fails, keep 0
      }
    }

    return {
      currency,
      todayTotal,
      todayTotalFormatted: parseMoney(todayTotal, currency),
      creditToBalance,
      creditToBalanceFormatted: creditToBalance ? parseMoney(creditToBalance, currency) : undefined,
      prorationMode: 'prorated_immediately',
    };
  } catch (e) {
    console.error('Error previewing plan change', e);
    return { error: 'Could not calculate preview. Please try again.' };
  }
}

/**
 * SUBSCRIPTION ACTIONS FOR HIERARCHICAL PLAN SYSTEM
 *
 * These server actions handle plan changes with the following key features:
 * 1. IMMEDIATE DATABASE UPDATES: Don't wait for webhooks, update tier immediately
 * 2. HIERARCHY VALIDATION: Validate plan changes using tier hierarchy levels
 * 3. TRIAL-AWARE BILLING: Use different billing modes for trial vs active subscriptions
 * 4. COMPREHENSIVE CACHE INVALIDATION: Force refresh of all subscription data
 */
