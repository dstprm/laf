'use client';

import React, { useMemo, useState } from 'react';
import { useModelStore } from '../store/modelStore';
import { betasStatic } from '../betasStatic';
import { countryRiskPremiumStatic } from '../countryRiskPremiumStatic';

type Scenario = {
  id: string;
  name: string;
  ebitdaMarginPct: number; // percent (e.g., 20 for 20%)
  revenueGrowthPct: number; // percent growth per year (uniform)
};

export default function SimpleValuationPage() {
  const { model, updateRiskProfile, updateRevenue, updateOpEx, updateTaxes, updateTerminalValue, calculateFinancials } =
    useModelStore();

  const industries = useMemo(() => Object.keys(betasStatic), []);
  const countries = useMemo(() => Object.keys(countryRiskPremiumStatic), []);

  const [industry, setIndustry] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [lastYearRevenue, setLastYearRevenue] = useState<string>('');
  const [ebitdaMarginPct, setEbitdaMarginPct] = useState<string>('');
  const [revenueGrowthPct, setRevenueGrowthPct] = useState<string>('');

  // Three parallel scenarios for range (bear/base/bull)
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

  const [results, setResults] = useState<{ id: string; name: string; enterpriseValue: number }[] | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const revenue0 = parseFloat(lastYearRevenue || '0');
    if (!industry || !country || !(revenue0 > 0)) {
      setResults(null);
      return;
    }

    const industryData = betasStatic[industry as keyof typeof betasStatic];
    const countryData = countryRiskPremiumStatic[country as keyof typeof countryRiskPremiumStatic];

    const computeEVForScenario = (scenario: Scenario): number => {
      // 1) Risk profile (reuses existing WACC logic in calculateFinancials)
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

      // 2) Revenue: use consolidated growth model with base at revenue0 and uniform growth
      updateRevenue({
        inputType: 'consolidated',
        consolidated: {
          inputMethod: 'growth',
          growthMethod: 'uniform',
          baseValue: revenue0,
          growthRate: scenario.revenueGrowthPct,
        },
      });

      // 3) OpEx via percent of revenue to target EBITDA margin
      // EBITDA = GrossProfit - OpEx + OtherIncome - OtherExpenses; we keep cogs/other at 0 for simplicity
      // So EBITDA margin approximates to (Revenue - OpEx) / Revenue => OpEx% ≈ 1 - EBITDA%
      const targetOpexPercentOfRevenue = Math.max(0, 100 - scenario.ebitdaMarginPct);
      updateOpEx({
        inputType: 'consolidated',
        consolidated: {
          inputMethod: 'percentOfRevenue',
          percentMethod: 'uniform',
          percentOfRevenue: targetOpexPercentOfRevenue,
        },
      });

      // 4) Taxes based on EBIT: set to country corporate tax rate; DA/capex/nwc default to zero in initial model
      updateTaxes({
        inputMethod: 'percentOfEBIT',
        percentMethod: 'uniform',
        percentOfEBIT: (countryData?.corporateTaxRate ?? 0.25) * 100,
      });

      // 5) Terminal value: default multiples on EBITDA (keep 10x)
      updateTerminalValue({ method: 'multiples', multipleMetric: 'ebitda', multipleValue: 10 });

      // 6) Run calculation and read EV
      calculateFinancials();
      // Read immediately; zustand updates synchronously in our store setters/calc path
      const ev = useModelStore.getState().calculatedFinancials.enterpriseValue || 0;
      return ev;
    };

    const computed = scenarios.map((s) => ({ id: s.id, name: s.name, enterpriseValue: computeEVForScenario(s) }));
    setResults(computed);
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last year revenue (USD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={lastYearRevenue}
                onChange={(e) => setLastYearRevenue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">EBITDA margin (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={ebitdaMarginPct}
                onChange={(e) => setEbitdaMarginPct(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Revenue growth (%/yr)</label>
              <input
                type="number"
                step="0.1"
                value={revenueGrowthPct}
                onChange={(e) => setRevenueGrowthPct(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
              Estimate
            </button>
          </div>
        </form>

        {results && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.map((r) => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">{r.name} scenario</div>
                <div className="text-2xl font-semibold text-gray-900 mt-1">{currency(r.enterpriseValue)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
