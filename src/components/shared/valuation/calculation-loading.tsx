'use client';

import React from 'react';

export function CalculationLoading() {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4">
        <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <div>
          <div className="text-sm font-medium text-gray-900">Calculando...</div>
          <div className="text-xs text-gray-600">Esto tomará unos segundos</div>
        </div>
      </div>
    </div>
  );
}
