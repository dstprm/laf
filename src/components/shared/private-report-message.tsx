import Link from 'next/link';
import { Lock } from 'lucide-react';
import Header from '@/components/home/header/header';
import { Footer } from '@/components/home/footer/footer';

export function PrivateReportMessage() {
  return (
    <>
      {/* Add a sentinel div for the header's sticky behavior */}
      <div id="nav-sentinel" className="absolute top-0 h-px w-full" />

      <Header user={null} />

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">This Report is Private</h1>

            <p className="text-gray-600 mb-6">
              This valuation report has not been published yet. Only the owner can access unpublished reports.
            </p>

            <div className="space-y-3">
              <Link
                href="/free-valuation"
                className="block w-full px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Create Your Own Valuation
              </Link>

              <Link
                href="/"
                className="block w-full px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
