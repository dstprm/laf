'use client';

import React, { useEffect } from 'react';
import { useModelStore } from '../store/modelStore';
import { calculateWaccPercent } from '@/utils/wacc-calculator';

export const TerminalValueInput: React.FC = () => {
  const { 
    model, 
    calculatedFinancials,
    updateTerminalValue,
    calculateFinancials
  } = useModelStore();

  const handleChange = (field: string, value: string | number) => {
    const updates: Record<string, string | number> = { [field]: value };
    updateTerminalValue(updates);
    // Trigger immediate recalculation
    calculateFinancials();
  };

  // Ensure calculations are current on mount
  useEffect(() => {
    calculateFinancials();
  }, [calculateFinancials]);

  const terminalValue = model.terminalValue;

  return (
    <div className="space-y-4 pb-6 border-b-2 border-gray-300 mb-6">
      {/* Section Title */}
      <div className="border-l-4 border-blue-500 pl-4 mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Terminal Value</h3>
        <p className="text-sm text-gray-600">Configure terminal value calculation method</p>
      </div>

      {/* Method Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Terminal Value Method
            </label>
            <div className="flex bg-gray-100 rounded-md p-1">
              <button
                onClick={() => handleChange('method', 'growth')}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-colors ${
                  terminalValue.method === 'growth'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Growth Method
              </button>
              <button
                onClick={() => handleChange('method', 'multiples')}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-colors ${
                  terminalValue.method === 'multiples'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Multiples Method
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Method Configuration */}
      {terminalValue.method === 'growth' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Terminal Growth Rate (%)
              </label>
              <input
                type="number"
                value={terminalValue.growthRate || ''}
                onChange={(e) => handleChange('growthRate', Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="2.5"
                step="0.1"
                min="0"
                max="10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Perpetual growth rate for cash flows beyond the forecast period
              </p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-xs font-medium text-gray-700 mb-2">Formula:</div>
              <div className="text-xs text-gray-600">
                Terminal Value = FCF(final year) × (1 + growth rate) ÷ (discount rate - growth rate)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multiples Method Configuration */}
      {terminalValue.method === 'multiples' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Metric
                </label>
                <select
                  value={terminalValue.multipleMetric || 'ebitda'}
                  onChange={(e) => handleChange('multipleMetric', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ebitda">EBITDA</option>
                  <option value="revenue">Revenue</option>
                  <option value="ebit">EBIT</option>
                  <option value="netIncome">Net Income</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Financial metric to apply the multiple to
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Multiple
                </label>
                <input
                  type="number"
                  value={terminalValue.multipleValue || ''}
                  onChange={(e) => handleChange('multipleValue', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10"
                  step="0.1"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Multiple to apply to the selected metric
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-xs font-medium text-gray-700 mb-2">Formula:</div>
              <div className="text-xs text-gray-600">
                Terminal Value = {terminalValue.multipleMetric?.toUpperCase() || 'METRIC'}(final year) × Multiple
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Value Results */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-3">Terminal Value Results</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-blue-600 font-medium">Terminal Value (Final Year)</div>
            <div className="text-lg font-bold text-blue-900">
              ${calculatedFinancials.terminalValue.toFixed(1)}M
            </div>
          </div>
          <div>
            <div className="text-xs text-blue-600 font-medium">Present Value of Terminal Value</div>
            <div className="text-lg font-bold text-blue-900">
              ${calculatedFinancials.presentValueTerminalValue.toFixed(1)}M
            </div>
          </div>
        </div>
        
        {/* Calculation Details */}
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="text-xs text-blue-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">WACC (Discount Rate):</span>{' '}
                {(() => {
                  const rp = model.riskProfile;
                  if (!rp) return '9.0%';
                  
                  const wacc = calculateWaccPercent(rp);
                  
                  return `${wacc.toFixed(2)}%`;
                })()}
              </div>
              <div>
                <span className="font-medium">Forecast Periods:</span>{' '}
                {model.periods.numberOfYears}
              </div>
            </div>
            {terminalValue.method === 'growth' && (
              <div className="mt-1">
                <span className="font-medium">Final Year FCF:</span>{' '}
                ${calculatedFinancials.freeCashFlow[calculatedFinancials.freeCashFlow.length - 1]?.toFixed(1) || '0.0'}M
              </div>
            )}
            {terminalValue.method === 'multiples' && (
              <div className="mt-1">
                <span className="font-medium">Final Year {terminalValue.multipleMetric?.toUpperCase()}:</span>{' '}
                ${(() => {
                  const metric = terminalValue.multipleMetric || 'ebitda';
                  const values = calculatedFinancials[metric as keyof typeof calculatedFinancials] as number[];
                  if (!values || !Array.isArray(values)) return '0.0';
                  return values[values.length - 1]?.toFixed(1) || '0.0';
                })()}M
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 