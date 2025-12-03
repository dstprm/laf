'use client';

import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface RevenueEbitdaChartProps {
  /**
   * Array of revenue values (in currency units)
   */
  revenues: number[];
  /**
   * Array of EBITDA margin percentages
   */
  ebitdaMargins: number[];
  /**
   * Array of year labels (e.g., ['2025E', '2026E', '2027E'])
   * If not provided, will default to Year 1, Year 2, etc.
   */
  years?: string[];
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
 * RevenueEbitdaChart - A reusable chart component that displays revenue as bars
 * and EBITDA margins as a line on the same chart.
 *
 * @example
 * ```tsx
 * <RevenueEbitdaChart
 *   revenues={[1000000, 1200000, 1500000]}
 *   ebitdaMargins={[15, 18, 20]}
 *   years={['2025E', '2026E', '2027E']}
 *   title="Revenue & EBITDA Margin Projection"
 * />
 * ```
 */
export function RevenueEbitdaChart({
  revenues,
  ebitdaMargins,
  years,
  title = 'Ingresos y Margen EBITDA',
  height = 400,
  className = '',
  forceDesktop = false,
}: RevenueEbitdaChartProps) {
  // Detect small screens to adjust sizing and spacing (unless forced to desktop or generating PDF)
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
  // Prepare data for the chart
  const chartData = revenues.map((revenue, index) => {
    const ebitdaMargin = ebitdaMargins[index] || 0;
    const ebitda = revenue * (ebitdaMargin / 100);
    return {
      year: years?.[index] || `Año ${index + 1}`,
      revenue: revenue,
      ebitda: ebitda,
      ebitdaMargin: ebitdaMargin,
    };
  });

  // Custom formatter for currency values
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  // Custom formatter for percentage values
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-4 overflow-visible">
        <ResponsiveContainer width="100%" height={isMobile ? 260 : height}>
          <ComposedChart
            data={chartData}
            margin={{
              top: isMobile ? 12 : 20,
              right: isMobile ? 20 : 50,
              left: isMobile ? 8 : 20,
              bottom: isMobile ? 8 : 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: isMobile ? '10px' : '12px', fontWeight: 500 }} />
            <YAxis
              yAxisId="left"
              stroke="#3b82f6"
              style={{ fontSize: isMobile ? '10px' : '12px', fontWeight: 500 }}
              tickFormatter={formatCurrency}
              label={
                isMobile
                  ? undefined
                  : { value: 'Ingresos', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }
              }
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              style={{ fontSize: isMobile ? '10px' : '12px', fontWeight: 500 }}
              tickFormatter={formatPercent}
              label={
                isMobile
                  ? undefined
                  : { value: 'Margen EBITDA (%)', angle: 90, position: 'insideRight', style: { fontSize: '12px' } }
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.96)',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-gray-200 rounded-md shadow-lg p-3">
                      <p className="font-semibold text-gray-900 mb-2">{data.year}</p>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Ingresos:</span> {formatCurrency(data.revenue)}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">EBITDA:</span> {formatCurrency(data.ebitda)}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Margen EBITDA:</span> {formatPercent(data.ebitdaMargin)}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '8px', fontSize: isMobile ? '12px' : '14px' }} iconType="square" />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              name="Ingresos"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              barSize={isMobile ? 18 : undefined}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#9ca3af' : '#3b82f6'} />
              ))}
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ebitdaMargin"
              name="Margen EBITDA"
              stroke="#10b981"
              strokeWidth={isMobile ? 2 : 3}
              dot={{ fill: '#10b981', r: isMobile ? 4 : 5 }}
              activeDot={{ r: isMobile ? 6 : 7 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
