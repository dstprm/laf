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
        // WACC adjustment requires recalculating risk profile
        if (model.riskProfile && value !== undefined) {
          const targetWacc = value / 100;
          const currentWacc = calculateWacc(model.riskProfile);
          const waccDiff = targetWacc - currentWacc;

          // When D/E = 0, WACC = Cost of Equity only, so adjust equity risk premium
          // When D/E > 0, adjust company spread to affect cost of debt
          const debtWeight = calculateDebtWeight(model.riskProfile.deRatio);

          if (model.riskProfile.deRatio === 0 || debtWeight < 0.01) {
            // No debt or negligible debt: adjust equity risk premium
            // WACC = Cost of Equity when D/E = 0
            // Cost of Equity = Rf + Beta × (ERP + CRP)
            // So: waccDiff = Beta × erpAdjustment
            const erpAdjustment =
              model.riskProfile.leveredBeta !== 0 ? waccDiff / model.riskProfile.leveredBeta : waccDiff / 1; // Fallback if beta is 0
            model.riskProfile.equityRiskPremium = Math.max(0, model.riskProfile.equityRiskPremium + erpAdjustment);
          } else {
            // Has significant debt: adjust company spread
            const spreadAdjustment = waccDiff / (debtWeight * (1 - model.riskProfile.corporateTaxRate));
            model.riskProfile.companySpread = Math.max(0, model.riskProfile.companySpread + spreadAdjustment);
          }
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
        // Adjust OpEx to achieve target EBITDA margin
        if (model.opex?.consolidated && value !== undefined) {
          const targetOpexPercent = Math.max(0, 100 - value);
          // Ensure percent-of-revenue uniform so the margin change applies
          model.opex.inputType = 'consolidated';
          model.opex.consolidated.inputMethod = 'percentOfRevenue';
          model.opex.consolidated.percentMethod = 'uniform';
          model.opex.consolidated.percentOfRevenue = targetOpexPercent;
          // Clear individual percents if present (no-op if undefined)
          if (model.opex.consolidated.individualPercents) delete model.opex.consolidated.individualPercents;
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
