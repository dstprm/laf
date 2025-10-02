import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { PaymentsContent } from '@/components/dashboard/payments/payments-content';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { Suspense } from 'react';
import { DashboardPageWrapper } from '@/components/dashboard/layout/dashboard-page-wrapper';

export default async function PaymentsPage() {
  return (
    <DashboardPageWrapper>
      <DashboardPageHeader pageTitle={'Payments'} />
      <Suspense fallback={<LoadingScreen />}>
        <PaymentsContent subscriptionId={''} />
      </Suspense>
    </DashboardPageWrapper>
  );
}
