'use client';

import { useState } from 'react';
import { Globe, Lock, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface ReportPublishBannerProps {
  valuationId: string;
  isPublished: boolean;
  isOwner: boolean;
}

export function ReportPublishBanner({ valuationId, isPublished, isOwner }: ReportPublishBannerProps) {
  const [publishing, setPublishing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(isPublished);
  const router = useRouter();
  const { toast } = useToast();

  // Don't show the banner if not the owner
  if (!isOwner) {
    return null;
  }

  const handleTogglePublish = async () => {
    setPublishing(true);
    try {
      const method = currentStatus ? 'DELETE' : 'POST';
      const response = await fetch(`/api/valuations/${valuationId}/publish`, {
        method,
      });

      if (!response.ok) {
        throw new Error(`Error al cambiar el estado de publicación`);
      }

      const newStatus = !currentStatus;
      setCurrentStatus(newStatus);

      toast({
        title: newStatus ? 'Reporte publicado!' : 'Reporte despublicado',
        description: newStatus ? 'Tu reporte ahora es público.' : 'Tu reporte ahora es privado.',
      });

      // Refresh the page to update the status
      router.refresh();
    } catch (error) {
      console.error('Error al cambiar el estado de publicación', error);
      toast({
        title: 'Error',
        description: `Error al cambiar el estado de publicación`,
        variant: 'destructive',
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className={`border-b ${currentStatus ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {currentStatus ? (
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Globe className="h-5 w-5 text-green-600" />
              </div>
            ) : (
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Lock className="h-5 w-5 text-yellow-600" />
              </div>
            )}
            <div>
              <h3 className={`text-sm font-semibold ${currentStatus ? 'text-green-900' : 'text-yellow-900'}`}>
                {currentStatus ? 'Es reporte público' : 'Es reporte privado.'}
              </h3>
              <p className={`text-sm ${currentStatus ? 'text-green-700' : 'text-yellow-700'}`}>
                {currentStatus
                  ? 'Cualquiera con el enlace puede ver este reporte.'
                  : 'Solo tú puedes ver este reporte. Publícalo para compartirlo con otros.'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleTogglePublish}
            disabled={publishing}
            variant={currentStatus ? 'outline' : 'default'}
            size="sm"
            className={
              currentStatus
                ? 'border-green-300 text-green-700 hover:bg-green-100'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          >
            {publishing ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                {currentStatus ? 'Despublicando...' : 'Publicando...'}
              </>
            ) : (
              <>
                {currentStatus ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Despublicar
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Publicar Reporte.
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
