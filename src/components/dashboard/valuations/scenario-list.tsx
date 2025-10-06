'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ScenarioListItem, FinancialModel, CalculatedFinancials } from '@/lib/valuation.types';
import { CreateScenarioDialog } from './create-scenario-dialog';
import { Trash2, Edit } from 'lucide-react';

interface ScenarioListProps {
  valuationId: string;
  baseValue: number;
  baseModel: FinancialModel;
  baseResults: CalculatedFinancials;
  onScenariosChange?: (scenarios: ScenarioListItem[]) => void;
}

export function ScenarioList({ valuationId, baseValue, baseModel, baseResults, onScenariosChange }: ScenarioListProps) {
  const [scenarios, setScenarios] = useState<ScenarioListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchScenarios = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/valuations/${valuationId}/scenarios`);
      if (!response.ok) {
        throw new Error('Failed to fetch scenarios');
      }
      const data: ScenarioListItem[] = await response.json();
      setScenarios(data);
      onScenariosChange?.(data);
    } catch (error) {
      console.error('Failed to fetch scenarios:', error);
      toast({
        variant: 'destructive',
        title: 'Error al cargar escenarios',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valuationId]);

  const handleDelete = async (scenarioId: string) => {
    if (!confirm('¿Estás seguro de querer eliminar este escenario?')) {
      return;
    }

    try {
      const response = await fetch(`/api/valuations/${valuationId}/scenarios/${scenarioId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete scenario');
      }

      toast({
        title: 'Escenario eliminado',
        description: 'The scenario has been successfully deleted.',
      });

      fetchScenarios();
    } catch (error) {
      console.error('Failed to delete scenario:', error);
      toast({
        variant: 'destructive',
        title: 'Error al eliminar escenario',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatRange = (min: number, max: number) => {
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Escenarios</CardTitle>
          <CardDescription>Cargando escenarios...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Escenarios</CardTitle>
            <CardDescription>Escenarios de sensibilidad para análisis de valuación</CardDescription>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>Crear Escenario</Button>
        </div>
      </CardHeader>
      <CardContent>
        {scenarios.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No se han creado escenarios aún.</p>
            <p className="text-sm mt-2">Crea un escenario para ver diferentes rangos de valuación.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                  {scenario.description && <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>}
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className="text-gray-700">
                      Rango: <span className="font-medium">{formatRange(scenario.minValue, scenario.maxValue)}</span>
                    </span>
                    <span className="text-gray-500">
                      Spread: {formatCurrency(scenario.maxValue - scenario.minValue)} %
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(scenario.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <CreateScenarioDialog
          valuationId={valuationId}
          baseValue={baseValue}
          baseModel={baseModel}
          baseResults={baseResults}
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={fetchScenarios}
        />
      </CardContent>
    </Card>
  );
}
