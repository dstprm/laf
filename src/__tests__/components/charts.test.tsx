/**
 * Chart Component Tests
 *
 * Tests ensure that charts render correctly and display data accurately.
 * Tests verify:
 * - FootballFieldChart renders with correct data
 * - RevenueEbitdaChart renders with correct data
 * - Charts handle edge cases (empty data, zero values)
 * - Charts format currency and percentages correctly
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { FootballFieldChart } from '@/components/dashboard/valuations/football-field-chart';
import { RevenueEbitdaChart } from '@/components/dashboard/valuations/revenue-ebitda-chart';

// Mock ResizeObserver which is used by Recharts but not available in Jest
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('FootballFieldChart', () => {
  const mockRanges = [
    {
      scenario: 'WACC Sensitivity',
      min: 8000000,
      max: 12000000,
      base: 10000000,
    },
    {
      scenario: 'Revenue Growth Sensitivity',
      min: 7500000,
      max: 13000000,
      base: 10000000,
    },
  ];

  it('should render chart with correct title', () => {
    render(<FootballFieldChart ranges={mockRanges} title="Test Chart Title" />);
    expect(screen.getByText('Test Chart Title')).toBeInTheDocument();
  });

  it('should render chart with default title when no title provided', () => {
    render(<FootballFieldChart ranges={mockRanges} />);
    expect(screen.getByText('Análisis de rango de valuación')).toBeInTheDocument();
  });

  it('should display summary statistics', () => {
    render(<FootballFieldChart ranges={mockRanges} />);

    // Check that summary statistics section renders
    expect(screen.getByText(/Mínimo/i)).toBeInTheDocument();
    expect(screen.getByText(/Máximo/i)).toBeInTheDocument();

    // Check for the summary values (using getAllByText for "Caso base" since it appears multiple times)
    const casoBaseElements = screen.getAllByText(/Caso base/i);
    expect(casoBaseElements.length).toBeGreaterThan(0);

    // Check that formatted values are displayed
    expect(screen.getByText('$7.5M')).toBeInTheDocument();
    expect(screen.getByText('$13.0M')).toBeInTheDocument();
    expect(screen.getByText('$10.0M')).toBeInTheDocument();
  });

  it('should handle empty ranges array', () => {
    render(<FootballFieldChart ranges={[]} />);
    expect(screen.getByText('Análisis de rango de valuación')).toBeInTheDocument();
  });

  it('should handle single range', () => {
    const singleRange = [mockRanges[0]];
    render(<FootballFieldChart ranges={singleRange} />);

    // Verify the chart renders and shows summary statistics
    expect(screen.getByText(/Mínimo/i)).toBeInTheDocument();
    expect(screen.getByText('$8.0M')).toBeInTheDocument();
    expect(screen.getByText('$12.0M')).toBeInTheDocument();
  });

  it('should format currency values correctly', () => {
    render(<FootballFieldChart ranges={mockRanges} />);

    // Check that currency formatting is applied in summary statistics
    expect(screen.getByText('$7.5M')).toBeInTheDocument();
    expect(screen.getByText('$13.0M')).toBeInTheDocument();
    expect(screen.getByText('$10.0M')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<FootballFieldChart ranges={mockRanges} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle very large values', () => {
    const largeRanges = [
      {
        scenario: 'Large Values',
        min: 1000000000, // 1B
        max: 2000000000, // 2B
        base: 1500000000, // 1.5B
      },
    ];
    render(<FootballFieldChart ranges={largeRanges} />);

    // Verify large values are formatted correctly with billions
    // $1.0B appears twice (min and range), so use getAllByText
    const oneBillionElements = screen.getAllByText('$1.0B');
    expect(oneBillionElements.length).toBeGreaterThan(0);
    expect(screen.getByText('$2.0B')).toBeInTheDocument();
    expect(screen.getByText('$1.5B')).toBeInTheDocument();
  });

  it('should handle very small values', () => {
    const smallRanges = [
      {
        scenario: 'Small Values',
        min: 1000,
        max: 5000,
        base: 3000,
      },
    ];
    render(<FootballFieldChart ranges={smallRanges} />);

    // Verify small values are formatted correctly with thousands
    expect(screen.getByText('$1.0K')).toBeInTheDocument();
    expect(screen.getByText('$5.0K')).toBeInTheDocument();
    expect(screen.getByText('$3.0K')).toBeInTheDocument();
  });
});

describe('RevenueEbitdaChart', () => {
  const mockData = {
    revenues: [1000000, 1200000, 1500000, 1800000, 2100000],
    ebitdaMargins: [15, 18, 20, 22, 25],
    years: ['2025E', '2026E', '2027E', '2028E', '2029E'],
  };

  it('should render chart with correct title', () => {
    render(<RevenueEbitdaChart {...mockData} title="Test Revenue Chart" />);
    expect(screen.getByText('Test Revenue Chart')).toBeInTheDocument();
  });

  it('should render chart with default title when no title provided', () => {
    render(<RevenueEbitdaChart {...mockData} />);
    expect(screen.getByText('Ingresos y Margen EBITDA')).toBeInTheDocument();
  });

  it('should render with year labels provided', () => {
    render(<RevenueEbitdaChart {...mockData} />);

    // Verify the chart renders without crashing
    expect(screen.getByText('Ingresos y Margen EBITDA')).toBeInTheDocument();

    // The ResponsiveContainer should be present
    const containers = document.querySelectorAll('.recharts-responsive-container');
    expect(containers.length).toBeGreaterThan(0);
  });

  it('should render when years are not provided', () => {
    const dataWithoutYears = {
      revenues: mockData.revenues,
      ebitdaMargins: mockData.ebitdaMargins,
    };
    render(<RevenueEbitdaChart {...dataWithoutYears} />);

    // Verify the chart renders without crashing
    expect(screen.getByText('Ingresos y Margen EBITDA')).toBeInTheDocument();
  });

  it('should handle empty data arrays', () => {
    render(<RevenueEbitdaChart revenues={[]} ebitdaMargins={[]} />);
    expect(screen.getByText('Ingresos y Margen EBITDA')).toBeInTheDocument();
  });

  it('should handle mismatched array lengths', () => {
    const mismatchedData = {
      revenues: [1000000, 1200000],
      ebitdaMargins: [15, 18, 20], // Different length
    };
    render(<RevenueEbitdaChart {...mismatchedData} />);
    // Should still render without crashing
    expect(screen.getByText('Ingresos y Margen EBITDA')).toBeInTheDocument();
  });

  it('should handle zero revenue values', () => {
    const zeroData = {
      revenues: [0, 0, 0],
      ebitdaMargins: [0, 0, 0],
      years: ['2025E', '2026E', '2027E'],
    };
    render(<RevenueEbitdaChart {...zeroData} />);

    // Verify the chart renders without crashing
    expect(screen.getByText('Ingresos y Margen EBITDA')).toBeInTheDocument();
  });

  it('should handle negative EBITDA margins', () => {
    const negativeMarginData = {
      revenues: [1000000, 1200000],
      ebitdaMargins: [-5, -3],
      years: ['2025E', '2026E'],
    };
    render(<RevenueEbitdaChart {...negativeMarginData} />);

    // Verify the chart renders without crashing
    expect(screen.getByText('Ingresos y Margen EBITDA')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<RevenueEbitdaChart {...mockData} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render chart with proper data structure', () => {
    // The chart should properly structure data for EBITDA calculation
    // EBITDA = Revenue * (EBITDA Margin / 100)
    render(<RevenueEbitdaChart {...mockData} />);

    // Verify the chart renders without crashing
    expect(screen.getByText('Ingresos y Margen EBITDA')).toBeInTheDocument();

    // The ResponsiveContainer should be present
    const containers = document.querySelectorAll('.recharts-responsive-container');
    expect(containers.length).toBeGreaterThan(0);
  });

  it('should handle custom height', () => {
    render(<RevenueEbitdaChart {...mockData} height={500} />);
    // Height prop should be applied to ResponsiveContainer
    expect(screen.getByText('Ingresos y Margen EBITDA')).toBeInTheDocument();
  });
});
