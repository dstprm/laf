import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/utils/database/user';
import { getValuationById, parseValuationRecord } from '@/utils/database/valuation';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import ValuationEditClient from '@/components/dashboard/valuations/valuation-edit-client';
import { DashboardPageWrapper } from '@/components/dashboard/layout/dashboard-page-wrapper';
import { EditReportComment } from '@/components/dashboard/valuations/edit-report-comment';
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

  // Debug: Log what we loaded from database (server-side)
  console.log('[SERVER] Loaded valuation from database:', {
    id: valuation.id,
    hasModelData: !!valuation.modelData,
    hasResultsData: !!valuation.resultsData,
    hasRiskProfile: !!valuation.modelData?.riskProfile,
    riskProfileIndustry: valuation.modelData?.riskProfile?.selectedIndustry,
    riskProfileCountry: valuation.modelData?.riskProfile?.selectedCountry,
    dbIndustry: valuation.industry,
    dbCountry: valuation.country,
  });

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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/dashboard/valuations"
                className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
              >
                ← Back to Valuations
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                {valuation.name || `Valuation - ${formatDate(valuation.createdAt)}`}
              </h1>
              <p className="mt-2 text-gray-600">Created on {formatDate(valuation.createdAt)}</p>
            </div>
          </div>

          {/* Executive Summary Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">Report Executive Summary</h3>
                </div>
                <p className="text-sm text-gray-700">
                  {valuation.reportComment ? (
                    <span className="italic">
                      "{valuation.reportComment.substring(0, 150)}
                      {valuation.reportComment.length > 150 ? '...' : ''}"
                    </span>
                  ) : (
                    'Add an executive summary that will appear at the top of your published report. Perfect for highlighting key insights, conclusions, or context for readers.'
                  )}
                </p>
              </div>
              <div className="flex-shrink-0">
                <EditReportComment valuationId={valuation.id} initialComment={valuation.reportComment} />
              </div>
            </div>
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
          preferredEditMode={valuation.preferredEditMode ?? undefined}
        />
      </div>
    </DashboardPageWrapper>
  );
}
