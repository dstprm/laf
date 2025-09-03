'use client';

import React, { useEffect } from 'react';
import { useModelStore } from '../store/modelStore';

export const EquityValueInput: React.FC = () => {
  const { 
    model, 
    calculatedFinancials,
    updateEquityValue,
    calculateFinancials
  } = useModelStore();

  const handleChange = (field: string, value: number) => {
    const updates: Record<string, number> = { [field]: value };
    updateEquityValue(updates);
    // Trigger immediate recalculation
    calculateFinancials();
  };

  // Ensure calculations are current on mount
  useEffect(() => {
    calculateFinancials();
  }, [calculateFinancials]);

  const equityValue = model.equityValue;

  return (
    <div className="space-y-4 pb-6 border-b-2 border-gray-300 mb-6">
      {/* Section Title */}
      <div className="border-l-4 border-green-500 pl-4 mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Equity Value</h3>
        <p className="text-sm text-gray-600">Configure balance sheet items to calculate equity value from enterprise value</p>
      </div>

      {/* Balance Sheet Items */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Cash & Cash Equivalents ($M)
              </label>
              <input
                type="number"
                value={equityValue.cash || ''}
                onChange={(e) => handleChange('cash', Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                placeholder="0"
                step="0.1"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Cash, short-term investments, and cash equivalents
              </p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Total Debt ($M)
              </label>
              <input
                type="number"
                value={equityValue.totalDebt || ''}
                onChange={(e) => handleChange('totalDebt', Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                placeholder="0"
                step="0.1"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Short-term + long-term debt
              </p>
            </div>
          </div>

          {/* Optional Adjustments */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Optional Adjustments</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Minority Interest ($M)
                </label>
                <input
                  type="number"
                  value={equityValue.minorityInterest || ''}
                  onChange={(e) => handleChange('minorityInterest', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Non-controlling interests
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Investments in Subsidiaries ($M)
                </label>
                <input
                  type="number"
                  value={equityValue.investmentsInSubsidiaries || ''}
                  onChange={(e) => handleChange('investmentsInSubsidiaries', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Value of subsidiary investments
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Other Adjustments ($M)
                </label>
                <input
                  type="number"
                  value={equityValue.otherAdjustments || ''}
                  onChange={(e) => handleChange('otherAdjustments', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Other balance sheet adjustments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculation Formula */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-xs font-medium text-gray-700 mb-2">Formula:</div>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Enterprise Value = Sum of Discounted Cash Flows + Present Value of Terminal Value</div>
          <div>Equity Value = Enterprise Value - Total Debt + Cash - Minority Interest + Investments + Other Adjustments</div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-900 mb-3">Valuation Results</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-green-600 font-medium">Enterprise Value</div>
            <div className="text-xl font-bold text-green-900">
              ${calculatedFinancials.enterpriseValue.toFixed(1)}M
            </div>
            <div className="text-xs text-green-600 mt-1">
              DCF: ${calculatedFinancials.discountedCashFlows.reduce((sum: number, dcf: number) => sum + dcf, 0).toFixed(1)}M + TV: ${calculatedFinancials.presentValueTerminalValue.toFixed(1)}M
            </div>
          </div>
          <div>
            <div className="text-xs text-green-600 font-medium">Equity Value</div>
            <div className="text-xl font-bold text-green-900">
              ${calculatedFinancials.equityValue.toFixed(1)}M
            </div>
            <div className="text-xs text-green-600 mt-1">
              Net Cash: ${((equityValue.cash || 0) - (equityValue.totalDebt || 0)).toFixed(1)}M
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 