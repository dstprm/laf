'use client';

import React, { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    updateCapex,
    updateNetWorkingCapital,
    updateDA,
    updatePeriods,
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
  const [activeTab, setActiveTab] = useState<'simple' | 'advanced'>('simple');

  // Advanced inputs
  const [advYears, setAdvYears] = useState<number>(5);
  const [growthMode, setGrowthMode] = useState<'uniform' | 'perYear'>('uniform');
  const [advUniformGrowth, setAdvUniformGrowth] = useState<string>('');
  const [advPerYearGrowth, setAdvPerYearGrowth] = useState<string>('');
  const [advEbitdaStart, setAdvEbitdaStart] = useState<string>('');
  const [advEbitdaTarget, setAdvEbitdaTarget] = useState<string>('');
  const [advCapexPct, setAdvCapexPct] = useState<string>('');
  const [advNwcPct, setAdvNwcPct] = useState<string>('');
  const [advDaPct, setAdvDaPct] = useState<string>('');
  // Advanced sequential UI state
  // EBITDA mode: constant, per year list, or ramp (start->target)
  const [ebitdaMode, setEbitdaMode] = useState<'constant' | 'perYear' | 'ramp'>('ramp');
  const [ebitdaConstant, setEbitdaConstant] = useState<string>('');
  const [ebitdaPerYear, setEbitdaPerYear] = useState<string>('');
  const [capexMethod, setCapexMethod] = useState<'percentOfRevenue' | 'direct'>('percentOfRevenue');
  const [capexDirect, setCapexDirect] = useState<string>('');
  const [nwcMethod, setNwcMethod] = useState<'percentOfRevenue' | 'direct'>('percentOfRevenue');
  const [nwcDirect, setNwcDirect] = useState<string>('');
  const [daMethod, setDaMethod] = useState<'percentOfRevenue' | 'direct'>('percentOfRevenue');
  const [daDirect, setDaDirect] = useState<string>('');
  const [taxesMethod, setTaxesMethod] = useState<'percentOfEBIT' | 'direct'>('percentOfEBIT');
  const [taxesPct, setTaxesPct] = useState<string>('');
  const [taxesDirect, setTaxesDirect] = useState<string>('');

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

  const handleSubmitAdvanced = (e: React.FormEvent) => {
    e.preventDefault();
    const revenue0 = parseFloat(lastYearRevenue || '0');
    if (!industry || !country || !(revenue0 > 0) || advYears < 2) {
      setResults(null);
      return;
    }

    setResults(null);
    setIsCalculating(true);
    setStep(4);

    const industryData = betasStatic[industry as keyof typeof betasStatic];
    const countryData = countryRiskPremiumStatic[country as keyof typeof countryRiskPremiumStatic];

    const buildMarginArray = (startPct: number, targetPct: number, years: number, delta: number) => {
      const s = Math.max(0, startPct + delta);
      const t = Math.max(0, targetPct + delta);
      const arr: number[] = [];
      for (let i = 0; i < years; i++) {
        const ratio = years === 1 ? 0 : i / (years - 1);
        arr.push(s + (t - s) * ratio);
      }
      return arr.map((v) => Math.min(100, Math.max(0, v)));
    };

    const parsePerYearGrowth = (): number[] | null => {
      const parts = advPerYearGrowth
        .split(/[\,\s]+/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => Number(p));
      if (parts.length >= advYears - 1 && parts.every((n) => !Number.isNaN(n))) {
        return parts.slice(0, advYears - 1);
      }
      return null;
    };

    const AdvBuildDirectArray = (years: number, csv: string): number[] => {
      const parts = csv
        .split(/[\,\s]+/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map(Number);
      const arr: number[] = [];
      for (let i = 0; i < years; i++) {
        arr.push(parts[i] ?? 0);
      }
      return arr;
    };

    const computeEVForScenarioAdvanced = (growthDelta: number, marginDelta: number): number => {
      updatePeriods({ numberOfYears: advYears, startYear: new Date().getFullYear() });

      if (growthMode === 'uniform') {
        const g = parseFloat(advUniformGrowth || '0') + growthDelta;
        updateRevenue({
          inputType: 'consolidated',
          consolidated: { inputMethod: 'growth', growthMethod: 'uniform', baseValue: revenue0, growthRate: g },
        });
      } else {
        const arr = parsePerYearGrowth();
        if (arr) {
          const individualGrowthRates: { [k: number]: number } = {};
          for (let i = 1; i < advYears; i++) {
            individualGrowthRates[i] = (arr[i - 1] ?? 0) + growthDelta;
          }
          updateRevenue({
            inputType: 'consolidated',
            consolidated: {
              inputMethod: 'growth',
              growthMethod: 'individual',
              baseValue: revenue0,
              individualGrowthRates,
            },
          });
        } else {
          updateRevenue({
            inputType: 'consolidated',
            consolidated: {
              inputMethod: 'growth',
              growthMethod: 'uniform',
              baseValue: revenue0,
              growthRate: growthDelta,
            },
          });
        }
      }

      let marginArr: number[] = [];
      if (ebitdaMode === 'constant') {
        const m = parseFloat(ebitdaConstant || '0') + marginDelta;
        marginArr = Array.from({ length: advYears }, () => m);
      } else if (ebitdaMode === 'perYear') {
        const parts = ebitdaPerYear
          .split(/[\,\s]+/)
          .map((p) => p.trim())
          .filter(Boolean)
          .map(Number);
        marginArr = Array.from({ length: advYears }, (_, i) =>
          i < parts.length ? (parts[i] || 0) + marginDelta : (parts[parts.length - 1] || 0) + marginDelta,
        );
      } else {
        const startM = parseFloat(advEbitdaStart || '0');
        const targetM = parseFloat(advEbitdaTarget || advEbitdaStart || '0');
        marginArr = buildMarginArray(startM, targetM, advYears, marginDelta);
      }
      const individualPercents: { [k: number]: number } = {};
      for (let i = 0; i < advYears; i++) {
        individualPercents[i] = Math.max(0, 100 - (marginArr[i] || 0));
      }
      updateOpEx({
        inputType: 'consolidated',
        consolidated: { inputMethod: 'percentOfRevenue', percentMethod: 'individual', individualPercents },
      });

      if (capexMethod === 'direct') {
        updateCapex({ inputMethod: 'direct', yearlyValues: AdvBuildDirectArray(advYears, capexDirect) });
      } else {
        updateCapex({
          inputMethod: 'percentOfRevenue',
          percentMethod: 'uniform',
          percentOfRevenue: parseFloat(advCapexPct || '0'),
        });
      }
      if (nwcMethod === 'direct') {
        updateNetWorkingCapital({ inputMethod: 'direct', yearlyValues: AdvBuildDirectArray(advYears, nwcDirect) });
      } else {
        updateNetWorkingCapital({
          inputMethod: 'percentOfRevenue',
          percentMethod: 'uniform',
          percentOfRevenue: parseFloat(advNwcPct || '0'),
        });
      }
      if (daMethod === 'direct') {
        updateDA({ inputMethod: 'direct', yearlyValues: AdvBuildDirectArray(advYears, daDirect) });
      } else {
        updateDA({
          inputMethod: 'percentOfRevenue',
          percentMethod: 'uniform',
          percentOfRevenue: parseFloat(advDaPct || '0'),
        });
      }

      if (taxesMethod === 'direct') {
        updateTaxes({ inputMethod: 'direct', yearlyValues: AdvBuildDirectArray(advYears, taxesDirect) });
      } else {
        const taxPct = taxesPct.trim() !== '' ? parseFloat(taxesPct) : 0;
        updateTaxes({ inputMethod: 'percentOfEBIT', percentMethod: 'uniform', percentOfEBIT: taxPct });
      }

      calculateFinancials();
      return useModelStore.getState().calculatedFinancials.enterpriseValue || 0;
    };

    setTimeout(() => {
      const baseEV = computeEVForScenarioAdvanced(0, 0);
      const lowEV = computeEVForScenarioAdvanced(-5, -5);
      const highEV = computeEVForScenarioAdvanced(5, 5);
      setResults([
        {
          id: 'bear',
          name: 'Low',
          enterpriseValue: lowEV,
          ebitdaMarginPct: Math.max(0, parseFloat(advEbitdaStart || '0') - 5),
          revenueGrowthPct: growthMode === 'uniform' ? parseFloat(advUniformGrowth || '0') - 5 : 0,
        },
        {
          id: 'base',
          name: 'Base',
          enterpriseValue: baseEV,
          ebitdaMarginPct: parseFloat(advEbitdaStart || '0'),
          revenueGrowthPct: growthMode === 'uniform' ? parseFloat(advUniformGrowth || '0') : 0,
        },
        {
          id: 'bull',
          name: 'High',
          enterpriseValue: highEV,
          ebitdaMarginPct: parseFloat(advEbitdaStart || '0') + 5,
          revenueGrowthPct: growthMode === 'uniform' ? parseFloat(advUniformGrowth || '0') + 5 : 0,
        },
      ]);
      setIsCalculating(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Valuation</h1>
            <p className="mt-1 text-gray-600">Quick or advanced enterprise value estimate</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'simple' | 'advanced')}>
          <TabsList>
            <TabsTrigger value="simple">Simple</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="simple">
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

              <div className="space-y-4">
                <div
                  className={`transition-all duration-500 ease-out ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
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

            {isCalculating && (
              <div className="mt-4">
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
          </TabsContent>

          <TabsContent value="advanced">
            <form onSubmit={handleSubmitAdvanced} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last year&#39;s revenue (USD)</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Forecast years</label>
                  <select
                    value={advYears}
                    onChange={(e) => setAdvYears(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Growth mode</label>
                  <select
                    value={growthMode}
                    onChange={(e) => setGrowthMode(e.target.value as 'uniform' | 'perYear')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="uniform">Uniform growth (%/yr)</option>
                    <option value="perYear">Per-year growth list</option>
                  </select>
                </div>
                {growthMode === 'uniform' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Uniform growth (%/yr)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={advUniformGrowth}
                      onChange={(e) => setAdvUniformGrowth(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Per-year growth rates (%), comma or space separated (length {advYears - 1})
                    </label>
                    <input
                      type="text"
                      value={advPerYearGrowth}
                      onChange={(e) => setAdvPerYearGrowth(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g. 10, 9, 8, 7"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">EBITDA margin start (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={advEbitdaStart}
                    onChange={(e) => setAdvEbitdaStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">EBITDA margin target (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={advEbitdaTarget}
                    onChange={(e) => setAdvEbitdaTarget(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CAPEX (% of revenue)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={advCapexPct}
                    onChange={(e) => setAdvCapexPct(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NWC (% of revenue)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={advNwcPct}
                    onChange={(e) => setAdvNwcPct(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">D&A (% of revenue)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={advDaPct}
                    onChange={(e) => setAdvDaPct(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taxes</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={taxesMethod}
                      onChange={(e) => setTaxesMethod(e.target.value as 'percentOfEBIT' | 'direct')}
                      className="px-2 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="percentOfEBIT">% of EBIT</option>
                      <option value="direct">Direct</option>
                    </select>
                    {taxesMethod === 'percentOfEBIT' ? (
                      <input
                        type="number"
                        step="0.1"
                        value={taxesPct}
                        onChange={(e) => setTaxesPct(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Tax % of EBIT"
                      />
                    ) : (
                      <input
                        type="text"
                        value={taxesDirect}
                        onChange={(e) => setTaxesDirect(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Direct values CSV e.g. 10,12,14"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                  disabled={isCalculating}
                >
                  Estimate
                </button>
              </div>
            </form>

            {isCalculating && (
              <div className="mt-4">
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
          </TabsContent>
        </Tabs>
      </div>

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
  );
}
