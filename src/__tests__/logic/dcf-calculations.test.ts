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
import {
  calculateWacc,
  calculateWaccComponents,
  calculateWaccPercent,
  calculateCostOfEquity,
  calculateCostOfDebt,
  calculateEquityWeight,
  calculateDebtWeight,
} from '@/utils/wacc-calculator';

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
      waccPremium: 0,
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

      expect(revenue).toHaveLength(6); // base + 5 projection years
      expect(revenue[0]).toBeCloseTo(1000000, 0); // Base year
      expect(revenue[1]).toBeCloseTo(1100000, 0); // Year 1: 1M * 1.1
      expect(revenue[2]).toBeCloseTo(1210000, 0); // Year 2: 1.1M * 1.1
      expect(revenue[3]).toBeCloseTo(1331000, 0); // Year 3: 1.21M * 1.1
      expect(revenue[4]).toBeCloseTo(1464100, 0); // Year 4: 1.331M * 1.1
      expect(revenue[5]).toBeCloseTo(1610510, 0); // Year 5: 1.4641M * 1.1
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

      // With 0% revenue growth, NWC stays constant, so change in NWC = 0
      // Base year: NWC = 1,000,000 * 0.1 = 100,000
      // Year 1: NWC = 1,000,000 * 0.1 = 100,000
      // Change: 100,000 - 100,000 = 0
      const changeNWC = 0;

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
      const unleveredBeta = 1.01;
      const equityRiskPremium = 0.06;
      const countryRiskPremium = 0.01;
      const deRatio = 0.5;
      const adjustedDefaultSpread = 0.02;
      const companySpread = 0.05;
      const riskFreeRate = 0.0444;
      const corporateTaxRate = 0.25;
      const leveredBeta = unleveredBeta * (1 + deRatio * (1 - corporateTaxRate));

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
          unleveredBeta,
          leveredBeta,
          equityRiskPremium,
          countryRiskPremium,
          deRatio,
          adjustedDefaultSpread,
          companySpread,
          riskFreeRate,
          corporateTaxRate,
          waccPremium: 0,
        },
      });

      useModelStore.setState({ model });
      useModelStore.getState().calculateFinancials();

      const { freeCashFlow, discountedCashFlows } = useModelStore.getState().calculatedFinancials;

      // WACC = Cost of Equity (since D/E = 0)
      // Cost of Equity = Rf + Beta * ERP = 0.0444 + 1.0 * 0.06 = 0.1044
      const costOfEquity = riskFreeRate + leveredBeta * (equityRiskPremium + countryRiskPremium);
      const costOfDebt = riskFreeRate + adjustedDefaultSpread + companySpread;
      const equityWeight = 1 / (1 + deRatio);
      const debtWeight = deRatio / (1 + deRatio);
      const wacc = equityWeight * costOfEquity + debtWeight * costOfDebt * (1 - corporateTaxRate);

      console.log('wacc', wacc);
      console.log(useModelStore.getState().calculatedFinancials);

      // Verify each DCF is discounted correctly for projection years (skip base year at index 0)
      discountedCashFlows.forEach((dcf, index) => {
        if (index === 0) {
          expect(dcf).toBeCloseTo(0, 0);
          return;
        }
        const yearNumber = index; // Year 1 at index 1, etc.
        const expectedDCF = freeCashFlow[index] / Math.pow(1 + wacc, yearNumber);
        expect(dcf).toBeCloseTo(expectedDCF, 0);
      });

      // Later projection years should be discounted more than earlier ones
      expect(discountedCashFlows[1]).toBeGreaterThan(discountedCashFlows[4]);
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

  describe('WACC Calculation Utility', () => {
    it('should calculate WACC components correctly with precise numbers', () => {
      // Test Case: Realistic company with moderate debt
      const riskProfile = {
        riskFreeRate: 0.0425, // 4.25% - US 10-year Treasury rate
        leveredBeta: 1.15, // Levered beta
        equityRiskPremium: 0.055, // 5.5% - Historical US equity risk premium
        countryRiskPremium: 0.015, // 1.5% - Emerging market country risk
        adjustedDefaultSpread: 0.0275, // 2.75% - BBB rated company default spread
        companySpread: 0.0125, // 1.25% - Company-specific spread
        deRatio: 0.4, // D/E = 0.4 (28.57% debt, 71.43% equity)
        corporateTaxRate: 0.21, // 21% - US federal corporate tax rate
      };

      // Calculate individual components
      const costOfEquity = calculateCostOfEquity(riskProfile);
      const costOfDebt = calculateCostOfDebt(riskProfile);
      const equityWeight = calculateEquityWeight(riskProfile.deRatio);
      const debtWeight = calculateDebtWeight(riskProfile.deRatio);

      // Expected calculations (manually computed for verification):
      // Cost of Equity = Rf + β × (ERP + CRP)
      // = 0.0425 + 1.15 × (0.055 + 0.015)
      // = 0.0425 + 1.15 × 0.07
      // = 0.0425 + 0.0805
      // = 0.1230 (12.30%)
      expect(costOfEquity).toBe(0.123);

      // Cost of Debt (pre-tax) = Rf + Default Spread + Company Spread
      // = 0.0425 + 0.0275 + 0.0125
      // = 0.0825 (8.25%)
      expect(costOfDebt).toBe(0.0825);

      // Equity Weight = E/V = 1 / (1 + D/E)
      // = 1 / (1 + 0.4)
      // = 1 / 1.4
      // = 0.7142857...
      expect(equityWeight).toBeCloseTo(0.7142857142857143, 10);

      // Debt Weight = D/V = (D/E) / (1 + D/E)
      // = 0.4 / 1.4
      // = 0.2857142...
      expect(debtWeight).toBeCloseTo(0.2857142857142857, 10);

      // Verify weights sum to 1
      expect(equityWeight + debtWeight).toBeCloseTo(1.0, 10);

      // WACC = (E/V × Re) + (D/V × Rd × (1 - Tc))
      // = (0.7142857142857143 × 0.123) + (0.2857142857142857 × 0.0825 × (1 - 0.21))
      // = 0.08785714285714286 + (0.2857142857142857 × 0.0825 × 0.79)
      // = 0.08785714285714286 + 0.018621428571428573
      // = 0.10647857142857143 (10.6479%)
      const wacc = calculateWacc(riskProfile);
      expect(wacc).toBeCloseTo(0.10647857142857143, 8);

      // Test the components function
      const waccComponents = calculateWaccComponents(riskProfile);
      expect(waccComponents.costOfEquity).toBe(0.123);
      expect(waccComponents.costOfDebt).toBe(0.0825);
      expect(waccComponents.equityWeight).toBeCloseTo(0.7142857142857143, 10);
      expect(waccComponents.debtWeight).toBeCloseTo(0.2857142857142857, 10);
      expect(waccComponents.wacc).toBeCloseTo(0.10647857142857143, 8);

      // Test percentage conversion
      const waccPercent = calculateWaccPercent(riskProfile);
      expect(waccPercent).toBeCloseTo(10.647857142857143, 8);
    });

    it('should calculate WACC correctly for 100% equity financed company (no debt)', () => {
      const riskProfile = {
        riskFreeRate: 0.04,
        leveredBeta: 1.0,
        equityRiskPremium: 0.06,
        countryRiskPremium: 0.0,
        adjustedDefaultSpread: 0.02,
        companySpread: 0.01,
        deRatio: 0.0, // No debt
        corporateTaxRate: 0.25,
      };

      const wacc = calculateWacc(riskProfile);

      // With D/E = 0, WACC = Cost of Equity
      // Cost of Equity = 0.04 + 1.0 × (0.06 + 0.0) = 0.10 (10%)
      expect(wacc).toBe(0.1);
      expect(calculateWaccPercent(riskProfile)).toBe(10);
    });

    it('should calculate WACC correctly for highly leveraged company', () => {
      const riskProfile = {
        riskFreeRate: 0.045,
        leveredBeta: 1.5,
        equityRiskPremium: 0.06,
        countryRiskPremium: 0.02,
        adjustedDefaultSpread: 0.04,
        companySpread: 0.02,
        deRatio: 1.0, // D/E = 1.0 (50% debt, 50% equity)
        corporateTaxRate: 0.25,
      };

      // Cost of Equity = 0.045 + 1.5 × (0.06 + 0.02) = 0.045 + 0.12 = 0.165
      // Cost of Debt = 0.045 + 0.04 + 0.02 = 0.105
      // E/V = 1/(1+1) = 0.5, D/V = 1/(1+1) = 0.5
      // WACC = 0.5 × 0.165 + 0.5 × 0.105 × (1 - 0.25)
      // = 0.0825 + 0.039375
      // = 0.121875 (12.1875%)

      const wacc = calculateWacc(riskProfile);
      expect(wacc).toBeCloseTo(0.121875, 10);
      expect(calculateWaccPercent(riskProfile)).toBeCloseTo(12.1875, 10);
    });

    it('should handle edge case with very high country risk premium', () => {
      const riskProfile = {
        riskFreeRate: 0.03,
        leveredBeta: 0.8,
        equityRiskPremium: 0.05,
        countryRiskPremium: 0.12, // 12% country risk (high-risk country)
        adjustedDefaultSpread: 0.06,
        companySpread: 0.03,
        deRatio: 0.3,
        corporateTaxRate: 0.3,
      };

      // Cost of Equity = 0.03 + 0.8 × (0.05 + 0.12) = 0.03 + 0.136 = 0.166
      // Cost of Debt = 0.03 + 0.06 + 0.03 = 0.12
      // E/V = 1/1.3 = 0.7692307..., D/V = 0.3/1.3 = 0.2307692...
      // WACC = 0.7692307 × 0.166 + 0.2307692 × 0.12 × (1 - 0.30)
      // = 0.1276923 + 0.01938461
      // = 0.14707691... (14.71%)

      const wacc = calculateWacc(riskProfile);
      expect(wacc).toBeCloseTo(0.14707692307692307, 10);
    });
  });

  describe('WACC Calculation in DCF', () => {
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
          waccPremium: 0,
        },
      });

      useModelStore.setState({ model });
      useModelStore.getState().calculateFinancials();

      // With D/E = 0, WACC = Cost of Equity
      // Cost of Equity = Rf + Beta * (ERP + CRP) = 0.0444 + 1.0 * (0.06 + 0) = 0.1044
      const expectedWACC = 0.0444 + 1.0 * 0.06;

      // Verify WACC is used correctly in discounting
      const { freeCashFlow, discountedCashFlows } = useModelStore.getState().calculatedFinancials;

      // First projection year DCF is at index 1 (index 0 is base year and should be zero)
      const dcfYear1 = discountedCashFlows[1];
      const expectedDCF = freeCashFlow[1] / (1 + expectedWACC);
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
          waccPremium: 0,
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

      const dcfYear1 = discountedCashFlows[1];
      const expectedDCF = freeCashFlow[1] / (1 + expectedWACC);
      expect(dcfYear1).toBeCloseTo(expectedDCF, 0);
    });
  });

  describe('Net Working Capital Calculation', () => {
    describe('percentOfRevenue method', () => {
      it('should calculate change in NWC correctly with uniform percentage', () => {
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
          netWorkingCapital: {
            inputMethod: 'percentOfRevenue',
            percentMethod: 'uniform',
            percentOfRevenue: 10,
          },
        });

        useModelStore.setState({ model });
        useModelStore.getState().calculateFinancials();

        const { netWorkingCapital, changeInNWC } = useModelStore.getState().calculatedFinancials;

        // NWC array includes base year at index 0
        // Base year (index 0): revenue = 1,000,000, NWC = 100,000
        // Year 1 (index 1): revenue = 1,100,000, NWC = 110,000
        // Year 2 (index 2): revenue = 1,210,000, NWC = 121,000

        // Verify NWC values match revenues
        // Base year (index 0) has no prior period, so change is 0
        expect(changeInNWC[0]).toBeCloseTo(0, 0);
        // Year 1 Change: 110,000 - 100,000 = 10,000
        expect(changeInNWC[1]).toBeCloseTo(10000, 0);

        // Year 2 Change: 121,000 - 110,000 = 11,000
        expect(changeInNWC[2]).toBeCloseTo(11000, 0);

        // Verify no NaN values
        changeInNWC.forEach((change) => {
          expect(change).not.toBeNaN();
          expect(Number.isFinite(change)).toBe(true);
        });
      });

      it('should calculate change in NWC correctly with individual percentages', () => {
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
          netWorkingCapital: {
            inputMethod: 'percentOfRevenue',
            percentMethod: 'individual',
            individualPercents: {
              0: 10,
              1: 12,
              2: 11,
              3: 13,
              4: 10,
            },
          },
        });

        useModelStore.setState({ model });
        useModelStore.getState().calculateFinancials();

        const { changeInNWC } = useModelStore.getState().calculatedFinancials;

        // Base year (index 0): 1,000,000 * 0.10 = 100,000
        // Year 1 (index 1): 1,000,000 * 0.12 = 120,000
        // Change from base to Year 1: 120,000 - 100,000 = 20,000
        expect(changeInNWC[0]).toBeCloseTo(0, 0); // Base year has no change
        expect(changeInNWC[1]).toBeCloseTo(20000, 0); // Year 1 change

        // Year 2 (index 2): 1,000,000 * 0.11 = 110,000
        // Change: 110,000 - 120,000 = -10,000
        expect(changeInNWC[2]).toBeCloseTo(-10000, 0);

        // Verify no NaN values
        changeInNWC.forEach((change) => {
          expect(change).not.toBeNaN();
        });
      });
    });

    describe('percentOfEBIT method', () => {
      it('should calculate change in NWC correctly with uniform percentage', () => {
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
          netWorkingCapital: {
            inputMethod: 'percentOfEBIT',
            percentMethod: 'uniform',
            percentOfEBIT: 15,
          },
        });

        useModelStore.setState({ model });
        useModelStore.getState().calculateFinancials();

        const { netWorkingCapital, changeInNWC } = useModelStore.getState().calculatedFinancials;

        // The displayed NWC is calculated from extended EBIT (including base year)
        // We can verify the relationship by checking change in NWC calculation
        // (NWC values will be based on extended EBIT which includes projected Year 6)

        // Verify change in NWC is the difference between consecutive years
        for (let i = 1; i < netWorkingCapital.length; i++) {
          const expectedChange = netWorkingCapital[i] - netWorkingCapital[i - 1];
          expect(changeInNWC[i]).toBeCloseTo(expectedChange, 0);
        }

        // Verify no NaN values
        changeInNWC.forEach((change) => {
          expect(change).not.toBeNaN();
          expect(Number.isFinite(change)).toBe(true);
        });
      });

      it('should calculate change in NWC correctly with individual percentages', () => {
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
          netWorkingCapital: {
            inputMethod: 'percentOfEBIT',
            percentMethod: 'individual',
            individualPercents: {
              0: 10,
              1: 15,
              2: 12,
              3: 18,
              4: 10,
            },
          },
        });

        useModelStore.setState({ model });
        useModelStore.getState().calculateFinancials();

        const { changeInNWC } = useModelStore.getState().calculatedFinancials;

        // Verify no NaN values
        changeInNWC.forEach((change) => {
          expect(change).not.toBeNaN();
          expect(Number.isFinite(change)).toBe(true);
        });
      });
    });

    describe('growth method', () => {
      it('should calculate change in NWC correctly with uniform growth', () => {
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
          netWorkingCapital: {
            inputMethod: 'growth',
            growthMethod: 'uniform',
            baseValue: 100000,
            growthRate: 5,
          },
        });

        useModelStore.setState({ model });
        useModelStore.getState().calculateFinancials();

        const { netWorkingCapital, changeInNWC } = useModelStore.getState().calculatedFinancials;

        // Base year (index 0): 100,000
        expect(netWorkingCapital[0]).toBeCloseTo(100000, 0);
        expect(changeInNWC[0]).toBeCloseTo(0, 0); // Base year has no change

        // Year 1 (index 1): 100,000 * 1.05 = 105,000
        expect(netWorkingCapital[1]).toBeCloseTo(105000, 0);
        // Change Year 1: 105,000 - 100,000 = 5,000
        expect(changeInNWC[1]).toBeCloseTo(5000, 0);

        // Year 2 (index 2): 105,000 * 1.05 = 110,250
        expect(netWorkingCapital[2]).toBeCloseTo(110250, 0);
        // Change Year 2: 110,250 - 105,000 = 5,250
        expect(changeInNWC[2]).toBeCloseTo(5250, 0);

        // Verify no NaN values
        changeInNWC.forEach((change) => {
          expect(change).not.toBeNaN();
          expect(Number.isFinite(change)).toBe(true);
        });
      });

      it('should calculate change in NWC correctly with individual growth rates', () => {
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
          netWorkingCapital: {
            inputMethod: 'growth',
            growthMethod: 'individual',
            baseValue: 100000,
            individualGrowthRates: {
              1: 5,
              2: 10,
              3: 8,
              4: 6,
              5: 4,
            },
          },
        });

        useModelStore.setState({ model });
        useModelStore.getState().calculateFinancials();

        const { netWorkingCapital, changeInNWC } = useModelStore.getState().calculatedFinancials;

        // Base year (index 0): 100,000
        expect(netWorkingCapital[0]).toBeCloseTo(100000, 0);
        expect(changeInNWC[0]).toBeCloseTo(0, 0); // Base year has no change

        // Year 1 (index 1): 100,000 * 1.05 = 105,000
        expect(netWorkingCapital[1]).toBeCloseTo(105000, 0);
        expect(changeInNWC[1]).toBeCloseTo(5000, 0);

        // Year 2 (index 2): 105,000 * 1.10 = 115,500
        expect(netWorkingCapital[2]).toBeCloseTo(115500, 0);
        expect(changeInNWC[2]).toBeCloseTo(10500, 0);

        // Verify no NaN values
        changeInNWC.forEach((change) => {
          expect(change).not.toBeNaN();
        });
      });
    });

    describe('direct method', () => {
      it('should calculate change in NWC correctly with direct values', () => {
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
          netWorkingCapital: {
            inputMethod: 'direct',
            yearlyValues: [100000, 110000, 115000, 120000, 125000, 130000],
          },
        });

        useModelStore.setState({ model });
        useModelStore.getState().calculateFinancials();

        const { netWorkingCapital, changeInNWC } = useModelStore.getState().calculatedFinancials;

        // Base year (index 0): 100,000
        expect(netWorkingCapital[0]).toBeCloseTo(100000, 0);
        expect(changeInNWC[0]).toBeCloseTo(0, 0); // Base year has no change

        // Year 1 (index 1): 110,000, Change: 110,000 - 100,000 = 10,000
        expect(netWorkingCapital[1]).toBeCloseTo(110000, 0);
        expect(changeInNWC[1]).toBeCloseTo(10000, 0);

        // Year 2 (index 2): 115,000, Change: 115,000 - 110,000 = 5,000
        expect(netWorkingCapital[2]).toBeCloseTo(115000, 0);
        expect(changeInNWC[2]).toBeCloseTo(5000, 0);

        // Year 5 (index 5): 130,000, Previous: 125,000, Change: 5,000
        expect(netWorkingCapital[5]).toBeCloseTo(130000, 0);
        expect(changeInNWC[5]).toBeCloseTo(5000, 0);

        // Verify no NaN values
        changeInNWC.forEach((change) => {
          expect(change).not.toBeNaN();
          expect(Number.isFinite(change)).toBe(true);
        });
      });
    });

    describe('Impact on Free Cash Flow', () => {
      it('should correctly impact FCF with change in NWC', () => {
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
          netWorkingCapital: {
            inputMethod: 'percentOfRevenue',
            percentMethod: 'uniform',
            percentOfRevenue: 10,
          },
          da: {
            inputMethod: 'direct',
            yearlyValues: [50000, 50000, 50000, 50000, 50000],
          },
          capex: {
            inputMethod: 'direct',
            yearlyValues: [50000, 50000, 50000, 50000, 50000],
          },
        });

        useModelStore.setState({ model });
        useModelStore.getState().calculateFinancials();

        const { netIncome, da, capex, changeInNWC, freeCashFlow } = useModelStore.getState().calculatedFinancials;

        // FCF = Net Income + D&A - CAPEX - Change in NWC
        freeCashFlow.forEach((fcf, i) => {
          const expectedFCF = netIncome[i] + da[i] - capex[i] - changeInNWC[i];
          expect(fcf).toBeCloseTo(expectedFCF, 0);
        });

        // Verify no NaN values in FCF
        freeCashFlow.forEach((fcf) => {
          expect(fcf).not.toBeNaN();
          expect(Number.isFinite(fcf)).toBe(true);
        });
      });

      it('should handle decrease in NWC (positive impact on FCF)', () => {
        const model = createTestModel({
          revenue: {
            inputType: 'consolidated',
            consolidated: {
              inputMethod: 'growth',
              growthMethod: 'uniform',
              baseValue: 1000000,
              growthRate: 0, // No revenue growth
            },
          },
          netWorkingCapital: {
            inputMethod: 'percentOfRevenue',
            percentMethod: 'individual',
            individualPercents: {
              0: 15, // Base year
              1: 10, // Decrease
              2: 8, // Further decrease
              3: 6,
              4: 5,
            },
          },
        });

        useModelStore.setState({ model });
        useModelStore.getState().calculateFinancials();

        const { changeInNWC } = useModelStore.getState().calculatedFinancials;

        // Base year (index 0): 150,000
        expect(changeInNWC[0]).toBeCloseTo(0, 0); // Base year has no change

        // Year 1 (index 1): 100,000, Change: 100,000 - 150,000 = -50,000 (decrease)
        expect(changeInNWC[1]).toBeCloseTo(-50000, 0);

        // Decrease in NWC should boost FCF
        // When NWC decreases, change is negative, and FCF = NI + DA - CAPEX - (negative) = higher
        expect(changeInNWC[1]).toBeLessThan(0);

        // Verify no NaN values
        changeInNWC.forEach((change) => {
          expect(change).not.toBeNaN();
        });
      });
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

      // Should still calculate even with negative FCF (base year + 5 projection years)
      expect(freeCashFlow).toHaveLength(6);
      expect(enterpriseValue).toBeDefined();
    });
  });
});
