'use client';

import React from 'react';
import { RevenueEbitdaChart } from './revenue-ebitda-chart';
import { FootballFieldChart } from './football-field-chart';

interface Scenario {
  id: string;
  name: string;
  description: string | null;
  minValue: number;
  maxValue: number;
}

interface ValuationReportProps {
  // Basic information
  name: string | null;
  companyName?: string | null;
  industry?: string | null;
  country?: string | null;
  createdAt: Date;

  // Financial data
  enterpriseValue: number | null;
  modelData: any;
  resultsData: any;
  scenarios?: Scenario[];

  // Display options
  showHeader?: boolean;
  className?: string;
}

/**
 * ValuationReport - A comprehensive, reusable component for displaying valuation reports
 * Can be used in both authenticated (dashboard) and public (shared) contexts
 */
export function ValuationReport({
  name,
  companyName,
  industry,
  country,
  createdAt,
  enterpriseValue,
  modelData,
  resultsData,
  scenarios = [],
  showHeader = true,
  className = '',
}: ValuationReportProps) {
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  // Extract key data
  const revenue = resultsData?.revenue || [];
  const ebitda = resultsData?.ebitda || [];
  const ebitdaMargin = resultsData?.ebitdaMargin || [];
  const freeCashFlow = resultsData?.freeCashFlow || [];
  const wacc = modelData?.terminalValue?.wacc;
  const terminalGrowthRate = modelData?.terminalValue?.terminalGrowthRate;
  const periods = modelData?.periods?.periodLabels || [];
  const numberOfYears = modelData?.periods?.numberOfYears || 5;

  // Prepare football field data
  const footballFieldData =
    scenarios.length > 0
      ? scenarios.map((scenario) => ({
          scenario: scenario.name,
          min: scenario.minValue,
          max: scenario.maxValue,
          base: enterpriseValue || 0,
        }))
      : [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      {showHeader && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{companyName || name || 'Valuation Report'}</h1>
              {companyName && name && companyName !== name && <p className="text-blue-100 mt-1">{name}</p>}
              <div className="flex items-center gap-4 mt-3 text-sm text-blue-100">
                {industry && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/30 text-white font-medium">
                    {industry}
                  </span>
                )}
                {country && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/30 text-white font-medium">
                    {country}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Report Date</p>
              <p className="text-lg font-semibold">{formatDate(createdAt)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Value Highlight */}
      <div className="bg-white border-2 border-blue-200 rounded-lg p-6 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Enterprise Value</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">{formatCurrency(enterpriseValue)}</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {wacc !== null && wacc !== undefined && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-600">WACC</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatPercent(wacc)}</p>
          </div>
        )}
        {terminalGrowthRate !== null && terminalGrowthRate !== undefined && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Terminal Growth Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatPercent(terminalGrowthRate)}</p>
          </div>
        )}
        {resultsData?.terminalValue && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Terminal Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(resultsData.terminalValue)}</p>
          </div>
        )}
      </div>

      {/* Revenue & EBITDA Chart */}
      {revenue.length > 0 && (
        <RevenueEbitdaChart
          revenues={revenue.slice(0, numberOfYears)}
          ebitdaMargins={ebitdaMargin.slice(0, numberOfYears)}
          years={periods.slice(0, numberOfYears)}
          title="Revenue & EBITDA Margin Projection"
        />
      )}

      {/* Football Field Chart - Scenario Analysis */}
      {footballFieldData.length > 0 && (
        <FootballFieldChart ranges={footballFieldData} title="Valuation Range Analysis (Scenario Analysis)" />
      )}

      {/* Financial Projections Table */}
      {revenue.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Financial Projections</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metric
                  </th>
                  {periods.slice(0, numberOfYears).map((period, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {period}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Revenue</td>
                  {revenue.slice(0, numberOfYears).map((val, idx) => (
                    <td key={idx} className="px-4 py-3 text-sm text-right text-gray-600">
                      {formatCurrency(val)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">EBITDA</td>
                  {ebitda.slice(0, numberOfYears).map((val, idx) => (
                    <td key={idx} className="px-4 py-3 text-sm text-right text-gray-600">
                      {formatCurrency(val)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">EBITDA Margin</td>
                  {ebitdaMargin.slice(0, numberOfYears).map((val, idx) => (
                    <td key={idx} className="px-4 py-3 text-sm text-right text-gray-600">
                      {formatPercent(val)}
                    </td>
                  ))}
                </tr>
                {freeCashFlow.length > 0 && (
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Free Cash Flow</td>
                    {freeCashFlow.slice(0, numberOfYears).map((val, idx) => (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-gray-600">
                        {formatCurrency(val)}
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Key Assumptions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Assumptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Projection Period</p>
            <p className="text-base text-gray-900 mt-1">{numberOfYears} years</p>
          </div>
          {wacc !== null && wacc !== undefined && (
            <div>
              <p className="text-sm font-medium text-gray-600">Discount Rate (WACC)</p>
              <p className="text-base text-gray-900 mt-1">{formatPercent(wacc)}</p>
            </div>
          )}
          {terminalGrowthRate !== null && terminalGrowthRate !== undefined && (
            <div>
              <p className="text-sm font-medium text-gray-600">Terminal Growth Rate</p>
              <p className="text-base text-gray-900 mt-1">{formatPercent(terminalGrowthRate)}</p>
            </div>
          )}
          {modelData?.riskProfile?.unleveredBeta !== null && modelData?.riskProfile?.unleveredBeta !== undefined && (
            <div>
              <p className="text-sm font-medium text-gray-600">Unlevered Beta</p>
              <p className="text-base text-gray-900 mt-1">{modelData.riskProfile.unleveredBeta.toFixed(2)}</p>
            </div>
          )}
          {modelData?.riskProfile?.leveredBeta !== null && modelData?.riskProfile?.leveredBeta !== undefined && (
            <div>
              <p className="text-sm font-medium text-gray-600">Levered Beta</p>
              <p className="text-base text-gray-900 mt-1">{modelData.riskProfile.leveredBeta.toFixed(2)}</p>
            </div>
          )}
          {modelData?.taxes?.taxRate !== null && modelData?.taxes?.taxRate !== undefined && (
            <div>
              <p className="text-sm font-medium text-gray-600">Tax Rate</p>
              <p className="text-base text-gray-900 mt-1">{formatPercent(modelData.taxes.taxRate)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Disclaimer:</strong> This valuation report is for informational purposes only and should not be
          construed as financial advice. All projections and assumptions are based on the inputs provided and may not
          reflect actual future results. Please consult with a qualified financial professional before making any
          investment decisions.
        </p>
      </div>
    </div>
  );
}
