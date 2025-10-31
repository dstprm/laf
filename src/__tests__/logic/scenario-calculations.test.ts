/**
 * Scenario Calculation Logic Tests
 *
 * Tests ensure that scenario calculations output correctly with various variable adjustments.
 * These tests verify:
 * - Variable adjustments are applied correctly
 * - Min/max scenario values are calculated correctly
 * - Scenario calculation handles edge cases
 * - WACC adjustments work correctly
 * - Revenue growth adjustments work correctly
 * - EBITDA margin adjustments work correctly
 */

import { applyVariableAdjustments, calculateScenarioValues, calculateEnterpriseValue } from '@/lib/scenario-calculator';
import { useModelStore } from '@/app/valuation/store/modelStore';
import type { FinancialModel } from '@/lib/valuation.types';
import type { VariableAdjustment } from '@/lib/scenario-variables';

// Helper to create a test model
function createTestModel(overrides: Partial<FinancialModel> = {}): FinancialModel {
  const currentYear = new Date().getFullYear();
  const baseModel: FinancialModel = {
    periods: {
      startYear: currentYear,
      numberOfYears: 5,
      periodLabels: Array.from({ length: 5 }, (_, i) => `${currentYear + i}E`),
    },
    riskProfile: {
      selectedIndustry: null,
      selectedCountry: null,
      unleveredBeta: 1.0,
      leveredBeta: 1.0,
      equityRiskPremium: 0.06,
      countryRiskPremium: 0,
      deRatio: 0,
      adjustedDefaultSpread: 0,
      companySpread: 0.05,
      riskFreeRate: 0.0444,
      corporateTaxRate: 0.25,
    },
    revenue: {
      inputType: 'consolidated',
      consolidated: {
        inputMethod: 'growth',
        growthMethod: 'uniform',
        baseValue: 1000000,
        growthRate: 10,
      },
    },
    cogs: {
      inputType: 'consolidated',
      consolidated: {
        inputMethod: 'revenueMargin',
        percentMethod: 'uniform',
        revenueMarginPercent: 40,
      },
    },
    opex: {
      inputType: 'consolidated',
      consolidated: {
        inputMethod: 'percentOfRevenue',
        percentMethod: 'uniform',
        percentOfRevenue: 30,
      },
    },
    otherIncome: {
      inputType: 'consolidated',
      consolidated: {
        inputMethod: 'percentOfRevenue',
        percentMethod: 'uniform',
        percentOfRevenue: 0,
      },
    },
    otherExpenses: {
      inputType: 'consolidated',
      consolidated: {
        inputMethod: 'percentOfRevenue',
        percentMethod: 'uniform',
        percentOfRevenue: 0,
      },
    },
    da: {
      inputMethod: 'percentOfRevenue',
      percentMethod: 'uniform',
      percentOfRevenue: 5,
    },
    taxes: {
      inputMethod: 'percentOfEBIT',
      percentMethod: 'uniform',
      percentOfEBIT: 25,
    },
    capex: {
      inputMethod: 'percentOfRevenue',
      percentMethod: 'uniform',
      percentOfRevenue: 5,
    },
    netWorkingCapital: {
      inputMethod: 'percentOfRevenue',
      percentMethod: 'uniform',
      percentOfRevenue: 10,
    },
    terminalValue: {
      method: 'multiples',
      multipleMetric: 'ebitda',
      multipleValue: 10,
      growthRate: 2.5,
    },
    equityValue: {
      cash: 0,
      totalDebt: 0,
      minorityInterest: 0,
      investmentsInSubsidiaries: 0,
      otherAdjustments: 0,
    },
  };

  return { ...baseModel, ...overrides };
}

describe('Scenario Calculation Logic', () => {
  describe('applyVariableAdjustments', () => {
    it('should apply revenue growth adjustment correctly', () => {
      const baseModel = createTestModel();
      const adjustments: VariableAdjustment[] = [
        {
          variableId: 'revenue_growth',
          minValue: 5,
          maxValue: 15,
          baseValue: 10,
        },
      ];

      const minModel = applyVariableAdjustments(baseModel, adjustments, true);
      const maxModel = applyVariableAdjustments(baseModel, adjustments, false);

      expect(minModel.revenue?.consolidated?.growthRate).toBe(5);
      expect(minModel.revenue?.consolidated?.inputMethod).toBe('growth');
      expect(minModel.revenue?.consolidated?.growthMethod).toBe('uniform');

      expect(maxModel.revenue?.consolidated?.growthRate).toBe(15);
      expect(maxModel.revenue?.consolidated?.inputMethod).toBe('growth');
      expect(maxModel.revenue?.consolidated?.growthMethod).toBe('uniform');
    });

    it('should apply EBITDA margin adjustment correctly', () => {
      const baseModel = createTestModel({
        revenue: {
          inputType: 'consolidated',
          consolidated: {
            inputMethod: 'growth',
            growthMethod: 'uniform',
            baseValue: 1000000,
            growthRate: 10,
          },
        },
        opex: {
          inputType: 'consolidated',
          consolidated: {
            inputMethod: 'percentOfRevenue',
            percentMethod: 'uniform',
            percentOfRevenue: 30,
          },
        },
      });

      const adjustments: VariableAdjustment[] = [
        {
          variableId: 'ebitda_margin',
          minValue: 25,
          maxValue: 35,
          baseValue: 30,
        },
      ];

      const minModel = applyVariableAdjustments(baseModel, adjustments, true);
      const maxModel = applyVariableAdjustments(baseModel, adjustments, false);

      // EBITDA margin of 25% means OpEx should be 75% of revenue
      // EBITDA margin of 35% means OpEx should be 65% of revenue
      expect(minModel.opex?.consolidated?.percentOfRevenue).toBeCloseTo(75, 0);
      expect(maxModel.opex?.consolidated?.percentOfRevenue).toBeCloseTo(65, 0);
    });

    it('should apply WACC adjustment correctly for zero debt', () => {
      const baseModel = createTestModel({
        riskProfile: {
          selectedIndustry: null,
          selectedCountry: null,
          unleveredBeta: 1.0,
          leveredBeta: 1.0,
          equityRiskPremium: 0.06,
          countryRiskPremium: 0,
          deRatio: 0,
          adjustedDefaultSpread: 0,
          companySpread: 0.05,
          riskFreeRate: 0.0444,
          corporateTaxRate: 0.25,
        },
      });

      const adjustments: VariableAdjustment[] = [
        {
          variableId: 'wacc',
          minValue: 8, // 8%
          maxValue: 12, // 12%
          baseValue: 10,
        },
      ];

      const minModel = applyVariableAdjustments(baseModel, adjustments, true);
      const maxModel = applyVariableAdjustments(baseModel, adjustments, false);

      // With zero debt, WACC adjustment should affect equity risk premium
      expect(minModel.riskProfile?.equityRiskPremium).toBeGreaterThan(baseModel.riskProfile?.equityRiskPremium || 0);
      expect(maxModel.riskProfile?.equityRiskPremium).toBeGreaterThan(baseModel.riskProfile?.equityRiskPremium || 0);
    });

    it('should apply terminal growth adjustment correctly', () => {
      const baseModel = createTestModel();
      const adjustments: VariableAdjustment[] = [
        {
          variableId: 'terminal_growth',
          minValue: 2.0,
          maxValue: 3.0,
          baseValue: 2.5,
        },
      ];

      const minModel = applyVariableAdjustments(baseModel, adjustments, true);
      const maxModel = applyVariableAdjustments(baseModel, adjustments, false);

      expect(minModel.terminalValue?.method).toBe('growth');
      expect(minModel.terminalValue?.growthRate).toBe(2.0);

      expect(maxModel.terminalValue?.method).toBe('growth');
      expect(maxModel.terminalValue?.growthRate).toBe(3.0);
    });

    it('should apply terminal multiple adjustment correctly', () => {
      const baseModel = createTestModel();
      const adjustments: VariableAdjustment[] = [
        {
          variableId: 'terminal_multiple',
          minValue: 8,
          maxValue: 12,
          baseValue: 10,
        },
      ];

      const minModel = applyVariableAdjustments(baseModel, adjustments, true);
      const maxModel = applyVariableAdjustments(baseModel, adjustments, false);

      expect(minModel.terminalValue?.method).toBe('multiples');
      expect(minModel.terminalValue?.multipleValue).toBe(8);

      expect(maxModel.terminalValue?.method).toBe('multiples');
      expect(maxModel.terminalValue?.multipleValue).toBe(12);
    });

    it('should apply CAPEX percent adjustment correctly', () => {
      const baseModel = createTestModel();
      const adjustments: VariableAdjustment[] = [
        {
          variableId: 'capex_percent',
          minValue: 3,
          maxValue: 7,
          baseValue: 5,
        },
      ];

      const minModel = applyVariableAdjustments(baseModel, adjustments, true);
      const maxModel = applyVariableAdjustments(baseModel, adjustments, false);

      expect(minModel.capex?.inputMethod).toBe('percentOfRevenue');
      expect(minModel.capex?.percentOfRevenue).toBe(3);

      expect(maxModel.capex?.inputMethod).toBe('percentOfRevenue');
      expect(maxModel.capex?.percentOfRevenue).toBe(7);
    });

    it('should apply multiple adjustments correctly', () => {
      const baseModel = createTestModel();
      const adjustments: VariableAdjustment[] = [
        {
          variableId: 'revenue_growth',
          minValue: 5,
          maxValue: 15,
          baseValue: 10,
        },
        {
          variableId: 'ebitda_margin',
          minValue: 25,
          maxValue: 35,
          baseValue: 30,
        },
      ];

      const minModel = applyVariableAdjustments(baseModel, adjustments, true);
      const maxModel = applyVariableAdjustments(baseModel, adjustments, false);

      expect(minModel.revenue?.consolidated?.growthRate).toBe(5);
      expect(minModel.opex?.consolidated?.percentOfRevenue).toBeCloseTo(75, 0);

      expect(maxModel.revenue?.consolidated?.growthRate).toBe(15);
      expect(maxModel.opex?.consolidated?.percentOfRevenue).toBeCloseTo(65, 0);
    });
  });

  describe('calculateScenarioValues', () => {
    it('should calculate min and max scenario values correctly', () => {
      const baseModel = createTestModel();
      const adjustments: VariableAdjustment[] = [
        {
          variableId: 'revenue_growth',
          minValue: 5,
          maxValue: 15,
          baseValue: 10,
        },
      ];

      const result = calculateScenarioValues(baseModel, adjustments);

      expect(result.minValue).toBeGreaterThan(0);
      expect(result.maxValue).toBeGreaterThan(0);
      expect(result.maxValue).toBeGreaterThan(result.minValue);
      expect(result.minModel).toBeDefined();
      expect(result.maxModel).toBeDefined();
      expect(result.minResults).toBeDefined();
      expect(result.maxResults).toBeDefined();
    });

    it('should swap min and max if min value is greater than max', () => {
      const baseModel = createTestModel();
      // Intentionally create a scenario where lower growth might produce higher value
      // (this is unlikely but we test the swap logic)
      const adjustments: VariableAdjustment[] = [
        {
          variableId: 'terminal_multiple',
          minValue: 12, // Higher multiple
          maxValue: 8, // Lower multiple
          baseValue: 10,
        },
      ];

      const result = calculateScenarioValues(baseModel, adjustments);

      // After swap, min should be less than max
      expect(result.minValue).toBeLessThan(result.maxValue);
    });

    it('should handle multiple variable adjustments', () => {
      const baseModel = createTestModel();
      const adjustments: VariableAdjustment[] = [
        {
          variableId: 'revenue_growth',
          minValue: 5,
          maxValue: 15,
          baseValue: 10,
        },
        {
          variableId: 'ebitda_margin',
          minValue: 25,
          maxValue: 35,
          baseValue: 30,
        },
        {
          variableId: 'wacc',
          minValue: 8,
          maxValue: 12,
          baseValue: 10,
        },
      ];

      const result = calculateScenarioValues(baseModel, adjustments);

      expect(result.minValue).toBeGreaterThan(0);
      expect(result.maxValue).toBeGreaterThan(0);
      expect(result.maxValue).toBeGreaterThan(result.minValue);
    });
  });

  describe('calculateEnterpriseValue', () => {
    it('should calculate enterprise value for a model', () => {
      const model = createTestModel();

      const result = calculateEnterpriseValue(model);

      expect(result.enterpriseValue).toBeGreaterThan(0);
      expect(result.calculatedFinancials).toBeDefined();
      expect(result.calculatedFinancials.enterpriseValue).toBeGreaterThan(0);
      expect(result.calculatedFinancials.revenue).toHaveLength(5);
    });

    it('should not mutate the original model', () => {
      const model = createTestModel();
      const originalGrowthRate = model.revenue?.consolidated?.growthRate;

      calculateEnterpriseValue(model);

      expect(model.revenue?.consolidated?.growthRate).toBe(originalGrowthRate);
    });

    it('should restore store state after calculation', () => {
      const model = createTestModel();

      // Get initial state
      const initialState = JSON.parse(JSON.stringify(useModelStore.getState().model));

      calculateEnterpriseValue(model);

      // State should be restored
      const finalState = useModelStore.getState().model;
      expect(finalState.periods.startYear).toBe(initialState.periods.startYear);
      expect(finalState.periods.numberOfYears).toBe(initialState.periods.numberOfYears);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty adjustments array', () => {
      const baseModel = createTestModel();
      const adjustments: VariableAdjustment[] = [];

      const result = calculateScenarioValues(baseModel, adjustments);

      // Should still calculate values (min and max should be equal)
      expect(result.minValue).toBeGreaterThan(0);
      expect(result.maxValue).toBeGreaterThan(0);
    });

    it('should handle extreme WACC values', () => {
      const baseModel = createTestModel();
      const adjustments: VariableAdjustment[] = [
        {
          variableId: 'wacc',
          minValue: 5,
          maxValue: 20,
          baseValue: 10,
        },
      ];

      const result = calculateScenarioValues(baseModel, adjustments);

      expect(result.minValue).toBeGreaterThan(0);
      expect(result.maxValue).toBeGreaterThan(0);
      // Higher WACC should generally produce lower enterprise value
      expect(result.minValue).toBeGreaterThan(result.maxValue);
    });

    it('should handle zero revenue growth', () => {
      const baseModel = createTestModel();
      const adjustments: VariableAdjustment[] = [
        {
          variableId: 'revenue_growth',
          minValue: 0,
          maxValue: 5,
          baseValue: 2.5,
        },
      ];

      const result = calculateScenarioValues(baseModel, adjustments);

      expect(result.minValue).toBeGreaterThan(0);
      expect(result.maxValue).toBeGreaterThan(0);
      expect(result.maxValue).toBeGreaterThan(result.minValue);
    });
  });
});
