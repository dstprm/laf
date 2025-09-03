'use client';

import React from 'react';
import { useModelStore } from '../store/modelStore';

export const DAInput: React.FC = () => {
  const { model, updateDA, calculateFinancials } = useModelStore();

  const handleDAChange = (field: string, value: number | string) => {
    const updatedDA = { ...model.da };
    
    if (field === 'inputMethod') {
      updatedDA.inputMethod = value as 'direct' | 'percentOfRevenue' | 'growth';
    } else if (field === 'baseValue') {
      updatedDA.baseValue = Number(value);
    } else if (field === 'growthRate') {
      updatedDA.growthRate = Number(value);
    } else if (field === 'growthMethod') {
      updatedDA.growthMethod = value as 'uniform' | 'individual';
    } else if (field === 'percentOfRevenue') {
      updatedDA.percentOfRevenue = Number(value);
    } else if (field === 'percentMethod') {
      updatedDA.percentMethod = value as 'uniform' | 'individual';
    }
    
    updateDA(updatedDA);
    setTimeout(() => calculateFinancials(), 100);
  };

  // Individual growth rate change handler
  const handleIndividualGrowthChange = (periodIndex: number, growthRate: number) => {
    const currentGrowthRates = model.da.individualGrowthRates || {};
    const newGrowthRates = { ...currentGrowthRates };
    
    if (growthRate === 0) {
      delete newGrowthRates[periodIndex];
    } else {
      newGrowthRates[periodIndex] = growthRate;
    }

    updateDA({
      ...model.da,
      individualGrowthRates: newGrowthRates,
    });
    setTimeout(() => calculateFinancials(), 100);
  };

  // Individual percentage change handler
  const handleIndividualPercentChange = (periodIndex: number, percent: number) => {
    const currentPercents = model.da.individualPercents || {};
    const newPercents = { ...currentPercents };
    
    if (percent === 0) {
      delete newPercents[periodIndex];
    } else {
      newPercents[periodIndex] = percent;
    }

    updateDA({
      ...model.da,
      individualPercents: newPercents,
    });
    setTimeout(() => calculateFinancials(), 100);
  };

  // Yearly value change handler
  const handleYearlyValueChange = (periodIndex: number, value: number) => {
    const currentYearlyValues = model.da.yearlyValues || [];
    const newYearlyValues = [...currentYearlyValues];
    
    while (newYearlyValues.length <= periodIndex) {
      newYearlyValues.push(0);
    }
    
    newYearlyValues[periodIndex] = value;

    updateDA({
      ...model.da,
      yearlyValues: newYearlyValues,
    });
    setTimeout(() => calculateFinancials(), 100);
  };

  return (
    <div className="space-y-4">
      {/* Input Method Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Depreciation & Amortization
            </label>
            <p className="text-xs text-gray-500">
              Configure D&A calculation method
            </p>
          </div>

          {/* Calculation Method */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Calculation Method
            </label>
            <div className="flex bg-gray-100 rounded-md p-1">
              <button
                onClick={() => handleDAChange('inputMethod', 'growth')}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                  model.da.inputMethod === 'growth'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Growth-based
              </button>
              <button
                onClick={() => handleDAChange('inputMethod', 'percentOfRevenue')}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                  model.da.inputMethod === 'percentOfRevenue'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                % of Revenue
              </button>
              <button
                onClick={() => handleDAChange('inputMethod', 'direct')}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                  model.da.inputMethod === 'direct'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Direct Input
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Growth-based Configuration */}
      {model.da.inputMethod === 'growth' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Base Value ({model.periods.startYear}) ($M)
                </label>
                <input
                  type="number"
                  value={model.da.baseValue || ''}
                  onChange={(e) => handleDAChange('baseValue', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter base D&A value"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  D&A value for {model.periods.startYear}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Growth Method</label>
                <select
                  value={model.da.growthMethod || 'uniform'}
                  onChange={(e) => handleDAChange('growthMethod', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="uniform">Uniform Growth Rate</option>
                  <option value="individual">Individual Year Growth</option>
                </select>
              </div>
            </div>

            {model.da.growthMethod === 'uniform' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Annual Growth Rate (%)
                </label>
                <input
                  type="number"
                  value={model.da.growthRate || ''}
                  onChange={(e) => handleDAChange('growthRate', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter growth rate"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Year-over-year growth rate for D&A
                </p>
              </div>
            )}

            {model.da.growthMethod === 'individual' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Individual Growth Rates (%)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {model.periods.periodLabels.map((label: string, periodIndex: number) => (
                    <div key={periodIndex}>
                      <label className="block text-xs text-gray-500 mb-1">{label}</label>
                      {periodIndex === 0 ? (
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 text-center text-sm">
                          Base Year
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={model.da.individualGrowthRates?.[periodIndex] || ''}
                          onChange={(e) => handleIndividualGrowthChange(periodIndex, Number(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                          step="0.1"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Percentage of Revenue Configuration */}
      {model.da.inputMethod === 'percentOfRevenue' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Percentage Method</label>
              <select
                value={model.da.percentMethod || 'uniform'}
                onChange={(e) => handleDAChange('percentMethod', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="uniform">Uniform Percentage</option>
                <option value="individual">Individual Year Percentages</option>
              </select>
            </div>

            {model.da.percentMethod === 'uniform' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  D&A as % of Revenue
                </label>
                <input
                  type="number"
                  value={model.da.percentOfRevenue || ''}
                  onChange={(e) => handleDAChange('percentOfRevenue', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter percentage"
                  step="0.1"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  D&A = Revenue × Percentage
                </p>
              </div>
            )}

            {model.da.percentMethod === 'individual' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Individual D&A Percentages of Revenue (%)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {model.periods.periodLabels.map((label: string, periodIndex: number) => (
                    <div key={periodIndex}>
                      <label className="block text-xs text-gray-500 mb-1">{label}</label>
                      <input
                        type="number"
                        value={model.da.individualPercents?.[periodIndex] || ''}
                        onChange={(e) => handleIndividualPercentChange(periodIndex, Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Direct Input Configuration */}
      {model.da.inputMethod === 'direct' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Direct D&A Values by Year ($M)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {model.periods.periodLabels.map((label: string, periodIndex: number) => (
                <div key={periodIndex}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input
                    type="number"
                    value={model.da.yearlyValues?.[periodIndex] || ''}
                    onChange={(e) => handleYearlyValueChange(periodIndex, Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    step="0.1"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enter D&A values directly for each year
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 