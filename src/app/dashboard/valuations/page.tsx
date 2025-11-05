import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/utils/database/user';
import { getUserValuations } from '@/utils/database/valuation';
import { redirect } from 'next/navigation';
import { ValuationsList } from '@/components/dashboard/valuations/valuations-list';
import { DashboardPageWrapper } from '@/components/dashboard/layout/dashboard-page-wrapper';

export default async function ValuationsPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect('/login');
  }

  const user = await getUserByClerkId(clerkUserId);
  if (!user) {
    redirect('/login');
  }

  const valuations = await getUserValuations(user.id);

  return (
    <DashboardPageWrapper>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis Valorizaciones</h1>
            <p className="mt-1 sm:mt-2 text-gray-600">Ver y gestionar tus valorizaciones guardadas</p>
          </div>
          <Link
            href="/free-valuation"
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Nueva Valorización
          </Link>
        </div>

        <ValuationsList valuations={valuations} />
      </div>
    </DashboardPageWrapper>
  );
}
