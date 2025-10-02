import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/utils/database/user';
import { getValuationById, parseValuationRecord } from '@/utils/database/valuation';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import ValuationEditClient from '@/components/dashboard/valuations/valuation-edit-client';
import { DashboardPageWrapper } from '@/components/dashboard/layout/dashboard-page-wrapper';
import type { ValuationRecord } from '@/lib/valuation.types';

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
  const rawValuation = await getValuationById(id, user.id);

  if (!rawValuation) {
    notFound();
  }

  // Parse the valuation to get properly typed modelData and resultsData
  const valuation: ValuationRecord = parseValuationRecord(rawValuation);

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

        <ValuationEditClient
          valuationId={valuation.id}
          initialModelData={valuation.modelData}
          initialResultsData={valuation.resultsData}
          companyName={valuation.companyName}
          industry={valuation.industry}
          country={valuation.country}
          enterpriseValue={valuation.enterpriseValue}
        />
      </div>
    </DashboardPageWrapper>
  );
}
