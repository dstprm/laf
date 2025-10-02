import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/utils/database/user';
import { getValuationById } from '@/utils/database/valuation';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import ValuationDetailClient from '@/components/dashboard/valuations/valuation-detail-client';
import { DashboardPageWrapper } from '@/components/dashboard/layout/dashboard-page-wrapper';

export default async function ValuationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect('/login');
  }

  const user = await getUserByClerkId(clerkUserId);
  if (!user) {
    redirect('/login');
  }

  const { id } = await params;
  const valuation = await getValuationById(id, user.id);

  if (!valuation) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <DashboardPageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/valuations" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← Back to Valuations
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {valuation.name || `Valuation - ${formatDate(valuation.createdAt)}`}
            </h1>
            <p className="mt-2 text-gray-600">Created on {formatDate(valuation.createdAt)}</p>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Valuation Summary</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Industry</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{valuation.industry || 'N/A'}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Country</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{valuation.country || 'N/A'}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Enterprise Value</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900 sm:mt-0 sm:col-span-2">
                  {valuation.enterpriseValue
                    ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0,
                      }).format(valuation.enterpriseValue)
                    : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <ValuationDetailClient modelData={valuation.modelData} resultsData={valuation.resultsData} />
      </div>
    </DashboardPageWrapper>
  );
}
