export interface PriceQuantityModel {
  quantity: number | null;
  quantityGrowthRate?: number;
  price: number | null;
  priceGrowthRate?: number;
}

export interface SegmentRow {
  id: string;
  name: string;
  inputMethod: 'growth' | 'direct' | 'percentOfRevenue';
  
  // Growth-based fields
  baseValue?: number;
  growthMethod?: 'uniform' | 'individual';
  growthRate?: number;
  individualGrowthRates?: GrowthRates;
  
  // Direct input fields
  yearlyValues?: number[];
  
  // Percentage of revenue fields
  percentMethod?: 'uniform' | 'individual';
  percentOfRevenue?: number; // Uniform percentage
  individualPercents?: { [periodIndex: number]: number }; // Individual percentages per period
  
  // Manual overrides
  manualOverrides?: ManualOverrides;
}

export interface RevenueSegment {
  id: string;
  name: string;
  segmentType: 'consolidated' | 'multiplication';
  
  // For consolidated segments (single row)
  consolidatedRow?: SegmentRow;
  
  // For multiplication segments (multiple rows)
  rows?: SegmentRow[];
  
  // Calculated values for this segment
  calculatedValues?: number[];
}

export interface ManualOverrides {
  [periodIndex: number]: number; // periodIndex -> overridden value
}

export interface GrowthRates {
  [periodIndex: number]: number; // periodIndex -> growth rate for that year
}

export interface RevenueAssumptions {
  inputType: 'consolidated' | 'segments';
  consolidated?: {
    inputMethod: 'direct' | 'growth';
    baseValue?: number; // Year 0 or base year value
    growthMethod?: 'uniform' | 'individual'; // New: how to apply growth rates
    growthRate?: number; // Uniform growth rate
    individualGrowthRates?: GrowthRates; // Individual growth rates per year
    yearlyValues?: number[]; // Calculated values for each period
    manualOverrides?: ManualOverrides; // Manual cell overrides
  };
  segments?: RevenueSegment[];
}

export interface COGSSegment {
  id: string;
  name: string;
  segmentType: 'consolidated' | 'multiplication';
  
  // Input method for this segment
  inputMethod: 'direct' | 'margin' | 'growth'; // Added 'growth' method
  
  // For margin-based input (when using same segments as revenue)
  marginMethod?: 'uniform' | 'individual'; // How to apply margin percentages
  marginPercent?: number; // Uniform margin as percentage of corresponding revenue segment
  individualMarginPercents?: { [periodIndex: number]: number }; // Individual margins per period
  
  // For consolidated segments (single row) - same structure as revenue
  consolidatedRow?: SegmentRow;
  
  // For multiplication segments (multiple rows) - same structure as revenue
  rows?: SegmentRow[];
  
  // Calculated values for this segment
  calculatedValues?: number[];
}

export interface COGSAssumptions {
  inputType: 'consolidated' | 'segments';
  
  // Consolidated COGS
  consolidated?: {
    inputMethod: 'direct' | 'growth' | 'grossMargin' | 'revenueMargin';
    baseValue?: number;
    growthMethod?: 'uniform' | 'individual'; // How to apply growth rates
    growthRate?: number; // Uniform growth rate
    individualGrowthRates?: GrowthRates; // Individual growth rates per year
    grossMarginPercent?: number; // gross margin as % of revenue
    revenueMarginPercent?: number; // COGS as % of revenue (uniform)
    percentMethod?: 'uniform' | 'individual'; // How to apply revenue margin percentages
    individualPercents?: { [periodIndex: number]: number }; // Individual revenue margin percentages per period
    yearlyValues?: number[]; // Direct input values for each period
    manualOverrides?: ManualOverrides;
  };
  
  // Segment-based COGS
  segments?: COGSSegment[];
  useSameSegmentsAsRevenue?: boolean; // if true, mirror revenue segments
}

export interface OpExSegment {
  id: string;
  name: string;
  segmentType: 'consolidated' | 'multiplication';
  
  // Input method for this segment
  inputMethod: 'direct' | 'percentOfRevenue' | 'growth';
  
  // For percentage of revenue-based input
  percentMethod?: 'uniform' | 'individual'; // How to apply percentages
  percentOfRevenue?: number; // Uniform percentage of revenue
  individualPercents?: { [periodIndex: number]: number }; // Individual percentages per period
  
  // For consolidated segments (single row) - same structure as revenue
  consolidatedRow?: SegmentRow;
  
  // For multiplication segments (multiple rows) - same structure as revenue
  rows?: SegmentRow[];
  
  // Calculated values for this segment
  calculatedValues?: number[];
}

export interface OpExAssumptions {
  inputType: 'consolidated' | 'segments';
  
  // Consolidated OpEx
  consolidated?: {
    inputMethod: 'direct' | 'percentOfRevenue' | 'growth';
    baseValue?: number;
    growthMethod?: 'uniform' | 'individual'; // How to apply growth rates
    growthRate?: number; // Uniform growth rate
    individualGrowthRates?: GrowthRates; // Individual growth rates per year
    percentMethod?: 'uniform' | 'individual'; // How to apply percentages of revenue
    percentOfRevenue?: number; // Uniform percentage of revenue
    individualPercents?: { [periodIndex: number]: number }; // Individual percentages per period
    yearlyValues?: number[]; // Direct input values for each period
    manualOverrides?: ManualOverrides;
  };
  
  // Segment-based OpEx
  segments?: OpExSegment[];
}

export interface OtherIncomeSegment {
  id: string;
  name: string;
  segmentType: 'consolidated' | 'multiplication';
  
  // Input method for this segment
  inputMethod: 'direct' | 'percentOfRevenue' | 'growth';
  
  // For percentage of revenue-based input
  percentMethod?: 'uniform' | 'individual'; // How to apply percentages
  percentOfRevenue?: number; // Uniform percentage of revenue
  individualPercents?: { [periodIndex: number]: number }; // Individual percentages per period
  
  // For consolidated segments (single row) - same structure as revenue
  consolidatedRow?: SegmentRow;
  
  // For multiplication segments (multiple rows) - same structure as revenue
  rows?: SegmentRow[];
  
  // Calculated values for this segment
  calculatedValues?: number[];
}

export interface OtherIncomeAssumptions {
  inputType: 'consolidated' | 'segments';
  
  // Consolidated Other Income
  consolidated?: {
    inputMethod: 'direct' | 'percentOfRevenue' | 'growth';
    baseValue?: number;
    growthMethod?: 'uniform' | 'individual'; // How to apply growth rates
    growthRate?: number; // Uniform growth rate
    individualGrowthRates?: GrowthRates; // Individual growth rates per year
    percentMethod?: 'uniform' | 'individual'; // How to apply percentages of revenue
    percentOfRevenue?: number; // Uniform percentage of revenue
    individualPercents?: { [periodIndex: number]: number }; // Individual percentages per period
    yearlyValues?: number[]; // Direct input values for each period
    manualOverrides?: ManualOverrides;
  };
  
  // Segment-based Other Income
  segments?: OtherIncomeSegment[];
}

export interface OtherExpensesSegment {
  id: string;
  name: string;
  segmentType: 'consolidated' | 'multiplication';
  
  // Input method for this segment
  inputMethod: 'direct' | 'percentOfRevenue' | 'growth';
  
  // For percentage of revenue-based input
  percentMethod?: 'uniform' | 'individual'; // How to apply percentages
  percentOfRevenue?: number; // Uniform percentage of revenue
  individualPercents?: { [periodIndex: number]: number }; // Individual percentages per period
  
  // For consolidated segments (single row) - same structure as revenue
  consolidatedRow?: SegmentRow;
  
  // For multiplication segments (multiple rows) - same structure as revenue
  rows?: SegmentRow[];
  
  // Calculated values for this segment
  calculatedValues?: number[];
}

export interface OtherExpensesAssumptions {
  inputType: 'consolidated' | 'segments';
  
  // Consolidated Other Expenses
  consolidated?: {
    inputMethod: 'direct' | 'percentOfRevenue' | 'growth';
    baseValue?: number;
    growthMethod?: 'uniform' | 'individual'; // How to apply growth rates
    growthRate?: number; // Uniform growth rate
    individualGrowthRates?: GrowthRates; // Individual growth rates per year
    percentMethod?: 'uniform' | 'individual'; // How to apply percentages of revenue
    percentOfRevenue?: number; // Uniform percentage of revenue
    individualPercents?: { [periodIndex: number]: number }; // Individual percentages per period
    yearlyValues?: number[]; // Direct input values for each period
    manualOverrides?: ManualOverrides;
  };
  
  // Segment-based Other Expenses
  segments?: OtherExpensesSegment[];
}

export interface TerminalValueAssumptions {
  method: 'growth' | 'multiples';
  
  // Growth method (perpetual growth)
  growthRate?: number; // Terminal growth rate as percentage (e.g., 2.5 for 2.5%)
  
  // Multiples method
  multipleMetric?: 'ebitda' | 'revenue' | 'ebit' | 'netIncome'; // Which metric to apply multiple to
  multipleValue?: number; // The multiple to apply (e.g., 10 for 10x EBITDA)
}

export interface EquityValueAssumptions {
  // Balance sheet items to go from EV to Equity Value
  cash?: number; // Cash and cash equivalents ($M)
  totalDebt?: number; // Total debt including short-term and long-term ($M)
  
  // Optional: other adjustments
  minorityInterest?: number; // Minority interest ($M)
  investmentsInSubsidiaries?: number; // Investments in subsidiaries ($M)
  otherAdjustments?: number; // Other adjustments ($M)
}

export interface ModelPeriods {
  startYear: number;
  numberOfYears: number;
  periodLabels: string[]; // e.g., ['2024E', '2025E', '2026E', '2027E', '2028E']
}

export interface RiskProfile {
  selectedIndustry: string | null;
  selectedCountry: string | null;
  unleveredBeta: number;
  leveredBeta: number;
  equityRiskPremium: number;
  countryRiskPremium: number;
  deRatio: number;
  adjustedDefaultSpread: number;
  companySpread: number;
  riskFreeRate: number;
  corporateTaxRate: number;
}

export interface FinancialModel {
  periods: ModelPeriods;
  riskProfile?: RiskProfile;
  revenue: RevenueAssumptions;
  cogs: COGSAssumptions;
  opex: OpExAssumptions;
  otherIncome: OtherIncomeAssumptions;
  otherExpenses: OtherExpensesAssumptions;
  da: {
    inputMethod: 'direct' | 'percentOfRevenue' | 'growth';
    baseValue?: number;
    growthMethod?: 'uniform' | 'individual'; // How to apply growth rates
    growthRate?: number; // Uniform growth rate
    individualGrowthRates?: GrowthRates; // Individual growth rates per year
    percentMethod?: 'uniform' | 'individual'; // How to apply percentages of revenue
    percentOfRevenue?: number; // Uniform percentage of revenue
    individualPercents?: { [periodIndex: number]: number }; // Individual percentages per period
    yearlyValues?: number[]; // Direct input values for each period
    manualOverrides?: ManualOverrides;
  };
  taxes: {
    inputMethod: 'direct' | 'percentOfEBIT' | 'growth';
    baseValue?: number;
    growthMethod?: 'uniform' | 'individual'; // How to apply growth rates
    growthRate?: number; // Uniform growth rate
    individualGrowthRates?: GrowthRates; // Individual growth rates per year
    percentMethod?: 'uniform' | 'individual'; // How to apply percentages of EBIT
    percentOfEBIT?: number; // Uniform percentage of EBIT (tax rate)
    individualPercents?: { [periodIndex: number]: number }; // Individual tax rates per period
    yearlyValues?: number[]; // Direct input values for each period
    manualOverrides?: ManualOverrides;
  };
  capex: {
    inputMethod: 'direct' | 'percentOfRevenue' | 'percentOfEBIT' | 'growth';
    baseValue?: number;
    growthMethod?: 'uniform' | 'individual'; // How to apply growth rates
    growthRate?: number; // Uniform growth rate
    individualGrowthRates?: GrowthRates; // Individual growth rates per year
    percentMethod?: 'uniform' | 'individual'; // How to apply percentages
    percentOfRevenue?: number; // Uniform percentage of revenue
    percentOfEBIT?: number; // Uniform percentage of EBIT
    individualPercents?: { [periodIndex: number]: number }; // Individual percentages per period
    yearlyValues?: number[]; // Direct input values for each period
    manualOverrides?: ManualOverrides;
  };
  netWorkingCapital: {
    inputMethod: 'direct' | 'percentOfRevenue' | 'percentOfEBIT' | 'growth';
    baseValue?: number;
    growthMethod?: 'uniform' | 'individual'; // How to apply growth rates
    growthRate?: number; // Uniform growth rate
    individualGrowthRates?: GrowthRates; // Individual growth rates per year
    percentMethod?: 'uniform' | 'individual'; // How to apply percentages
    percentOfRevenue?: number; // Uniform percentage of revenue
    percentOfEBIT?: number; // Uniform percentage of EBIT
    individualPercents?: { [periodIndex: number]: number }; // Individual percentages per period
    yearlyValues?: number[]; // Direct input values for each period
    manualOverrides?: ManualOverrides;
  };
  terminalValue: TerminalValueAssumptions;
  equityValue: EquityValueAssumptions;
}

export interface CalculatedFinancials {
  revenue: number[];
  cogs: number[];
  grossProfit: number[];
  grossMargin: number[];
  opex: number[];
  ebitda: number[];
  ebitdaMargin: number[];
  otherIncome: number[];
  otherExpenses: number[];
  da: number[];
  ebit: number[];
  ebitMargin: number[];
  taxes: number[];
  netIncome: number[];
  netIncomeMargin: number[];
  capex: number[];
  netWorkingCapital: number[];
  changeInNWC: number[];
  freeCashFlow: number[];
  discountedCashFlows: number[]; // Present value of each year's free cash flow
  terminalValue: number; // Terminal value in final year
  presentValueTerminalValue: number; // Present value of terminal value
  enterpriseValue: number; // Sum of discounted cash flows + PV of terminal value
  equityValue: number; // Enterprise value - net debt + cash
  // Add more calculated metrics as needed
}

export type ModelSection = 'periods' | 'revenue' | 'cogs' | 'opex' | 'otherIncome' | 'otherExpenses' | 'da' | 'taxes' | 'capex' | 'netWorkingCapital' | 'terminalValue' | 'equityValue';

export interface TableRowData {
  id: string;
  label: string;
  values: (number | string)[];
  isCalculated: boolean;
  section: ModelSection;
  format: 'currency' | 'percentage' | 'number';
  isEditable: boolean; // Whether cells can be manually edited
  manualOverrides?: ManualOverrides; // Track which cells are manually overridden
  segmentId?: string; // For segment-specific rows
  factorRowId?: string; // For factor rows within segments
} 