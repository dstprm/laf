import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { DeveloperThemeSettings } from '@/components/dashboard/settings/developer-theme-settings';
import { checkIsAdmin } from '@/utils/database/admin';
import { redirect } from 'next/navigation';
import { DashboardPageWrapper } from '@/components/dashboard/layout/dashboard-page-wrapper';

export default async function SettingsPage() {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    redirect('/dashboard');
  }

  return (
    <DashboardPageWrapper>
      <div className="space-y-4">
        <DashboardPageHeader pageTitle="Theme Configuration" />
        <div className="grid gap-6">
          <DeveloperThemeSettings />
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
