'use client';

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { CreateScenarioInput, FinancialModel, CalculatedFinancials } from '@/lib/valuation.types';
import {
  SCENARIO_VARIABLES,
  getVariableById,
  formatVariableValue,
  getVariableBaseValue,
  type VariableAdjustment,
  type ScenarioVariableType,
} from '@/lib/scenario-variables';
import { calculateScenarioValues, generateScenarioDescription } from '@/lib/scenario-calculator';

interface CreateScenarioDialogProps {
  valuationId: string;
  baseValue: number;
  baseModel: FinancialModel;
  baseResults: CalculatedFinancials;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateScenarioDialog({
  valuationId,
  baseValue,
  baseModel,
  baseResults,
  open,
  onOpenChange,
  onSuccess,
}: CreateScenarioDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [adjustments, setAdjustments] = useState<VariableAdjustment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [scenarioValues, setScenarioValues] = useState<{
    minValue: number;
    maxValue: number;
    minModel: FinancialModel;
    maxModel: FinancialModel;
    minResults: CalculatedFinancials;
    maxResults: CalculatedFinancials;
  } | null>(null);
  const { toast } = useToast();

  // Reset state when dialog is closed
  React.useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setAdjustments([]);
      setScenarioValues(null);
      setIsCalculating(false);
    }
  }, [open]);

  // Calculate scenario values when adjustments change (use effect to avoid state updates during render)
  React.useEffect(() => {
    if (adjustments.length === 0) {
      setScenarioValues(null);
      setIsCalculating(false);
      return;
    }

    setIsCalculating(true);
    // Use setTimeout to defer calculation to next tick (avoids render-time state updates)
    const timeoutId = setTimeout(() => {
      try {
        const result = calculateScenarioValues(baseModel, adjustments);
        setScenarioValues(result);
      } catch (error) {
        console.error('Failed to calculate scenario:', error);
        setScenarioValues(null);
        toast({
          variant: 'destructive',
          title: 'Calculation error',
          description: 'Unable to calculate scenario values. Please try different values.',
        });
      } finally {
        setIsCalculating(false);
      }
    }, 100); // Small delay for better UX

    return () => clearTimeout(timeoutId);
  }, [adjustments, baseModel, toast]);

  const addVariableAdjustment = () => {
    // Find first unused variable
    const usedIds = new Set(adjustments.map((a) => a.variableId));
    const availableVar = SCENARIO_VARIABLES.find((v) => !usedIds.has(v.id));

    if (!availableVar) {
      toast({
        title: 'No more variables',
        description: 'All available variables have been added.',
      });
      return;
    }

    const baseValue = getVariableBaseValue(availableVar.id, baseModel, baseResults) || 0;

    setAdjustments([
      ...adjustments,
      {
        variableId: availableVar.id,
        minValue: baseValue,
        maxValue: baseValue,
        baseValue,
      },
    ]);
  };

  const removeVariableAdjustment = (index: number) => {
    setAdjustments(adjustments.filter((_, i) => i !== index));
  };

  const updateAdjustment = (index: number, field: keyof VariableAdjustment, value: any) => {
    const updated = [...adjustments];
    updated[index] = { ...updated[index], [field]: value };
    setAdjustments(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation error',
        description: 'Please enter a scenario name.',
      });
      return;
    }

    if (adjustments.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Validation error',
        description: 'Please add at least one variable adjustment.',
      });
      return;
    }

    if (!scenarioValues) {
      toast({
        variant: 'destructive',
        title: 'Calculation error',
        description: 'Unable to calculate scenario values. Please check your inputs.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const autoDescription = generateScenarioDescription(adjustments);

      const payload: CreateScenarioInput = {
        valuationId,
        name: name.trim(),
        description: description.trim() || autoDescription,
        minValue: scenarioValues.minValue,
        maxValue: scenarioValues.maxValue,
        minModelData: scenarioValues.minModel,
        maxModelData: scenarioValues.maxModel,
        minResultsData: scenarioValues.minResults,
        maxResultsData: scenarioValues.maxResults,
      };

      const response = await fetch(`/api/valuations/${valuationId}/scenarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create scenario');
      }

      toast({
        title: 'Scenario created',
        description: 'Your scenario has been successfully calculated and saved.',
      });

      // Reset will happen via useEffect when dialog closes
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create scenario:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to create scenario',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Scenario</DialogTitle>
          <DialogDescription>
            Select variables to adjust and the system will calculate the valuation range.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <Label htmlFor="name">Scenario Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., WACC Sensitivity ±2%, Optimistic Case"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Auto-generated from variables if left blank"
              className="mt-1"
              rows={2}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label>Variable Adjustments</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariableAdjustment}
                disabled={adjustments.length >= SCENARIO_VARIABLES.length}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Variable
              </Button>
            </div>

            {adjustments.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-lg">
                No variables selected. Click "Add Variable" to start building your scenario.
              </div>
            ) : (
              <div className="space-y-3">
                {adjustments.map((adj, index) => {
                  const variable = getVariableById(adj.variableId)!;
                  const usedIds = new Set(adjustments.map((a) => a.variableId));
                  const availableVars = SCENARIO_VARIABLES.filter((v) => v.id === adj.variableId || !usedIds.has(v.id));

                  return (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <select
                            value={adj.variableId}
                            onChange={(e) => {
                              const newVarId = e.target.value as ScenarioVariableType;
                              const newBase = getVariableBaseValue(newVarId, baseModel, baseResults) || 0;
                              updateAdjustment(index, 'variableId', newVarId);
                              updateAdjustment(index, 'baseValue', newBase);
                              updateAdjustment(index, 'minValue', newBase);
                              updateAdjustment(index, 'maxValue', newBase);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          >
                            {availableVars.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.label}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">{variable.description}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariableAdjustment(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Base</Label>
                          <Input
                            type="number"
                            value={adj.baseValue?.toFixed(2) || ''}
                            disabled
                            className="mt-1 text-sm bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Min</Label>
                          <Input
                            type="number"
                            step={variable.step || 0.1}
                            value={adj.minValue}
                            onChange={(e) => updateAdjustment(index, 'minValue', parseFloat(e.target.value) || 0)}
                            className="mt-1 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Max</Label>
                          <Input
                            type="number"
                            step={variable.step || 0.1}
                            value={adj.maxValue}
                            onChange={(e) => updateAdjustment(index, 'maxValue', parseFloat(e.target.value) || 0)}
                            className="mt-1 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {scenarioValues && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900 mb-2">Calculated Values:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-blue-700">Min EV:</span>
                  <span className="ml-2 font-semibold text-blue-900">{formatCurrency(scenarioValues.minValue)}</span>
                </div>
                <div>
                  <span className="text-blue-700">Max EV:</span>
                  <span className="ml-2 font-semibold text-blue-900">{formatCurrency(scenarioValues.maxValue)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-blue-700">Range:</span>
                  <span className="ml-2 font-semibold text-blue-900">
                    {formatCurrency(scenarioValues.maxValue - scenarioValues.minValue)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {isCalculating && <div className="text-sm text-gray-600 text-center">Calculating scenario values...</div>}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isCalculating || !scenarioValues}>
              {isSubmitting ? 'Creating...' : 'Create Scenario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
