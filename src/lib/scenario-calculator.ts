/**
 * Scenario Calculation Engine
 *
 * Calculates enterprise values by applying variable adjustments to a base financial model
 */

import { useModelStore } from '@/app/valuation/store/modelStore';
import type { FinancialModel, CalculatedFinancials } from '@/lib/valuation.types';
import type { ScenarioVariableType, VariableAdjustment } from './scenario-variables';

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
        // WACC adjustment requires recalculating risk profile
        // We'll adjust the company spread to achieve the target WACC
        if (model.riskProfile && value !== undefined) {
          const targetWacc = value / 100;
          const currentWacc = calculateWacc(model.riskProfile);
          const waccDiff = targetWacc - currentWacc;

          // Adjust company spread (simple approximation)
          const debtWeight = model.riskProfile.deRatio / (1 + model.riskProfile.deRatio);
          const spreadAdjustment = waccDiff / (debtWeight * (1 - model.riskProfile.corporateTaxRate));
          model.riskProfile.companySpread = Math.max(0, model.riskProfile.companySpread + spreadAdjustment);
        }
        break;

      case 'revenue_growth':
        if (model.revenue?.consolidated && value !== undefined) {
          model.revenue.consolidated.growthRate = value;
        }
        break;

      case 'ebitda_margin':
        // Adjust OpEx to achieve target EBITDA margin
        if (model.opex?.consolidated && value !== undefined) {
          const targetOpexPercent = Math.max(0, 100 - value);
          if (model.opex.consolidated.inputMethod === 'percentOfRevenue') {
            model.opex.consolidated.percentOfRevenue = targetOpexPercent;
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
 * Calculate WACC from risk profile
 */
function calculateWacc(riskProfile: any): number {
  const costOfEquity =
    riskProfile.riskFreeRate +
    riskProfile.leveredBeta * (riskProfile.equityRiskPremium + riskProfile.countryRiskPremium);
  const costOfDebt = riskProfile.riskFreeRate + riskProfile.adjustedDefaultSpread + riskProfile.companySpread;
  const equityWeight = 1 / (1 + riskProfile.deRatio);
  const debtWeight = riskProfile.deRatio / (1 + riskProfile.deRatio);

  return equityWeight * costOfEquity + debtWeight * costOfDebt * (1 - riskProfile.corporateTaxRate);
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
