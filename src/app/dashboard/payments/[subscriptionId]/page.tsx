'use client';

import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { PaymentsContent } from '@/components/dashboard/payments/payments-content';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { DashboardPageWrapper } from '@/components/dashboard/layout/dashboard-page-wrapper';

export default function SubscriptionsPaymentPage() {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();

  return (
    <DashboardPageWrapper>
      <DashboardPageHeader pageTitle={'Payments'} />
      <Suspense fallback={<LoadingScreen />}>
        <PaymentsContent subscriptionId={subscriptionId} />
      </Suspense>
    </DashboardPageWrapper>
  );
}
