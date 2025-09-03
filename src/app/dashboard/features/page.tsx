import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { FeaturesDemo } from '@/components/dashboard/features/features-demo';

export default function FeaturesPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle="Features" />
      <FeaturesDemo />
    </main>
  );
}
