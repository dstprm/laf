'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';

interface EditReportCommentProps {
  valuationId: string;
  initialComment?: string | null;
}

export function EditReportComment({ valuationId, initialComment }: EditReportCommentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState(initialComment || '');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/valuations/${valuationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportComment: comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar comentario');
      }

      toast({
        title: 'Resumen Ejecutivo guardado',
        description: 'Tu resumen ejecutivo ha sido actualizado.',
      });

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error al guardar resumen ejecutivo:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar resumen ejecutivo',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="default" size="default" className="font-semibold">
        <Pencil className="h-4 w-4 mr-2" />
        {initialComment ? 'Editar Resumen Ejecutivo' : 'Agregar Resumen Ejecutivo'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Resumen Ejecutivo del Informe</DialogTitle>
            <DialogDescription>
              Agrega un resumen ejecutivo que se mostrará prominentemente al inicio de tu informe publicado. Usa esto
              para resaltar hallazgos clave, conclusiones, tesis de inversión o proporcionar contexto importante para
              los lectores.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ingresa tu resumen ejecutivo aquí... (e.g., 'Fuerte crecimiento con márgenes mejorando. La empresa está bien posicionada en el mercado que se está expandiendo. La valorización refleja un 25% de alza sobre los niveles actuales de trading.')"
              className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              maxLength={50000}
            />
            <p className="text-xs text-gray-500 mt-2">{comment.length.toLocaleString()} / 50,000 caracteres</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Resumen Ejecutivo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
