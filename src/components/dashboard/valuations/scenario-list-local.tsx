'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Plus } from 'lucide-react';
import { CreateScenarioDialog } from './create-scenario-dialog';
import { FinancialModel, CalculatedFinancials } from '@/lib/valuation.types';

type LocalScenario = {
  name: string;
  description?: string;
  minValue: number;
  maxValue: number;
};

interface ScenarioListLocalProps {
  scenarios: LocalScenario[];
  onChange: (scenarios: LocalScenario[]) => void;
  baseModel: FinancialModel;
  baseResults: CalculatedFinancials;
  baseValue: number;
  /** Optional: when provided, new scenarios will also be saved to DB */
  valuationId?: string;
}

export function ScenarioListLocal({
  scenarios,
  onChange,
  baseModel,
  baseResults,
  baseValue,
  valuationId,
}: ScenarioListLocalProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const handleDelete = (index: number) => {
    setDeletingIndex(index);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingIndex !== null) {
      const updated = scenarios.filter((_, i) => i !== deletingIndex);
      onChange(updated);
    }
    setIsDeleteDialogOpen(false);
    setDeletingIndex(null);
  };

  const handleLocalCreate = (scenario: LocalScenario) => {
    console.log('ScenarioListLocal: Creating new scenario', scenario);
    console.log('ScenarioListLocal: Current scenarios', scenarios);
    const updated = [...scenarios, scenario];
    console.log('ScenarioListLocal: Updated scenarios', updated);
    onChange(updated);
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Escenarios</CardTitle>
              <CardDescription>
                Crea y gestiona escenarios antes de guardar (los cambios aún no se guardan)
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Agregar escenario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {scenarios.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aún no se han creado escenarios.</p>
              <p className="text-sm mt-2">Agrega un escenario para ver diferentes rangos de valorización.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scenarios.map((scenario, index) => (
                <div
                  key={index}
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
                        Diferencia: {formatCurrency(scenario.maxValue - scenario.minValue)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Scenario Dialog - Uses the sophisticated variable-based dialog */}
      <CreateScenarioDialog
        valuationId={valuationId}
        baseValue={baseValue}
        baseModel={baseModel}
        baseResults={baseResults}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onLocalCreate={handleLocalCreate}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar escenario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este escenario? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
