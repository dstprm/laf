'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Trash2, Share2, Eye, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Confirmation } from '@/components/shared/confirmation/confirmation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

interface Valuation {
  id: string;
  name: string | null;
  enterpriseValue: number | null;
  industry: string | null;
  country: string | null;
  createdAt: Date;
  updatedAt: Date;
  isPublished?: boolean;
  shareToken?: string | null;
}

interface ValuationsListProps {
  valuations: Valuation[];
}

export function ValuationsList({ valuations }: ValuationsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [valuationToDelete, setValuationToDelete] = useState<{ id: string; name: string | null } | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedValuation, setSelectedValuation] = useState<Valuation | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/D';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
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
        title: 'Éxito',
        description: 'Valuación eliminada correctamente',
        variant: 'default',
      });

      // Refresh the page to show updated list
      router.refresh();
    } catch (error) {
      console.error('Error deleting valuation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la valuación',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
      setValuationToDelete(null);
    }
  };

  const handleShare = (valuation: Valuation, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedValuation(valuation);
    setShareDialogOpen(true);
    setCopied(false);
  };

  const handlePublish = async () => {
    if (!selectedValuation) return;

    setIsPublishing(true);
    try {
      const response = await fetch(`/api/valuations/${selectedValuation.id}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to publish report');
      }

      const data = await response.json();

      toast({
        title: '¡Informe publicado!',
        description: 'Tu informe ahora es público.',
      });

      // Update the valuation in state
      setSelectedValuation({
        ...selectedValuation,
        isPublished: true,
        shareToken: data.shareToken,
      });

      // Refresh the page to show updated status
      router.refresh();
    } catch (error) {
      console.error('Error publishing report:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish report',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!selectedValuation) return;

    setIsPublishing(true);
    try {
      const response = await fetch(`/api/valuations/${selectedValuation.id}/publish`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unpublish report');
      }

      toast({
        title: 'Informe despublicado',
        description: 'Tu informe ahora es privado.',
      });

      // Update the valuation in state
      setSelectedValuation({
        ...selectedValuation,
        isPublished: false,
      });

      // Refresh the page to show updated status
      router.refresh();
    } catch (error) {
      console.error('Error unpublishing report:', error);
      toast({
        title: 'Error',
        description: 'No se pudo despublicar el informe',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!selectedValuation?.shareToken) return;

    const shareUrl = `${window.location.origin}/reports/${selectedValuation.shareToken}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: '¡Enlace copiado!',
        description: 'Enlace de compartir copiado al portapapeles.',
      });

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: 'Error',
        description: 'No se pudo copiar el enlace',
        variant: 'destructive',
      });
    }
  };

  const handlePreview = async (valuation: Valuation, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let shareToken = valuation.shareToken;

    // If no share token exists, generate one
    if (!shareToken) {
      try {
        const response = await fetch(`/api/valuations/${valuation.id}/ensure-token`, {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Failed to generate share token');
        }

        const data = await response.json();
        shareToken = data.shareToken;
      } catch (error) {
        console.error('Error generating share token:', error);
        toast({
          title: 'Error',
          description: 'Failed to generate preview link',
          variant: 'destructive',
        });
        return;
      }
    }

    // Always open the report preview page
    window.open(`/reports/${shareToken}`, '_blank');
  };

  if (valuations.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border-2 border-gray-300">
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">Sin valuaciones</h3>
        <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva valuación.</p>
        <div className="mt-6">
          <Link
            href="/free-valuation"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Crear valuación
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow-md border border-gray-300 overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-300">
          {valuations.map((valuation) => (
            <li key={valuation.id}>
              <Link
                href={`/dashboard/valuations/${valuation.id}`}
                className="block hover:bg-gray-100 transition-colors"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-blue-700 truncate">
                        {valuation.name || `Valuación - ${formatDate(valuation.createdAt)}`}
                      </p>
                      <div className="mt-2 flex items-center text-sm text-gray-600">
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
                        <p className="text-base font-bold text-gray-900">{formatCurrency(valuation.enterpriseValue)}</p>
                        <p className="mt-1 text-xs text-gray-600">{formatDate(valuation.createdAt)}</p>
                        {valuation.isPublished && (
                          <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Publicado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Tooltip content="Previsualizar informe">
                          <button
                            onClick={(e) => handlePreview(valuation, e)}
                            className="p-2 text-gray-600 border border-gray-300 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-600 rounded-md transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Compartir valuación">
                          <button
                            onClick={(e) => handleShare(valuation, e)}
                            className="p-2 text-gray-600 border border-gray-300 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-600 rounded-md transition-colors"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Eliminar valuación">
                          <button
                            onClick={(e) => handleDelete(valuation.id, valuation.name, e)}
                            disabled={deletingId === valuation.id}
                            className="p-2 text-gray-600 border border-gray-300 hover:text-red-600 hover:bg-red-50 hover:border-red-600 rounded-md transition-colors disabled:opacity-50"
                          >
                            {deletingId === valuation.id ? (
                              <div className="h-4 w-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </Tooltip>
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
        title="¿Eliminar valuación?"
        description={`¿Seguro que quieres eliminar "${valuationToDelete?.name || 'esta valuación'}"? Esta acción no se puede deshacer.`}
        actionText="Eliminar"
        actionVariant="destructive"
        onConfirm={confirmDelete}
      />

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="w-[90vw] max-w-[90vw] sm:max-w-[600px] px-6 sm:px-8">
          <DialogHeader>
            <DialogTitle>Compartir informe de valuación</DialogTitle>
            <DialogDescription>
              {selectedValuation?.isPublished
                ? 'Tu informe está publicado y accesible mediante el siguiente enlace.'
                : 'Publica tu informe para hacerlo público y obtener un enlace para compartir.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedValuation?.isPublished && selectedValuation?.shareToken ? (
              <>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Enlace para compartir</p>
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <code className="flex-1 min-w-0 text-sm bg-white px-3 py-2 rounded border border-gray-300 overflow-x-auto whitespace-nowrap">
                      {`${typeof window !== 'undefined' ? window.location.origin : ''}/reports/${selectedValuation.shareToken}`}
                    </code>
                    <Button onClick={handleCopyLink} variant="outline" size="sm" className="flex-shrink-0">
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Cualquiera con este enlace puede ver tu informe de valuación. El informe es
                    de solo lectura y no incluye información personal.
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  Tu informe es privado. Haz clic en "Publicar informe" para generar un enlace compartible.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedValuation?.isPublished ? (
              <>
                <Button variant="outline" onClick={() => setShareDialogOpen(false)} className="w-full sm:w-auto">
                  Cerrar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleUnpublish}
                  disabled={isPublishing}
                  className="w-full sm:w-auto"
                >
                  {isPublishing ? 'Despublicando...' : 'Despublicar informe'}
                </Button>
                {selectedValuation?.shareToken && (
                  <Button
                    onClick={() => window.open(`/reports/${selectedValuation.shareToken}`, '_blank')}
                    className="w-full sm:w-auto"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver informe
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShareDialogOpen(false)} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button onClick={handlePublish} disabled={isPublishing} className="w-full sm:w-auto">
                  {isPublishing ? 'Publicando...' : 'Publicar informe'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
