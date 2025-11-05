import { notFound } from 'next/navigation';
import { getValuationByTokenWithOwnerCheck } from '@/utils/database/valuation';
import { ValuationReport } from '@/components/dashboard/valuations/valuation-report';
import { ReportPublishBanner } from '@/components/dashboard/valuations/report-publish-banner';
import { PrivateReportMessage } from '@/components/shared/private-report-message';
import { DownloadPDFButton } from '@/components/dashboard/valuations/download-pdf-button';
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
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reporte de Valorización</h1>
                <p className="mt-2 text-sm text-gray-600">Análisis profesional DCF y proyecciones financieras</p>
              </div>
              <DownloadPDFButton
                reportElementId="valuation-report"
                companyName={valuation.companyName}
                reportName={valuation.name}
                variant="default"
                size="default"
              />
            </div>
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
            <h2 className="text-2xl font-bold mb-3">Crea tu propio informe de valorización</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Obtén valorizaciones de empresas de alta calidad con nuestro calculador DCF fácil de usar. Guarda,
              comparte y analiza múltiples escenarios.
            </p>
            <Link
              href="/free-valuation"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-blue-600 transition-colors"
            >
              Comienza Gratis
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
      title: 'Reporte de Valorización no encontrado',
    };
  }

  if (status === 'private') {
    return {
      title: 'Reporte Privado',
      description: 'Este informe de valorización es privado y solo accesible para su propietario.',
    };
  }

  if (!valuation) {
    return {
      title: 'Reporte de Valorización no encontrado',
    };
  }

  const title = valuation.companyName || valuation.name || 'Reporte de Valorización';

  return {
    title: `${title} - Reporte de Valorización`,
    description: `Ve el análisis detallado de la valorización para ${title}. Incluye proyecciones financieras, análisis de escenarios y suposiciones clave.`,
  };
}
