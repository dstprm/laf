'use client';

import React from 'react';
import { useModelStore } from '../store/modelStore';

export const TaxInput: React.FC = () => {
  const { model, updateTaxes, calculateFinancials } = useModelStore();

  const handleTaxChange = (field: string, value: number | string) => {
    const updatedTaxes = { ...model.taxes };
    
    if (field === 'inputMethod') {
      updatedTaxes.inputMethod = value as 'direct' | 'percentOfEBIT' | 'growth';
    } else if (field === 'baseValue') {
      updatedTaxes.baseValue = Number(value);
    } else if (field === 'growthRate') {
      updatedTaxes.growthRate = Number(value);
    } else if (field === 'growthMethod') {
      updatedTaxes.growthMethod = value as 'uniform' | 'individual';
    } else if (field === 'percentOfEBIT') {
      updatedTaxes.percentOfEBIT = Number(value);
    } else if (field === 'percentMethod') {
      updatedTaxes.percentMethod = value as 'uniform' | 'individual';
    }
    
    updateTaxes(updatedTaxes);
    setTimeout(() => calculateFinancials(), 100);
  };

  // Individual growth rate change handler
  const handleIndividualGrowthChange = (periodIndex: number, growthRate: number) => {
    const currentGrowthRates = model.taxes.individualGrowthRates || {};
    const newGrowthRates = { ...currentGrowthRates };
    
    if (growthRate === 0) {
      delete newGrowthRates[periodIndex];
    } else {
      newGrowthRates[periodIndex] = growthRate;
    }

    updateTaxes({
      ...model.taxes,
      individualGrowthRates: newGrowthRates,
    });
    setTimeout(() => calculateFinancials(), 100);
  };

  // Individual percentage change handler
  const handleIndividualPercentChange = (periodIndex: number, percent: number) => {
    const currentPercents = model.taxes.individualPercents || {};
    const newPercents = { ...currentPercents };
    
    if (percent === 0) {
      delete newPercents[periodIndex];
    } else {
      newPercents[periodIndex] = percent;
    }

    updateTaxes({
      ...model.taxes,
      individualPercents: newPercents,
    });
    setTimeout(() => calculateFinancials(), 100);
  };

  // Yearly value change handler
  const handleYearlyValueChange = (periodIndex: number, value: number) => {
    const currentYearlyValues = model.taxes.yearlyValues || [];
    const newYearlyValues = [...currentYearlyValues];
    
    while (newYearlyValues.length <= periodIndex) {
      newYearlyValues.push(0);
    }
    
    newYearlyValues[periodIndex] = value;

    updateTaxes({
      ...model.taxes,
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
              Income Taxes
            </label>
            <p className="text-xs text-gray-500">
              Configure tax calculation method
            </p>
          </div>

          {/* Calculation Method */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Calculation Method
            </label>
            <div className="flex bg-gray-100 rounded-md p-1">
              <button
                onClick={() => handleTaxChange('inputMethod', 'growth')}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                  model.taxes.inputMethod === 'growth'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Growth-based
              </button>
              <button
                onClick={() => handleTaxChange('inputMethod', 'percentOfEBIT')}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                  model.taxes.inputMethod === 'percentOfEBIT'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                % of EBIT
              </button>
              <button
                onClick={() => handleTaxChange('inputMethod', 'direct')}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                  model.taxes.inputMethod === 'direct'
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
      {model.taxes.inputMethod === 'growth' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Base Value ({model.periods.startYear}) ($M)
                </label>
                <input
                  type="number"
                  value={model.taxes.baseValue || ''}
                  onChange={(e) => handleTaxChange('baseValue', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter base tax value"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tax value for {model.periods.startYear}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Growth Method</label>
                <select
                  value={model.taxes.growthMethod || 'uniform'}
                  onChange={(e) => handleTaxChange('growthMethod', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="uniform">Uniform Growth Rate</option>
                  <option value="individual">Individual Year Growth</option>
                </select>
              </div>
            </div>

            {model.taxes.growthMethod === 'uniform' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Annual Growth Rate (%)
                </label>
                <input
                  type="number"
                  value={model.taxes.growthRate || ''}
                  onChange={(e) => handleTaxChange('growthRate', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter growth rate"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Year-over-year growth rate for taxes
                </p>
              </div>
            )}

            {model.taxes.growthMethod === 'individual' && (
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
                          value={model.taxes.individualGrowthRates?.[periodIndex] || ''}
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

      {/* Percentage of EBIT Configuration */}
      {model.taxes.inputMethod === 'percentOfEBIT' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tax Rate Method</label>
              <select
                value={model.taxes.percentMethod || 'uniform'}
                onChange={(e) => handleTaxChange('percentMethod', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="uniform">Uniform Tax Rate</option>
                <option value="individual">Individual Year Tax Rates</option>
              </select>
            </div>

            {model.taxes.percentMethod === 'uniform' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Tax Rate (% of EBIT)
                </label>
                <input
                  type="number"
                  value={model.taxes.percentOfEBIT || ''}
                  onChange={(e) => handleTaxChange('percentOfEBIT', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter tax rate"
                  step="0.1"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Taxes = EBIT × Tax Rate (only applied to positive EBIT)
                </p>
              </div>
            )}

            {model.taxes.percentMethod === 'individual' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Individual Tax Rates (% of EBIT)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {model.periods.periodLabels.map((label: string, periodIndex: number) => (
                    <div key={periodIndex}>
                      <label className="block text-xs text-gray-500 mb-1">{label}</label>
                      <input
                        type="number"
                        value={model.taxes.individualPercents?.[periodIndex] || ''}
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
                  Tax rates for each year (only applied to positive EBIT)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Direct Input Configuration */}
      {model.taxes.inputMethod === 'direct' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Direct Tax Values by Year ($M)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {model.periods.periodLabels.map((label: string, periodIndex: number) => (
                <div key={periodIndex}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input
                    type="number"
                    value={model.taxes.yearlyValues?.[periodIndex] || ''}
                    onChange={(e) => handleYearlyValueChange(periodIndex, Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    step="0.1"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enter tax values directly for each year
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 