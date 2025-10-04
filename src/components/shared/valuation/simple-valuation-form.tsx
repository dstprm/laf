'use client';

import React from 'react';
import { BusinessInfoForm } from './business-info-form';

interface SimpleValuationFormProps {
  // Business info
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

  // Form values
  lastYearRevenue: string;
  setLastYearRevenue: (value: string) => void;
  revenueGrowthPct: string;
  setRevenueGrowthPct: (value: string) => void;
  ebitdaMarginPct: string;
  setEbitdaMarginPct: (value: string) => void;

  // Form state
  step: number;
  setStep: (value: number) => void;
  isCalculating: boolean;

  // Handlers
  onSubmit: (e: React.FormEvent) => void;
}

export function SimpleValuationForm({
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
  revenueGrowthPct,
  setRevenueGrowthPct,
  ebitdaMarginPct,
  setEbitdaMarginPct,
  step,
  setStep,
  isCalculating,
  onSubmit,
}: SimpleValuationFormProps) {
  return (
    <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Business Information Section */}
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
  );
}
