import { notFound } from 'next/navigation';
import { getPublishedValuationByToken } from '@/utils/database/valuation';
import { ValuationReport } from '@/components/dashboard/valuations/valuation-report';
import Link from 'next/link';

interface ReportPageProps {
  params: Promise<{
    shareToken: string;
  }>;
}

export default async function PublicReportPage({ params }: ReportPageProps) {
  const { shareToken } = await params;

  // Fetch the published valuation
  const valuation = await getPublishedValuationByToken(shareToken);

  // If not found or not published, show 404
  if (!valuation || !valuation.isPublished) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xl font-bold text-gray-900">Valuation Report</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/free-valuation"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Create Your Valuation
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ValuationReport
          name={valuation.name}
          companyName={valuation.companyName}
          industry={valuation.industry}
          country={valuation.country}
          createdAt={valuation.createdAt}
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

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            This report was generated using our DCF valuation platform.{' '}
            <Link href="/free-valuation" className="text-blue-600 hover:text-blue-700 font-medium">
              Create your own valuation
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: ReportPageProps) {
  const { shareToken } = await params;
  const valuation = await getPublishedValuationByToken(shareToken);

  if (!valuation || !valuation.isPublished) {
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
