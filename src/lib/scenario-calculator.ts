/**
 * Scenario Calculation Engine
 *
 * Calculates enterprise values by applying variable adjustments to a base financial model
 */

import { useModelStore } from '@/app/valuation/store/modelStore';
import type { FinancialModel, CalculatedFinancials } from '@/lib/valuation.types';
import type { VariableAdjustment } from './scenario-variables';
import { calculateWacc, calculateDebtWeight } from '@/utils/wacc-calculator';

/**
 * Apply variable adjustments to a model and return a new modified model
 */
export function applyVariableAdjustments(
  baseModel: FinancialModel,
  adjustments: VariableAdjustment[],
  useMinValues: boolean,
): FinancialModel {
  // Deep clone the model to avoid mutations
  const model = JSON.parse(JSON.stringify(baseModel)) as FinancialModel;

  adjustments.forEach((adjustment) => {
    const value = useMinValues ? adjustment.minValue : adjustment.maxValue;

    switch (adjustment.variableId) {
      case 'wacc':
        // WACC adjustment: use waccPremium for direct adjustment
        if (model.riskProfile && value !== undefined) {
          const targetWacc = value / 100;

          // Calculate base WACC (without premium) by temporarily setting premium to 0
          const tempRiskProfile = { ...model.riskProfile, waccPremium: 0 };
          const baseWacc = calculateWacc(tempRiskProfile);

          // The difference between target and base WACC becomes the new premium
          const newWaccPremium = targetWacc - baseWacc;

          // Set the WACC premium to achieve the target WACC
          // This can be positive (increase WACC) or negative (decrease WACC)
          model.riskProfile.waccPremium = newWaccPremium;
        }
        break;

      case 'revenue_growth':
        if (model.revenue?.consolidated && value !== undefined) {
          // Force consolidated uniform growth so the adjustment actually applies
          model.revenue.inputType = 'consolidated';
          model.revenue.consolidated.inputMethod = 'growth';
          model.revenue.consolidated.growthMethod = 'uniform';
          model.revenue.consolidated.growthRate = value;
        }
        break;

      case 'ebitda_margin':
        // Adjust OpEx to achieve target EBITDA margin adjustment
        // Apply the adjustment to each year individually to preserve year-over-year variation
        if (model.opex?.consolidated && value !== undefined) {
          // First, calculate the current model to get base EBITDA margins and other components
          const tempStore = useModelStore.getState();
          const originalModel = JSON.parse(JSON.stringify(tempStore.model)) as FinancialModel;

          try {
            // Set base model temporarily and calculate to get current margins
            useModelStore.setState({ model: JSON.parse(JSON.stringify(baseModel)) });
            tempStore.calculateFinancials();
            const baseFinancials = useModelStore.getState().calculatedFinancials;

            // Get base EBITDA margins and related percentages for each year
            const baseMargins = baseFinancials.ebitdaMargin || [];
            const revenue = baseFinancials.revenue || [];
            const grossProfit = baseFinancials.grossProfit || [];
            const otherIncome = baseFinancials.otherIncome || [];
            const otherExpenses = baseFinancials.otherExpenses || [];

            if (baseMargins.length > 0) {
              // Calculate the average base margin to determine the adjustment amount
              const avgBaseMargin = baseMargins.reduce((sum, m) => sum + (isNaN(m) ? 0 : m), 0) / baseMargins.length;

              // The adjustment amount is the difference between the target value and average
              const adjustmentAmount = value - avgBaseMargin;

              // Apply the adjustment to each year's margin individually
              const individualPercents: { [key: number]: number } = {};
              for (let i = 0; i < baseMargins.length; i++) {
                const baseMargin = isNaN(baseMargins[i]) ? 0 : baseMargins[i];
                const adjustedMargin = Math.max(0, Math.min(100, baseMargin + adjustmentAmount));

                // Calculate OpEx percentage needed to achieve adjusted EBITDA margin
                // EBITDA = GrossProfit - OpEx + OtherIncome - OtherExpenses
                // EBITDA_Margin = (GrossProfit - OpEx + OtherIncome - OtherExpenses) / Revenue * 100
                // Solve for OpEx%:
                // OpEx% = (GrossProfit + OtherIncome - OtherExpenses - (Revenue * EBITDA_Margin / 100)) / Revenue * 100
                // OpEx% = GrossProfit% + OtherIncome% - OtherExpenses% - EBITDA_Margin

                const rev = revenue[i] || 1; // Avoid division by zero
                const grossProfitPercent = (grossProfit[i] / rev) * 100;
                const otherIncomePercent = (otherIncome[i] / rev) * 100;
                const otherExpensesPercent = (otherExpenses[i] / rev) * 100;

                const opexPercent = Math.max(
                  0,
                  grossProfitPercent + otherIncomePercent - otherExpensesPercent - adjustedMargin,
                );
                individualPercents[i] = opexPercent;
              }

              // Set OpEx with individual percentages for each year
              model.opex.inputType = 'consolidated';
              model.opex.consolidated.inputMethod = 'percentOfRevenue';
              model.opex.consolidated.percentMethod = 'individual';
              model.opex.consolidated.individualPercents = individualPercents;
              // Clear uniform percent if present
              if (model.opex.consolidated.percentOfRevenue !== undefined) {
                delete model.opex.consolidated.percentOfRevenue;
              }
            }
          } finally {
            // Restore original model state
            useModelStore.setState({ model: originalModel });
          }
        }
        break;

      case 'terminal_growth':
        if (model.terminalValue && value !== undefined) {
          model.terminalValue.method = 'growth';
          model.terminalValue.growthRate = value;
        }
        break;

      case 'terminal_multiple':
        if (model.terminalValue && value !== undefined) {
          model.terminalValue.method = 'multiples';
          model.terminalValue.multipleMetric = 'ebitda';
          model.terminalValue.multipleValue = value;
        }
        break;

      case 'capex_percent':
        if (model.capex && value !== undefined) {
          model.capex.inputMethod = 'percentOfRevenue';
          model.capex.percentMethod = 'uniform';
          model.capex.percentOfRevenue = value;
        }
        break;

      case 'nwc_percent':
        if (model.netWorkingCapital && value !== undefined) {
          model.netWorkingCapital.inputMethod = 'percentOfRevenue';
          model.netWorkingCapital.percentMethod = 'uniform';
          model.netWorkingCapital.percentOfRevenue = value;
        }
        break;

      case 'tax_rate':
        if (model.riskProfile && value !== undefined) {
          model.riskProfile.corporateTaxRate = value / 100;
        }
        if (model.taxes && value !== undefined) {
          model.taxes.inputMethod = 'percentOfEBIT';
          model.taxes.percentMethod = 'uniform';
          model.taxes.percentOfEBIT = value;
        }
        break;
    }
  });

  return model;
}

/**
 * Calculate enterprise value for a given model
 * Uses the modelStore calculation engine
 * IMPORTANT: This temporarily modifies global state - use only in async contexts
 */
export function calculateEnterpriseValue(model: FinancialModel): {
  enterpriseValue: number;
  calculatedFinancials: CalculatedFinancials;
} {
  // Save current state BEFORE getting tempStore
  const originalState = {
    model: useModelStore.getState().model,
    calculatedFinancials: useModelStore.getState().calculatedFinancials,
  };

  try {
    // Set the new model
    useModelStore.setState({ model });

    // Get fresh reference after state update
    const tempStore = useModelStore.getState();

    // Run calculations
    tempStore.calculateFinancials();

    // Get results
    const calculatedFinancials = useModelStore.getState().calculatedFinancials;
    const enterpriseValue = calculatedFinancials.enterpriseValue || 0;

    return { enterpriseValue, calculatedFinancials };
  } catch (error) {
    console.error('Error calculating enterprise value:', error);
    throw error;
  } finally {
    // Always restore original state
    useModelStore.setState({
      model: originalState.model,
      calculatedFinancials: originalState.calculatedFinancials,
    });
  }
}

/**
 * Calculate scenario min/max values based on variable adjustments
 */
export function calculateScenarioValues(
  baseModel: FinancialModel,
  adjustments: VariableAdjustment[],
): {
  minValue: number;
  maxValue: number;
  minModel: FinancialModel;
  maxModel: FinancialModel;
  minResults: CalculatedFinancials;
  maxResults: CalculatedFinancials;
} {
  // Calculate min scenario (using min values)
  const minModel = applyVariableAdjustments(baseModel, adjustments, true);
  const minCalc = calculateEnterpriseValue(minModel);

  // Calculate max scenario (using max values)
  const maxModel = applyVariableAdjustments(baseModel, adjustments, false);
  const maxCalc = calculateEnterpriseValue(maxModel);

  // Ensure min is always less than max (swap if needed)
  if (minCalc.enterpriseValue > maxCalc.enterpriseValue) {
    return {
      minValue: maxCalc.enterpriseValue,
      maxValue: minCalc.enterpriseValue,
      minModel: maxModel,
      maxModel: minModel,
      minResults: maxCalc.calculatedFinancials,
      maxResults: minCalc.calculatedFinancials,
    };
  }

  return {
    minValue: minCalc.enterpriseValue,
    maxValue: maxCalc.enterpriseValue,
    minModel,
    maxModel,
    minResults: minCalc.calculatedFinancials,
    maxResults: maxCalc.calculatedFinancials,
  };
}

/**
 * Generate scenario description from adjustments
 */
export function generateScenarioDescription(adjustments: VariableAdjustment[]): string {
  if (adjustments.length === 0) return '';

  const parts = adjustments.map((adj) => {
    const varName = adj.variableId.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    return `${varName}: ${adj.minValue} - ${adj.maxValue}`;
  });

  return parts.join(', ');
}
