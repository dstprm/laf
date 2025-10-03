/**
 * Scenario Variables Configuration
 *
 * Defines which model variables can be used for scenario analysis
 */

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
  {
    id: 'terminal_multiple',
    label: 'Terminal EBITDA Multiple',
    description: 'Exit multiple for terminal value calculation',
    unit: 'multiplier',
    step: 0.5,
  },
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
      // Calculate WACC from risk profile
      const rp = model.riskProfile;
      if (!rp) return null;
      const costOfEquity = rp.riskFreeRate + rp.leveredBeta * (rp.equityRiskPremium + rp.countryRiskPremium);
      const costOfDebt = rp.riskFreeRate + rp.adjustedDefaultSpread + rp.companySpread;
      const equityWeight = 1 / (1 + rp.deRatio);
      const debtWeight = rp.deRatio / (1 + rp.deRatio);
      return (equityWeight * costOfEquity + debtWeight * costOfDebt * (1 - rp.corporateTaxRate)) * 100;

    case 'revenue_growth':
      // Get uniform growth rate if available
      if (model.revenue?.consolidated?.growthRate) {
        return model.revenue.consolidated.growthRate;
      }
      return null;

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
