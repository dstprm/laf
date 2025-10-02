import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { Suspense } from 'react';
import { Subscriptions } from '@/components/dashboard/subscriptions/subscriptions';
import { DashboardPageWrapper } from '@/components/dashboard/layout/dashboard-page-wrapper';

export default async function SubscriptionsListPage() {
  return (
    <DashboardPageWrapper>
      <Suspense fallback={<LoadingScreen />}>
        <Subscriptions />
      </Suspense>
    </DashboardPageWrapper>
  );
}
