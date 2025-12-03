'use client';

import React from 'react';
import { RevenueEbitdaChart } from './revenue-ebitda-chart';
import { FootballFieldChart } from './football-field-chart';
import { countryRiskPremiumStatic } from '@/app/valuation/countryRiskPremiumStatic';
import { calculateWacc, calculateWaccComponents } from '@/utils/wacc-calculator';

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
  reportComment?: string | null;

  // Financial data
  enterpriseValue: number | null;
  modelData: any;
  resultsData: any;
  scenarios?: Scenario[];

  // Display options
  showHeader?: boolean;
  className?: string;
  id?: string; // Optional ID for PDF generation
  isPDF?: boolean; // Flag to force desktop rendering for PDF generation
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
  reportComment,
  enterpriseValue,
  modelData,
  resultsData,
  scenarios = [],
  showHeader = true,
  className = '',
  id = 'valuation-report',
  isPDF = false,
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
  const revenue: number[] = (resultsData?.revenue as number[]) || [];
  const ebitda: number[] = (resultsData?.ebitda as number[]) || [];
  const ebitdaMargin: number[] = (resultsData?.ebitdaMargin as number[]) || [];
  const freeCashFlow: number[] = (resultsData?.freeCashFlow as number[]) || [];

  // Calculate WACC at runtime from risk profile to maintain consistency
  const riskProfile = modelData?.riskProfile;
  const wacc = riskProfile ? calculateWacc(riskProfile) * 100 : modelData?.terminalValue?.wacc;

  const terminalGrowthRate = modelData?.terminalValue?.terminalGrowthRate;
  const periods: string[] = (modelData?.periods?.periodLabels as string[]) || [];
  const numberOfYears = modelData?.periods?.numberOfYears || 5;

  // Calculate valuation multiples
  const lastYearRevenue = revenue[numberOfYears - 1] || 0;
  const firstYearEbitda = ebitda[0] || 0;
  const lastYearEbitda = ebitda[numberOfYears - 1] || 0;
  const evEbitdaMultipleCurrent = enterpriseValue && firstYearEbitda > 0 ? enterpriseValue / firstYearEbitda : null;
  const evEbitdaMultipleTerminal = enterpriseValue && lastYearEbitda > 0 ? enterpriseValue / lastYearEbitda : null;
  const terminalValuePercent =
    enterpriseValue && resultsData?.presentValueTerminalValue
      ? (resultsData.presentValueTerminalValue / enterpriseValue) * 100
      : null;

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

  // Calculate scenario ranges (min and max across all scenarios)
  const scenarioRange =
    scenarios.length > 0
      ? {
          min: Math.min(...scenarios.map((s) => s.minValue)),
          max: Math.max(...scenarios.map((s) => s.maxValue)),
        }
      : null;

  // Calculate WACC components using utility function
  // Prefer taxes.percentOfEBIT if present (Advanced mode) to display tax shield consistently
  const taxesPercent =
    modelData?.taxes?.percentMethod === 'uniform' && typeof modelData?.taxes?.percentOfEBIT === 'number'
      ? modelData.taxes.percentOfEBIT / 100
      : undefined;
  // Prefer model tax rate; if missing or likely default, fall back to country's current rate
  const countryTaxRate = country
    ? countryRiskPremiumStatic[country as keyof typeof countryRiskPremiumStatic]?.corporateTaxRate
    : undefined;
  const displayCorporateTaxRate =
    (typeof taxesPercent === 'number' ? taxesPercent : undefined) ??
    (riskProfile && typeof riskProfile.corporateTaxRate === 'number' && riskProfile.corporateTaxRate > 0
      ? riskProfile.corporateTaxRate
      : (countryTaxRate ?? riskProfile?.corporateTaxRate));

  const waccComponents = riskProfile ? calculateWaccComponents(riskProfile) : null;

  console.log('riskProfile', riskProfile);
  console.log('wacc components', waccComponents);
  console.log('wacc', wacc);
  console.log('risk free rate', riskProfile?.riskFreeRate);
  console.log('levered beta', riskProfile?.leveredBeta);
  console.log('equity risk premium', riskProfile?.equityRiskPremium);
  console.log('country risk premium', riskProfile?.countryRiskPremium);
  console.log('adjusted default spread', riskProfile?.adjustedDefaultSpread);
  console.log('company spread', riskProfile?.companySpread);
  console.log('debt ratio', riskProfile?.deRatio);
  console.log('corporate tax rate', riskProfile?.corporateTaxRate);
  console.log('country tax rate', countryTaxRate);
  console.log('display corporate tax rate', displayCorporateTaxRate);

  return (
    <div id={id} className={`space-y-6 p-8 pb-16 bg-white ${className}`}>
      {/* Logo Section */}
      <div className="flex justify-center mb-8">
        <img src="/logo.svg" alt="ValuPro" className="h-12" />
      </div>

      {/* Header Section */}
      {showHeader && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{companyName || name || 'Informe de Valorización'}</h1>
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
              <p className="text-sm text-blue-100">Fecha del Reporte</p>
              <p className="text-lg font-semibold">{formatDate(createdAt)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Executive Summary */}
      {reportComment && (
        <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-base font-bold text-blue-900">Resumen Ejecutivo</h3>
          </div>
          <p className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">{reportComment}</p>
        </div>
      )}

      {/* Enterprise Value Highlight */}
      <div className="bg-white border-2 border-blue-200 rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="text-center">
          <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
            Enterprise Value (Caso Base)
          </p>
          <p className="text-2xl sm:text-4xl font-bold text-blue-600 mt-2 mb-4 sm:mb-6">
            {formatCurrency(enterpriseValue)}
          </p>

          {/* Show scenario range if available */}
          {scenarioRange && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase mb-3">Rango de Escenarios</p>
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                <div>
                  <p className="text-xs text-gray-500">Bajo</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-700">
                    {formatCurrency(scenarioRange.min)}
                  </p>
                </div>
                <div className="text-gray-400">—</div>
                <div>
                  <p className="text-xs text-gray-500">Alto</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-700">
                    {formatCurrency(scenarioRange.max)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {wacc !== null && wacc !== undefined && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-600">WACC.</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatPercent(wacc)}</p>
          </div>
        )}
        {terminalGrowthRate !== null && terminalGrowthRate !== undefined && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Tasa de Crecimiento Terminal</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatPercent(terminalGrowthRate)}</p>
          </div>
        )}
        {resultsData?.terminalValue && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Valor Terminal</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(resultsData.terminalValue)}</p>
          </div>
        )}
        {terminalValuePercent !== null && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-600">TV % de EV</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{terminalValuePercent.toFixed(1)}%</p>
          </div>
        )}
      </div> */}

      {/* Valuation Multiples */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Múltiplos de Valorización Implícitos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {evEbitdaMultipleCurrent !== null && (
            <div>
              <p className="text-sm font-medium text-gray-600">EV / EBITDA (Actual)</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{evEbitdaMultipleCurrent.toFixed(2)}x</p>
              <p className="text-xs text-gray-500 mt-1">Basado en EBITDA del Año 1</p>
            </div>
          )}
          {evEbitdaMultipleTerminal !== null && (
            <div>
              <p className="text-sm font-medium text-gray-600">EV / EBITDA (Terminal)</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{evEbitdaMultipleTerminal.toFixed(2)}x</p>
              <p className="text-xs text-gray-500 mt-1">Basado en EBITDA del Año {numberOfYears}</p>
            </div>
          )}
          {lastYearEbitda > 0 && lastYearRevenue > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600">Margen EBITDA Terminal</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {((lastYearEbitda / lastYearRevenue) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Año de proyección final</p>
            </div>
          )}
          {lastYearRevenue > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Terminal</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(lastYearRevenue)}</p>
              <p className="text-xs text-gray-500 mt-1">Año {numberOfYears} proyección</p>
            </div>
          )}
        </div>
      </div>

      {/* Revenue & EBITDA Chart */}
      {revenue.length > 0 && (
        <div className="break-inside-avoid mt-8 mb-8">
          <RevenueEbitdaChart
            revenues={revenue.slice(0, numberOfYears + 1)}
            ebitdaMargins={ebitdaMargin.slice(0, numberOfYears + 1)}
            years={periods.slice(0, numberOfYears + 1)}
            title="Proyección de Ingresos y Margen EBITDA"
            forceDesktop={isPDF}
          />
        </div>
      )}

      {/* Football Field Chart - Scenario Analysis */}
      {footballFieldData.length > 0 && (
        <div className="break-inside-avoid mt-8 mb-8">
          <FootballFieldChart
            ranges={footballFieldData}
            title="Análisis de Rango de Valorización (Análisis de Escenarios)"
            forceDesktop={isPDF}
          />
        </div>
      )}

      {/* Financial Projections Table */}
      {revenue.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm break-inside-avoid mt-8 mb-8">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Proyecciones Financieras</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Métrica
                  </th>
                  {periods.slice(0, numberOfYears + 1).map((period, idx) => {
                    const isBaseYear = idx === 0;
                    return (
                      <th
                        key={idx}
                        className={`px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          isBaseYear ? 'bg-gray-100 border-l-2 border-r-2 border-gray-300' : ''
                        }`}
                      >
                        {period}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Ingresos</td>
                  {revenue.slice(0, numberOfYears + 1).map((val, idx) => {
                    const isBaseYear = idx === 0;
                    return (
                      <td
                        key={idx}
                        className={`px-4 py-3 text-sm text-right ${
                          isBaseYear
                            ? 'bg-gray-50 border-l-2 border-r-2 border-gray-300 text-gray-500'
                            : 'text-gray-600'
                        }`}
                      >
                        {formatCurrency(val)}
                      </td>
                    );
                  })}
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">EBITDA</td>
                  {ebitda.slice(0, numberOfYears + 1).map((val, idx) => {
                    const isBaseYear = idx === 0;
                    return (
                      <td
                        key={idx}
                        className={`px-4 py-3 text-sm text-right ${
                          isBaseYear
                            ? 'bg-gray-100 border-l-2 border-r-2 border-gray-300 text-gray-500'
                            : 'text-gray-600'
                        }`}
                      >
                        {formatCurrency(val)}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Margen EBITDA</td>
                  {ebitdaMargin.slice(0, numberOfYears + 1).map((val, idx) => {
                    const isBaseYear = idx === 0;
                    return (
                      <td
                        key={idx}
                        className={`px-4 py-3 text-sm text-right ${
                          isBaseYear
                            ? 'bg-gray-50 border-l-2 border-r-2 border-gray-300 text-gray-500'
                            : 'text-gray-600'
                        }`}
                      >
                        {formatPercent(val)}
                      </td>
                    );
                  })}
                </tr>
                {freeCashFlow.length > 0 && (
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Flujo de Caja Libre</td>
                    {freeCashFlow.slice(0, numberOfYears + 1).map((val, idx) => {
                      const isBaseYear = idx === 0;
                      return (
                        <td
                          key={idx}
                          className={`px-4 py-3 text-sm text-right ${
                            isBaseYear
                              ? 'bg-gray-100 border-l-2 border-r-2 border-gray-300 text-gray-500'
                              : 'text-gray-600'
                          }`}
                        >
                          {formatCurrency(val)}
                        </td>
                      );
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Key Assumptions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm break-inside-avoid mt-8 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Supuestos Clave</h3>

        {/* General Assumptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Período de Proyección</p>
            <p className="text-base text-gray-900 mt-1">{numberOfYears} años</p>
          </div>
          {terminalGrowthRate !== null && terminalGrowthRate !== undefined && (
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Crecimiento Terminal</p>
              <p className="text-base text-gray-900 mt-1">{formatPercent(terminalGrowthRate)}</p>
            </div>
          )}
          {riskProfile?.corporateTaxRate !== null && riskProfile?.corporateTaxRate !== undefined && (
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Impuesto Corporativo</p>
              <p className="text-base text-gray-900 mt-1">{formatPercent(riskProfile.corporateTaxRate * 100)}</p>
            </div>
          )}
        </div>

        {/* WACC Components */}
        {waccComponents && (
          <>
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Cálculo de WACC</h4>
              {/* WACC Result */}
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Weighted Average Cost of Capital (WACC)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {wacc !== null && wacc !== undefined ? formatPercent(wacc) : 'N/A'}
                    </p>
                  </div>
                  <div className="sm:min-w-[180px]">
                    <p className="text-sm font-medium text-gray-600 mb-2">Estructura de Capital</p>
                    <div className="space-y-1 text-sm text-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Patrimonio:</span>
                        <span className="font-semibold">{(waccComponents.equityWeight * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Deuda:</span>
                        <span className="font-semibold">{(waccComponents.debtWeight * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900 mb-2">Costo de Equity</p>
                <p className="text-lg font-bold text-blue-700">{formatPercent(waccComponents.costOfEquity * 100)}</p>
                <div className="mt-2 space-y-1 text-xs text-blue-800">
                  <div className="flex justify-between">
                    <span>Tasa Libre de Riesgo:</span>
                    <span className="font-medium">{formatPercent(riskProfile.riskFreeRate * 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Beta Apalancado:</span>
                    <span className="font-medium">{riskProfile.leveredBeta.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equity Risk Premium:</span>
                    <span className="font-medium">{formatPercent(riskProfile.equityRiskPremium * 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Riesgo País:</span>
                    <span className="font-medium">{formatPercent(riskProfile.countryRiskPremium * 100)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm font-medium text-green-900 mb-2">Cost of Debt (After-Tax)</p>
                <p className="text-lg font-bold text-green-700">
                  {formatPercent(
                    waccComponents.costOfDebt *
                      (1 - (displayCorporateTaxRate ?? (riskProfile.corporateTaxRate || 0))) *
                      100,
                  )}
                </p>
                <div className="mt-2 space-y-1 text-xs text-green-800">
                  <div className="flex justify-between">
                    <span>Costo de Deuda Antes de Impuestos:</span>
                    <span className="font-medium">{formatPercent(waccComponents.costOfDebt * 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Default Spread:</span>
                    <span className="font-medium">{formatPercent(riskProfile.adjustedDefaultSpread * 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spread de Empresa:</span>
                    <span className="font-medium">{formatPercent(riskProfile.companySpread * 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Shield:</span>
                    <span className="font-medium">
                      {formatPercent((displayCorporateTaxRate ?? (riskProfile.corporateTaxRate || 0)) * 100)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* WACC Premium - Show only if non-zero */}
            {riskProfile.waccPremium && riskProfile.waccPremium !== 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-900">WACC Premium</p>
                    <p className="text-xs text-amber-700 mt-1">Prima adicional agregada al WACC base</p>
                  </div>
                  <p className="text-lg font-bold text-amber-800">{formatPercent(riskProfile.waccPremium * 100)}</p>
                </div>
              </div>
            )}

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Peso de Equity (E/V)</p>
                <p className="text-base text-gray-900 mt-1">{(waccComponents.equityWeight * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Peso de Deuda (D/V)</p>
                <p className="text-base text-gray-900 mt-1">{(waccComponents.debtWeight * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">D/E Ratio (D/E)</p>
                <p className="text-base text-gray-900 mt-1">{riskProfile.deRatio.toFixed(2)}</p>
              </div>
              {riskProfile.unleveredBeta !== null && riskProfile.unleveredBeta !== undefined && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Beta Desapalancado</p>
                  <p className="text-base text-gray-900 mt-1">{riskProfile.unleveredBeta.toFixed(2)}</p>
                </div>
              )}
            </div> */}
          </>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Disclaimer:</strong> Este informe de valorización se ha elaborado sólo para fines informativos, y
          representa una referencia de valor a partir de los supuestos considerados y en base a la información
          proporcionada. La estimación de flujos futuros podría no reflejar los resultados reales, y por ende este
          informe no debe ser considerado como una recomendación de tipo financiera. Por favor, consulte con un
          profesional financiero calificado antes de tomar decisiones de inversión
        </p>
      </div>
    </div>
  );
}
