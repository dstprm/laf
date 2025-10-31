/**
 * DCF Calculation Logic Tests
 *
 * Tests ensure that DCF calculations output correctly with various inputs.
 * These tests verify:
 * - Revenue calculation with growth rates
 * - EBITDA and margin calculations
 * - Free cash flow calculation
 * - Terminal value calculation (both growth and multiples methods)
 * - Discounted cash flow calculation
 * - Enterprise value and equity value calculations
 * - WACC calculation from risk profile
 */

import { useModelStore } from '@/app/valuation/store/modelStore';
import type { FinancialModel } from '@/lib/valuation.types';

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

describe('DCF Calculation Logic', () => {
  beforeEach(() => {
    // Reset store state before each test
    useModelStore.setState({
      model: createTestModel(),
      calculatedFinancials: {
        revenue: [],
        cogs: [],
        grossProfit: [],
        grossMargin: [],
        opex: [],
        ebitda: [],
        ebitdaMargin: [],
        otherIncome: [],
        otherExpenses: [],
        da: [],
        ebit: [],
        ebitMargin: [],
        taxes: [],
        netIncome: [],
        netIncomeMargin: [],
        capex: [],
        netWorkingCapital: [],
        changeInNWC: [],
        freeCashFlow: [],
        discountedCashFlows: [],
        terminalValue: 0,
        presentValueTerminalValue: 0,
        enterpriseValue: 0,
        equityValue: 0,
      },
    });
  });

  describe('Revenue Calculation', () => {
    it('should calculate revenue with uniform growth rate correctly', () => {
      const model = createTestModel({
        revenue: {
          inputType: 'consolidated',
          consolidated: {
            inputMethod: 'growth',
            growthMethod: 'uniform',
            baseValue: 1000000,
            growthRate: 10,
          },
        },
      });

      useModelStore.setState({ model });
      useModelStore.getState().calculateFinancials();

      const { revenue } = useModelStore.getState().calculatedFinancials;

      expect(revenue).toHaveLength(5);
      expect(revenue[0]).toBeCloseTo(1000000, 0);
      expect(revenue[1]).toBeCloseTo(1100000, 0); // 1M * 1.1
      expect(revenue[2]).toBeCloseTo(1210000, 0); // 1.1M * 1.1
      expect(revenue[3]).toBeCloseTo(1331000, 0); // 1.21M * 1.1
      expect(revenue[4]).toBeCloseTo(1464100, 0); // 1.331M * 1.1
    });

    it('should calculate revenue with individual growth rates correctly', () => {
      const model = createTestModel({
        revenue: {
          inputType: 'consolidated',
          consolidated: {
            inputMethod: 'growth',
            growthMethod: 'individual',
            baseValue: 1000000,
            individualGrowthRates: {
              1: 10,
              2: 15,
              3: 20,
              4: 12,
            },
          },
        },
      });

      useModelStore.setState({ model });
      useModelStore.getState().calculateFinancials();

      const { revenue } = useModelStore.getState().calculatedFinancials;

      expect(revenue[0]).toBeCloseTo(1000000, 0);
      expect(revenue[1]).toBeCloseTo(1100000, 0); // 1M * 1.1
      expect(revenue[2]).toBeCloseTo(1265000, 0); // 1.1M * 1.15
      expect(revenue[3]).toBeCloseTo(1518000, 0); // 1.265M * 1.20
      expect(revenue[4]).toBeCloseTo(1700160, 0); // 1.518M * 1.12
    });
  });

  describe('EBITDA Calculation', () => {
    it('should calculate EBITDA and margins correctly', () => {
      const model = createTestModel({
        revenue: {
          inputType: 'consolidated',
          consolidated: {
            inputMethod: 'growth',
            growthMethod: 'uniform',
            baseValue: 1000000,
            growthRate: 0, // No growth for simplicity
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
      });

      useModelStore.setState({ model });
      useModelStore.getState().calculateFinancials();

      const { revenue, ebitda, ebitdaMargin, grossProfit, grossMargin } = useModelStore.getState().calculatedFinancials;

      // All years should have same values (no growth)
      const rev = revenue[0];
      const cogs = rev * 0.4;
      const opex = rev * 0.3;
      const expectedGrossProfit = rev - cogs;
      const expectedEBITDA = expectedGrossProfit - opex;
      const expectedEBITDAMargin = (expectedEBITDA / rev) * 100;

      expect(grossProfit[0]).toBeCloseTo(expectedGrossProfit, 0);
      expect(grossMargin[0]).toBeCloseTo(60, 1); // (1 - 0.4) * 100
      expect(ebitda[0]).toBeCloseTo(expectedEBITDA, 0);
      expect(ebitdaMargin[0]).toBeCloseTo(expectedEBITDAMargin, 1);
    });
  });

  describe('Free Cash Flow Calculation', () => {
    it('should calculate FCF correctly', () => {
      const model = createTestModel({
        revenue: {
          inputType: 'consolidated',
          consolidated: {
            inputMethod: 'growth',
            growthMethod: 'uniform',
            baseValue: 1000000,
            growthRate: 0,
          },
        },
        da: {
          inputMethod: 'percentOfRevenue',
          percentMethod: 'uniform',
          percentOfRevenue: 5,
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
      });

      useModelStore.setState({ model });
      useModelStore.getState().calculateFinancials();

      const { revenue, netIncome, da, capex, changeInNWC, freeCashFlow } =
        useModelStore.getState().calculatedFinancials;

      const rev = revenue[0];
      const dAndA = rev * 0.05;
      const capEx = rev * 0.05;
      const nwc = rev * 0.1;
      const changeNWC = nwc; // First year change = initial NWC

      // FCF = Net Income + D&A - CAPEX - Change in NWC
      const expectedFCF = netIncome[0] + dAndA - capEx - changeNWC;

      expect(da[0]).toBeCloseTo(dAndA, 0);
      expect(capex[0]).toBeCloseTo(capEx, 0);
      expect(changeInNWC[0]).toBeCloseTo(changeNWC, 0);
      expect(freeCashFlow[0]).toBeCloseTo(expectedFCF, 0);
    });
  });

  describe('Terminal Value Calculation', () => {
    it('should calculate terminal value using multiples method', () => {
      const model = createTestModel({
        revenue: {
          inputType: 'consolidated',
          consolidated: {
            inputMethod: 'growth',
            growthMethod: 'uniform',
            baseValue: 1000000,
            growthRate: 0,
          },
        },
        terminalValue: {
          method: 'multiples',
          multipleMetric: 'ebitda',
          multipleValue: 10,
          growthRate: 2.5,
        },
      });

      useModelStore.setState({ model });
      useModelStore.getState().calculateFinancials();

      const { ebitda, terminalValue, presentValueTerminalValue } = useModelStore.getState().calculatedFinancials;

      const finalYearEBITDA = ebitda[4];
      const expectedTerminalValue = finalYearEBITDA * 10;

      expect(terminalValue).toBeCloseTo(expectedTerminalValue, 0);
      expect(presentValueTerminalValue).toBeGreaterThan(0);
      expect(presentValueTerminalValue).toBeLessThan(terminalValue); // Should be discounted
    });

    it('should calculate terminal value using growth method', () => {
      const model = createTestModel({
        revenue: {
          inputType: 'consolidated',
          consolidated: {
            inputMethod: 'growth',
            growthMethod: 'uniform',
            baseValue: 1000000,
            growthRate: 0,
          },
        },
        terminalValue: {
          method: 'growth',
          multipleMetric: 'ebitda',
          multipleValue: 10,
          growthRate: 2.5,
        },
      });

      useModelStore.setState({ model });
      useModelStore.getState().calculateFinancials();

      const { terminalValue, presentValueTerminalValue } = useModelStore.getState().calculatedFinancials;

      expect(terminalValue).toBeGreaterThan(0);
      expect(presentValueTerminalValue).toBeGreaterThan(0);
      expect(presentValueTerminalValue).toBeLessThan(terminalValue);
    });
  });

  describe('Discounted Cash Flow Calculation', () => {
    it('should discount cash flows correctly', () => {
      const model = createTestModel({
        revenue: {
          inputType: 'consolidated',
          consolidated: {
            inputMethod: 'growth',
            growthMethod: 'uniform',
            baseValue: 1000000,
            growthRate: 0,
          },
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
      });

      useModelStore.setState({ model });
      useModelStore.getState().calculateFinancials();

      const { freeCashFlow, discountedCashFlows } = useModelStore.getState().calculatedFinancials;

      // WACC = Cost of Equity (since D/E = 0)
      // Cost of Equity = Rf + Beta * ERP = 0.0444 + 1.0 * 0.06 = 0.1044
      const wacc = 0.1044;

      // Verify each DCF is discounted correctly
      discountedCashFlows.forEach((dcf, index) => {
        const yearNumber = index + 1;
        const expectedDCF = freeCashFlow[index] / Math.pow(1 + wacc, yearNumber);
        expect(dcf).toBeCloseTo(expectedDCF, 0);
      });

      // Later years should be discounted more
      expect(discountedCashFlows[0]).toBeGreaterThan(discountedCashFlows[4]);
    });
  });

  describe('Enterprise Value Calculation', () => {
    it('should calculate enterprise value as sum of DCFs + PV of terminal value', () => {
      const model = createTestModel({
        revenue: {
          inputType: 'consolidated',
          consolidated: {
            inputMethod: 'growth',
            growthMethod: 'uniform',
            baseValue: 1000000,
            growthRate: 10,
          },
        },
      });

      useModelStore.setState({ model });
      useModelStore.getState().calculateFinancials();

      const { discountedCashFlows, presentValueTerminalValue, enterpriseValue } =
        useModelStore.getState().calculatedFinancials;

      const sumOfDCFs = discountedCashFlows.reduce((sum, dcf) => sum + dcf, 0);
      const expectedEV = sumOfDCFs + presentValueTerminalValue;

      expect(enterpriseValue).toBeCloseTo(expectedEV, 0);
      expect(enterpriseValue).toBeGreaterThan(0);
    });
  });

  describe('Equity Value Calculation', () => {
    it('should calculate equity value correctly', () => {
      const model = createTestModel({
        revenue: {
          inputType: 'consolidated',
          consolidated: {
            inputMethod: 'growth',
            growthMethod: 'uniform',
            baseValue: 1000000,
            growthRate: 0,
          },
        },
        equityValue: {
          cash: 500000,
          totalDebt: 200000,
          minorityInterest: 0,
          investmentsInSubsidiaries: 0,
          otherAdjustments: 0,
        },
      });

      useModelStore.setState({ model });
      useModelStore.getState().calculateFinancials();

      const { enterpriseValue, equityValue } = useModelStore.getState().calculatedFinancials;

      // Equity Value = EV - Net Debt + Cash
      const expectedEquityValue = enterpriseValue - 200000 + 500000;

      expect(equityValue).toBeCloseTo(expectedEquityValue, 0);
    });
  });

  describe('WACC Calculation', () => {
    it('should calculate WACC correctly for zero debt', () => {
      const model = createTestModel({
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

      useModelStore.setState({ model });
      useModelStore.getState().calculateFinancials();

      // With D/E = 0, WACC = Cost of Equity
      // Cost of Equity = Rf + Beta * (ERP + CRP) = 0.0444 + 1.0 * (0.06 + 0) = 0.1044
      const expectedWACC = 0.0444 + 1.0 * 0.06;

      // Verify WACC is used correctly in discounting
      const { freeCashFlow, discountedCashFlows } = useModelStore.getState().calculatedFinancials;

      const dcfYear1 = discountedCashFlows[0];
      const expectedDCF = freeCashFlow[0] / (1 + expectedWACC);
      expect(dcfYear1).toBeCloseTo(expectedDCF, 0);
    });

    it('should calculate WACC correctly with debt', () => {
      const model = createTestModel({
        riskProfile: {
          selectedIndustry: null,
          selectedCountry: null,
          unleveredBeta: 1.0,
          leveredBeta: 1.2,
          equityRiskPremium: 0.06,
          countryRiskPremium: 0,
          deRatio: 0.5, // D/E = 0.5 means D/V = 0.333, E/V = 0.667
          adjustedDefaultSpread: 0.02,
          companySpread: 0.03,
          riskFreeRate: 0.0444,
          corporateTaxRate: 0.25,
        },
      });

      useModelStore.setState({ model });
      useModelStore.getState().calculateFinancials();

      // Cost of Equity = 0.0444 + 1.2 * 0.06 = 0.1164
      // Cost of Debt = 0.0444 + 0.02 + 0.03 = 0.0944
      // Equity Weight = 1 / (1 + 0.5) = 0.667
      // Debt Weight = 0.5 / (1 + 0.5) = 0.333
      // WACC = 0.667 * 0.1164 + 0.333 * 0.0944 * (1 - 0.25) = 0.0776 + 0.0236 = 0.1012
      const costOfEquity = 0.0444 + 1.2 * 0.06;
      const costOfDebt = 0.0444 + 0.02 + 0.03;
      const equityWeight = 1 / (1 + 0.5);
      const debtWeight = 0.5 / (1 + 0.5);
      const expectedWACC = equityWeight * costOfEquity + debtWeight * costOfDebt * (1 - 0.25);

      const { freeCashFlow, discountedCashFlows } = useModelStore.getState().calculatedFinancials;

      const dcfYear1 = discountedCashFlows[0];
      const expectedDCF = freeCashFlow[0] / (1 + expectedWACC);
      expect(dcfYear1).toBeCloseTo(expectedDCF, 0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero revenue', () => {
      const model = createTestModel({
        revenue: {
          inputType: 'consolidated',
          consolidated: {
            inputMethod: 'growth',
            growthMethod: 'uniform',
            baseValue: 0,
            growthRate: 0,
          },
        },
      });

      useModelStore.setState({ model });
      useModelStore.getState().calculateFinancials();

      const { revenue, enterpriseValue } = useModelStore.getState().calculatedFinancials;

      expect(revenue.every((r) => r === 0)).toBe(true);
      expect(enterpriseValue).toBeGreaterThanOrEqual(0);
    });

    it('should handle negative FCF correctly', () => {
      const model = createTestModel({
        revenue: {
          inputType: 'consolidated',
          consolidated: {
            inputMethod: 'growth',
            growthMethod: 'uniform',
            baseValue: 1000000,
            growthRate: 0,
          },
        },
        opex: {
          inputType: 'consolidated',
          consolidated: {
            inputMethod: 'percentOfRevenue',
            percentMethod: 'uniform',
            percentOfRevenue: 100, // High OpEx to create negative EBITDA
          },
        },
      });

      useModelStore.setState({ model });
      useModelStore.getState().calculateFinancials();

      const { freeCashFlow, enterpriseValue } = useModelStore.getState().calculatedFinancials;

      // Should still calculate even with negative FCF
      expect(freeCashFlow).toHaveLength(5);
      expect(enterpriseValue).toBeDefined();
    });
  });
});
