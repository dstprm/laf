import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { DashboardLandingPage } from '@/components/dashboard/landing/dashboard-landing-page';
import { DashboardPageWrapper } from '@/components/dashboard/layout/dashboard-page-wrapper';

export default function LandingPage() {
  return (
    <DashboardPageWrapper>
      <DashboardPageHeader pageTitle={'Dashboard'} />
      <DashboardLandingPage />
    </DashboardPageWrapper>
  );
}
