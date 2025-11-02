import { create } from 'zustand';
import {
  FinancialModel,
  RevenueAssumptions,
  COGSAssumptions,
  OpExAssumptions,
  OtherIncomeAssumptions,
  OtherExpensesAssumptions,
  ModelPeriods,
  CalculatedFinancials,
  TableRowData,
  ManualOverrides,
  GrowthRates,
  RiskProfile,
  TerminalValueAssumptions,
  EquityValueAssumptions,
} from '../types/financial';

interface ModelStore {
  model: FinancialModel;
  calculatedFinancials: CalculatedFinancials;
  selectedIndustry: string | null;
  segmentsVisible: boolean;
  cogsSegmentsVisible: boolean;
  opexSegmentsVisible: boolean;
  otherIncomeSegmentsVisible: boolean;
  otherExpensesSegmentsVisible: boolean;
  expandedSegmentFactors: Set<string>;
  jsonPreviewVisible: boolean;

  // Actions
  updatePeriods: (periods: Partial<ModelPeriods>) => void;
  updateRevenue: (updates: Partial<import('../types/financial').RevenueAssumptions>) => void;
  updateCOGS: (cogs: Partial<COGSAssumptions>) => void;
  updateOpEx: (opex: Partial<OpExAssumptions>) => void;
  updateOtherIncome: (otherIncome: Partial<OtherIncomeAssumptions>) => void;
  updateOtherExpenses: (otherExpenses: Partial<OtherExpensesAssumptions>) => void;
  updateDA: (da: Partial<FinancialModel['da']>) => void;
  updateTaxes: (taxes: Partial<FinancialModel['taxes']>) => void;
  updateCapex: (capex: Partial<FinancialModel['capex']>) => void;
  updateNetWorkingCapital: (nwc: Partial<FinancialModel['netWorkingCapital']>) => void;
  updateTerminalValue: (terminalValue: Partial<TerminalValueAssumptions>) => void;
  updateEquityValue: (equityValue: Partial<EquityValueAssumptions>) => void;
  calculateFinancials: () => void;
  getTableData: () => TableRowData[];
  updateCellValue: (rowId: string, periodIndex: number, value: number) => void;
  clearCellOverride: (rowId: string, periodIndex: number) => void;
  exportModel: () => string;
  updateSegment: (segmentId: string, updates: Partial<import('../types/financial').RevenueSegment>) => void;
  updateSegmentRow: (
    segmentId: string,
    rowId: string,
    updates: Partial<import('../types/financial').SegmentRow>,
  ) => void;
  updateCOGSSegment: (segmentId: string, updates: Partial<import('../types/financial').COGSSegment>) => void;
  updateCOGSSegmentRow: (
    segmentId: string,
    rowId: string,
    updates: Partial<import('../types/financial').SegmentRow>,
  ) => void;
  updateOpExSegment: (segmentId: string, updates: Partial<import('../types/financial').OpExSegment>) => void;
  updateOpExSegmentRow: (
    segmentId: string,
    rowId: string,
    updates: Partial<import('../types/financial').SegmentRow>,
  ) => void;
  updateOtherIncomeSegment: (
    segmentId: string,
    updates: Partial<import('../types/financial').OtherIncomeSegment>,
  ) => void;
  updateOtherIncomeSegmentRow: (
    segmentId: string,
    rowId: string,
    updates: Partial<import('../types/financial').SegmentRow>,
  ) => void;
  updateOtherExpensesSegment: (
    segmentId: string,
    updates: Partial<import('../types/financial').OtherExpensesSegment>,
  ) => void;
  updateOtherExpensesSegmentRow: (
    segmentId: string,
    rowId: string,
    updates: Partial<import('../types/financial').SegmentRow>,
  ) => void;
  toggleSegmentsVisibility: () => void;
  toggleCOGSSegmentsVisibility: () => void;
  toggleOpExSegmentsVisibility: () => void;
  toggleOtherIncomeSegmentsVisibility: () => void;
  toggleOtherExpensesSegmentsVisibility: () => void;
  toggleSegmentFactors: (segmentId: string) => void;
  updateSelectedIndustry: (industry: string | null) => void;
  updateRiskProfile: (riskProfile: Partial<RiskProfile>) => void;
  setJsonPreviewVisibility: (visible: boolean) => void;
}

const currentYear = new Date().getFullYear();

const initialModel: FinancialModel = {
  periods: {
    startYear: currentYear,
    numberOfYears: 5,
    periodLabels: Array.from({ length: 5 }, (_, i) => `${currentYear + i}E`),
  },
  riskProfile: {
    selectedIndustry: null,
    selectedCountry: null,
    unleveredBeta: 0,
    leveredBeta: 0,
    equityRiskPremium: 0,
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
    },
  },
  cogs: {
    inputType: 'consolidated',
    consolidated: {
      inputMethod: 'direct',
    },
  },
  opex: {
    inputType: 'consolidated',
    consolidated: {
      inputMethod: 'percentOfRevenue',
      percentMethod: 'uniform',
    },
  },
  otherIncome: {
    inputType: 'consolidated',
    consolidated: {
      inputMethod: 'percentOfRevenue',
      percentMethod: 'uniform',
    },
  },
  otherExpenses: {
    inputType: 'consolidated',
    consolidated: {
      inputMethod: 'percentOfRevenue',
      percentMethod: 'uniform',
    },
  },
  da: {
    inputMethod: 'direct',
  },
  taxes: {
    inputMethod: 'percentOfEBIT',
    percentMethod: 'uniform',
  },
  capex: {
    inputMethod: 'percentOfRevenue',
    percentMethod: 'uniform',
  },
  netWorkingCapital: {
    inputMethod: 'percentOfRevenue',
    percentMethod: 'uniform',
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

const initialCalculatedFinancials: CalculatedFinancials = {
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
};

// Helper function to apply manual overrides to calculated values
const applyManualOverrides = (calculatedValues: number[], manualOverrides?: ManualOverrides): number[] => {
  if (!manualOverrides) return calculatedValues;

  return calculatedValues.map((value, index) => {
    return manualOverrides[index] !== undefined ? manualOverrides[index] : value;
  });
};

// Helper function to calculate revenue with year-over-year growth
const calculateRevenueWithGrowth = (
  baseValue: number,
  numberOfYears: number,
  growthMethod: 'uniform' | 'individual',
  uniformGrowthRate?: number,
  individualGrowthRates?: GrowthRates,
): number[] => {
  const revenue: number[] = [];

  for (let i = 0; i < numberOfYears; i++) {
    if (i === 0) {
      // First year is always the base value
      revenue.push(baseValue);
    } else {
      // Calculate based on previous year's revenue
      const previousYearRevenue = revenue[i - 1];
      let growthRate = 0;

      if (growthMethod === 'uniform') {
        growthRate = (uniformGrowthRate || 0) / 100;
      } else if (growthMethod === 'individual') {
        growthRate = (individualGrowthRates?.[i] || 0) / 100;
      }

      revenue.push(previousYearRevenue * (1 + growthRate));
    }
  }

  return revenue;
};

// Helper function to calculate segment row values
const calculateSegmentRowValues = (
  row: import('../types/financial').SegmentRow,
  numberOfYears: number,
  revenueValues?: number[],
): number[] => {
  const values: number[] = [];

  if (row.inputMethod === 'direct') {
    // Direct input method
    for (let i = 0; i < numberOfYears; i++) {
      values.push(row.yearlyValues?.[i] || 0);
    }
  } else if (row.inputMethod === 'growth') {
    // Growth-based method
    const baseValue = row.baseValue || 0;
    const growthMethod = row.growthMethod || 'uniform';

    const calculatedValues = calculateRevenueWithGrowth(
      baseValue,
      numberOfYears,
      growthMethod,
      row.growthRate,
      row.individualGrowthRates,
    );

    values.push(...calculatedValues);
  } else if (row.inputMethod === 'percentOfRevenue' && revenueValues) {
    // Percentage of revenue method
    const percentMethod = row.percentMethod || 'uniform';

    if (percentMethod === 'uniform') {
      const percent = (row.percentOfRevenue || 0) / 100;
      for (let i = 0; i < numberOfYears; i++) {
        values.push(revenueValues[i] * percent);
      }
    } else {
      // Individual percentages per period
      for (let i = 0; i < numberOfYears; i++) {
        const periodPercent = (row.individualPercents?.[i] || 0) / 100;
        values.push(revenueValues[i] * periodPercent);
      }
    }
  }

  // Apply manual overrides
  return applyManualOverrides(values, row.manualOverrides);
};

// Helper function to calculate segment total values
const calculateSegmentValues = (
  segment: import('../types/financial').RevenueSegment,
  numberOfYears: number,
): number[] => {
  const values: number[] = [];

  if (segment.segmentType === 'consolidated' && segment.consolidatedRow) {
    // Single row calculation
    return calculateSegmentRowValues(segment.consolidatedRow, numberOfYears);
  } else if (segment.segmentType === 'multiplication' && segment.rows) {
    // Multiple rows multiplication
    for (let i = 0; i < numberOfYears; i++) {
      let periodValue = 1; // Start with 1 for multiplication

      for (const row of segment.rows) {
        const rowValues = calculateSegmentRowValues(row, numberOfYears);
        periodValue *= rowValues[i] || 0;
      }

      values.push(periodValue);
    }
  }

  return values;
};

// Helper function to calculate OpEx segment values
const calculateOpExSegmentValues = (
  segment: import('../types/financial').OpExSegment,
  revenueValues: number[],
  numberOfYears: number,
): number[] => {
  const values: number[] = [];

  if (segment.inputMethod === 'percentOfRevenue') {
    // Calculate as percentage of revenue
    const percentMethod = segment.percentMethod || 'uniform';

    if (percentMethod === 'uniform') {
      const percentOfRevenue = (segment.percentOfRevenue || 0) / 100;
      for (let i = 0; i < numberOfYears; i++) {
        values.push(revenueValues[i] * percentOfRevenue);
      }
    } else if (percentMethod === 'individual') {
      for (let i = 0; i < numberOfYears; i++) {
        const percent = (segment.individualPercents?.[i] || 0) / 100;
        values.push(revenueValues[i] * percent);
      }
    }
  } else if (segment.inputMethod === 'growth' || segment.inputMethod === 'direct') {
    // Calculate using segment structure (same as revenue segments)
    if (segment.segmentType === 'consolidated' && segment.consolidatedRow) {
      return calculateSegmentRowValues(segment.consolidatedRow, numberOfYears);
    } else if (segment.segmentType === 'multiplication' && segment.rows) {
      for (let i = 0; i < numberOfYears; i++) {
        let periodValue = 1; // Start with 1 for multiplication

        for (const row of segment.rows) {
          const rowValues = calculateSegmentRowValues(row, numberOfYears);
          periodValue *= rowValues[i] || 0;
        }

        values.push(periodValue);
      }
    }
  }

  return values;
};

// Helper function to calculate Other Income segment values
const calculateOtherIncomeSegmentValues = (
  segment: import('../types/financial').OtherIncomeSegment,
  revenueValues: number[],
  numberOfYears: number,
): number[] => {
  const values: number[] = [];

  if (segment.inputMethod === 'percentOfRevenue') {
    // Calculate as percentage of revenue
    const percentMethod = segment.percentMethod || 'uniform';

    if (percentMethod === 'uniform') {
      const percentOfRevenue = (segment.percentOfRevenue || 0) / 100;
      for (let i = 0; i < numberOfYears; i++) {
        values.push(revenueValues[i] * percentOfRevenue);
      }
    } else if (percentMethod === 'individual') {
      for (let i = 0; i < numberOfYears; i++) {
        const percent = (segment.individualPercents?.[i] || 0) / 100;
        values.push(revenueValues[i] * percent);
      }
    }
  } else if (segment.inputMethod === 'growth' || segment.inputMethod === 'direct') {
    // Calculate using segment structure (same as revenue segments)
    if (segment.segmentType === 'consolidated' && segment.consolidatedRow) {
      return calculateSegmentRowValues(segment.consolidatedRow, numberOfYears);
    } else if (segment.segmentType === 'multiplication' && segment.rows) {
      for (let i = 0; i < numberOfYears; i++) {
        let periodValue = 1; // Start with 1 for multiplication

        for (const row of segment.rows) {
          const rowValues = calculateSegmentRowValues(row, numberOfYears);
          periodValue *= rowValues[i] || 0;
        }

        values.push(periodValue);
      }
    }
  }

  return values;
};

// Helper function to calculate Other Expenses segment values (same logic as Other Income but treated as expenses)
const calculateOtherExpensesSegmentValues = (
  segment: import('../types/financial').OtherExpensesSegment,
  revenueValues: number[],
  numberOfYears: number,
): number[] => {
  const values: number[] = [];

  if (segment.inputMethod === 'percentOfRevenue') {
    // Calculate as percentage of revenue
    const percentMethod = segment.percentMethod || 'uniform';

    if (percentMethod === 'uniform') {
      const percentOfRevenue = (segment.percentOfRevenue || 0) / 100;
      for (let i = 0; i < numberOfYears; i++) {
        values.push(revenueValues[i] * percentOfRevenue);
      }
    } else if (percentMethod === 'individual') {
      for (let i = 0; i < numberOfYears; i++) {
        const percent = (segment.individualPercents?.[i] || 0) / 100;
        values.push(revenueValues[i] * percent);
      }
    }
  } else if (segment.inputMethod === 'growth' || segment.inputMethod === 'direct') {
    // Calculate using segment structure (same as revenue segments)
    if (segment.segmentType === 'consolidated' && segment.consolidatedRow) {
      return calculateSegmentRowValues(segment.consolidatedRow, numberOfYears);
    } else if (segment.segmentType === 'multiplication' && segment.rows) {
      for (let i = 0; i < numberOfYears; i++) {
        let periodValue = 1; // Start with 1 for multiplication

        for (const row of segment.rows) {
          const rowValues = calculateSegmentRowValues(row, numberOfYears);
          periodValue *= rowValues[i] || 0;
        }

        values.push(periodValue);
      }
    }
  }

  return values;
};

// Helper function to calculate COGS segment values
const calculateCOGSSegmentValues = (
  segment: import('../types/financial').COGSSegment,
  revenueSegmentValues: number[],
  numberOfYears: number,
  totalRevenueValues?: number[],
): number[] => {
  const values: number[] = [];

  if (segment.inputMethod === 'margin') {
    // Calculate as margin of corresponding revenue segment
    // Only works when using same segments as revenue (revenueSegmentValues provided)
    if (revenueSegmentValues.length > 0) {
      const marginMethod = segment.marginMethod || 'uniform';

      if (marginMethod === 'uniform') {
        const marginPercent = (segment.marginPercent || 0) / 100;
        for (let i = 0; i < numberOfYears; i++) {
          values.push(revenueSegmentValues[i] * marginPercent);
        }
      } else {
        // Individual margins per period
        for (let i = 0; i < numberOfYears; i++) {
          const periodMargin = segment.individualMarginPercents?.[i] || 0;
          const marginPercent = periodMargin / 100;
          values.push(revenueSegmentValues[i] * marginPercent);
        }
      }
    } else {
      // Independent COGS segments can't use margin method - return zeros
      for (let i = 0; i < numberOfYears; i++) {
        values.push(0);
      }
    }
  } else if (segment.inputMethod === 'direct' || segment.inputMethod === 'growth') {
    // Use the same calculation logic as revenue segments
    if (segment.segmentType === 'consolidated' && segment.consolidatedRow) {
      return calculateSegmentRowValues(segment.consolidatedRow, numberOfYears, totalRevenueValues);
    } else if (segment.segmentType === 'multiplication' && segment.rows) {
      // Multiple rows multiplication
      for (let i = 0; i < numberOfYears; i++) {
        let periodValue = 1; // Start with 1 for multiplication

        for (const row of segment.rows) {
          const rowValues = calculateSegmentRowValues(row, numberOfYears, totalRevenueValues);
          periodValue *= rowValues[i] || 0;
        }

        values.push(periodValue);
      }
    }
  }

  return values;
};

export const useModelStore = create<ModelStore>((set, get) => ({
  model: initialModel,
  calculatedFinancials: initialCalculatedFinancials,
  selectedIndustry: null,
  segmentsVisible: false,
  cogsSegmentsVisible: false,
  opexSegmentsVisible: false,
  otherIncomeSegmentsVisible: false,
  otherExpensesSegmentsVisible: false,
  expandedSegmentFactors: new Set(),
  jsonPreviewVisible: false,

  updatePeriods: (periods) =>
    set((state) => {
      const updatedPeriods = { ...state.model.periods, ...periods };
      if (periods.numberOfYears || periods.startYear) {
        const startYear = updatedPeriods.startYear;
        const numberOfYears = updatedPeriods.numberOfYears;
        updatedPeriods.periodLabels = Array.from({ length: numberOfYears }, (_, i) => `${startYear + i}E`);
      }
      const newModel = {
        ...state.model,
        periods: updatedPeriods,
      };
      return {
        model: newModel,
      };
    }),

  updateRevenue: (updates) =>
    set((state) => ({
      model: {
        ...state.model,
        revenue: {
          ...state.model.revenue,
          ...updates,
        },
      },
    })),

  updateCOGS: (cogs) =>
    set((state) => ({
      model: {
        ...state.model,
        cogs: { ...state.model.cogs, ...cogs },
      },
    })),

  updateOpEx: (opex) =>
    set((state) => ({
      model: {
        ...state.model,
        opex: { ...state.model.opex, ...opex },
      },
    })),

  updateOtherIncome: (otherIncome) =>
    set((state) => ({
      model: {
        ...state.model,
        otherIncome: { ...state.model.otherIncome, ...otherIncome },
      },
    })),

  updateOtherExpenses: (otherExpenses) =>
    set((state) => ({
      model: {
        ...state.model,
        otherExpenses: { ...state.model.otherExpenses, ...otherExpenses },
      },
    })),

  updateDA: (da) =>
    set((state) => ({
      model: {
        ...state.model,
        da: { ...state.model.da, ...da },
      },
    })),

  updateTaxes: (taxes) =>
    set((state) => ({
      model: {
        ...state.model,
        taxes: { ...state.model.taxes, ...taxes },
      },
    })),

  updateCapex: (capex) =>
    set((state) => ({
      model: {
        ...state.model,
        capex: { ...state.model.capex, ...capex },
      },
    })),

  updateNetWorkingCapital: (nwc) =>
    set((state) => ({
      model: {
        ...state.model,
        netWorkingCapital: { ...state.model.netWorkingCapital, ...nwc },
      },
    })),

  updateTerminalValue: (terminalValue) =>
    set((state) => ({
      model: {
        ...state.model,
        terminalValue: { ...state.model.terminalValue, ...terminalValue },
      },
    })),

  updateEquityValue: (equityValue) =>
    set((state) => ({
      model: {
        ...state.model,
        equityValue: { ...state.model.equityValue, ...equityValue },
      },
    })),

  calculateFinancials: () => {
    const { model } = get();
    const numberOfYears = model.periods.numberOfYears;

    // Calculate Revenue (base calculation with proper year-over-year growth)
    const revenueCalculated: number[] = [];

    if (model.revenue.inputType === 'consolidated' && model.revenue.consolidated) {
      if (model.revenue.consolidated.inputMethod === 'growth') {
        const baseValue = model.revenue.consolidated.baseValue || 0;
        const growthMethod = model.revenue.consolidated.growthMethod || 'uniform';

        const calculatedRevenue = calculateRevenueWithGrowth(
          baseValue,
          numberOfYears,
          growthMethod,
          model.revenue.consolidated.growthRate,
          model.revenue.consolidated.individualGrowthRates,
        );

        revenueCalculated.push(...calculatedRevenue);
      } else {
        // Direct input method - use yearlyValues if available
        for (let i = 0; i < numberOfYears; i++) {
          if (model.revenue.consolidated.yearlyValues?.[i] !== undefined) {
            revenueCalculated.push(model.revenue.consolidated.yearlyValues[i]);
          } else {
            revenueCalculated.push(0);
          }
        }
      }
    } else if (model.revenue.inputType === 'segments' && model.revenue.segments) {
      // Segment-based calculation
      for (let i = 0; i < numberOfYears; i++) {
        let totalRevenue = 0;

        // Sum up all segment revenues for this period
        for (const segment of model.revenue.segments) {
          const segmentValues = calculateSegmentValues(segment, numberOfYears);
          totalRevenue += segmentValues[i] || 0;
        }

        revenueCalculated.push(totalRevenue);
      }
    } else {
      for (let i = 0; i < numberOfYears; i++) {
        revenueCalculated.push(0);
      }
    }

    // Apply manual overrides to revenue
    // For segments, we'll need a top-level override system
    let revenueManualOverrides: ManualOverrides | undefined;
    if (model.revenue.inputType === 'consolidated') {
      revenueManualOverrides = model.revenue.consolidated?.manualOverrides;
    } else if (model.revenue.inputType === 'segments') {
      // For segments, create a top-level override system (could be enhanced later)
      revenueManualOverrides = model.revenue.consolidated?.manualOverrides;
    }

    const revenue = applyManualOverrides(revenueCalculated, revenueManualOverrides);

    // Calculate COGS (base calculation)
    const cogsCalculated: number[] = [];
    if (model.cogs.inputType === 'consolidated' && model.cogs.consolidated) {
      if (model.cogs.consolidated.inputMethod === 'direct') {
        // Direct yearly values input
        for (let i = 0; i < numberOfYears; i++) {
          cogsCalculated.push(model.cogs.consolidated.yearlyValues?.[i] || 0);
        }
      } else if (model.cogs.consolidated.inputMethod === 'growth') {
        // Growth-based calculation using base value + growth rate
        const baseValue = model.cogs.consolidated.baseValue || 0;
        const growthMethod = model.cogs.consolidated.growthMethod || 'uniform';

        if (growthMethod === 'uniform') {
          const growthRate = (model.cogs.consolidated.growthRate || 0) / 100;
          for (let i = 0; i < numberOfYears; i++) {
            cogsCalculated.push(baseValue * Math.pow(1 + growthRate, i));
          }
        } else {
          // Individual growth rates
          const individualGrowthRates = model.cogs.consolidated.individualGrowthRates || {};
          let currentValue = baseValue;
          cogsCalculated.push(currentValue);

          for (let i = 1; i < numberOfYears; i++) {
            const growthRate = (individualGrowthRates[i] || 0) / 100;
            currentValue = currentValue * (1 + growthRate);
            cogsCalculated.push(currentValue);
          }
        }
      } else if (model.cogs.consolidated.inputMethod === 'grossMargin') {
        const grossMarginPercent = (model.cogs.consolidated.grossMarginPercent || 0) / 100;
        for (let i = 0; i < numberOfYears; i++) {
          cogsCalculated.push(revenue[i] * (1 - grossMarginPercent));
        }
      } else if (model.cogs.consolidated.inputMethod === 'revenueMargin') {
        const percentMethod = model.cogs.consolidated.percentMethod || 'uniform';

        if (percentMethod === 'uniform') {
          const revenueMarginPercent = (model.cogs.consolidated.revenueMarginPercent || 0) / 100;
          for (let i = 0; i < numberOfYears; i++) {
            cogsCalculated.push(revenue[i] * revenueMarginPercent);
          }
        } else {
          // Individual percentages per period
          for (let i = 0; i < numberOfYears; i++) {
            const periodPercent = model.cogs.consolidated.individualPercents?.[i] || 0;
            const percentDecimal = periodPercent / 100;
            cogsCalculated.push(revenue[i] * percentDecimal);
          }
        }
      }
    } else if (model.cogs.inputType === 'segments' && model.cogs.segments) {
      // Segment-based COGS calculation
      for (let i = 0; i < numberOfYears; i++) {
        let totalCogs = 0;

        for (const cogsSegment of model.cogs.segments) {
          if (model.cogs.useSameSegmentsAsRevenue && model.revenue.inputType === 'segments' && model.revenue.segments) {
            // Find corresponding revenue segment
            const revenueSegmentId = cogsSegment.id.replace('cogs_', '');
            const revenueSegment = model.revenue.segments.find((seg) => seg.id === revenueSegmentId);

            if (revenueSegment) {
              const revenueSegmentValues = calculateSegmentValues(revenueSegment, numberOfYears);
              const cogsSegmentValues = calculateCOGSSegmentValues(
                cogsSegment,
                revenueSegmentValues,
                numberOfYears,
                revenue,
              );
              totalCogs += cogsSegmentValues[i] || 0;
            }
          } else {
            // Independent COGS segments - calculate directly using segment configuration
            const cogsSegmentValues = calculateCOGSSegmentValues(cogsSegment, [], numberOfYears, revenue);
            totalCogs += cogsSegmentValues[i] || 0;
          }
        }

        cogsCalculated.push(totalCogs);
      }
    } else {
      for (let i = 0; i < numberOfYears; i++) {
        cogsCalculated.push(0);
      }
    }

    // Apply manual overrides to COGS
    const cogs = applyManualOverrides(cogsCalculated, model.cogs.consolidated?.manualOverrides);

    // Calculate derived metrics
    const grossProfit = revenue.map((rev, i) => rev - cogs[i]);
    const grossMargin = revenue.map((rev, i) => (rev > 0 ? (grossProfit[i] / rev) * 100 : 0));

    // Calculate OpEx
    const opexCalculated: number[] = [];
    if (model.opex.inputType === 'consolidated' && model.opex.consolidated) {
      if (model.opex.consolidated.inputMethod === 'direct') {
        for (let i = 0; i < numberOfYears; i++) {
          opexCalculated.push(model.opex.consolidated.yearlyValues?.[i] || 0);
        }
      } else if (model.opex.consolidated.inputMethod === 'growth') {
        const baseValue = model.opex.consolidated.baseValue || 0;
        const growthMethod = model.opex.consolidated.growthMethod || 'uniform';

        const calculatedValues = calculateRevenueWithGrowth(
          baseValue,
          numberOfYears,
          growthMethod,
          model.opex.consolidated.growthRate,
          model.opex.consolidated.individualGrowthRates,
        );

        opexCalculated.push(...calculatedValues);
      } else if (model.opex.consolidated.inputMethod === 'percentOfRevenue') {
        const percentMethod = model.opex.consolidated.percentMethod || 'uniform';

        if (percentMethod === 'uniform') {
          const percentOfRevenue = (model.opex.consolidated.percentOfRevenue || 0) / 100;
          for (let i = 0; i < numberOfYears; i++) {
            opexCalculated.push(revenue[i] * percentOfRevenue);
          }
        } else if (percentMethod === 'individual') {
          for (let i = 0; i < numberOfYears; i++) {
            const percent = (model.opex.consolidated.individualPercents?.[i] || 0) / 100;
            opexCalculated.push(revenue[i] * percent);
          }
        }
      }
    } else if (model.opex.inputType === 'segments' && model.opex.segments) {
      // Calculate segments-based OpEx
      for (let i = 0; i < numberOfYears; i++) {
        let totalOpEx = 0;

        for (const opexSegment of model.opex.segments) {
          const opexSegmentValues = calculateOpExSegmentValues(opexSegment, revenue, numberOfYears);
          totalOpEx += opexSegmentValues[i] || 0;
        }

        opexCalculated.push(totalOpEx);
      }
    } else {
      for (let i = 0; i < numberOfYears; i++) {
        opexCalculated.push(0);
      }
    }

    // Apply manual overrides to OpEx
    const opex = applyManualOverrides(opexCalculated, model.opex.consolidated?.manualOverrides);

    // Calculate Other Income
    const otherIncomeCalculated: number[] = [];
    if (model.otherIncome.inputType === 'consolidated' && model.otherIncome.consolidated) {
      if (model.otherIncome.consolidated.inputMethod === 'direct') {
        for (let i = 0; i < numberOfYears; i++) {
          otherIncomeCalculated.push(model.otherIncome.consolidated.yearlyValues?.[i] || 0);
        }
      } else if (model.otherIncome.consolidated.inputMethod === 'growth') {
        const baseValue = model.otherIncome.consolidated.baseValue || 0;
        const growthMethod = model.otherIncome.consolidated.growthMethod || 'uniform';

        const calculatedValues = calculateRevenueWithGrowth(
          baseValue,
          numberOfYears,
          growthMethod,
          model.otherIncome.consolidated.growthRate,
          model.otherIncome.consolidated.individualGrowthRates,
        );

        otherIncomeCalculated.push(...calculatedValues);
      } else if (model.otherIncome.consolidated.inputMethod === 'percentOfRevenue') {
        const percentMethod = model.otherIncome.consolidated.percentMethod || 'uniform';

        if (percentMethod === 'uniform') {
          const percentOfRevenue = (model.otherIncome.consolidated.percentOfRevenue || 0) / 100;
          for (let i = 0; i < numberOfYears; i++) {
            otherIncomeCalculated.push(revenue[i] * percentOfRevenue);
          }
        } else if (percentMethod === 'individual') {
          for (let i = 0; i < numberOfYears; i++) {
            const percent = (model.otherIncome.consolidated.individualPercents?.[i] || 0) / 100;
            otherIncomeCalculated.push(revenue[i] * percent);
          }
        }
      }
    } else if (model.otherIncome.inputType === 'segments' && model.otherIncome.segments) {
      // Calculate segments-based Other Income
      for (let i = 0; i < numberOfYears; i++) {
        let totalOtherIncome = 0;

        for (const otherIncomeSegment of model.otherIncome.segments) {
          const otherIncomeSegmentValues = calculateOtherIncomeSegmentValues(
            otherIncomeSegment,
            revenue,
            numberOfYears,
          );
          totalOtherIncome += otherIncomeSegmentValues[i] || 0;
        }

        otherIncomeCalculated.push(totalOtherIncome);
      }
    } else {
      for (let i = 0; i < numberOfYears; i++) {
        otherIncomeCalculated.push(0);
      }
    }

    // Apply manual overrides to Other Income
    const otherIncome = applyManualOverrides(otherIncomeCalculated, model.otherIncome.consolidated?.manualOverrides);

    // Calculate Other Expenses
    const otherExpensesCalculated: number[] = [];
    if (model.otherExpenses.inputType === 'consolidated' && model.otherExpenses.consolidated) {
      if (model.otherExpenses.consolidated.inputMethod === 'direct') {
        for (let i = 0; i < numberOfYears; i++) {
          otherExpensesCalculated.push(model.otherExpenses.consolidated.yearlyValues?.[i] || 0);
        }
      } else if (model.otherExpenses.consolidated.inputMethod === 'growth') {
        const baseValue = model.otherExpenses.consolidated.baseValue || 0;
        const growthMethod = model.otherExpenses.consolidated.growthMethod || 'uniform';

        const calculatedValues = calculateRevenueWithGrowth(
          baseValue,
          numberOfYears,
          growthMethod,
          model.otherExpenses.consolidated.growthRate,
          model.otherExpenses.consolidated.individualGrowthRates,
        );

        otherExpensesCalculated.push(...calculatedValues);
      } else if (model.otherExpenses.consolidated.inputMethod === 'percentOfRevenue') {
        const percentMethod = model.otherExpenses.consolidated.percentMethod || 'uniform';

        if (percentMethod === 'uniform') {
          const percentOfRevenue = (model.otherExpenses.consolidated.percentOfRevenue || 0) / 100;
          for (let i = 0; i < numberOfYears; i++) {
            otherExpensesCalculated.push(revenue[i] * percentOfRevenue);
          }
        } else if (percentMethod === 'individual') {
          for (let i = 0; i < numberOfYears; i++) {
            const percent = (model.otherExpenses.consolidated.individualPercents?.[i] || 0) / 100;
            otherExpensesCalculated.push(revenue[i] * percent);
          }
        }
      }
    } else if (model.otherExpenses.inputType === 'segments' && model.otherExpenses.segments) {
      // Calculate segments-based Other Expenses
      for (let i = 0; i < numberOfYears; i++) {
        let totalOtherExpenses = 0;

        for (const otherExpensesSegment of model.otherExpenses.segments) {
          const otherExpensesSegmentValues = calculateOtherExpensesSegmentValues(
            otherExpensesSegment,
            revenue,
            numberOfYears,
          );
          totalOtherExpenses += otherExpensesSegmentValues[i] || 0;
        }

        otherExpensesCalculated.push(totalOtherExpenses);
      }
    } else {
      for (let i = 0; i < numberOfYears; i++) {
        otherExpensesCalculated.push(0);
      }
    }

    // Apply manual overrides to Other Expenses
    const otherExpenses = applyManualOverrides(
      otherExpensesCalculated,
      model.otherExpenses.consolidated?.manualOverrides,
    );

    // Calculate EBITDA (now includes other expenses as a deduction)
    const ebitda = grossProfit.map((gp, i) => gp - opex[i] + otherIncome[i] - otherExpenses[i]);
    const ebitdaMargin = revenue.map((rev, i) => (rev > 0 ? (ebitda[i] / rev) * 100 : 0));

    // Calculate D&A
    const daCalculated: number[] = [];
    if (model.da.inputMethod === 'direct') {
      for (let i = 0; i < numberOfYears; i++) {
        daCalculated.push(model.da.yearlyValues?.[i] || 0);
      }
    } else if (model.da.inputMethod === 'growth') {
      const baseValue = model.da.baseValue || 0;
      const growthMethod = model.da.growthMethod || 'uniform';

      const calculatedValues = calculateRevenueWithGrowth(
        baseValue,
        numberOfYears,
        growthMethod,
        model.da.growthRate,
        model.da.individualGrowthRates,
      );

      daCalculated.push(...calculatedValues);
    } else if (model.da.inputMethod === 'percentOfRevenue') {
      const percentMethod = model.da.percentMethod || 'uniform';

      if (percentMethod === 'uniform') {
        const percentOfRevenue = (model.da.percentOfRevenue || 0) / 100;
        for (let i = 0; i < numberOfYears; i++) {
          daCalculated.push(revenue[i] * percentOfRevenue);
        }
      } else if (percentMethod === 'individual') {
        for (let i = 0; i < numberOfYears; i++) {
          const percent = (model.da.individualPercents?.[i] || 0) / 100;
          daCalculated.push(revenue[i] * percent);
        }
      }
    } else {
      for (let i = 0; i < numberOfYears; i++) {
        daCalculated.push(0);
      }
    }

    // Apply manual overrides to D&A
    const da = applyManualOverrides(daCalculated, model.da.manualOverrides);

    // Calculate EBIT
    const ebit = ebitda.map((ebitdaVal, i) => ebitdaVal - da[i]);
    const ebitMargin = revenue.map((rev, i) => (rev > 0 ? (ebit[i] / rev) * 100 : 0));

    // Calculate Taxes
    const taxesCalculated: number[] = [];
    if (model.taxes.inputMethod === 'direct') {
      for (let i = 0; i < numberOfYears; i++) {
        taxesCalculated.push(model.taxes.yearlyValues?.[i] || 0);
      }
    } else if (model.taxes.inputMethod === 'growth') {
      const baseValue = model.taxes.baseValue || 0;
      const growthMethod = model.taxes.growthMethod || 'uniform';

      const calculatedValues = calculateRevenueWithGrowth(
        baseValue,
        numberOfYears,
        growthMethod,
        model.taxes.growthRate,
        model.taxes.individualGrowthRates,
      );

      taxesCalculated.push(...calculatedValues);
    } else if (model.taxes.inputMethod === 'percentOfEBIT') {
      const percentMethod = model.taxes.percentMethod || 'uniform';

      if (percentMethod === 'uniform') {
        const percentOfEBIT = (model.taxes.percentOfEBIT || 0) / 100;
        for (let i = 0; i < numberOfYears; i++) {
          // Only calculate taxes if EBIT is positive
          const taxableIncome = Math.max(0, ebit[i]);
          taxesCalculated.push(taxableIncome * percentOfEBIT);
        }
      } else if (percentMethod === 'individual') {
        for (let i = 0; i < numberOfYears; i++) {
          const percent = (model.taxes.individualPercents?.[i] || 0) / 100;
          // Only calculate taxes if EBIT is positive
          const taxableIncome = Math.max(0, ebit[i]);
          taxesCalculated.push(taxableIncome * percent);
        }
      }
    } else {
      for (let i = 0; i < numberOfYears; i++) {
        taxesCalculated.push(0);
      }
    }

    // Apply manual overrides to Taxes
    const taxes = applyManualOverrides(taxesCalculated, model.taxes.manualOverrides);

    // Calculate CAPEX
    const capexCalculated: number[] = [];
    if (model.capex.inputMethod === 'direct') {
      for (let i = 0; i < numberOfYears; i++) {
        capexCalculated.push(model.capex.yearlyValues?.[i] || 0);
      }
    } else if (model.capex.inputMethod === 'growth') {
      const baseValue = model.capex.baseValue || 0;
      const growthMethod = model.capex.growthMethod || 'uniform';

      const calculatedValues = calculateRevenueWithGrowth(
        baseValue,
        numberOfYears,
        growthMethod,
        model.capex.growthRate,
        model.capex.individualGrowthRates,
      );

      capexCalculated.push(...calculatedValues);
    } else if (model.capex.inputMethod === 'percentOfRevenue') {
      const percentMethod = model.capex.percentMethod || 'uniform';

      if (percentMethod === 'uniform') {
        const percentOfRevenue = (model.capex.percentOfRevenue || 0) / 100;
        for (let i = 0; i < numberOfYears; i++) {
          capexCalculated.push(revenue[i] * percentOfRevenue);
        }
      } else if (percentMethod === 'individual') {
        for (let i = 0; i < numberOfYears; i++) {
          const percent = (model.capex.individualPercents?.[i] || 0) / 100;
          capexCalculated.push(revenue[i] * percent);
        }
      }
    } else if (model.capex.inputMethod === 'percentOfEBIT') {
      const percentMethod = model.capex.percentMethod || 'uniform';

      if (percentMethod === 'uniform') {
        const percentOfEBIT = (model.capex.percentOfEBIT || 0) / 100;
        for (let i = 0; i < numberOfYears; i++) {
          capexCalculated.push(ebit[i] * percentOfEBIT);
        }
      } else if (percentMethod === 'individual') {
        for (let i = 0; i < numberOfYears; i++) {
          const percent = (model.capex.individualPercents?.[i] || 0) / 100;
          capexCalculated.push(ebit[i] * percent);
        }
      }
    } else {
      for (let i = 0; i < numberOfYears; i++) {
        capexCalculated.push(0);
      }
    }

    // Apply manual overrides to CAPEX
    const capex = applyManualOverrides(capexCalculated, model.capex.manualOverrides);

    // Calculate Net Working Capital
    // We calculate NWC for numberOfYears + 1 periods (base year + projection years)
    // to properly calculate change in NWC starting from year 0
    const nwcCalculated: number[] = [];
    const nwcPeriodsToCalculate = numberOfYears + 1; // Add one extra period for base year

    if (model.netWorkingCapital.inputMethod === 'direct') {
      for (let i = 0; i < nwcPeriodsToCalculate; i++) {
        nwcCalculated.push(model.netWorkingCapital.yearlyValues?.[i] || 0);
      }
    } else if (model.netWorkingCapital.inputMethod === 'growth') {
      const baseValue = model.netWorkingCapital.baseValue || 0;
      const growthMethod = model.netWorkingCapital.growthMethod || 'uniform';

      const calculatedValues = calculateRevenueWithGrowth(
        baseValue,
        nwcPeriodsToCalculate,
        growthMethod,
        model.netWorkingCapital.growthRate,
        model.netWorkingCapital.individualGrowthRates,
      );

      nwcCalculated.push(...calculatedValues);
    } else if (model.netWorkingCapital.inputMethod === 'percentOfRevenue') {
      // Need to calculate revenue for one extra period to get NWC for base year + all projection years
      const extendedRevenue = [...revenue];

      // Project revenue for one more period using the last year's growth rate
      if (revenue.length > 1 && revenue[revenue.length - 2] !== 0) {
        const lastYearGrowthRate =
          (revenue[revenue.length - 1] - revenue[revenue.length - 2]) / revenue[revenue.length - 2];
        extendedRevenue.push(revenue[revenue.length - 1] * (1 + lastYearGrowthRate));
      } else {
        // If only one year or previous year is 0, assume 0% growth or keep last value
        extendedRevenue.push(revenue.length > 0 ? revenue[revenue.length - 1] : 0);
      }

      const percentMethod = model.netWorkingCapital.percentMethod || 'uniform';

      if (percentMethod === 'uniform') {
        const percent = (model.netWorkingCapital.percentOfRevenue || 0) / 100;
        for (let i = 0; i < nwcPeriodsToCalculate; i++) {
          nwcCalculated.push(extendedRevenue[i] * percent);
        }
      } else {
        for (let i = 0; i < nwcPeriodsToCalculate; i++) {
          const periodPercent = (model.netWorkingCapital.individualPercents?.[i] || 0) / 100;
          nwcCalculated.push(extendedRevenue[i] * periodPercent);
        }
      }
    } else if (model.netWorkingCapital.inputMethod === 'percentOfEBIT') {
      // Need to calculate EBIT for one extra period to get NWC for base year + all projection years
      const extendedEBIT = [...ebit];

      // Project EBIT for one more period using the last year's growth rate
      if (ebit.length > 1 && ebit[ebit.length - 2] !== 0) {
        const lastYearGrowthRate = (ebit[ebit.length - 1] - ebit[ebit.length - 2]) / ebit[ebit.length - 2];
        extendedEBIT.push(ebit[ebit.length - 1] * (1 + lastYearGrowthRate));
      } else {
        // If only one year or previous year is 0, assume 0% growth or keep last value
        extendedEBIT.push(ebit.length > 0 ? ebit[ebit.length - 1] : 0);
      }

      const percentMethod = model.netWorkingCapital.percentMethod || 'uniform';

      if (percentMethod === 'uniform') {
        const percent = (model.netWorkingCapital.percentOfEBIT || 0) / 100;
        for (let i = 0; i < nwcPeriodsToCalculate; i++) {
          nwcCalculated.push(extendedEBIT[i] * percent);
        }
      } else {
        for (let i = 0; i < nwcPeriodsToCalculate; i++) {
          const periodPercent = (model.netWorkingCapital.individualPercents?.[i] || 0) / 100;
          nwcCalculated.push(extendedEBIT[i] * periodPercent);
        }
      }
    }

    // Apply manual overrides to NWC (extended array)
    const nwcWithBaseYear = applyManualOverrides(nwcCalculated, model.netWorkingCapital.manualOverrides);

    // Extract the display NWC values (projection years only, excluding base year)
    const netWorkingCapital = nwcWithBaseYear.slice(1);

    // Calculate change in NWC (for FCF calculation)
    // Now we properly calculate the change from base year (index 0) to year 1 (index 1), etc.
    const changeInNWC: number[] = [];
    for (let i = 0; i < numberOfYears; i++) {
      changeInNWC.push(nwcWithBaseYear[i + 1] - nwcWithBaseYear[i]);
    }

    // Calculate Net Income
    const netIncome = ebit.map((ebitVal, i) => ebitVal - taxes[i]);
    const netIncomeMargin = revenue.map((rev, i) => (rev > 0 ? (netIncome[i] / rev) * 100 : 0));

    // Calculate Free Cash Flow: Net Income + D&A - CAPEX - Change in NWC
    const freeCashFlow = netIncome.map((ni, i) => ni + da[i] - capex[i] - changeInNWC[i]);

    // Calculate WACC for discounting
    let discountRate = 0.09; // Default fallback rate
    const riskProfile = model.riskProfile;

    if (riskProfile) {
      const {
        riskFreeRate,
        leveredBeta,
        equityRiskPremium,
        countryRiskPremium,
        adjustedDefaultSpread,
        companySpread,
        deRatio,
        corporateTaxRate,
      } = riskProfile;

      // Cost of Equity: Rf + Beta × (ERP + CRP)
      const costOfEquity = riskFreeRate + leveredBeta * (equityRiskPremium + countryRiskPremium);

      // Cost of Debt: Rf + Adjusted Default Spread + Company Spread
      const costOfDebt = riskFreeRate + adjustedDefaultSpread + companySpread;

      // WACC: (E/V × CoE) + (D/V × CoD × (1-Tax))
      const equityWeight = 1 / (1 + deRatio); // E/V
      const debtWeight = deRatio / (1 + deRatio); // D/V
      discountRate = equityWeight * costOfEquity + debtWeight * costOfDebt * (1 - corporateTaxRate);
    }

    // Calculate Discounted Cash Flows: FCF_year_n / (1 + WACC)^n
    const discountedCashFlows = freeCashFlow.map((fcf, index) => {
      const yearNumber = index + 1; // Years start from 1, not 0
      return fcf / Math.pow(1 + discountRate, yearNumber);
    });

    // Calculate Terminal Value
    let terminalValue = 0;
    let presentValueTerminalValue = 0;

    if (numberOfYears > 0) {
      const finalYearIndex = numberOfYears - 1;

      if (model.terminalValue.method === 'growth') {
        // Growth method: TV = FCF(final year) * (1 + g) / (WACC - g)
        const growthRate = (model.terminalValue.growthRate || 0) / 100;
        const finalYearFCF = freeCashFlow[finalYearIndex];

        if (discountRate > growthRate && finalYearFCF > 0) {
          terminalValue = (finalYearFCF * (1 + growthRate)) / (discountRate - growthRate);
          // Discount back from end of final year (which is numberOfYears periods from today)
          presentValueTerminalValue = terminalValue / Math.pow(1 + discountRate, numberOfYears);
        }
      } else if (model.terminalValue.method === 'multiples') {
        // Multiples method: TV = Final Year Metric * Multiple
        const multiple = model.terminalValue.multipleValue || 10;
        const metric = model.terminalValue.multipleMetric || 'ebitda';

        let baseValue = 0;
        switch (metric) {
          case 'ebitda':
            baseValue = ebitda[finalYearIndex];
            break;
          case 'revenue':
            baseValue = revenue[finalYearIndex];
            break;
          case 'ebit':
            baseValue = ebit[finalYearIndex];
            break;
          case 'netIncome':
            baseValue = netIncome[finalYearIndex];
            break;
        }

        if (baseValue > 0) {
          terminalValue = baseValue * multiple;
          // Discount back from end of final year (which is numberOfYears periods from today)
          presentValueTerminalValue = terminalValue / Math.pow(1 + discountRate, numberOfYears);
        }
      }
    }

    // Calculate Enterprise Value: Sum of Discounted Cash Flows + PV of Terminal Value
    const enterpriseValue = discountedCashFlows.reduce((sum, dcf) => sum + dcf, 0) + presentValueTerminalValue;

    // Calculate Equity Value: EV - Net Debt + Cash
    const equityValueAssumptions = model.equityValue;
    const cash = equityValueAssumptions.cash || 0;
    const totalDebt = equityValueAssumptions.totalDebt || 0;
    const minorityInterest = equityValueAssumptions.minorityInterest || 0;
    const investmentsInSubsidiaries = equityValueAssumptions.investmentsInSubsidiaries || 0;
    const otherAdjustments = equityValueAssumptions.otherAdjustments || 0;

    const equityValue =
      enterpriseValue - totalDebt + cash - minorityInterest + investmentsInSubsidiaries + otherAdjustments;

    set({
      calculatedFinancials: {
        revenue,
        cogs,
        grossProfit,
        grossMargin,
        opex,
        ebitda,
        ebitdaMargin,
        otherIncome,
        otherExpenses,
        da,
        ebit,
        ebitMargin,
        taxes,
        netIncome,
        netIncomeMargin,
        capex,
        netWorkingCapital,
        changeInNWC,
        freeCashFlow,
        discountedCashFlows,
        terminalValue,
        presentValueTerminalValue,
        enterpriseValue,
        equityValue,
      },
    });
  },

  getTableData: () => {
    const {
      model,
      calculatedFinancials,
      segmentsVisible,
      cogsSegmentsVisible,
      opexSegmentsVisible,
      otherIncomeSegmentsVisible,
      otherExpensesSegmentsVisible,
      expandedSegmentFactors,
    } = get();

    // Calculate revenue growth rates for display
    const revenueGrowthRates: number[] = [];
    const growthRateOverrides: ManualOverrides = {};

    for (let i = 0; i < model.periods.numberOfYears; i++) {
      if (i === 0) {
        revenueGrowthRates.push(0); // No growth for base year
      } else {
        const currentRevenue = calculatedFinancials.revenue[i];
        const previousRevenue = calculatedFinancials.revenue[i - 1];
        if (previousRevenue > 0) {
          revenueGrowthRates.push((currentRevenue / previousRevenue - 1) * 100);
        } else {
          revenueGrowthRates.push(0);
        }

        // Mark as "overridden" if user has set an individual growth rate for this period
        if (
          model.revenue.consolidated?.growthMethod === 'individual' &&
          model.revenue.consolidated?.individualGrowthRates?.[i] !== undefined
        ) {
          growthRateOverrides[i] = revenueGrowthRates[i];
        }
      }
    }

    const tableData: TableRowData[] = [
      // Revenue section
      {
        id: 'revenue',
        label: 'Revenue',
        values: calculatedFinancials.revenue.map((val) => val),
        isCalculated: true,
        section: 'revenue',
        format: 'currency',
        isEditable: true,
        manualOverrides: model.revenue.consolidated?.manualOverrides,
      },
    ];

    // Add segment rows if using segments and segments are visible
    if (model.revenue.inputType === 'segments' && model.revenue.segments && segmentsVisible) {
      model.revenue.segments.forEach((segment) => {
        const segmentValues = calculateSegmentValues(segment, model.periods.numberOfYears);

        tableData.push({
          id: `segment_${segment.id}`,
          label: `  └ ${segment.name}`,
          values: segmentValues,
          isCalculated: true,
          section: 'revenue',
          format: 'currency',
          isEditable: false, // Individual segments are not directly editable in table
          segmentId: segment.id, // Add segment ID for expansion handling
        });

        // Add factor rows if segment is multiplication type and factors are expanded
        if (segment.segmentType === 'multiplication' && segment.rows && expandedSegmentFactors.has(segment.id)) {
          segment.rows.forEach((row) => {
            const rowValues = calculateSegmentRowValues(row, model.periods.numberOfYears);

            tableData.push({
              id: `factor_${segment.id}_${row.id}`,
              label: `      ├ ${row.name}`,
              values: rowValues,
              isCalculated: true,
              section: 'revenue',
              format: 'number', // Factors are typically numbers, not currency
              isEditable: false, // Individual factor rows are not directly editable in table
              segmentId: segment.id,
              factorRowId: row.id,
            });
          });
        }
      });
    }

    // Add revenue growth rate row
    tableData.push({
      id: 'revenueGrowth',
      label: 'Revenue Growth',
      values: revenueGrowthRates.map((rate) => rate),
      isCalculated: true,
      section: 'revenue',
      format: 'percentage',
      isEditable: model.revenue.inputType === 'consolidated',
      manualOverrides: growthRateOverrides,
    });

    // Rest of the financial metrics
    tableData.push({
      id: 'cogs',
      label: 'Cost of Goods Sold',
      values: calculatedFinancials.cogs.map((val) => val),
      isCalculated: true,
      section: 'cogs',
      format: 'currency',
      isEditable: true,
      manualOverrides: model.cogs.consolidated?.manualOverrides,
    });

    // Add COGS segment rows if using segments and segments are visible
    if (model.cogs.inputType === 'segments' && model.cogs.segments && cogsSegmentsVisible) {
      model.cogs.segments.forEach((cogsSegment) => {
        let segmentValues: number[] = [];

        if (model.cogs.useSameSegmentsAsRevenue && model.revenue.inputType === 'segments' && model.revenue.segments) {
          // Find corresponding revenue segment
          const revenueSegmentId = cogsSegment.id.replace('cogs_', '');
          const revenueSegment = model.revenue.segments.find((seg) => seg.id === revenueSegmentId);

          if (revenueSegment) {
            const revenueSegmentValues = calculateSegmentValues(revenueSegment, model.periods.numberOfYears);
            segmentValues = calculateCOGSSegmentValues(
              cogsSegment,
              revenueSegmentValues,
              model.periods.numberOfYears,
              calculatedFinancials.revenue,
            );
          }
        } else {
          // Independent COGS segments - calculate directly
          segmentValues = calculateCOGSSegmentValues(
            cogsSegment,
            [],
            model.periods.numberOfYears,
            calculatedFinancials.revenue,
          );
        }

        tableData.push({
          id: `cogs_segment_${cogsSegment.id}`,
          label: `  └ ${cogsSegment.name}`,
          values: segmentValues,
          isCalculated: true,
          section: 'cogs',
          format: 'currency',
          isEditable: false, // Individual COGS segments are not directly editable in table
          segmentId: cogsSegment.id,
        });

        // Add factor rows if segment is multiplication type and factors are expanded
        if (
          cogsSegment.segmentType === 'multiplication' &&
          cogsSegment.rows &&
          expandedSegmentFactors.has(cogsSegment.id)
        ) {
          cogsSegment.rows.forEach((row) => {
            const rowValues = calculateSegmentRowValues(row, model.periods.numberOfYears);

            tableData.push({
              id: `cogs_factor_${cogsSegment.id}_${row.id}`,
              label: `      ├ ${row.name}`,
              values: rowValues,
              isCalculated: true,
              section: 'cogs',
              format: 'number',
              isEditable: false,
              segmentId: cogsSegment.id,
              factorRowId: row.id,
            });
          });
        }
      });
    }

    tableData.push(
      {
        id: 'grossProfit',
        label: 'Gross Profit',
        values: calculatedFinancials.grossProfit.map((val) => val),
        isCalculated: true,
        section: 'revenue',
        format: 'currency',
        isEditable: false,
      },
      {
        id: 'grossMargin',
        label: 'Gross Margin',
        values: calculatedFinancials.grossMargin.map((val) => val),
        isCalculated: true,
        section: 'revenue',
        format: 'percentage',
        isEditable: false,
      },
      {
        id: 'opex',
        label: 'Operating Expenses',
        values: calculatedFinancials.opex.map((val) => val),
        isCalculated: true,
        section: 'opex',
        format: 'currency',
        isEditable: true,
        manualOverrides: model.opex.consolidated?.manualOverrides,
      },
    );

    // Add OpEx segment rows if using segments and segments are visible
    if (model.opex.inputType === 'segments' && model.opex.segments && opexSegmentsVisible) {
      model.opex.segments.forEach((opexSegment) => {
        const segmentValues = calculateOpExSegmentValues(
          opexSegment,
          calculatedFinancials.revenue,
          model.periods.numberOfYears,
        );

        tableData.push({
          id: `opex_segment_${opexSegment.id}`,
          label: `  └ ${opexSegment.name}`,
          values: segmentValues,
          isCalculated: true,
          section: 'opex',
          format: 'currency',
          isEditable: false, // Individual OpEx segments are not directly editable in table
          segmentId: opexSegment.id,
        });

        // Add factor rows if segment is multiplication type and factors are expanded
        if (
          opexSegment.segmentType === 'multiplication' &&
          opexSegment.rows &&
          expandedSegmentFactors.has(opexSegment.id)
        ) {
          opexSegment.rows.forEach((row) => {
            const rowValues = calculateSegmentRowValues(row, model.periods.numberOfYears);

            tableData.push({
              id: `opex_factor_${opexSegment.id}_${row.id}`,
              label: `      ├ ${row.name}`,
              values: rowValues,
              isCalculated: true,
              section: 'opex',
              format: 'number', // Factors are typically numbers, not currency
              isEditable: false, // Individual factor rows are not directly editable in table
              segmentId: opexSegment.id,
              factorRowId: row.id,
            });
          });
        }
      });
    }

    tableData.push({
      id: 'otherIncome',
      label: 'Other Income',
      values: calculatedFinancials.otherIncome.map((val) => val),
      isCalculated: true,
      section: 'otherIncome',
      format: 'currency',
      isEditable: true,
      manualOverrides: model.otherIncome.consolidated?.manualOverrides,
    });

    // Add Other Income segment rows if using segments and segments are visible
    if (model.otherIncome.inputType === 'segments' && model.otherIncome.segments && otherIncomeSegmentsVisible) {
      model.otherIncome.segments.forEach((otherIncomeSegment) => {
        const segmentValues = calculateOtherIncomeSegmentValues(
          otherIncomeSegment,
          calculatedFinancials.revenue,
          model.periods.numberOfYears,
        );

        tableData.push({
          id: `otherIncome_segment_${otherIncomeSegment.id}`,
          label: `  └ ${otherIncomeSegment.name}`,
          values: segmentValues,
          isCalculated: true,
          section: 'otherIncome',
          format: 'currency',
          isEditable: false, // Individual Other Income segments are not directly editable in table
          segmentId: otherIncomeSegment.id,
        });

        // Add factor rows if segment is multiplication type and factors are expanded
        if (
          otherIncomeSegment.segmentType === 'multiplication' &&
          otherIncomeSegment.rows &&
          expandedSegmentFactors.has(otherIncomeSegment.id)
        ) {
          otherIncomeSegment.rows.forEach((row) => {
            const rowValues = calculateSegmentRowValues(row, model.periods.numberOfYears);

            tableData.push({
              id: `otherIncome_factor_${otherIncomeSegment.id}_${row.id}`,
              label: `      ├ ${row.name}`,
              values: rowValues,
              isCalculated: true,
              section: 'otherIncome',
              format: 'number', // Factors are typically numbers, not currency
              isEditable: false, // Individual factor rows are not directly editable in table
              segmentId: otherIncomeSegment.id,
              factorRowId: row.id,
            });
          });
        }
      });
    }

    tableData.push({
      id: 'otherExpenses',
      label: 'Other Expenses',
      values: calculatedFinancials.otherExpenses.map((val) => val),
      isCalculated: true,
      section: 'otherExpenses',
      format: 'currency',
      isEditable: true,
      manualOverrides: model.otherExpenses.consolidated?.manualOverrides,
    });

    // Add Other Expenses segment rows if using segments and segments are visible
    if (model.otherExpenses.inputType === 'segments' && model.otherExpenses.segments && otherExpensesSegmentsVisible) {
      model.otherExpenses.segments.forEach((otherExpensesSegment) => {
        const segmentValues = calculateOtherExpensesSegmentValues(
          otherExpensesSegment,
          calculatedFinancials.revenue,
          model.periods.numberOfYears,
        );

        tableData.push({
          id: `otherExpenses_segment_${otherExpensesSegment.id}`,
          label: `  └ ${otherExpensesSegment.name}`,
          values: segmentValues,
          isCalculated: true,
          section: 'otherExpenses',
          format: 'currency',
          isEditable: false, // Individual Other Expenses segments are not directly editable in table
          segmentId: otherExpensesSegment.id,
        });

        // Add factor rows if segment is multiplication type and factors are expanded
        if (
          otherExpensesSegment.segmentType === 'multiplication' &&
          otherExpensesSegment.rows &&
          expandedSegmentFactors.has(otherExpensesSegment.id)
        ) {
          otherExpensesSegment.rows.forEach((row) => {
            const rowValues = calculateSegmentRowValues(row, model.periods.numberOfYears);

            tableData.push({
              id: `otherExpenses_factor_${otherExpensesSegment.id}_${row.id}`,
              label: `      ├ ${row.name}`,
              values: rowValues,
              isCalculated: true,
              section: 'otherExpenses',
              format: 'number', // Factors are typically numbers, not currency
              isEditable: false, // Individual factor rows are not directly editable in table
              segmentId: otherExpensesSegment.id,
              factorRowId: row.id,
            });
          });
        }
      });
    }

    tableData.push(
      {
        id: 'ebitda',
        label: 'EBITDA',
        values: calculatedFinancials.ebitda.map((val) => val),
        isCalculated: true,
        section: 'opex',
        format: 'currency',
        isEditable: false,
      },
      {
        id: 'ebitdaMargin',
        label: 'EBITDA Margin',
        values: calculatedFinancials.ebitdaMargin.map((val) => val),
        isCalculated: true,
        section: 'opex',
        format: 'percentage',
        isEditable: false,
      },
      {
        id: 'da',
        label: 'Depreciation & Amortization',
        values: calculatedFinancials.da.map((val) => val),
        isCalculated: true,
        section: 'da',
        format: 'currency',
        isEditable: true,
        manualOverrides: model.da.manualOverrides,
      },
      {
        id: 'ebit',
        label: 'EBIT',
        values: calculatedFinancials.ebit.map((val) => val),
        isCalculated: true,
        section: 'da',
        format: 'currency',
        isEditable: false,
      },
      {
        id: 'ebitMargin',
        label: 'EBIT Margin',
        values: calculatedFinancials.ebitMargin.map((val) => val),
        isCalculated: true,
        section: 'da',
        format: 'percentage',
        isEditable: false,
      },
      {
        id: 'taxes',
        label: 'Taxes',
        values: calculatedFinancials.taxes.map((val) => val),
        isCalculated: true,
        section: 'taxes',
        format: 'currency',
        isEditable: true,
        manualOverrides: model.taxes.manualOverrides,
      },
      {
        id: 'netIncome',
        label: 'Net Income',
        values: calculatedFinancials.netIncome.map((val) => val),
        isCalculated: true,
        section: 'taxes',
        format: 'currency',
        isEditable: false,
      },
      {
        id: 'netIncomeMargin',
        label: 'Net Income Margin',
        values: calculatedFinancials.netIncomeMargin.map((val) => val),
        isCalculated: true,
        section: 'taxes',
        format: 'percentage',
        isEditable: false,
      },
      {
        id: 'capex',
        label: 'Capital Expenditures',
        values: calculatedFinancials.capex.map((val) => val),
        isCalculated: true,
        section: 'capex',
        format: 'currency',
        isEditable: true,
        manualOverrides: model.capex.manualOverrides,
      },
      {
        id: 'netWorkingCapital',
        label: 'Net Working Capital',
        values: calculatedFinancials.netWorkingCapital.map((val) => val),
        isCalculated: true,
        section: 'netWorkingCapital',
        format: 'currency',
        isEditable: true,
        manualOverrides: model.netWorkingCapital.manualOverrides,
      },
      {
        id: 'changeInNWC',
        label: 'Change in NWC',
        values: calculatedFinancials.changeInNWC.map((val) => val),
        isCalculated: true,
        section: 'netWorkingCapital',
        format: 'currency',
        isEditable: false,
      },
      {
        id: 'freeCashFlow',
        label: 'Free Cash Flow',
        values: calculatedFinancials.freeCashFlow.map((val) => val),
        isCalculated: true,
        section: 'netWorkingCapital',
        format: 'currency',
        isEditable: false,
      },
      {
        id: 'discountedCashFlows',
        label: 'Discounted Cash Flow',
        values: calculatedFinancials.discountedCashFlows.map((val) => val),
        isCalculated: true,
        section: 'netWorkingCapital',
        format: 'currency',
        isEditable: false,
      },
      {
        id: 'terminalValue',
        label: 'Terminal Value',
        values: [...Array(model.periods.numberOfYears - 1).fill(''), calculatedFinancials.terminalValue],
        isCalculated: true,
        section: 'terminalValue',
        format: 'currency',
        isEditable: false,
      },
      {
        id: 'presentValueTerminalValue',
        label: 'PV of Terminal Value',
        values: [calculatedFinancials.presentValueTerminalValue, ...Array(model.periods.numberOfYears - 1).fill('')],
        isCalculated: true,
        section: 'terminalValue',
        format: 'currency',
        isEditable: false,
      },
      {
        id: 'enterpriseValue',
        label: 'Enterprise Value',
        values: [calculatedFinancials.enterpriseValue, ...Array(model.periods.numberOfYears - 1).fill('')],
        isCalculated: true,
        section: 'equityValue',
        format: 'currency',
        isEditable: false,
      },
      {
        id: 'equityValue',
        label: 'Equity Value',
        values: [calculatedFinancials.equityValue, ...Array(model.periods.numberOfYears - 1).fill('')],
        isCalculated: true,
        section: 'equityValue',
        format: 'currency',
        isEditable: false,
      },
    );

    return tableData;
  },

  updateCellValue: (rowId: string, periodIndex: number, value: number) =>
    set((state) => {
      const newModel = { ...state.model };

      switch (rowId) {
        case 'revenue':
          if (!newModel.revenue.consolidated) {
            newModel.revenue.consolidated = { inputMethod: 'direct' };
          }
          if (!newModel.revenue.consolidated.manualOverrides) {
            newModel.revenue.consolidated.manualOverrides = {};
          }
          newModel.revenue.consolidated.manualOverrides[periodIndex] = value;
          break;

        case 'revenueGrowth':
          // Handle growth rate editing - reverse calculate revenue
          if (periodIndex === 0) {
            // Can't edit growth for base year
            break;
          }

          if (!newModel.revenue.consolidated) {
            newModel.revenue.consolidated = { inputMethod: 'growth' };
          }

          // Switch to individual growth method if not already
          if (newModel.revenue.consolidated.growthMethod !== 'individual') {
            newModel.revenue.consolidated.growthMethod = 'individual';
            newModel.revenue.consolidated.inputMethod = 'growth';
          }

          if (!newModel.revenue.consolidated.individualGrowthRates) {
            newModel.revenue.consolidated.individualGrowthRates = {};
          }

          // Set the individual growth rate for this period
          newModel.revenue.consolidated.individualGrowthRates[periodIndex] = value;
          break;

        case 'cogs':
          if (!newModel.cogs.consolidated) {
            newModel.cogs.consolidated = { inputMethod: 'direct' };
          }
          if (!newModel.cogs.consolidated.manualOverrides) {
            newModel.cogs.consolidated.manualOverrides = {};
          }
          newModel.cogs.consolidated.manualOverrides[periodIndex] = value;
          break;

        case 'opex':
          if (!newModel.opex.consolidated) {
            newModel.opex.consolidated = { inputMethod: 'direct' };
          }
          if (!newModel.opex.consolidated.manualOverrides) {
            newModel.opex.consolidated.manualOverrides = {};
          }
          newModel.opex.consolidated.manualOverrides[periodIndex] = value;
          break;

        case 'otherIncome':
          if (!newModel.otherIncome.consolidated) {
            newModel.otherIncome.consolidated = { inputMethod: 'direct' };
          }
          if (!newModel.otherIncome.consolidated.manualOverrides) {
            newModel.otherIncome.consolidated.manualOverrides = {};
          }
          newModel.otherIncome.consolidated.manualOverrides[periodIndex] = value;
          break;

        case 'otherExpenses':
          if (!newModel.otherExpenses.consolidated) {
            newModel.otherExpenses.consolidated = { inputMethod: 'direct' };
          }
          if (!newModel.otherExpenses.consolidated.manualOverrides) {
            newModel.otherExpenses.consolidated.manualOverrides = {};
          }
          newModel.otherExpenses.consolidated.manualOverrides[periodIndex] = value;
          break;

        case 'da':
          if (!newModel.da.manualOverrides) {
            newModel.da.manualOverrides = {};
          }
          newModel.da.manualOverrides[periodIndex] = value;
          break;

        case 'taxes':
          if (!newModel.taxes.manualOverrides) {
            newModel.taxes.manualOverrides = {};
          }
          newModel.taxes.manualOverrides[periodIndex] = value;
          break;

        case 'capex':
          if (!newModel.capex.manualOverrides) {
            newModel.capex.manualOverrides = {};
          }
          newModel.capex.manualOverrides[periodIndex] = value;
          break;

        case 'netWorkingCapital':
          if (!newModel.netWorkingCapital.manualOverrides) {
            newModel.netWorkingCapital.manualOverrides = {};
          }
          newModel.netWorkingCapital.manualOverrides[periodIndex] = value;
          break;
      }

      // Trigger recalculation after updating
      const store = get();
      setTimeout(() => store.calculateFinancials(), 0);

      return { model: newModel };
    }),

  clearCellOverride: (rowId: string, periodIndex: number) =>
    set((state) => {
      const newModel = { ...state.model };

      switch (rowId) {
        case 'revenue':
          if (newModel.revenue.consolidated?.manualOverrides) {
            delete newModel.revenue.consolidated.manualOverrides[periodIndex];
          }
          break;

        case 'revenueGrowth':
          // Clear individual growth rate
          if (newModel.revenue.consolidated?.individualGrowthRates) {
            delete newModel.revenue.consolidated.individualGrowthRates[periodIndex];

            // If no individual growth rates left, could switch back to uniform
            const hasIndividualRates = Object.keys(newModel.revenue.consolidated.individualGrowthRates).length > 0;
            if (!hasIndividualRates && newModel.revenue.consolidated.growthMethod === 'individual') {
              newModel.revenue.consolidated.growthMethod = 'uniform';
            }
          }
          break;

        case 'cogs':
          if (newModel.cogs.consolidated?.manualOverrides) {
            delete newModel.cogs.consolidated.manualOverrides[periodIndex];
          }
          break;

        case 'opex':
          if (newModel.opex.consolidated?.manualOverrides) {
            delete newModel.opex.consolidated.manualOverrides[periodIndex];
          }
          break;

        case 'otherIncome':
          if (newModel.otherIncome.consolidated?.manualOverrides) {
            delete newModel.otherIncome.consolidated.manualOverrides[periodIndex];
          }
          break;

        case 'da':
          if (newModel.da.manualOverrides) {
            delete newModel.da.manualOverrides[periodIndex];
          }
          break;

        case 'taxes':
          if (newModel.taxes.manualOverrides) {
            delete newModel.taxes.manualOverrides[periodIndex];
          }
          break;

        case 'capex':
          if (newModel.capex.manualOverrides) {
            delete newModel.capex.manualOverrides[periodIndex];
          }
          break;

        case 'netWorkingCapital':
          if (newModel.netWorkingCapital.manualOverrides) {
            delete newModel.netWorkingCapital.manualOverrides[periodIndex];
          }
          break;
      }

      return { model: newModel };
    }),

  exportModel: () => {
    const { model } = get();
    return JSON.stringify(model, null, 2);
  },

  updateSegment: (segmentId: string, updates: Partial<import('../types/financial').RevenueSegment>) =>
    set((state) => ({
      model: {
        ...state.model,
        revenue: {
          ...state.model.revenue,
          segments:
            state.model.revenue.segments?.map((segment) =>
              segment.id === segmentId ? { ...segment, ...updates } : segment,
            ) || [],
        },
      },
    })),

  updateSegmentRow: (segmentId: string, rowId: string, updates: Partial<import('../types/financial').SegmentRow>) =>
    set((state) => ({
      model: {
        ...state.model,
        revenue: {
          ...state.model.revenue,
          segments:
            state.model.revenue.segments?.map((segment) => {
              if (segment.id === segmentId) {
                if (segment.segmentType === 'consolidated' && segment.consolidatedRow?.id === rowId) {
                  return { ...segment, consolidatedRow: { ...segment.consolidatedRow, ...updates } };
                } else if (segment.segmentType === 'multiplication' && segment.rows) {
                  return {
                    ...segment,
                    rows: segment.rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
                  };
                }
              }
              return segment;
            }) || [],
        },
      },
    })),

  toggleSegmentsVisibility: () =>
    set((state) => ({
      segmentsVisible: !state.segmentsVisible,
    })),

  toggleCOGSSegmentsVisibility: () =>
    set((state) => ({
      cogsSegmentsVisible: !state.cogsSegmentsVisible,
    })),

  toggleOpExSegmentsVisibility: () =>
    set((state) => ({
      opexSegmentsVisible: !state.opexSegmentsVisible,
    })),

  toggleOtherIncomeSegmentsVisibility: () =>
    set((state) => ({
      otherIncomeSegmentsVisible: !state.otherIncomeSegmentsVisible,
    })),

  toggleOtherExpensesSegmentsVisibility: () =>
    set((state) => ({
      otherExpensesSegmentsVisible: !state.otherExpensesSegmentsVisible,
    })),

  toggleSegmentFactors: (segmentId: string) =>
    set((state) => {
      const newExpanded = new Set(state.expandedSegmentFactors);
      if (newExpanded.has(segmentId)) {
        newExpanded.delete(segmentId);
      } else {
        newExpanded.add(segmentId);
      }
      return { expandedSegmentFactors: newExpanded };
    }),

  updateCOGSSegment: (segmentId: string, updates: Partial<import('../types/financial').COGSSegment>) =>
    set((state) => ({
      model: {
        ...state.model,
        cogs: {
          ...state.model.cogs,
          segments:
            state.model.cogs.segments?.map((segment) =>
              segment.id === segmentId ? { ...segment, ...updates } : segment,
            ) || [],
        },
      },
    })),

  updateCOGSSegmentRow: (segmentId: string, rowId: string, updates: Partial<import('../types/financial').SegmentRow>) =>
    set((state) => ({
      model: {
        ...state.model,
        cogs: {
          ...state.model.cogs,
          segments:
            state.model.cogs.segments?.map((segment) => {
              if (segment.id === segmentId) {
                if (segment.segmentType === 'consolidated' && segment.consolidatedRow?.id === rowId) {
                  return { ...segment, consolidatedRow: { ...segment.consolidatedRow, ...updates } };
                } else if (segment.segmentType === 'multiplication' && segment.rows) {
                  return {
                    ...segment,
                    rows: segment.rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
                  };
                }
              }
              return segment;
            }) || [],
        },
      },
    })),

  updateOpExSegment: (segmentId: string, updates: Partial<import('../types/financial').OpExSegment>) =>
    set((state) => ({
      model: {
        ...state.model,
        opex: {
          ...state.model.opex,
          segments:
            state.model.opex.segments?.map((segment) =>
              segment.id === segmentId ? { ...segment, ...updates } : segment,
            ) || [],
        },
      },
    })),

  updateOpExSegmentRow: (segmentId: string, rowId: string, updates: Partial<import('../types/financial').SegmentRow>) =>
    set((state) => ({
      model: {
        ...state.model,
        opex: {
          ...state.model.opex,
          segments:
            state.model.opex.segments?.map((segment) => {
              if (segment.id === segmentId) {
                if (segment.segmentType === 'consolidated' && segment.consolidatedRow?.id === rowId) {
                  return { ...segment, consolidatedRow: { ...segment.consolidatedRow, ...updates } };
                } else if (segment.segmentType === 'multiplication' && segment.rows) {
                  return {
                    ...segment,
                    rows: segment.rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
                  };
                }
              }
              return segment;
            }) || [],
        },
      },
    })),

  updateOtherIncomeSegment: (segmentId: string, updates: Partial<import('../types/financial').OtherIncomeSegment>) =>
    set((state) => ({
      model: {
        ...state.model,
        otherIncome: {
          ...state.model.otherIncome,
          segments:
            state.model.otherIncome.segments?.map((segment) =>
              segment.id === segmentId ? { ...segment, ...updates } : segment,
            ) || [],
        },
      },
    })),

  updateOtherIncomeSegmentRow: (
    segmentId: string,
    rowId: string,
    updates: Partial<import('../types/financial').SegmentRow>,
  ) =>
    set((state) => ({
      model: {
        ...state.model,
        otherIncome: {
          ...state.model.otherIncome,
          segments:
            state.model.otherIncome.segments?.map((segment) => {
              if (segment.id === segmentId) {
                if (segment.segmentType === 'consolidated' && segment.consolidatedRow?.id === rowId) {
                  return { ...segment, consolidatedRow: { ...segment.consolidatedRow, ...updates } };
                } else if (segment.segmentType === 'multiplication' && segment.rows) {
                  return {
                    ...segment,
                    rows: segment.rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
                  };
                }
              }
              return segment;
            }) || [],
        },
      },
    })),

  updateOtherExpensesSegment: (
    segmentId: string,
    updates: Partial<import('../types/financial').OtherExpensesSegment>,
  ) =>
    set((state) => ({
      model: {
        ...state.model,
        otherExpenses: {
          ...state.model.otherExpenses,
          segments:
            state.model.otherExpenses.segments?.map((segment) =>
              segment.id === segmentId ? { ...segment, ...updates } : segment,
            ) || [],
        },
      },
    })),

  updateOtherExpensesSegmentRow: (
    segmentId: string,
    rowId: string,
    updates: Partial<import('../types/financial').SegmentRow>,
  ) =>
    set((state) => ({
      model: {
        ...state.model,
        otherExpenses: {
          ...state.model.otherExpenses,
          segments:
            state.model.otherExpenses.segments?.map((segment) => {
              if (segment.id === segmentId) {
                if (segment.segmentType === 'consolidated' && segment.consolidatedRow?.id === rowId) {
                  return { ...segment, consolidatedRow: { ...segment.consolidatedRow, ...updates } };
                } else if (segment.segmentType === 'multiplication' && segment.rows) {
                  return {
                    ...segment,
                    rows: segment.rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
                  };
                }
              }
              return segment;
            }) || [],
        },
      },
    })),

  updateSelectedIndustry: (industry: string | null) =>
    set(() => ({
      selectedIndustry: industry,
    })),

  updateRiskProfile: (riskProfile: Partial<RiskProfile>) =>
    set((state) => ({
      model: {
        ...state.model,
        riskProfile: {
          ...(state.model.riskProfile || {
            selectedIndustry: null,
            selectedCountry: null,
            unleveredBeta: 0,
            leveredBeta: 0,
            equityRiskPremium: 0,
            countryRiskPremium: 0,
            deRatio: 0,
            adjustedDefaultSpread: 0,
            companySpread: 0.05,
            riskFreeRate: 0.0444,
            corporateTaxRate: 0.25,
          }),
          ...riskProfile,
        },
      },
    })),

  setJsonPreviewVisibility: (visible: boolean) => set({ jsonPreviewVisible: visible }),
}));
