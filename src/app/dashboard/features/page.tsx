import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { FeaturesDemo } from '@/components/dashboard/features/features-demo';
import { DashboardPageWrapper } from '@/components/dashboard/layout/dashboard-page-wrapper';

export default function FeaturesPage() {
  return (
    <DashboardPageWrapper>
      <DashboardPageHeader pageTitle="Features" />
      <FeaturesDemo />
    </DashboardPageWrapper>
  );
}
