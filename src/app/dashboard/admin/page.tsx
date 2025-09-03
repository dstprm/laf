import { checkIsAdmin } from '@/utils/database/admin';
import { redirect } from 'next/navigation';
import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { AdminUsersTable } from '@/components/dashboard/admin/admin-users-table';
import { AdminContactRequestsTable } from '@/components/dashboard/admin/admin-contact-requests-table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

export default async function AdminPage() {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <DashboardPageHeader pageTitle="Admin Panel" />
      <Alert className="text-sm mx-0 max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-4rem)]">
        <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <AlertDescription className="text-xs sm:text-sm leading-relaxed pr-1 sm:pr-2">
          This page is only visible for admins. You can manage users and permissions here.
        </AlertDescription>
      </Alert>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">User Management</h2>
      </div>
      <AdminUsersTable />
      <div className="flex items-center justify-between space-y-2 mt-10">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Contact Requests</h2>
      </div>
      <AdminContactRequestsTable />
    </div>
  );
}
