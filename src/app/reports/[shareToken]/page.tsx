import { notFound } from 'next/navigation';
import { getValuationByTokenWithOwnerCheck } from '@/utils/database/valuation';
import { ValuationReport } from '@/components/dashboard/valuations/valuation-report';
import { ReportPublishBanner } from '@/components/dashboard/valuations/report-publish-banner';
import { PrivateReportMessage } from '@/components/shared/private-report-message';
import Link from 'next/link';
import Header from '@/components/home/header/header';
import { Footer } from '@/components/home/footer/footer';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/utils/database/user';

interface ReportPageProps {
  params: Promise<{
    shareToken: string;
  }>;
}

export default async function PublicReportPage({ params }: ReportPageProps) {
  const { shareToken } = await params;

  // Get the current user (if authenticated)
  const { userId: clerkUserId } = await auth();
  let currentUserId: string | undefined;

  if (clerkUserId) {
    const user = await getUserByClerkId(clerkUserId);
    currentUserId = user?.id;
  }

  // Fetch the valuation with owner check
  const { valuation, status } = await getValuationByTokenWithOwnerCheck(shareToken, currentUserId);

  // If not found, show 404
  if (status === 'not_found') {
    notFound();
  }

  // If private (not published and not owner), show private message
  if (status === 'private') {
    return <PrivateReportMessage />;
  }

  // At this point, valuation is accessible
  if (!valuation) {
    notFound();
  }

  // Check if the current user is the owner
  const isOwner = currentUserId === valuation.userId;

  return (
    <>
      {/* Add a sentinel div for the header's sticky behavior */}
      <div id="nav-sentinel" className="absolute top-0 h-px w-full" />

      <Header user={null} />

      <div className="min-h-screen bg-gray-50">
        {/* Publish Status Banner (only visible to owner) */}
        <ReportPublishBanner valuationId={valuation.id} isPublished={valuation.isPublished} isOwner={isOwner} />

        {/* Page Title */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Valuation Report</h1>
            <p className="mt-2 text-sm text-gray-600">Professional DCF analysis and financial projections</p>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ValuationReport
            name={valuation.name}
            companyName={valuation.companyName}
            industry={valuation.industry}
            country={valuation.country}
            createdAt={valuation.createdAt}
            reportComment={valuation.reportComment}
            enterpriseValue={valuation.enterpriseValue}
            modelData={valuation.modelData}
            resultsData={valuation.resultsData}
            scenarios={valuation.scenarios}
            showHeader={true}
          />

          {/* Call to Action */}
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-center text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-3">Create Your Own Valuation Report</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Get professional-grade company valuations with our easy-to-use DCF calculator. Save, share, and analyze
              multiple scenarios.
            </p>
            <Link
              href="/free-valuation"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-blue-600 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: ReportPageProps) {
  const { shareToken } = await params;

  // Get the current user (if authenticated) for owner check
  const { userId: clerkUserId } = await auth();
  let currentUserId: string | undefined;

  if (clerkUserId) {
    const user = await getUserByClerkId(clerkUserId);
    currentUserId = user?.id;
  }

  const { valuation, status } = await getValuationByTokenWithOwnerCheck(shareToken, currentUserId);

  if (status === 'not_found') {
    return {
      title: 'Report Not Found',
    };
  }

  if (status === 'private') {
    return {
      title: 'Private Report',
      description: 'This valuation report is private and only accessible to its owner.',
    };
  }

  if (!valuation) {
    return {
      title: 'Report Not Found',
    };
  }

  const title = valuation.companyName || valuation.name || 'Valuation Report';

  return {
    title: `${title} - Valuation Report`,
    description: `View the detailed valuation analysis for ${title}. Includes financial projections, scenario analysis, and key assumptions.`,
  };
}
