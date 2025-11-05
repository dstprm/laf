/**
 * Scenario Variables Configuration
 *
 * Defines which model variables can be used for scenario analysis
 */

import { calculateWaccPercent } from '@/utils/wacc-calculator';

export type ScenarioVariableType =
  | 'wacc'
  | 'revenue_growth'
  | 'ebitda_margin'
  | 'terminal_growth'
  | 'terminal_multiple'
  | 'capex_percent'
  | 'nwc_percent'
  | 'tax_rate';

export interface ScenarioVariable {
  id: ScenarioVariableType;
  label: string;
  description: string;
  unit: 'percentage' | 'multiplier' | 'rate';
  defaultMin?: number;
  defaultMax?: number;
  step?: number;
}

/**
 * Available variables for scenario analysis
 */
export const SCENARIO_VARIABLES: ScenarioVariable[] = [
  {
    id: 'wacc',
    label: 'WACC (Discount Rate)',
    description: 'Weighted Average Cost of Capital',
    unit: 'percentage',
    step: 0.1,
  },
  {
    id: 'revenue_growth',
    label: 'Revenue Growth Rate',
    description: 'Annual revenue growth percentage',
    unit: 'percentage',
    step: 0.5,
  },
  {
    id: 'ebitda_margin',
    label: 'EBITDA Margin',
    description: 'EBITDA as percentage of revenue',
    unit: 'percentage',
    step: 0.5,
  },
  {
    id: 'terminal_growth',
    label: 'Terminal Growth Rate',
    description: 'Perpetual growth rate for terminal value',
    unit: 'percentage',
    step: 0.1,
  },
  // {
  //   id: 'terminal_multiple',
  //   label: 'Terminal EBITDA Multiple',
  //   description: 'Exit multiple for terminal value calculation',
  //   unit: 'multiplier',
  //   step: 0.5,
  // },
  {
    id: 'capex_percent',
    label: 'CAPEX (% of Revenue)',
    description: 'Capital expenditure as percentage of revenue',
    unit: 'percentage',
    step: 0.5,
  },
  {
    id: 'nwc_percent',
    label: 'Net Working Capital (% of Revenue)',
    description: 'NWC change as percentage of revenue',
    unit: 'percentage',
    step: 0.5,
  },
  {
    id: 'tax_rate',
    label: 'Tax Rate',
    description: 'Corporate tax rate',
    unit: 'percentage',
    step: 0.5,
  },
];

/**
 * Variable adjustment for scenario calculation
 */
export interface VariableAdjustment {
  variableId: ScenarioVariableType;
  minValue: number;
  maxValue: number;
  baseValue?: number; // Current value from the model
}

/**
 * Get variable configuration by ID
 */
export function getVariableById(id: ScenarioVariableType): ScenarioVariable | undefined {
  return SCENARIO_VARIABLES.find((v) => v.id === id);
}

/**
 * Format variable value for display
 */
export function formatVariableValue(variable: ScenarioVariable, value: number): string {
  switch (variable.unit) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'multiplier':
      return `${value.toFixed(1)}x`;
    case 'rate':
      return value.toFixed(3);
    default:
      return value.toString();
  }
}

/**
 * Get base value for a variable from the model
 */
export function getVariableBaseValue(
  variableId: ScenarioVariableType,
  model: any,
  calculatedFinancials: any,
): number | null {
  switch (variableId) {
    case 'wacc':
      // Calculate WACC from risk profile using utility function
      const rp = model.riskProfile;
      if (!rp) return null;
      return calculateWaccPercent(rp);

    case 'revenue_growth':
      // Prefer uniform growth rate if available; otherwise approximate from calculated revenue
      if (model.revenue?.consolidated?.growthRate != null) {
        return model.revenue.consolidated.growthRate;
      }
      if (calculatedFinancials?.revenue && calculatedFinancials.revenue.length > 1) {
        const rev = calculatedFinancials.revenue.filter((v: number) => Number.isFinite(v) && v > 0);
        if (rev.length > 1) {
          let sum = 0;
          let count = 0;
          for (let i = 1; i < rev.length; i++) {
            const prev = rev[i - 1];
            const curr = rev[i];
            if (prev > 0 && Number.isFinite(curr)) {
              sum += (curr / prev - 1) * 100;
              count++;
            }
          }
          if (count > 0) return sum / count;
        }
      }
      return 0;

    case 'ebitda_margin':
      // Calculate average EBITDA margin
      if (calculatedFinancials?.ebitdaMargin?.length > 0) {
        const margins = calculatedFinancials.ebitdaMargin.filter((m: number) => !isNaN(m));
        return margins.reduce((a: number, b: number) => a + b, 0) / margins.length;
      }
      return null;

    case 'terminal_growth':
      if (model.terminalValue?.method === 'growth') {
        return model.terminalValue.growthRate || 0;
      }
      return null;

    case 'terminal_multiple':
      if (model.terminalValue?.method === 'multiples') {
        return model.terminalValue.multipleValue || 0;
      }
      return null;

    case 'capex_percent':
      if (model.capex?.inputMethod === 'percentOfRevenue') {
        return model.capex.percentOfRevenue || 0;
      }
      return null;

    case 'nwc_percent':
      if (model.netWorkingCapital?.inputMethod === 'percentOfRevenue') {
        return model.netWorkingCapital.percentOfRevenue || 0;
      }
      return null;

    case 'tax_rate':
      if (model.riskProfile?.corporateTaxRate) {
        return model.riskProfile.corporateTaxRate * 100;
      }
      return null;

    default:
      return null;
  }
}
