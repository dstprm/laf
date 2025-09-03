import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/utils/database/user';
import { upsertSubscription } from '@/utils/database/subscription';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';
import { prisma } from '@/lib/prisma';

/**
 * Sync subscription data from Paddle API to local database
 * This serves as a fallback mechanism in case webhooks fail or are missed
 *
 * Includes canceled states to ensure local cleanup even if webhooks are missed
 *
 * Should be called on user login/dashboard access to ensure data consistency
 */
export async function syncUserSubscriptions(): Promise<void> {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.log('🔄 Sync skipped: No authenticated user');
      return;
    }

    // Get user data from local database
    const user = await getUserByClerkId(userId);

    if (!user?.customer?.paddleCustomerId) {
      console.log('🔄 Sync skipped: User has no customer record');
      return;
    }

    const paddleCustomerId = user.customer.paddleCustomerId;
    console.log(`🔄 Starting subscription sync for customer: ${paddleCustomerId}`);

    // Fetch fresh subscription data from Paddle - include canceled to ensure cleanup on missed webhooks
    const paddle = getPaddleInstance();
    const subscriptionCollection = paddle.subscriptions.list({
      customerId: [paddleCustomerId],
      // Include canceled so we can clear local tier on login if needed
      status: ['active', 'trialing', 'past_due', 'paused', 'canceled'],
      perPage: 10,
    });

    const paddleSubscriptions = await subscriptionCollection.next();

    if (!paddleSubscriptions || paddleSubscriptions.length === 0) {
      console.log('🔄 No subscriptions found in Paddle for sync');
      // If there are no subs at all, clear currentTier since the user has nothing active
      try {
        if (user.customer?.id) {
          await prisma.customer.update({
            where: { id: user.customer.id },
            data: { currentTier: null, updatedAt: new Date() },
          });
        }
      } catch (clearErr) {
        console.error('Failed to clear currentTier during sync:', clearErr);
      }
      return;
    }

    // Sync each subscription to local database
    let syncCount = 0;
    for (const subscription of paddleSubscriptions) {
      try {
        await upsertSubscription({
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          priceId: subscription.items[0]?.price?.id ?? '',
          productId: subscription.items[0]?.price?.productId ?? '',
          scheduledChange: subscription.scheduledChange?.effectiveAt || null,
          paddleCustomerId: subscription.customerId,
        });
        syncCount++;
      } catch (syncError) {
        console.error(`❌ Failed to sync subscription ${subscription.id}:`, syncError);
      }
    }

    console.log(`✅ Subscription sync completed: ${syncCount}/${paddleSubscriptions.length} subscriptions synced`);
  } catch (error) {
    // Don't throw errors to avoid breaking the user experience
    // This is a fallback mechanism, not critical functionality
    console.error('❌ Subscription sync failed (non-critical):', error);
  }
}

/**
 * Lightweight sync that only runs if data seems stale
 * Checks if local subscriptions were last updated more than X minutes ago
 */
export async function syncUserSubscriptionsIfStale(staleMinutes: number = 10): Promise<void> {
  try {
    const { userId } = await auth();

    if (!userId) return;

    await syncSubscriptionsForUser(userId, staleMinutes);
  } catch (error) {
    console.error('❌ Stale check failed (non-critical):', error);
  }
}

/**
 * Sync subscriptions for a specific user (works in webhook context)
 * Only syncs active, trialing, past_due, and paused subscriptions for efficiency
 * @param clerkUserId - The Clerk user ID
 * @param staleMinutes - Only sync if data is older than this many minutes (0 = always sync)
 */
export async function syncSubscriptionsForUser(clerkUserId: string, staleMinutes: number = 10): Promise<void> {
  try {
    const user = await getUserByClerkId(clerkUserId);

    if (!user?.customer?.paddleCustomerId) {
      console.log(`🔄 Sync skipped: User ${clerkUserId} has no customer record`);
      return;
    }

    // If staleMinutes > 0, check if sync is needed
    if (staleMinutes > 0 && user.customer.subscriptions?.length) {
      const now = new Date();
      const staleThreshold = new Date(now.getTime() - staleMinutes * 60 * 1000);

      const hasRecentUpdate = user.customer.subscriptions.some((sub) => sub.updatedAt > staleThreshold);

      if (hasRecentUpdate) {
        console.log(`🔄 Data appears fresh for user ${clerkUserId}, skipping sync`);
        return;
      }
    }

    const paddleCustomerId = user.customer.paddleCustomerId;
    console.log(`🔄 Starting subscription sync for user ${clerkUserId}, customer: ${paddleCustomerId}`);

    // Fetch fresh subscription data from Paddle - include canceled to ensure cleanup on missed webhooks
    const paddle = getPaddleInstance();
    const subscriptionCollection = paddle.subscriptions.list({
      customerId: [paddleCustomerId],
      // Include canceled so we can clear local tier on login if needed
      status: ['active', 'trialing', 'past_due', 'paused', 'canceled'],
      perPage: 10,
    });

    const paddleSubscriptions = await subscriptionCollection.next();

    if (!paddleSubscriptions || paddleSubscriptions.length === 0) {
      console.log(`🔄 No subscriptions found in Paddle for user ${clerkUserId}`);
      // If there are no subs at all, clear currentTier since the user has nothing active
      try {
        if (user.customer?.id) {
          await prisma.customer.update({
            where: { id: user.customer.id },
            data: { currentTier: null, updatedAt: new Date() },
          });
        }
      } catch (clearErr) {
        console.error('Failed to clear currentTier during sync:', clearErr);
      }
      return;
    }

    // Sync each subscription to local database
    let syncCount = 0;
    for (const subscription of paddleSubscriptions) {
      try {
        await upsertSubscription({
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          priceId: subscription.items[0]?.price?.id ?? '',
          productId: subscription.items[0]?.price?.productId ?? '',
          scheduledChange: subscription.scheduledChange?.effectiveAt || null,
          paddleCustomerId: subscription.customerId,
        });
        syncCount++;
      } catch (syncError) {
        console.error(`❌ Failed to sync subscription ${subscription.id}:`, syncError);
      }
    }

    console.log(
      `✅ Subscription sync completed for user ${clerkUserId}: ${syncCount}/${paddleSubscriptions.length} subscriptions synced`,
    );
  } catch (error) {
    console.error(`❌ Subscription sync failed for user ${clerkUserId} (non-critical):`, error);
  }
}
