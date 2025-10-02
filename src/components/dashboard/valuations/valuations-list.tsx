'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Trash2, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Confirmation } from '@/components/shared/confirmation/confirmation';

interface Valuation {
  id: string;
  name: string | null;
  enterpriseValue: number | null;
  industry: string | null;
  country: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ValuationsListProps {
  valuations: Valuation[];
}

export function ValuationsList({ valuations }: ValuationsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [valuationToDelete, setValuationToDelete] = useState<{ id: string; name: string | null } | null>(null);
  const router = useRouter();
  const { toast } = useToast();

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

  const handleDelete = (id: string, name: string | null, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setValuationToDelete({ id, name });
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!valuationToDelete) return;

    setConfirmOpen(false);
    setDeletingId(valuationToDelete.id);

    try {
      const response = await fetch(`/api/valuations/${valuationToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete valuation');
      }

      toast({
        title: 'Success',
        description: 'Valuation deleted successfully',
        variant: 'default',
      });

      // Refresh the page to show updated list
      router.refresh();
    } catch (error) {
      console.error('Error deleting valuation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete valuation',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
      setValuationToDelete(null);
    }
  };

  const handleShare = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement share functionality
    console.log('Share valuation:', id);
  };

  if (valuations.length === 0) {
    return (
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
    );
  }

  return (
    <>
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
                    <div className="flex items-center gap-4 ml-4">
                      <div className="flex flex-col items-end">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(valuation.enterpriseValue)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{formatDate(valuation.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleShare(valuation.id, e)}
                          className="p-2 text-gray-600 border border-gray-300 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-600 rounded-md transition-colors"
                          title="Share valuation"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(valuation.id, valuation.name, e)}
                          disabled={deletingId === valuation.id}
                          className="p-2 text-gray-600 border border-gray-300 hover:text-red-600 hover:bg-red-50 hover:border-red-600 rounded-md transition-colors disabled:opacity-50"
                          title="Delete valuation"
                        >
                          {deletingId === valuation.id ? (
                            <div className="h-4 w-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Confirmation
        isOpen={confirmOpen}
        onClose={setConfirmOpen}
        title="Delete valuation?"
        description={`Are you sure you want to delete "${valuationToDelete?.name || 'this valuation'}"? This action cannot be undone.`}
        actionText="Delete"
        actionVariant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
}
