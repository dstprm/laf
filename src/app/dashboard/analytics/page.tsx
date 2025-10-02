import { checkIsAdmin } from '@/utils/database/admin';
import { redirect } from 'next/navigation';
import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';
import { AdminAnalytics } from '@/components/dashboard/admin/admin-analytics';
import { DashboardPageWrapper } from '@/components/dashboard/layout/dashboard-page-wrapper';

export default async function AnalyticsPage() {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    redirect('/dashboard');
  }

  return (
    <DashboardPageWrapper>
      <div className="space-y-4">
        <DashboardPageHeader pageTitle="Analytics" />
        <Alert className="text-sm mx-0 max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-4rem)]">
          <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <AlertDescription className="text-xs sm:text-sm leading-relaxed pr-1 sm:pr-2">
            This page is only visible for admins.
          </AlertDescription>
        </Alert>
        <AdminAnalytics />
      </div>
    </DashboardPageWrapper>
  );
}
