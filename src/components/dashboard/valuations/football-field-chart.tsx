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
  /**
   * Force desktop rendering (useful for PDF generation)
   */
  forceDesktop?: boolean;
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
  forceDesktop = false,
}: FootballFieldChartProps) {
  // Detect small screens to adjust sizing/spacing (unless forced to desktop or generating PDF)
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    // Check if we're in a PDF generation context
    const isPDF = document.querySelector('[data-is-pdf="true"]') !== null;
    
    if (forceDesktop || isPDF) {
      setIsMobile(false);
      return;
    }
    const handleResize = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [forceDesktop]);
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
    const denom = max - min;
    // Guard against zero/invalid ranges to avoid NaN base position
    const baseRatio = denom > 0 ? (base - min) / denom : 0.5;
    const basePosition = barX + (Number.isFinite(baseRatio) ? baseRatio : 0.5) * barWidth;

    // Calculate min and max positions for labels (draw inside to free outer space)
    const minPosition = barX + 6;
    const maxPosition = barX + barWidth - 6;
    const labelY = barY + barHeight / 2;

    return (
      <g>
        {/* Main range bar */}
        <rect x={barX} y={barY} width={barWidth} height={barHeight} fill="#3b82f6" fillOpacity={0.7} rx={4} />

        {/* Min value label - inside left */}
        <text
          x={minPosition}
          y={labelY}
          fill="#374151"
          fontSize="12"
          fontWeight="600"
          dominantBaseline="middle"
          textAnchor="start"
        >
          {formatCurrency(min)}
        </text>

        {/* Max value label - inside right */}
        <text
          x={maxPosition}
          y={labelY}
          fill="#374151"
          fontSize="12"
          fontWeight="600"
          dominantBaseline="middle"
          textAnchor="end"
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

  // Multi-line Y-axis tick renderer to avoid truncation on small screens
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const WrappedYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const text = String(payload.value || '');
    const maxChars = 22; // wrap length per line

    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length <= maxChars) {
        current = next;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    const finalLines = lines.length <= 2 ? lines : [lines[0], words.slice(lines[0].split(' ').length).join(' ')];

    return (
      <text x={x - 4} y={y} fill="#374151" fontSize={10} fontWeight={500} textAnchor="end" dominantBaseline="central">
        {finalLines.map((line, idx) => (
          <tspan key={idx} x={x - 4} dy={idx === 0 ? 0 : 12}>
            {line}
          </tspan>
        ))}
      </text>
    );
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1 hidden sm:block">
            Las barras azules muestran los rangos • La <span className="text-red-500 font-semibold">línea roja</span>{' '}
            indica el caso base
          </p>
        </div>
      )}
      <div className="p-3 sm:p-4 overflow-visible">
        <ResponsiveContainer width="100%" height={isMobile ? 320 : height}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              top: isMobile ? 12 : 20,
              right: isMobile ? 20 : 40,
              left: isMobile ? 4 : 16,
              bottom: isMobile ? 8 : 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis
              type="number"
              domain={[domainMin, domainMax]}
              tickFormatter={formatCurrency}
              stroke="#6b7280"
              style={{ fontSize: isMobile ? '10px' : '12px', fontWeight: 500 }}
            />
            <YAxis
              type="category"
              dataKey="scenario"
              stroke="#6b7280"
              style={{ fontSize: isMobile ? '10px' : '12px', fontWeight: 500 }}
              width={isMobile ? 120 : 160}
              tick={<WrappedYAxisTick />}
              interval={0}
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
