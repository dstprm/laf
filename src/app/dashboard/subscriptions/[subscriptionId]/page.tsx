'use client';

import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { SubscriptionDetail } from '@/components/dashboard/subscriptions/components/subscription-detail';
import { DashboardPageWrapper } from '@/components/dashboard/layout/dashboard-page-wrapper';

export default function SubscriptionPage() {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  return (
    <DashboardPageWrapper>
      <Suspense fallback={<LoadingScreen />}>
        <SubscriptionDetail subscriptionId={subscriptionId} />
      </Suspense>
    </DashboardPageWrapper>
  );
}
