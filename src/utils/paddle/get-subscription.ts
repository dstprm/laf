'use server';

import { getCustomerId } from '@/utils/paddle/get-customer-id';
import { ErrorMessage, parseSDKResponse } from '@/utils/paddle/data-helpers';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';
import { SubscriptionDetailResponse } from '@/lib/api.types';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * Get single subscription with optional cache bypassing
 *
 * Supports the real-time plan change system by allowing forced cache
 * invalidation for immediate UI updates.
 */
export async function getSubscription(
  subscriptionId: string,
  forceRefresh?: boolean,
): Promise<SubscriptionDetailResponse> {
  // CACHE BYPASSING: Disable Next.js caching when fresh data is required
  if (forceRefresh) {
    noStore();
  }

  try {
    const customerId = await getCustomerId();
    if (customerId) {
      const subscription = await getPaddleInstance().subscriptions.get(subscriptionId, {
        include: ['next_transaction', 'recurring_transaction_details'],
      });

      return { data: parseSDKResponse(subscription) };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return { error: ErrorMessage };
  }
  return { error: ErrorMessage };
}
