'use server';

import { getCustomerId } from '@/utils/paddle/get-customer-id';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';
import { SubscriptionResponse } from '@/lib/api.types';
import { getErrorMessage } from '@/utils/paddle/data-helpers';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * Get subscriptions with optional cache bypassing
 *
 * This function supports our real-time plan change system by allowing
 * forced cache invalidation when fresh data is required.
 */
export async function getSubscriptions(forceRefresh?: boolean): Promise<SubscriptionResponse> {
  // CACHE BYPASSING: Disable Next.js caching when fresh data is required
  if (forceRefresh) {
    noStore();
  }

  try {
    const customerId = await getCustomerId();
    if (customerId) {
      const subscriptionCollection = getPaddleInstance().subscriptions.list({
        customerId: [customerId],
        perPage: 20,
        // Add a cache-busting parameter when forcing refresh
        ...(forceRefresh && { _refresh: Date.now() }),
      });
      const subscriptions = await subscriptionCollection.next();
      return {
        data: subscriptions,
        hasMore: subscriptionCollection.hasMore,
        totalRecords: subscriptionCollection.estimatedTotal,
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return getErrorMessage();
  }
  return getErrorMessage();
}
