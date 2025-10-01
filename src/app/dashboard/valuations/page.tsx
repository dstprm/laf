import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/utils/database/user';
import { getUserValuations } from '@/utils/database/valuation';
import { redirect } from 'next/navigation';

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

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Valuations</h1>
          <p className="mt-2 text-gray-600">View and manage your saved company valuations</p>
        </div>
        <Link
          href="/free-valuation"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          New Valuation
        </Link>
      </div>

      {valuations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No valuations</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new valuation.</p>
          <div className="mt-6">
            <Link
              href="/free-valuation"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Valuation
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {valuations.map((valuation) => (
              <li key={valuation.id}>
                <Link href={`/dashboard/valuations/${valuation.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {valuation.name || `Valuation - ${formatDate(valuation.createdAt)}`}
                        </p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          {valuation.industry && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                              {valuation.industry}
                            </span>
                          )}
                          {valuation.country && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {valuation.country}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end ml-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(valuation.enterpriseValue)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{formatDate(valuation.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
