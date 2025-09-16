'use client';

import React, { useMemo, useState } from 'react';
import { useModelStore } from '../valuation/store/modelStore';
import { betasStatic } from '../valuation/betasStatic';
import { countryRiskPremiumStatic } from '../valuation/countryRiskPremiumStatic';

type Scenario = {
  id: string;
  name: string;
  ebitdaMarginPct: number;
  revenueGrowthPct: number;
};

export default function FreeValuationPage() {
  const {
    model,
    calculatedFinancials,
    updateRiskProfile,
    updateRevenue,
    updateOpEx,
    updateTaxes,
    updateTerminalValue,
    calculateFinancials,
  } = useModelStore();

  const industries = useMemo(() => Object.keys(betasStatic), []);
  const countries = useMemo(() => Object.keys(countryRiskPremiumStatic), []);

  const [industry, setIndustry] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [lastYearRevenue, setLastYearRevenue] = useState<string>('');
  const [ebitdaMarginPct, setEbitdaMarginPct] = useState<string>('');
  const [revenueGrowthPct, setRevenueGrowthPct] = useState<string>('');
  const [step, setStep] = useState<number>(1); // 1: revenue, 2: growth, 3: margin
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const scenarios: Scenario[] = useMemo(() => {
    const baseMargin = parseFloat(ebitdaMarginPct || '0');
    const baseGrowth = parseFloat(revenueGrowthPct || '0');
    return [
      {
        id: 'bear',
        name: 'Low',
        ebitdaMarginPct: Math.max(0, baseMargin - 5),
        revenueGrowthPct: Math.max(0, baseGrowth - 5),
      },
      { id: 'base', name: 'Base', ebitdaMarginPct: baseMargin, revenueGrowthPct: baseGrowth },
      { id: 'bull', name: 'High', ebitdaMarginPct: baseMargin + 5, revenueGrowthPct: baseGrowth + 5 },
    ];
  }, [ebitdaMarginPct, revenueGrowthPct]);

  const [results, setResults] = useState<
    { id: string; name: string; enterpriseValue: number; ebitdaMarginPct: number; revenueGrowthPct: number }[] | null
  >(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const revenue0 = parseFloat(lastYearRevenue || '0');
    if (!industry || !country || !(revenue0 > 0)) {
      setResults(null);
      return;
    }

    setResults(null);
    setIsCalculating(true);
    setStep(4);

    const industryData = betasStatic[industry as keyof typeof betasStatic];
    const countryData = countryRiskPremiumStatic[country as keyof typeof countryRiskPremiumStatic];

    const computeEVForScenario = (scenario: Scenario): number => {
      updateRiskProfile({
        selectedIndustry: industry,
        selectedCountry: country,
        unleveredBeta: industryData?.unleveredBeta ?? 0,
        leveredBeta: industryData
          ? industryData.unleveredBeta * (1 + (1 - (countryData?.corporateTaxRate ?? 0)) * (industryData.dERatio ?? 0))
          : 0,
        equityRiskPremium: countryData?.equityRiskPremium ?? 0,
        countryRiskPremium: countryData?.countryRiskPremium ?? 0,
        deRatio: industryData?.dERatio ?? 0,
        adjustedDefaultSpread: countryData?.adjDefaultSpread ?? 0,
        companySpread: model.riskProfile?.companySpread ?? 0.05,
        riskFreeRate: model.riskProfile?.riskFreeRate ?? 0.0444,
        corporateTaxRate: countryData?.corporateTaxRate ?? model.riskProfile?.corporateTaxRate ?? 0.25,
      });

      updateRevenue({
        inputType: 'consolidated',
        consolidated: {
          inputMethod: 'growth',
          growthMethod: 'uniform',
          baseValue: revenue0,
          growthRate: scenario.revenueGrowthPct,
        },
      });

      const targetOpexPercentOfRevenue = Math.max(0, 100 - scenario.ebitdaMarginPct);
      updateOpEx({
        inputType: 'consolidated',
        consolidated: {
          inputMethod: 'percentOfRevenue',
          percentMethod: 'uniform',
          percentOfRevenue: targetOpexPercentOfRevenue,
        },
      });

      updateTaxes({
        inputMethod: 'percentOfEBIT',
        percentMethod: 'uniform',
        percentOfEBIT: (countryData?.corporateTaxRate ?? 0.25) * 100,
      });

      updateTerminalValue({ method: 'multiples', multipleMetric: 'ebitda', multipleValue: 10 });

      calculateFinancials();
      const ev = useModelStore.getState().calculatedFinancials.enterpriseValue || 0;
      return ev;
    };

    setTimeout(() => {
      const computed = scenarios.map((s) => ({
        id: s.id,
        name: s.name,
        enterpriseValue: computeEVForScenario(s),
        ebitdaMarginPct: s.ebitdaMarginPct,
        revenueGrowthPct: s.revenueGrowthPct,
      }));
      setResults(computed);
      setIsCalculating(false);
    }, 3000);
  };

  const currency = (v: number) =>
    v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Simple Valuation</h1>
            <p className="mt-1 text-gray-600">Quick enterprise value estimate with a few inputs</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select...</option>
                {industries.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select...</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sequential Questions */}
          <div className="space-y-4">
            {/* Step 1: Revenue */}
            <div
              className={`transition-all duration-500 ease-out ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}} `}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What was last year&#39;s revenue (USD)?
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={lastYearRevenue}
                  onChange={(e) => setLastYearRevenue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                  disabled={!(parseFloat(lastYearRevenue || '0') > 0)}
                  onClick={() => setStep(2)}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Step 2: Revenue Growth */}
            <div
              className={`transition-all duration-500 ease-out ${step >= 2 ? 'opacity-100 translate-y-0 max-h-40' : 'opacity-0 -translate-y-2 max-h-0'} overflow-hidden`}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What is expected revenue growth (%/yr)?
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.1"
                  value={revenueGrowthPct}
                  onChange={(e) => setRevenueGrowthPct(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                  disabled={revenueGrowthPct.trim() === ''}
                  onClick={() => setStep(3)}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Step 3: EBITDA Margin */}
            <div
              className={`transition-all duration-500 ease-out ${step >= 3 ? 'opacity-100 translate-y-0 max-h-40' : 'opacity-0 -translate-y-2 max-h-0'} overflow-hidden`}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">What is the EBITDA margin (%)?</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={ebitdaMarginPct}
                  onChange={(e) => setEbitdaMarginPct(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
                  disabled={ebitdaMarginPct.trim() === '' || isCalculating}
                >
                  Estimate
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Step 4: Thinking/Calculating Loader */}
        {isCalculating && (
          <div
            className={`mt-4 transition-all duration-500 ease-out ${
              step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4">
              <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <div>
                <div className="text-sm font-medium text-gray-900">Crunching numbers…</div>
                <div className="text-xs text-gray-600">This will take a few seconds</div>
              </div>
            </div>
          </div>
        )}

        {results && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.map((r) => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">{r.name} scenario</div>
                <div className="text-2xl font-semibold text-gray-900 mt-1">{currency(r.enterpriseValue)}</div>
                <div className="text-xs text-gray-600 mt-2">
                  <div>EBITDA margin: {r.ebitdaMarginPct}%</div>
                  <div>Revenue growth: {r.revenueGrowthPct}%/yr</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Debug: Pretty print model and calculated financials */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg">
          <div className="px-4 py-2 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Debug: Model & Calculations</h2>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-gray-700 mb-2">Model</div>
              <pre className="text-xs bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto max-h-96">
                {JSON.stringify(model, null, 2)}
              </pre>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-700 mb-2">Calculated Financials</div>
              <pre className="text-xs bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto max-h-96">
                {JSON.stringify(calculatedFinancials, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
