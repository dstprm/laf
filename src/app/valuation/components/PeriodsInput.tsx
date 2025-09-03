'use client';

import React from 'react';
import { useModelStore } from '../store/modelStore';

export const PeriodsInput: React.FC = () => {
  const { model, updatePeriods } = useModelStore();

  const handleStartYearChange = (startYear: number) => {
    updatePeriods({ startYear });
  };

  const handleNumberOfYearsChange = (numberOfYears: number) => {
    updatePeriods({ numberOfYears });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Year
          </label>
          <input
            type="number"
            value={model.periods.startYear}
            onChange={(e) => handleStartYearChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="2020"
            max="2050"
          />
          <p className="text-xs text-gray-500 mt-1">
            The first year of your projection period
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Years
          </label>
          <select
            value={model.periods.numberOfYears}
            onChange={(e) => handleNumberOfYearsChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={3}>3 Years</option>
            <option value={5}>5 Years</option>
            <option value={7}>7 Years</option>
            <option value={10}>10 Years</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Length of your projection period
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Projection Periods</h4>
        <div className="flex flex-wrap gap-2">
          {model.periods.periodLabels.map((label, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
            >
              {label}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          These are the periods that will appear as columns in your financial model
        </p>
      </div>
    </div>
  );
}; 