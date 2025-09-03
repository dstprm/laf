import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { DeveloperThemeSettings } from '@/components/dashboard/settings/developer-theme-settings';
import { checkIsAdmin } from '@/utils/database/admin';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <DashboardPageHeader pageTitle="Theme Configuration" />
      <div className="grid gap-6">
        <DeveloperThemeSettings />
      </div>
    </div>
  );
}
