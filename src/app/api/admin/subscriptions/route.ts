import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/database/admin';
import { prisma } from '@/lib/prisma';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';
import { upsertSubscription } from '@/utils/database/subscription';
import { getTierByPriceId } from '@/constants/pricing-tier';

const paddle = getPaddleInstance();

/**
 * PATCH /api/admin/subscriptions
 *
 * Admin-only endpoint to change a user's active subscription plan by price ID
 * Body: { userId: string, newPriceId: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { userId, newPriceId } = body as { userId?: string; newPriceId?: string };

    if (!userId || !newPriceId) {
      return NextResponse.json({ error: 'userId and newPriceId are required' }, { status: 400 });
    }

    // Load user with customer and subscriptions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { customer: { include: { subscriptions: true } } },
    });

    if (!user?.customer) {
      return NextResponse.json({ error: 'User has no customer record' }, { status: 404 });
    }

    // Find an active or trialing subscription to modify
    const activeOrTrialSub = user.customer.subscriptions.find((s) =>
      ['active', 'trialing'].includes((s.subscriptionStatus || '').toLowerCase()),
    );

    if (!activeOrTrialSub) {
      return NextResponse.json({ error: 'No active or trialing subscription to modify' }, { status: 400 });
    }

    // Get current subscription from Paddle to validate
    const currentSubscription = await paddle.subscriptions.get(activeOrTrialSub.subscriptionId);
    if (!currentSubscription) {
      return NextResponse.json({ error: 'Subscription not found in Paddle' }, { status: 404 });
    }

    const currentPriceId = currentSubscription.items[0]?.price?.id;
    if (currentPriceId === newPriceId) {
      return NextResponse.json({ error: 'New plan is the same as current plan' }, { status: 400 });
    }

    const currentTier = currentPriceId ? getTierByPriceId(currentPriceId) : null;
    const newTier = getTierByPriceId(newPriceId);
    if (!newTier) {
      return NextResponse.json({ error: 'Invalid pricing plan selected' }, { status: 400 });
    }

    // Determine billing strategy
    // Paddle default semantics: item swaps take effect immediately.
    // - Upgrades are billed immediately via proration.
    // - Downgrades apply immediately with no charge today (no end-of-term deferral here).
    // If you need downgrades to apply at period end, implement a scheduler (see SUBSCRIPTION_PLAN_CHANGES.md).
    const isTrialing = currentSubscription.status === 'trialing';
    const currentTierLevel = currentTier?.hierarchyLevel ?? 0;
    const newTierLevel = newTier.hierarchyLevel;
    const isDowngrade = currentTier && newTierLevel < currentTierLevel;

    const isSameTier = currentTier && newTier && currentTier.id === newTier.id;
    const currentIsMonthly = currentTier ? currentTier.priceId.month === currentPriceId : false;
    const newIsMonthly = newTier ? newTier.priceId.month === newPriceId : false;
    const isYearlyToMonthly = Boolean(isSameTier && !currentIsMonthly && newIsMonthly);

    const prorationBillingMode = isTrialing
      ? 'do_not_bill'
      : isDowngrade || isYearlyToMonthly
        ? 'do_not_bill'
        : 'prorated_immediately';

    const subscription = await paddle.subscriptions.update(activeOrTrialSub.subscriptionId, {
      items: [
        {
          priceId: newPriceId,
          quantity: 1,
        },
      ],
      prorationBillingMode,
    });

    if (subscription) {
      // Sync local database
      await upsertSubscription({
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        priceId: subscription.items[0]?.price?.id,
        productId: subscription.items[0]?.price?.productId,
        scheduledChange: subscription.scheduledChange?.effectiveAt || null,
        paddleCustomerId: subscription.customerId,
      });

      // Update customer's current tier immediately
      await prisma.customer.update({
        where: { id: user.customer.id },
        data: { currentTier: newTier.id, updatedAt: new Date() },
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error changing plan (admin):', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/subscriptions
 *
 * Admin-only endpoint to change a user's subscription status.
 * Body: { userId: string, action: 'cancel_now' | 'cancel_at_period_end' | 'resume' }
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { userId, action } = body as { userId?: string; action?: string };

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { customer: { include: { subscriptions: true } } },
    });

    if (!user?.customer) {
      return NextResponse.json({ error: 'User has no customer record' }, { status: 404 });
    }

    const activeOrTrialSub = user.customer.subscriptions.find((s) =>
      ['active', 'trialing', 'paused'].includes((s.subscriptionStatus || '').toLowerCase()),
    );

    if (!activeOrTrialSub) {
      return NextResponse.json({ error: 'No manageable subscription found' }, { status: 400 });
    }

    const subscriptionId = activeOrTrialSub.subscriptionId;
    let updated;

    if (action === 'cancel_now') {
      updated = await paddle.subscriptions.cancel(subscriptionId, { effectiveFrom: 'immediately' });
    } else if (action === 'cancel_at_period_end') {
      updated = await paddle.subscriptions.cancel(subscriptionId, { effectiveFrom: 'next_billing_period' });
    } else if (action === 'resume') {
      // Remove scheduled cancellation if present
      updated = await paddle.subscriptions.update(subscriptionId, { scheduledChange: null });
    } else {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
    }

    if (updated) {
      await upsertSubscription({
        subscriptionId: updated.id,
        subscriptionStatus: updated.status,
        priceId: updated.items[0]?.price?.id,
        productId: updated.items[0]?.price?.productId,
        scheduledChange: updated.scheduledChange?.effectiveAt || null,
        paddleCustomerId: updated.customerId,
      });

      // If canceled immediately, clear currentTier
      if ((updated.status || '').toLowerCase() === 'canceled') {
        await prisma.customer.update({
          where: { id: user.customer.id },
          data: { currentTier: null, updatedAt: new Date() },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error managing subscription (admin):', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
