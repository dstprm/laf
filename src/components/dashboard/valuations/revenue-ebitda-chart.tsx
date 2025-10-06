'use client';

import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
}: RevenueEbitdaChartProps) {
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
      <div className="p-4">
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: '12px', fontWeight: 500 }} />
            <YAxis
              yAxisId="left"
              stroke="#3b82f6"
              style={{ fontSize: '12px', fontWeight: 500 }}
              tickFormatter={formatCurrency}
              label={{ value: 'Ingresos', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              style={{ fontSize: '12px', fontWeight: 500 }}
              tickFormatter={formatPercent}
              label={{ value: 'Margen EBITDA (%)', angle: 90, position: 'insideRight', style: { fontSize: '12px' } }}
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
            <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="square" />
            <Bar yAxisId="left" dataKey="revenue" name="Ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ebitdaMargin"
              name="Margen EBITDA"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
