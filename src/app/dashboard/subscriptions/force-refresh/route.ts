import { revalidatePath, revalidateTag } from 'next/cache';
import { validateUserSession } from '@/utils/database/auth';

/**
 * FORCE REFRESH API ENDPOINT
 *
 * This endpoint provides comprehensive cache invalidation for the subscription system.
 * It's called after plan changes to ensure the UI immediately reflects the new state.
 *
 * Why we need this:
 * - Next.js aggressive caching can prevent real-time updates
 * - Plan changes need immediate UI reflection for good UX
 * - Combines multiple cache invalidation strategies for comprehensive refresh
 */
export async function POST() {
  try {
    // Security: Validate user session
    await validateUserSession();

    // COMPREHENSIVE CACHE INVALIDATION
    // 1. Revalidate all subscription-related paths
    revalidatePath('/dashboard/subscriptions');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/subscriptions/[subscriptionId]', 'page');

    // 2. Revalidate cache tags (if used)
    revalidateTag('subscriptions');
    revalidateTag('subscription-detail');

    console.log('✅ Force refresh: All subscription paths revalidated');

    return Response.json({ success: true, timestamp: Date.now() });
  } catch (error) {
    console.error('❌ Force refresh failed:', error);
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}
