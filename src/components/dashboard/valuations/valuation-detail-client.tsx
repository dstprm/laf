'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JsonValue } from '@prisma/client/runtime/library';

interface ValuationDetailClientProps {
  modelData: JsonValue;
  resultsData: JsonValue;
}

export default function ValuationDetailClient({ modelData, resultsData }: ValuationDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'raw'>('overview');

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

  const modelDataObj = modelData as Record<string, unknown>;
  const resultsDataObj = resultsData as Record<string, unknown>;

  const periods = (modelDataObj?.periods as { periodLabels?: string[] })?.periodLabels || [];

  // Extract key metrics
  const revenue = (resultsDataObj?.revenue as number[]) || [];
  const ebitda = (resultsDataObj?.ebitda as number[]) || [];
  const ebitdaMargin = (resultsDataObj?.ebitdaMargin as number[]) || [];
  const freeCashFlow = (resultsDataObj?.freeCashFlow as number[]) || [];
  const discountedCashFlows = (resultsDataObj?.discountedCashFlows as number[]) || [];
  const enterpriseValue = (resultsDataObj?.enterpriseValue as number) || 0;
  const terminalValue = (resultsDataObj?.terminalValue as number) || 0;
  const presentValueTerminalValue = (resultsDataObj?.presentValueTerminalValue as number) || 0;

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'financials' | 'raw')}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="financials">Full DCF Table</TabsTrigger>
        <TabsTrigger value="raw">Raw Data</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Key Metrics</h3>
          </div>
          <div className="border-t border-gray-200">
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Enterprise Value</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900 sm:mt-0 sm:col-span-2">
                {formatCurrency(enterpriseValue)}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Terminal Value</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatCurrency(terminalValue)}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">PV of Terminal Value</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatCurrency(presentValueTerminalValue)}
              </dd>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Revenue & EBITDA Summary</h3>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Year
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Revenue
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      EBITDA
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      EBITDA Margin
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Free Cash Flow
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {periods.map((period: string, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{period}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(revenue[index])}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(ebitda[index])}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPercent(ebitdaMargin[index])}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(freeCashFlow[index])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="financials">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Complete DCF Table</h3>
          </div>
          <div className="border-t border-gray-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50"
                  >
                    Line Item
                  </th>
                  {periods.map((period: string) => (
                    <th
                      key={period}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {period}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="bg-blue-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 sticky left-0 bg-blue-50">
                    Revenue
                  </td>
                  {revenue.map((val: number, i: number) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(val)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 sticky left-0 bg-white">
                    COGS
                  </td>
                  {((resultsDataObj?.cogs as number[]) || []).map((val: number, i: number) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(val)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50">
                    Gross Profit
                  </td>
                  {((resultsDataObj?.grossProfit as number[]) || []).map((val: number, i: number) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(val)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 sticky left-0 bg-white">
                    OpEx
                  </td>
                  {((resultsDataObj?.opex as number[]) || []).map((val: number, i: number) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(val)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-blue-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 sticky left-0 bg-blue-50">
                    EBITDA
                  </td>
                  {ebitda.map((val: number, i: number) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(val)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 sticky left-0 bg-white">
                    D&A
                  </td>
                  {((resultsDataObj?.da as number[]) || []).map((val: number, i: number) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(val)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50">
                    EBIT
                  </td>
                  {((resultsDataObj?.ebit as number[]) || []).map((val: number, i: number) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(val)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 sticky left-0 bg-white">
                    Taxes
                  </td>
                  {((resultsDataObj?.taxes as number[]) || []).map((val: number, i: number) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(val)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-blue-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 sticky left-0 bg-blue-50">
                    Net Income
                  </td>
                  {((resultsDataObj?.netIncome as number[]) || []).map((val: number, i: number) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(val)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 sticky left-0 bg-white">
                    CAPEX
                  </td>
                  {((resultsDataObj?.capex as number[]) || []).map((val: number, i: number) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(val)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 sticky left-0 bg-white">
                    Change in NWC
                  </td>
                  {((resultsDataObj?.changeInNWC as number[]) || []).map((val: number, i: number) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(val)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-green-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 sticky left-0 bg-green-50">
                    Free Cash Flow
                  </td>
                  {freeCashFlow.map((val: number, i: number) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(val)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 sticky left-0 bg-white">
                    Discounted CF
                  </td>
                  {discountedCashFlows.map((val: number, i: number) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(val)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Terminal Value</p>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(terminalValue)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">PV of Terminal Value</p>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(presentValueTerminalValue)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Enterprise Value</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(enterpriseValue)}</p>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="raw">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Raw JSON Data</h3>
            <p className="mt-1 text-sm text-gray-500">Complete model and calculation data in JSON format</p>
          </div>
          <div className="border-t border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Model Data</h4>
                <pre className="text-xs bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto max-h-96">
                  {JSON.stringify(modelDataObj, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Results Data</h4>
                <pre className="text-xs bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto max-h-96">
                  {JSON.stringify(resultsDataObj, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
