'use client';

import React from 'react';
import { HelpCircle, Calculator } from 'lucide-react';
import { BusinessInfoForm } from './business-info-form';
import { betasStatic } from '@/app/valuation/betasStatic';
import { Tooltip } from '@/components/ui/tooltip';

export interface AdvancedValuationState {
  // Revenue inputs
  advYears: number;
  advRevenueInputMethod: 'growth' | 'direct';
  growthMode: 'uniform' | 'perYear';
  advUniformGrowth: string;
  revenueDirectList: string[];
  growthPerYearList: string[];
  advLTG: string;

  // EBITDA inputs
  ebitdaInputType: 'percent' | 'direct';
  ebitdaPctMode: 'uniform' | 'perYear' | 'ramp';
  advEbitdaUniformPct: string;
  advEbitdaStart: string;
  advEbitdaTarget: string;
  ebitdaPercentPerYearList: string[];
  ebitdaDirectList: string[];

  // CAPEX inputs
  capexMethod: 'percentOfRevenue' | 'direct';
  capexPercentMode: 'uniform' | 'individual';
  advCapexPct: string;
  capexPercentsList: string[];
  capexDirectList: string[];

  // NWC inputs
  nwcMethod: 'percentOfRevenue' | 'direct';
  nwcPercentMode: 'uniform' | 'individual';
  advNwcPct: string;
  nwcPercentsList: string[];
  nwcDirectList: string[];

  // D&A inputs
  daMethod: 'percentOfRevenue' | 'direct';
  daPercentMode: 'uniform' | 'individual';
  advDaPct: string;
  daPercentsList: string[];
  daDirectList: string[];

  // Taxes inputs
  taxesMethod: 'percentOfEBIT' | 'direct';
  taxesPct: string;
  taxesDirectList: string[];

  // WACC / Risk Profile inputs
  deRatio: string; // Debt-to-Equity ratio

  // UI state
  advStep: number;
}

interface AdvancedValuationFormProps {
  // Business info (same as simple)
  companyName: string;
  setCompanyName: (value: string) => void;
  companyWebsite: string;
  setCompanyWebsite: (value: string) => void;
  companyPhone: string;
  setCompanyPhone: (value: string) => void;
  phoneCountryCode: string;
  setPhoneCountryCode: (value: string) => void;

  // Industry & Country
  industry: string;
  setIndustry: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  industries: string[];
  countries: string[];

  // Last year revenue (shared with simple)
  lastYearRevenue: string;
  setLastYearRevenue: (value: string) => void;

  // Advanced state
  advState: AdvancedValuationState;
  setAdvState: (state: AdvancedValuationState | ((prev: AdvancedValuationState) => AdvancedValuationState)) => void;

  // Form controls
  isCalculating: boolean;
  onSubmit: (e: React.FormEvent) => void;

  // Optional: hide D/E ratio input (e.g., in dashboard where it's in WACC section)
  hideDeRatio?: boolean;
  // Optional: hide the Business Information section (e.g., in dashboard edit)
  hideBusinessInfo?: boolean;
  // Optional: hide the Industry & Country selectors (e.g., managed elsewhere in dashboard)
  hideIndustryCountry?: boolean;
  // When true, render all steps expanded and hide Next/Back navigation (dashboard mode)
  showAllSteps?: boolean;
}

export function AdvancedValuationForm({
  companyName,
  setCompanyName,
  companyWebsite,
  setCompanyWebsite,
  companyPhone,
  setCompanyPhone,
  phoneCountryCode,
  setPhoneCountryCode,
  industry,
  setIndustry,
  country,
  setCountry,
  industries,
  countries,
  lastYearRevenue,
  setLastYearRevenue,
  advState,
  setAdvState,
  isCalculating,
  onSubmit,
  hideDeRatio = false,
  hideBusinessInfo = false,
  hideIndustryCountry = false,
  showAllSteps = false,
}: AdvancedValuationFormProps) {
  // Get industry average D/E ratio for reference
  const industryAvgDeRatio = industry ? (betasStatic[industry as keyof typeof betasStatic]?.dERatio ?? null) : null;
  const updateAdvState = <K extends keyof AdvancedValuationState>(key: K, value: AdvancedValuationState[K]) => {
    setAdvState((prev) => ({ ...prev, [key]: value }));
  };

  const updateListItem = (listKey: keyof AdvancedValuationState, index: number, value: string) => {
    setAdvState((prev) => {
      const list = [...(prev[listKey] as string[])];
      list[index] = value;
      return { ...prev, [listKey]: list };
    });
  };

  return (
    <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-6">
      {/* Business Information Section */}
      {!hideBusinessInfo && (
        <BusinessInfoForm
          companyName={companyName}
          setCompanyName={setCompanyName}
          companyWebsite={companyWebsite}
          setCompanyWebsite={setCompanyWebsite}
          companyPhone={companyPhone}
          setCompanyPhone={setCompanyPhone}
          phoneCountryCode={phoneCountryCode}
          setPhoneCountryCode={setPhoneCountryCode}
        />
      )}

      {/* Industry & Country */}
      {!hideIndustryCountry && (
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
      )}

      {/* Step 1: Revenue */}
      <div
        className={`transition-all duration-500 ease-out ${showAllSteps || advState.advStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'} ${showAllSteps || advState.advStep >= 1 ? '' : 'pointer-events-none'}`}
      >
        <div className="mb-2 text-sm font-medium text-gray-700">1. Revenue</div>
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
              value={advState.advYears}
              onChange={(e) => updateAdvState('advYears', Number(e.target.value))}
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
        {!showAllSteps && (
          <div className="mt-3 flex items-center gap-3">
            {advState.advStep === 1 && (
              <button
                type="button"
                className="px-3 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                disabled={!(parseFloat(lastYearRevenue || '0') > 0) || advState.advYears < 2}
                onClick={() => updateAdvState('advStep', 2)}
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Revenue growth / direct and LTG */}
      <div
        className={`transition-all duration-500 ease-out ${showAllSteps || advState.advStep >= 2 ? 'opacity-100 translate-y-0 max-h-[1000px]' : 'opacity-0 -translate-y-2 max-h-0'} overflow-hidden`}
      >
        <div className="mb-2 text-sm font-medium text-gray-700">2. Revenue growth</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input method</label>
            <select
              value={advState.advRevenueInputMethod}
              onChange={(e) => updateAdvState('advRevenueInputMethod', e.target.value as 'growth' | 'direct')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="growth">Growth based</option>
              <option value="direct">Direct revenue per year</option>
            </select>
          </div>
          {advState.advRevenueInputMethod === 'growth' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Growth mode</label>
              <select
                value={advState.growthMode}
                onChange={(e) => updateAdvState('growthMode', e.target.value as 'uniform' | 'perYear')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="uniform">Uniform (%/yr)</option>
                <option value="perYear">Per-year list</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Revenues per year:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {advState.revenueDirectList.map((val, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={val}
                      onChange={(e) => updateListItem('revenueDirectList', idx, e.target.value)}
                      className="px-2 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {advState.advRevenueInputMethod === 'growth' && (
          <div className="mt-3 grid grid-cols-1 gap-4">
            {advState.growthMode === 'uniform' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uniform growth (%/yr)</label>
                <input
                  type="number"
                  step="0.1"
                  value={advState.advUniformGrowth}
                  onChange={(e) => updateAdvState('advUniformGrowth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Per-year growth rates (%):</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {advState.growthPerYearList.map((val, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                      <input
                        type="number"
                        step="0.1"
                        value={val}
                        onChange={(e) => updateListItem('growthPerYearList', idx, e.target.value)}
                        className="px-2 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Long-term growth (%)</label>
              <input
                type="number"
                step="0.1"
                value={advState.advLTG}
                onChange={(e) => updateAdvState('advLTG', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g. 2.5"
              />
            </div>
          </div>
        )}
        {advState.advRevenueInputMethod === 'direct' && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Long-term growth (%)</label>
            <input
              type="number"
              step="0.1"
              value={advState.advLTG}
              onChange={(e) => updateAdvState('advLTG', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g. 2.5"
            />
          </div>
        )}
        {!showAllSteps && (
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md"
              onClick={() => updateAdvState('advStep', 1)}
            >
              Back
            </button>
            {advState.advStep === 2 && (
              <button
                type="button"
                className="px-3 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                disabled={
                  advState.advRevenueInputMethod === 'growth'
                    ? (advState.growthMode === 'uniform'
                        ? advState.advUniformGrowth.trim() === ''
                        : advState.growthPerYearList
                            .slice(0, Math.max(advState.advYears - 1, 1))
                            .some((v) => v.trim() === '')) || advState.advLTG.trim() === ''
                    : advState.revenueDirectList.slice(0, advState.advYears).some((v) => v.trim() === '') ||
                      advState.advLTG.trim() === ''
                }
                onClick={() => updateAdvState('advStep', 3)}
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>

      {/* Step 3: EBITDA */}
      <div
        className={`transition-all duration-500 ease-out ${showAllSteps || advState.advStep >= 3 ? 'opacity-100 translate-y-0 max-h-[1000px]' : 'opacity-0 -translate-y-2 max-h-0'} overflow-hidden`}
      >
        <div className="mb-2 text-sm font-medium text-gray-700">3. EBITDA</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input type</label>
            <select
              value={advState.ebitdaInputType}
              onChange={(e) => updateAdvState('ebitdaInputType', e.target.value as 'percent' | 'direct')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="percent">% EBITDA</option>
              <option value="direct">Direct EBITDA per year</option>
            </select>
          </div>
          {advState.ebitdaInputType === 'percent' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">% mode</label>
              <select
                value={advState.ebitdaPctMode}
                onChange={(e) => updateAdvState('ebitdaPctMode', e.target.value as 'uniform' | 'perYear' | 'ramp')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="uniform">Uniform</option>
                <option value="ramp">Start → Target</option>
                <option value="perYear">Per-year list</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">EBITDA per year:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {advState.ebitdaDirectList.map((val, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={val}
                      onChange={(e) => updateListItem('ebitdaDirectList', idx, e.target.value)}
                      className="px-2 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {advState.ebitdaInputType === 'percent' && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {advState.ebitdaPctMode === 'uniform' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">EBITDA margin (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={advState.advEbitdaUniformPct}
                  onChange={(e) => updateAdvState('advEbitdaUniformPct', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            )}
            {advState.ebitdaPctMode === 'ramp' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start EBITDA margin (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={advState.advEbitdaStart}
                    onChange={(e) => updateAdvState('advEbitdaStart', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target EBITDA margin (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={advState.advEbitdaTarget}
                    onChange={(e) => updateAdvState('advEbitdaTarget', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </>
            )}
            {advState.ebitdaPctMode === 'perYear' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">EBITDA margin (%) per year:</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {advState.ebitdaPercentPerYearList.map((val, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                      <input
                        type="number"
                        step="0.1"
                        value={val}
                        onChange={(e) => updateListItem('ebitdaPercentPerYearList', idx, e.target.value)}
                        className="px-2 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {!showAllSteps && (
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md"
              onClick={() => updateAdvState('advStep', 2)}
            >
              Back
            </button>
            {advState.advStep === 3 && (
              <button
                type="button"
                className="px-3 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                disabled={
                  advState.ebitdaInputType === 'percent'
                    ? advState.ebitdaPctMode === 'uniform'
                      ? advState.advEbitdaUniformPct.trim() === ''
                      : advState.ebitdaPctMode === 'ramp'
                        ? advState.advEbitdaStart.trim() === '' || advState.advEbitdaTarget.trim() === ''
                        : advState.ebitdaPercentPerYearList.slice(0, advState.advYears).some((v) => v.trim() === '')
                    : advState.ebitdaDirectList.slice(0, advState.advYears).some((v) => v.trim() === '')
                }
                onClick={() => updateAdvState('advStep', 4)}
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>

      {/* Step 4: Others (CAPEX, NWC, D&A) - Due to size, showing compact version */}
      <div
        className={`transition-all duration-500 ease-out ${showAllSteps || advState.advStep >= 4 ? 'opacity-100 translate-y-0 max-h-[2000px]' : 'opacity-0 -translate-y-2 max-h-0'} overflow-hidden`}
      >
        <div className="mb-2 text-sm font-medium text-gray-700">4. Others (CAPEX, NWC, D&A)</div>

        {/* CAPEX */}
        <div className="border-b pb-4 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">CAPEX</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select
                value={advState.capexMethod}
                onChange={(e) => updateAdvState('capexMethod', e.target.value as 'percentOfRevenue' | 'direct')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="percentOfRevenue">% of revenue</option>
                <option value="direct">Direct</option>
              </select>
            </div>
            {advState.capexMethod === 'percentOfRevenue' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                  <select
                    value={advState.capexPercentMode}
                    onChange={(e) => updateAdvState('capexPercentMode', e.target.value as 'uniform' | 'individual')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="uniform">Uniform</option>
                    <option value="individual">Each year</option>
                  </select>
                </div>
                {advState.capexPercentMode === 'uniform' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CAPEX (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={advState.advCapexPct}
                      onChange={(e) => updateAdvState('advCapexPct', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
              </>
            )}
          </div>
          {advState.capexMethod === 'percentOfRevenue' && advState.capexPercentMode === 'individual' && (
            <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2">
              {advState.capexPercentsList.map((val, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                  <input
                    type="number"
                    step="0.1"
                    value={val}
                    onChange={(e) => updateListItem('capexPercentsList', idx, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              ))}
            </div>
          )}
          {advState.capexMethod === 'direct' && (
            <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2">
              {advState.capexDirectList.map((val, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={val}
                    onChange={(e) => updateListItem('capexDirectList', idx, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NWC */}
        <div className="border-b pb-4 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Net Working Capital</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select
                value={advState.nwcMethod}
                onChange={(e) => updateAdvState('nwcMethod', e.target.value as 'percentOfRevenue' | 'direct')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="percentOfRevenue">% of revenue</option>
                <option value="direct">Direct</option>
              </select>
            </div>
            {advState.nwcMethod === 'percentOfRevenue' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                  <select
                    value={advState.nwcPercentMode}
                    onChange={(e) => updateAdvState('nwcPercentMode', e.target.value as 'uniform' | 'individual')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="uniform">Uniform</option>
                    <option value="individual">Each year</option>
                  </select>
                </div>
                {advState.nwcPercentMode === 'uniform' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NWC (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={advState.advNwcPct}
                      onChange={(e) => updateAdvState('advNwcPct', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
              </>
            )}
          </div>
          {advState.nwcMethod === 'percentOfRevenue' && advState.nwcPercentMode === 'individual' && (
            <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2">
              {advState.nwcPercentsList.map((val, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                  <input
                    type="number"
                    step="0.1"
                    value={val}
                    onChange={(e) => updateListItem('nwcPercentsList', idx, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              ))}
            </div>
          )}
          {advState.nwcMethod === 'direct' && (
            <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2">
              {advState.nwcDirectList.map((val, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={val}
                    onChange={(e) => updateListItem('nwcDirectList', idx, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* D&A */}
        <div className="pb-4 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Depreciation & Amortization</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select
                value={advState.daMethod}
                onChange={(e) => updateAdvState('daMethod', e.target.value as 'percentOfRevenue' | 'direct')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="percentOfRevenue">% of revenue</option>
                <option value="direct">Direct</option>
              </select>
            </div>
            {advState.daMethod === 'percentOfRevenue' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                  <select
                    value={advState.daPercentMode}
                    onChange={(e) => updateAdvState('daPercentMode', e.target.value as 'uniform' | 'individual')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="uniform">Uniform</option>
                    <option value="individual">Each year</option>
                  </select>
                </div>
                {advState.daPercentMode === 'uniform' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">D&A (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={advState.advDaPct}
                      onChange={(e) => updateAdvState('advDaPct', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
              </>
            )}
          </div>
          {advState.daMethod === 'percentOfRevenue' && advState.daPercentMode === 'individual' && (
            <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2">
              {advState.daPercentsList.map((val, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                  <input
                    type="number"
                    step="0.1"
                    value={val}
                    onChange={(e) => updateListItem('daPercentsList', idx, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              ))}
            </div>
          )}
          {advState.daMethod === 'direct' && (
            <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2">
              {advState.daDirectList.map((val, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={val}
                    onChange={(e) => updateListItem('daDirectList', idx, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {!showAllSteps && (
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md"
              onClick={() => updateAdvState('advStep', 3)}
            >
              Back
            </button>
            {advState.advStep === 4 && (
              <button
                type="button"
                className="px-3 py-2 bg-blue-600 text-white rounded-md"
                onClick={() => updateAdvState('advStep', 5)}
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>

      {/* Step 5: Capital Structure (D/E Ratio) - Only for free-valuation */}
      {!hideDeRatio && (
        <div
          className={`transition-all duration-500 ease-out ${showAllSteps || advState.advStep >= 5 ? 'opacity-100 translate-y-0 max-h-[1000px]' : 'opacity-0 -translate-y-2 max-h-0'} overflow-hidden`}
        >
          <div className="mb-2 text-sm font-medium text-gray-700">5. Capital Structure</div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Calculator className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="max-w-xs">
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    Debt-to-Equity Ratio
                    <Tooltip content="D/E Ratio = Total Debt ÷ Total Equity. Enter as a ratio (not percentage). For example: 0.5 = $0.50 debt per $1 equity, 1.0 = equal debt and equity, 2.0 = $2 debt per $1 equity.">
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                    </Tooltip>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={advState.deRatio}
                    onChange={(e) => updateAdvState('deRatio', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      parseFloat(advState.deRatio) > 5
                        ? 'border-amber-500 focus:ring-amber-500 bg-amber-50'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="0.00"
                  />
                  {industryAvgDeRatio !== null && (
                    <div className="mt-1 text-xs text-gray-600">
                      Industry average:{' '}
                      <span className="font-medium text-blue-700">{industryAvgDeRatio.toFixed(2)}</span>
                    </div>
                  )}
                  {parseFloat(advState.deRatio) > 5 && (
                    <div className="mt-1 flex items-start gap-1 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                      <span className="font-semibold">⚠️</span>
                      <span>
                        Very high leverage (D/E &gt; 5). This indicates extreme debt levels. Please verify this is
                        correct.
                      </span>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-600">
                    <span className="font-medium">Enter as ratio:</span> 0 = no debt, 0.5 = moderate, 1.0 = equal
                    debt/equity, 2.0 = high leverage
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!showAllSteps && (
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md"
                onClick={() => updateAdvState('advStep', 4)}
              >
                Back
              </button>
              {advState.advStep === 5 && (
                <button
                  type="button"
                  className="px-3 py-2 bg-blue-600 text-white rounded-md"
                  onClick={() => updateAdvState('advStep', 6)}
                >
                  Next
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 6: Taxes (or Step 5 if hideDeRatio is true) */}
      <div
        className={`transition-all duration-500 ease-out ${showAllSteps || advState.advStep >= (hideDeRatio ? 5 : 6) ? 'opacity-100 translate-y-0 max-h-[1000px]' : 'opacity-0 -translate-y-2 max-h-0'} overflow-hidden`}
      >
        <div className="mb-2 text-sm font-medium text-gray-700">{hideDeRatio ? '5' : '6'}. Taxes</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
            <select
              value={advState.taxesMethod}
              onChange={(e) => updateAdvState('taxesMethod', e.target.value as 'percentOfEBIT' | 'direct')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="percentOfEBIT">% of EBIT</option>
              <option value="direct">Direct per year</option>
            </select>
          </div>
          {advState.taxesMethod === 'percentOfEBIT' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax % of EBIT</label>
              <input
                type="number"
                step="0.1"
                value={advState.taxesPct}
                onChange={(e) => updateAdvState('taxesPct', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g. 25"
              />
            </div>
          ) : (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Taxes per year:</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {advState.taxesDirectList.map((val, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={val}
                      onChange={(e) => updateListItem('taxesDirectList', idx, e.target.value)}
                      className="px-2 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3">
          {!showAllSteps && (
            <button
              type="button"
              className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md"
              onClick={() => updateAdvState('advStep', hideDeRatio ? 4 : 5)}
            >
              Back
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
            disabled={isCalculating}
          >
            {isCalculating ? 'Calculating...' : 'Estimate'}
          </button>
        </div>
      </div>
    </form>
  );
}
