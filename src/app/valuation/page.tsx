'use client';

import React from 'react';
import { DCFTable } from './components/DCFTable';
import { JsonPreview } from './components/JsonPreview';
import { IndustryCountrySelector } from './components/IndustryCountrySelector';
import { useModelStore } from './store/modelStore';

export default function Home() {
  const { jsonPreviewVisible, setJsonPreviewVisibility, exportModel } = useModelStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">DCF Financial Model Builder</h1>
                <p className="mt-2 text-gray-600">Build your discounted cash flow model by defining key assumptions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Risk Profile Section */}
        <IndustryCountrySelector />

        {/* Full-Width DCF Table */}
        <DCFTable />

        {/* Excel Data Display */}
        {jsonPreviewVisible && (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Model Data (JSON)</h3>
                <button
                  onClick={() => setJsonPreviewVisibility(false)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-4">
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-96 text-gray-800">
                {exportModel()}
              </pre>
            </div>
          </div>
        )}

        {/* Mobile JSON Export */}
        <div className="mt-6 lg:hidden">
          <JsonPreview />
        </div>
      </div>
    </div>
  );
}
