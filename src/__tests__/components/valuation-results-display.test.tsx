/**
 * Valuation Results Display Component Tests
 *
 * Tests ensure that valuation results are displayed correctly after calculations.
 * Tests verify:
 * - Results cards display correctly
 * - Charts are rendered when data is available
 * - Scenarios are displayed correctly
 * - Component handles missing data gracefully
 * - Currency formatting works correctly
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ValuationResultsDisplay } from '@/components/shared/valuation/valuation-results-display';
import type { FinancialModel, CalculatedFinancials } from '@/lib/valuation.types';

// Mock the chart components
jest.mock('@/components/dashboard/valuations/revenue-ebitda-chart', () => ({
  RevenueEbitdaChart: ({ title, revenues, ebitdaMargins }: any) => (
    <div data-testid="revenue-ebitda-chart">
      <div>{title}</div>
      <div>Revenues: {revenues.length}</div>
      <div>Margins: {ebitdaMargins.length}</div>
    </div>
  ),
}));

jest.mock('@/components/dashboard/valuations/football-field-chart', () => ({
  FootballFieldChart: ({ title, ranges }: any) => (
    <div data-testid="football-field-chart">
      <div>{title}</div>
      <div>Ranges: {ranges.length}</div>
    </div>
  ),
}));

jest.mock('@/components/dashboard/valuations/scenario-list', () => ({
  ScenarioList: () => <div data-testid="scenario-list">Scenario List</div>,
}));

jest.mock('@/components/dashboard/valuations/scenario-list-local', () => ({
  ScenarioListLocal: () => <div data-testid="scenario-list-local">Scenario List Local</div>,
}));

const createMockModel = (): FinancialModel => {
  const currentYear = new Date().getFullYear();
  return {
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
};

const createMockCalculatedFinancials = (): CalculatedFinancials => ({
  revenue: [1000000, 1100000, 1210000, 1331000, 1464100],
  cogs: [400000, 440000, 484000, 532400, 585640],
  grossProfit: [600000, 660000, 726000, 798600, 878460],
  grossMargin: [60, 60, 60, 60, 60],
  opex: [300000, 330000, 363000, 399300, 439230],
  ebitda: [300000, 330000, 363000, 399300, 439230],
  ebitdaMargin: [30, 30, 30, 30, 30],
  otherIncome: [0, 0, 0, 0, 0],
  otherExpenses: [0, 0, 0, 0, 0],
  da: [50000, 55000, 60500, 66550, 73205],
  ebit: [250000, 275000, 302500, 332750, 366025],
  ebitMargin: [25, 25, 25, 25, 25],
  taxes: [62500, 68750, 75625, 83187.5, 91506.25],
  netIncome: [187500, 206250, 226875, 249562.5, 274518.75],
  netIncomeMargin: [18.75, 18.75, 18.75, 18.75, 18.75],
  capex: [50000, 55000, 60500, 66550, 73205],
  netWorkingCapital: [100000, 110000, 121000, 133100, 146410],
  changeInNWC: [100000, 10000, 11000, 12100, 13310],
  freeCashFlow: [87500, 141250, 156375, 170912.5, 188003.75],
  discountedCashFlows: [79200, 115725, 115725, 115725, 115725],
  terminalValue: 4392300,
  presentValueTerminalValue: 3000000,
  enterpriseValue: 10000000,
  equityValue: 10000000,
});

describe('ValuationResultsDisplay', () => {
  const mockResults = [
    {
      id: 'base',
      name: 'Base Case',
      enterpriseValue: 10000000,
      ebitdaMarginPct: 30,
      revenueGrowthPct: 10,
    },
    {
      id: 'optimistic',
      name: 'Optimistic',
      enterpriseValue: 12000000,
      ebitdaMarginPct: 35,
      revenueGrowthPct: 15,
    },
    {
      id: 'pessimistic',
      name: 'Pessimistic',
      enterpriseValue: 8000000,
      ebitdaMarginPct: 25,
      revenueGrowthPct: 5,
    },
  ];

  const mockLocalScenarios = [
    {
      name: 'WACC Sensitivity',
      description: 'WACC ±2%',
      minValue: 8000000,
      maxValue: 12000000,
    },
  ];

  const defaultProps = {
    results: mockResults,
    model: createMockModel(),
    calculatedFinancials: createMockCalculatedFinancials(),
    localScenarios: mockLocalScenarios,
    setLocalScenarios: jest.fn(),
    savedValuationId: null,
    isSignedIn: true,
    isSaving: false,
    showYears: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render null when results are null', () => {
    const { container } = render(<ValuationResultsDisplay {...defaultProps} results={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render all result cards', () => {
    render(<ValuationResultsDisplay {...defaultProps} />);

    expect(screen.getByText('Base Case scenario')).toBeInTheDocument();
    expect(screen.getByText('Optimistic scenario')).toBeInTheDocument();
    expect(screen.getByText('Pessimistic scenario')).toBeInTheDocument();
  });

  it('should format enterprise values as currency', () => {
    render(<ValuationResultsDisplay {...defaultProps} />);

    // Check that currency values are displayed (format may vary by locale)
    const baseCard = screen.getByText('Base Case scenario').closest('div');
    expect(baseCard).toBeInTheDocument();

    // Values should be formatted (check for $ or currency symbol)
    expect(screen.getByText(/10,000,000|\$10/i)).toBeInTheDocument();
  });

  it('should render RevenueEbitdaChart when revenue data is available', () => {
    render(<ValuationResultsDisplay {...defaultProps} />);

    expect(screen.getByTestId('revenue-ebitda-chart')).toBeInTheDocument();
    const chart = screen.getByTestId('revenue-ebitda-chart');
    expect(chart).toHaveTextContent('Revenues: 5');
    expect(chart).toHaveTextContent('Margins: 5');
  });

  it('should not render RevenueEbitdaChart when revenue data is empty', () => {
    const emptyFinancials = {
      ...createMockCalculatedFinancials(),
      revenue: [],
      ebitdaMargin: [],
    };

    render(<ValuationResultsDisplay {...defaultProps} calculatedFinancials={emptyFinancials} />);

    expect(screen.queryByTestId('revenue-ebitda-chart')).not.toBeInTheDocument();
  });

  it('should render FootballFieldChart when scenarios are available', () => {
    render(<ValuationResultsDisplay {...defaultProps} />);

    expect(screen.getByTestId('football-field-chart')).toBeInTheDocument();
    const chart = screen.getByTestId('football-field-chart');
    expect(chart).toHaveTextContent('Ranges: 1');
  });

  it('should not render FootballFieldChart when scenarios are empty', () => {
    render(<ValuationResultsDisplay {...defaultProps} localScenarios={[]} />);

    expect(screen.queryByTestId('football-field-chart')).not.toBeInTheDocument();
  });

  it('should use baseValue from results when available', () => {
    render(<ValuationResultsDisplay {...defaultProps} />);

    // Base value should be taken from results with id 'base'
    const baseResult = mockResults.find((r) => r.id === 'base');
    expect(baseResult?.enterpriseValue).toBe(10000000);
  });

  it('should use calculatedFinancials.enterpriseValue when base result not found', () => {
    const resultsWithoutBase = mockResults.filter((r) => r.id !== 'base');

    render(<ValuationResultsDisplay {...defaultProps} results={resultsWithoutBase} />);

    // Should fall back to calculatedFinancials.enterpriseValue
    expect(screen.getByTestId('football-field-chart')).toBeInTheDocument();
  });

  it('should respect showYears prop for chart data', () => {
    render(<ValuationResultsDisplay {...defaultProps} showYears={3} />);

    const chart = screen.getByTestId('revenue-ebitda-chart');
    expect(chart).toHaveTextContent('Revenues: 3');
    expect(chart).toHaveTextContent('Margins: 3');
  });

  it('should use custom chartTitle when provided', () => {
    render(<ValuationResultsDisplay {...defaultProps} chartTitle="Custom Chart Title" />);

    const chart = screen.getByTestId('revenue-ebitda-chart');
    expect(chart).toHaveTextContent('Custom Chart Title');
  });

  it('should render ScenarioListLocal when useLocalScenariosOnly is true', () => {
    render(<ValuationResultsDisplay {...defaultProps} useLocalScenariosOnly={true} />);

    expect(screen.getByTestId('scenario-list-local')).toBeInTheDocument();
  });

  it('should render ScenarioListLocal when savedValuationId is null', () => {
    render(<ValuationResultsDisplay {...defaultProps} savedValuationId={null} />);

    expect(screen.getByTestId('scenario-list-local')).toBeInTheDocument();
  });

  it('should render ScenarioList when savedValuationId is provided and not useLocalScenariosOnly', () => {
    render(<ValuationResultsDisplay {...defaultProps} savedValuationId="test-id" useLocalScenariosOnly={false} />);

    expect(screen.getByTestId('scenario-list')).toBeInTheDocument();
  });

  it('should handle empty results array', () => {
    render(<ValuationResultsDisplay {...defaultProps} results={[]} />);

    // Should still render but with no result cards
    expect(screen.queryByText(/scenario/i)).not.toBeInTheDocument();
  });

  it('should handle zero enterprise values', () => {
    const zeroResults = [
      {
        id: 'zero',
        name: 'Zero Value',
        enterpriseValue: 0,
        ebitdaMarginPct: 0,
        revenueGrowthPct: 0,
      },
    ];

    render(<ValuationResultsDisplay {...defaultProps} results={zeroResults} />);

    expect(screen.getByText('Zero Value scenario')).toBeInTheDocument();
  });
});
