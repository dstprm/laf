import { SubscriptionDetail } from '@/components/dashboard/subscriptions/components/subscription-detail';
import { NoSubscriptionView } from '@/components/dashboard/subscriptions/views/no-subscription-view';
import { SubscriptionErrorView } from '@/components/dashboard/subscriptions/views/subscription-error-view';
import { getSubscriptions } from '@/utils/paddle/get-subscriptions';

/**
 * Main Subscriptions Component
 *
 * This component implements a HIERARCHICAL SINGLE-SUBSCRIPTION MODEL where:
 * - Only ONE subscription can be active per customer at any time
 * - Plans have a hierarchy: Starter (Level 1) → Pro (Level 2) → Advanced (Level 3)
 * - Users can upgrade/downgrade between plans, but never have multiple active plans
 * - Both 'active' and 'trialing' subscriptions are considered "active" for UI purposes
 */
export async function Subscriptions() {
  const { data: subscriptions } = await getSubscriptions();

  if (subscriptions) {
    // Filter for active/trialing subscriptions (should only be one due to our enforcement)
    const activeSubscriptions = subscriptions.filter((sub) => ['active', 'trialing'].includes(sub.status));

    if (activeSubscriptions.length === 0) {
      return <NoSubscriptionView />;
    } else {
      // With our single subscription model, always show the detail view for the active subscription
      return <SubscriptionDetail subscriptionId={activeSubscriptions[0].id} />;
    }
  } else {
    return <SubscriptionErrorView />;
  }
}
