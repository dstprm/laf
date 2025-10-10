import type { FinancialModel, CalculatedFinancials } from '@/lib/valuation.types';
import { calculateScenarioValues } from '@/lib/scenario-calculator';
import { getVariableBaseValue } from '@/lib/scenario-variables';

export interface GeneratedScenario {
  name: string;
  description?: string;
  minValue: number;
  maxValue: number;
  minModel: FinancialModel;
  maxModel: FinancialModel;
  minResults: CalculatedFinancials;
  maxResults: CalculatedFinancials;
}

/**
 * Generate default auto scenarios (growth ±5%, EBITDA margin ±5%, WACC ±2%).
 * Uses the provided base model and results to compute min/max values and store min/max models/results.
 */
export function generateAutoScenarios(
  baseModel: FinancialModel,
  baseResults: CalculatedFinancials,
): GeneratedScenario[] {
  const scenarios: GeneratedScenario[] = [];

  // Revenue growth ±5%
  const baseGrowth = getVariableBaseValue('revenue_growth', baseModel as any, baseResults as any) ?? 0;
  {
    const min = Math.max(0, baseGrowth - 5);
    const max = baseGrowth + 5;
    const result = calculateScenarioValues(baseModel, [
      { variableId: 'revenue_growth', minValue: min, maxValue: max },
    ] as any);
    scenarios.push({
      name: 'Crecimiento de ingresos (±5%)',
      description: 'Análisis de sensibilidad: crecimiento de ingresos (±5%)',
      minValue: result.minValue,
      maxValue: result.maxValue,
      minModel: result.minModel,
      maxModel: result.maxModel,
      minResults: result.minResults,
      maxResults: result.maxResults,
    });
  }

  // EBITDA margin ±5%
  const baseMargin = getVariableBaseValue('ebitda_margin', baseModel as any, baseResults as any) ?? 0;
  {
    const min = Math.max(0, baseMargin - 5);
    const max = Math.min(100, baseMargin + 5);
    const result = calculateScenarioValues(baseModel, [
      { variableId: 'ebitda_margin', minValue: min, maxValue: max },
    ] as any);
    scenarios.push({
      name: 'Margen EBITDA (±5%)',
      description: 'Análisis de sensibilidad: margen EBITDA (±5%)',
      minValue: result.minValue,
      maxValue: result.maxValue,
      minModel: result.minModel,
      maxModel: result.maxModel,
      minResults: result.minResults,
      maxResults: result.maxResults,
    });
  }

  // WACC ±2%
  const baseWacc = getVariableBaseValue('wacc', baseModel as any, baseResults as any) ?? 9; // default fallback
  {
    const min = Math.max(0, baseWacc - 2);
    const max = baseWacc + 2;
    const result = calculateScenarioValues(baseModel, [{ variableId: 'wacc', minValue: min, maxValue: max }] as any);
    scenarios.push({
      name: 'WACC (±2%)',
      description: 'Análisis de sensibilidad: costo de capital (±2%)',
      minValue: result.minValue,
      maxValue: result.maxValue,
      minModel: result.minModel,
      maxModel: result.maxModel,
      minResults: result.minResults,
      maxResults: result.maxResults,
    });
  }

  return scenarios;
}
