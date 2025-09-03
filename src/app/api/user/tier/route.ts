import { auth, clerkClient } from '@clerk/nextjs/server';
import { getUserByClerkId, upsertUser } from '@/utils/database/user';
import { NextResponse } from 'next/server';

/**
 * GET /api/user/tier
 *
 * Returns the current user's subscription tier information
 * Used by the useUserTier hook for client-side tier checking
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with customer and subscription data
    let user = await getUserByClerkId(userId);

    // If user is missing (e.g., webhook not configured locally), auto-provision from Clerk
    if (!user) {
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);

        // Determine primary email
        const primaryEmail = clerkUser.emailAddresses.find(
          (email: { id: string }) => email.id === clerkUser.primaryEmailAddressId,
        );

        if (primaryEmail?.emailAddress) {
          await upsertUser({
            clerkUserId: clerkUser.id,
            email: primaryEmail.emailAddress,
            firstName: clerkUser.firstName || undefined,
            lastName: clerkUser.lastName || undefined,
            avatar: clerkUser.imageUrl || undefined,
          });

          // Re-fetch with relations
          user = await getUserByClerkId(userId);
        }
      } catch (provisionError) {
        console.error('Auto-provision from Clerk failed:', provisionError);
      }
    }

    if (!user) {
      // Fall back gracefully with no subscription info
      return NextResponse.json({
        currentTier: null,
        hasSubscription: false,
        isActiveOrTrialing: false,
        subscriptionStatus: null,
        override: null,
      });
    }

    // Prefer admin overrides if present and not expired
    const now = new Date();
    const hasCustomerOverride = Boolean(
      user.customer?.overrideTier && (!user.customer?.overrideExpiresAt || user.customer.overrideExpiresAt > now),
    );
    const hasUserOverride = Boolean(user.overrideTier && (!user.overrideExpiresAt || user.overrideExpiresAt > now));

    // Derive subscription status
    const subscriptions = user.customer?.subscriptions || [];
    const normalizedStatuses = subscriptions.map((s) => (s.subscriptionStatus || '').toLowerCase());
    const isActiveOrTrialing = normalizedStatuses.includes('active') || normalizedStatuses.includes('trialing');
    const statusPriority = ['active', 'trialing', 'past_due', 'paused', 'canceled'];
    const subscriptionStatus = statusPriority.find((s) => normalizedStatuses.includes(s)) || null;

    // Determine effective tier
    const effectiveTier = hasUserOverride
      ? user.overrideTier
      : hasCustomerOverride
        ? user.customer?.overrideTier
        : user.customer?.currentTier || null;

    return NextResponse.json({
      currentTier: effectiveTier,
      hasSubscription: !!user.customer?.currentTier,
      isActiveOrTrialing: hasUserOverride || hasCustomerOverride ? true : isActiveOrTrialing,
      subscriptionStatus: hasUserOverride || hasCustomerOverride ? 'active' : subscriptionStatus,
      override: hasUserOverride
        ? { tier: user.overrideTier, expiresAt: user.overrideExpiresAt || null, scope: 'user' }
        : hasCustomerOverride
          ? {
              tier: user.customer?.overrideTier,
              expiresAt: user.customer?.overrideExpiresAt || null,
              scope: 'customer',
            }
          : null,
    });
  } catch (error) {
    console.error('Error fetching user tier:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
