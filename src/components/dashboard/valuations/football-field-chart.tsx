'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ValuationRange {
  scenario: string;
  min: number;
  max: number;
  base: number;
}

interface FootballFieldChartProps {
  /**
   * Array of valuation ranges for different scenarios
   */
  ranges: ValuationRange[];
  /**
   * Optional title for the chart
   */
  title?: string;
  /**
   * Optional height in pixels (default: 400)
   */
  height?: number;
  /**
   * Optional class name for custom styling
   */
  className?: string;
}

/**
 * FootballFieldChart - A reusable chart component that displays valuation ranges
 * across different scenarios in a "football field" format.
 *
 * @example
 * ```tsx
 * <FootballFieldChart
 *   ranges={[
 *     { scenario: 'WACC Sensitivity', min: 8000000, max: 12000000, base: 10000000 },
 *     { scenario: 'Growth Sensitivity', min: 7500000, max: 13000000, base: 10000000 },
 *   ]}
 *   title="Valuation Range Analysis"
 * />
 * ```
 */
export function FootballFieldChart({
  ranges,
  title = 'Análisis de rango de valuación',
  height = 400,
  className = '',
}: FootballFieldChartProps) {
  // Debug logging
  React.useEffect(() => {
    console.log('FootballFieldChart: ranges updated', {
      count: ranges.length,
      ranges: ranges,
    });
  }, [ranges]);

  // Prepare data for the chart - need to transform for horizontal bars
  const chartData = ranges.map((range) => ({
    scenario: range.scenario,
    range: [range.min, range.max],
    base: range.base,
    min: range.min,
    max: range.max,
  }));

  // Find overall min and max for domain calculation
  const allValues = ranges.flatMap((r) => [r.min, r.max]);
  const overallMin = Math.min(...allValues);
  const overallMax = Math.max(...allValues);

  // Add padding to domain (10% on each side)
  const padding = (overallMax - overallMin) * 0.1;
  const domainMin = Math.max(0, overallMin - padding);
  const domainMax = overallMax + padding;

  // Custom formatter for currency values
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  // Custom bar shape that shows the range as a horizontal bar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    const { min, max, base } = payload;

    // Calculate positions
    const barX = x;
    const barWidth = width;
    const barY = y;
    const barHeight = height;

    // Calculate base position relative to the scenario's range (min to max)
    // The bar's x position already represents min, and width represents (max - min)
    const baseRatio = (base - min) / (max - min);
    const basePosition = barX + baseRatio * barWidth;

    // Calculate min and max positions for labels
    const minPosition = barX;
    const maxPosition = barX + barWidth;
    const labelY = barY + barHeight / 2;

    return (
      <g>
        {/* Main range bar */}
        <rect x={barX} y={barY} width={barWidth} height={barHeight} fill="#3b82f6" fillOpacity={0.7} rx={4} />

        {/* Min value label - to the left of the bar */}
        <text
          x={minPosition - 8}
          y={labelY}
          fill="#374151"
          fontSize="12"
          fontWeight="600"
          dominantBaseline="middle"
          textAnchor="end"
        >
          {formatCurrency(min)}
        </text>

        {/* Max value label - to the right of the bar */}
        <text
          x={maxPosition + 8}
          y={labelY}
          fill="#374151"
          fontSize="12"
          fontWeight="600"
          dominantBaseline="middle"
          textAnchor="start"
        >
          {formatCurrency(max)}
        </text>

        {/* Base case marker - red vertical line */}
        <line
          x1={basePosition}
          y1={barY - 2}
          x2={basePosition}
          y2={barY + barHeight + 2}
          stroke="#ef4444"
          strokeWidth={3}
        />
      </g>
    );
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            Las barras azules muestran los rangos • La <span className="text-red-500 font-semibold">línea roja</span>{' '}
            indica el caso base
          </p>
        </div>
      )}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis
              type="number"
              domain={[domainMin, domainMax]}
              tickFormatter={formatCurrency}
              stroke="#6b7280"
              style={{ fontSize: '12px', fontWeight: 500 }}
            />
            <YAxis
              type="category"
              dataKey="scenario"
              stroke="#6b7280"
              style={{ fontSize: '12px', fontWeight: 500 }}
              width={150}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-gray-200 rounded-md shadow-lg p-3">
                      <p className="font-semibold text-gray-900 mb-2">{data.scenario}</p>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Bajo:</span> {formatCurrency(data.min)}
                        </p>
                        <p className="text-sm text-red-600">
                          <span className="font-medium">Base:</span> {formatCurrency(data.base)}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Alto:</span> {formatCurrency(data.max)}
                        </p>
                        <p className="text-sm text-gray-600 pt-1 border-t border-gray-200">
                          <span className="font-medium">Rango:</span> {formatCurrency(data.max - data.min)}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="range" shape={<CustomBar />} />
          </BarChart>
        </ResponsiveContainer>

        {/* Summary statistics */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600">Mínimo</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(Math.min(...ranges.map((r) => r.min)))}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Máximo</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(Math.max(...ranges.map((r) => r.max)))}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Caso base</p>
              <p className="text-sm font-semibold text-red-600">{formatCurrency(ranges[0]?.base || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Rango de valuación</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(Math.max(...ranges.map((r) => r.max)) - Math.min(...ranges.map((r) => r.min)))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
