'use client';

import React from 'react';
import { useModelStore } from '../store/modelStore';

export const NWCInput: React.FC = () => {
  const { model, updateNetWorkingCapital, calculateFinancials } = useModelStore();

  const handleNWCChange = (field: string, value: number | string) => {
    const updatedNWC = { ...model.netWorkingCapital };
    
    if (field === 'inputMethod') {
      updatedNWC.inputMethod = value as 'direct' | 'percentOfRevenue' | 'percentOfEBIT' | 'growth';
    } else if (field === 'baseValue') {
      updatedNWC.baseValue = Number(value);
    } else if (field === 'growthRate') {
      updatedNWC.growthRate = Number(value);
    } else if (field === 'growthMethod') {
      updatedNWC.growthMethod = value as 'uniform' | 'individual';
    } else if (field === 'percentOfRevenue') {
      updatedNWC.percentOfRevenue = Number(value);
    } else if (field === 'percentOfEBIT') {
      updatedNWC.percentOfEBIT = Number(value);
    } else if (field === 'percentMethod') {
      updatedNWC.percentMethod = value as 'uniform' | 'individual';
    }
    
    updateNetWorkingCapital(updatedNWC);
    setTimeout(() => calculateFinancials(), 100);
  };

  const handleIndividualGrowthChange = (periodIndex: number, growthRate: number) => {
    const currentGrowthRates = model.netWorkingCapital.individualGrowthRates || {};
    const newGrowthRates = { ...currentGrowthRates };
    
    if (growthRate === 0) {
      delete newGrowthRates[periodIndex];
    } else {
      newGrowthRates[periodIndex] = growthRate;
    }

    updateNetWorkingCapital({
      ...model.netWorkingCapital,
      inputMethod: 'growth',
      growthMethod: 'individual',
      individualGrowthRates: newGrowthRates,
    });
    setTimeout(() => calculateFinancials(), 100);
  };

  const handleIndividualPercentChange = (periodIndex: number, percent: number) => {
    const currentPercents = model.netWorkingCapital.individualPercents || {};
    const newPercents = { ...currentPercents };
    
    if (percent === 0) {
      delete newPercents[periodIndex];
    } else {
      newPercents[periodIndex] = percent;
    }

    updateNetWorkingCapital({
      ...model.netWorkingCapital,
      percentMethod: 'individual',
      individualPercents: newPercents,
    });
    setTimeout(() => calculateFinancials(), 100);
  };

  const handleYearlyValueChange = (periodIndex: number, value: number) => {
    const currentYearlyValues = model.netWorkingCapital.yearlyValues || [];
    const newYearlyValues = [...currentYearlyValues];
    
    while (newYearlyValues.length <= periodIndex) {
      newYearlyValues.push(0);
    }
    
    newYearlyValues[periodIndex] = value;

    updateNetWorkingCapital({
      ...model.netWorkingCapital,
      inputMethod: 'direct',
      yearlyValues: newYearlyValues,
    });
    setTimeout(() => calculateFinancials(), 100);
  };

  return (
    <div className="space-y-4">
      {/* Input Method Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              NWC Calculation Method
            </label>
            <div className="flex bg-gray-100 rounded-md p-1">
              <button
                onClick={() => handleNWCChange('inputMethod', 'percentOfRevenue')}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                  model.netWorkingCapital.inputMethod === 'percentOfRevenue'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                % of Revenue
              </button>
              <button
                onClick={() => handleNWCChange('inputMethod', 'percentOfEBIT')}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                  model.netWorkingCapital.inputMethod === 'percentOfEBIT'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                % of EBIT
              </button>
              <button
                onClick={() => handleNWCChange('inputMethod', 'growth')}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                  model.netWorkingCapital.inputMethod === 'growth'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Base + Growth
              </button>
              <button
                onClick={() => handleNWCChange('inputMethod', 'direct')}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                  model.netWorkingCapital.inputMethod === 'direct'
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
      {model.netWorkingCapital.inputMethod === 'growth' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Base Value ({model.periods.startYear}) ($M)
                </label>
                <input
                  type="number"
                  value={model.netWorkingCapital.baseValue || ''}
                  onChange={(e) => handleNWCChange('baseValue', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter base NWC value"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  NWC value for {model.periods.startYear}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Growth Method</label>
                <select
                  value={model.netWorkingCapital.growthMethod || 'uniform'}
                  onChange={(e) => handleNWCChange('growthMethod', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="uniform">Uniform Growth Rate</option>
                  <option value="individual">Individual Year Growth</option>
                </select>
              </div>
            </div>

            {model.netWorkingCapital.growthMethod === 'uniform' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Annual Growth Rate (%)
                </label>
                <input
                  type="number"
                  value={model.netWorkingCapital.growthRate || ''}
                  onChange={(e) => handleNWCChange('growthRate', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter growth rate"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Year-over-year growth rate for NWC
                </p>
              </div>
            )}

            {model.netWorkingCapital.growthMethod === 'individual' && (
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
                          value={model.netWorkingCapital.individualGrowthRates?.[periodIndex] || ''}
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
      {model.netWorkingCapital.inputMethod === 'percentOfRevenue' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Percentage Method</label>
              <select
                value={model.netWorkingCapital.percentMethod || 'uniform'}
                onChange={(e) => handleNWCChange('percentMethod', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="uniform">Uniform Percentage</option>
                <option value="individual">Individual Year Percentages</option>
              </select>
            </div>

            {model.netWorkingCapital.percentMethod === 'uniform' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  NWC Rate (% of Revenue)
                </label>
                <input
                  type="number"
                  value={model.netWorkingCapital.percentOfRevenue || ''}
                  onChange={(e) => handleNWCChange('percentOfRevenue', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter NWC percentage"
                  step="0.1"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  NWC = Revenue × NWC Rate
                </p>
              </div>
            )}

            {model.netWorkingCapital.percentMethod === 'individual' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Individual NWC Rates (% of Revenue)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {model.periods.periodLabels.map((label: string, periodIndex: number) => (
                    <div key={periodIndex}>
                      <label className="block text-xs text-gray-500 mb-1">{label}</label>
                      <input
                        type="number"
                        value={model.netWorkingCapital.individualPercents?.[periodIndex] || ''}
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
                <p className="text-xs text-gray-500 mt-2">
                  NWC rates for each year (% of Revenue)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Percentage of EBIT Configuration */}
      {model.netWorkingCapital.inputMethod === 'percentOfEBIT' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Percentage Method</label>
              <select
                value={model.netWorkingCapital.percentMethod || 'uniform'}
                onChange={(e) => handleNWCChange('percentMethod', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="uniform">Uniform Percentage</option>
                <option value="individual">Individual Year Percentages</option>
              </select>
            </div>

            {model.netWorkingCapital.percentMethod === 'uniform' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  NWC Rate (% of EBIT)
                </label>
                <input
                  type="number"
                  value={model.netWorkingCapital.percentOfEBIT || ''}
                  onChange={(e) => handleNWCChange('percentOfEBIT', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter NWC percentage"
                  step="0.1"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  NWC = EBIT × NWC Rate
                </p>
              </div>
            )}

            {model.netWorkingCapital.percentMethod === 'individual' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Individual NWC Rates (% of EBIT)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {model.periods.periodLabels.map((label: string, periodIndex: number) => (
                    <div key={periodIndex}>
                      <label className="block text-xs text-gray-500 mb-1">{label}</label>
                      <input
                        type="number"
                        value={model.netWorkingCapital.individualPercents?.[periodIndex] || ''}
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
                <p className="text-xs text-gray-500 mt-2">
                  NWC rates for each year (% of EBIT)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Direct Input Configuration */}
      {model.netWorkingCapital.inputMethod === 'direct' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Direct NWC Values by Year ($M)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {model.periods.periodLabels.map((label: string, periodIndex: number) => (
                <div key={periodIndex}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input
                    type="number"
                    value={model.netWorkingCapital.yearlyValues?.[periodIndex] || ''}
                    onChange={(e) => handleYearlyValueChange(periodIndex, Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    step="0.1"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enter NWC values directly for each year
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 