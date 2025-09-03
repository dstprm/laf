/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { useModelStore } from '../store/modelStore';
import { Plus, X, ChevronDown, ChevronRight } from 'lucide-react';

// Types for the input methods configuration
export interface InputMethodConfig {
  key: string;
  label: string;
  description?: string;
}

export interface ConsolidatedInputConfig {
  inputMethods: InputMethodConfig[];
  allowPercentageOfRevenue?: boolean;
  percentageLabel?: string;
  percentageDescription?: string;
}

export interface SegmentConfig {
  segmentTypeName: string;
  defaultSegmentName: string;
  defaultRowName: string;
  allowFactorMultiplication?: boolean;
  allowPercentageOfRevenue?: boolean;
}

interface ConsolidatedData {
  inputMethod?: string;
  growthMethod?: 'uniform' | 'individual';
  baseValue?: number;
  growthRate?: number;
  percentOfRevenue?: number;
  percentMethod?: 'uniform' | 'individual';
  grossMarginPercent?: number;
  revenueMarginPercent?: number;
  individualGrowthRates?: Record<number, number>;
  individualPercents?: Record<number, number>;
  yearlyValues?: number[];
  [key: string]: any;
}

interface FinancialData {
  inputType: 'consolidated' | 'segments';
  consolidated?: ConsolidatedData;
  segments?: Array<Record<string, any>>;
}

export interface FinancialInputSectionProps {
  title: string;
  sectionKey: 'revenue' | 'cogs' | 'opex' | 'otherIncome' | 'otherExpenses';
  consolidatedConfig: ConsolidatedInputConfig;
  segmentConfig: SegmentConfig;
  data: FinancialData;
  updateFunction: (updates: Record<string, any>) => void;
  updateSegmentFunction?: (segmentId: string, updates: Record<string, any>) => void;
  updateSegmentRowFunction?: (segmentId: string, rowId: string, updates: Record<string, any>) => void;
  className?: string;
}

export const FinancialInputSection: React.FC<FinancialInputSectionProps> = ({
  title,
  sectionKey,
  consolidatedConfig,
  segmentConfig,
  data,
  updateFunction,
  updateSegmentFunction,
  updateSegmentRowFunction,
  className = '',
}) => {
  const { model, calculateFinancials } = useModelStore();
  const [expandedSegments, setExpandedSegments] = React.useState<Set<string>>(new Set());

  // Input type change handler (consolidated vs segments)
  const handleInputTypeChange = (inputType: 'consolidated' | 'segments') => {
    updateFunction({ inputType });
    setTimeout(() => calculateFinancials(), 100);
  };

  // Consolidated input change handler
  const handleConsolidatedChange = (field: string, value: number | string) => {
    const consolidated = {
      inputMethod: consolidatedConfig.inputMethods[0].key,
      growthMethod: 'uniform' as const,
      ...data.consolidated,
    };

    if (field === 'inputMethod') {
      consolidated.inputMethod = value as string;
    } else if (field === 'baseValue') {
      consolidated.baseValue = Number(value);
    } else if (field === 'growthRate') {
      consolidated.growthRate = Number(value);
    } else if (field === 'growthMethod') {
      consolidated.growthMethod = value as 'uniform' | 'individual';
    } else if (field === 'percentOfRevenue') {
      consolidated.percentOfRevenue = Number(value);
    } else if (field === 'percentMethod') {
      consolidated.percentMethod = value as 'uniform' | 'individual';
    } else if (field === 'grossMarginPercent') {
      consolidated.grossMarginPercent = Number(value);
    } else if (field === 'revenueMarginPercent') {
      consolidated.revenueMarginPercent = Number(value);
    } else if (field === 'percentMethod') {
      consolidated.percentMethod = value as 'uniform' | 'individual';
    }

    updateFunction({ consolidated });
    setTimeout(() => calculateFinancials(), 100);
  };

  // Individual growth rate change handler
  const handleIndividualGrowthChange = (periodIndex: number, growthRate: number) => {
    const currentGrowthRates = data.consolidated?.individualGrowthRates || {};
    const newGrowthRates = { ...currentGrowthRates };

    if (growthRate === 0) {
      delete newGrowthRates[periodIndex];
    } else {
      newGrowthRates[periodIndex] = growthRate;
    }

    updateFunction({
      consolidated: {
        inputMethod: 'growth',
        growthMethod: 'individual',
        ...data.consolidated,
        individualGrowthRates: newGrowthRates,
      },
    });
    setTimeout(() => calculateFinancials(), 100);
  };

  // Individual percentage change handler
  const handleIndividualPercentChange = (periodIndex: number, percent: number) => {
    const currentPercents = data.consolidated?.individualPercents || {};
    const newPercents = { ...currentPercents };

    if (percent === 0) {
      delete newPercents[periodIndex];
    } else {
      newPercents[periodIndex] = percent;
    }

    updateFunction({
      consolidated: {
        inputMethod: 'percentOfRevenue',
        percentMethod: 'individual',
        ...data.consolidated,
        individualPercents: newPercents,
      },
    });
    setTimeout(() => calculateFinancials(), 100);
  };

  // Yearly value change handler
  const handleYearlyValueChange = (periodIndex: number, value: number) => {
    const currentYearlyValues = data.consolidated?.yearlyValues || [];
    const newYearlyValues = [...currentYearlyValues];

    while (newYearlyValues.length <= periodIndex) {
      newYearlyValues.push(0);
    }

    newYearlyValues[periodIndex] = value;

    updateFunction({
      consolidated: {
        inputMethod: 'direct',
        ...data.consolidated,
        yearlyValues: newYearlyValues,
      },
    });
    setTimeout(() => calculateFinancials(), 100);
  };

  // Segment management functions
  const addSegment = () => {
    const segments = data.segments || [];
    const newSegmentId = `${sectionKey}_segment_${Date.now()}`;
    const newSegment: any = {
      id: newSegmentId,
      name: `${segmentConfig.segmentTypeName} ${segments.length + 1}`,
      segmentType: 'consolidated',
      inputMethod: 'growth',
      consolidatedRow: {
        id: `row_${Date.now()}`,
        name: segmentConfig.defaultRowName,
        inputMethod: 'growth',
        baseValue: 0,
        growthMethod: 'uniform',
        growthRate: 0,
      },
    };

    updateFunction({ segments: [...segments, newSegment] });
    setExpandedSegments((prev) => new Set([...prev, newSegmentId]));
    setTimeout(() => calculateFinancials(), 100);
  };

  const removeSegment = (segmentId: string) => {
    const segments = data.segments?.filter((s: any) => s.id !== segmentId) || [];
    updateFunction({ segments });
    setTimeout(() => calculateFinancials(), 100);
  };

  const toggleSegmentExpansion = (segmentId: string) => {
    setExpandedSegments((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(segmentId)) {
        newExpanded.delete(segmentId);
      } else {
        newExpanded.add(segmentId);
      }
      return newExpanded;
    });
  };

  const addRowToSegment = (segmentId: string) => {
    const segments =
      data.segments?.map((s: any) => {
        if (s.id === segmentId && s.segmentType === 'multiplication') {
          const currentRows = s.rows || [];
          const newRow: any = {
            id: `row_${Date.now()}`,
            name: `Factor ${currentRows.length + 1}`,
            inputMethod: 'growth',
            baseValue: 0,
            growthMethod: 'uniform',
            growthRate: 0,
          };
          return { ...s, rows: [...currentRows, newRow] };
        }
        return s;
      }) || [];
    updateFunction({ segments });
    setTimeout(() => calculateFinancials(), 100);
  };

  const removeRowFromSegment = (segmentId: string, rowId: string) => {
    const segments =
      data.segments?.map((s: any) => {
        if (s.id === segmentId && s.segmentType === 'multiplication') {
          return { ...s, rows: s.rows?.filter((r: any) => r.id !== rowId) || [] };
        }
        return s;
      }) || [];
    updateFunction({ segments });
    setTimeout(() => calculateFinancials(), 100);
  };

  return (
    <div className={`space-y-4 ${className} pb-6 border-b-2 border-gray-300 mb-6`}>
      {/* Section Title - Enhanced for Main Sections */}
      <div className="border-l-4 border-blue-500 pl-4 mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">Configure {title.toLowerCase()} assumptions and calculations</p>
      </div>

      {/* Input Method Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          {/* Input Type Toggle */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">{title} Input Method</label>
            <div className="flex bg-gray-100 rounded-md p-1">
              <button
                onClick={() => handleInputTypeChange('consolidated')}
                className={`flex-1 px-3 py-1 text-xs font-medium rounded transition-colors ${
                  data.inputType === 'consolidated'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Consolidated
              </button>
              <button
                onClick={() => handleInputTypeChange('segments')}
                className={`flex-1 px-3 py-1 text-xs font-medium rounded transition-colors ${
                  data.inputType === 'segments'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Segments
              </button>
            </div>
          </div>

          {/* Calculation Method (only for consolidated) */}
          {data.inputType === 'consolidated' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Calculation Method</label>
              <div className="flex bg-gray-100 rounded-md p-1">
                {consolidatedConfig.inputMethods.map((method, index) => (
                  <button
                    key={method.key}
                    onClick={() => handleConsolidatedChange('inputMethod', method.key)}
                    className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                      data.consolidated?.inputMethod === method.key
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Consolidated Configuration */}
      {data.inputType === 'consolidated' && (
        <ConsolidatedInputs
          data={data}
          consolidatedConfig={consolidatedConfig}
          onConsolidatedChange={handleConsolidatedChange}
          onIndividualGrowthChange={handleIndividualGrowthChange}
          onIndividualPercentChange={handleIndividualPercentChange}
          onYearlyValueChange={handleYearlyValueChange}
          periods={model.periods}
          sectionKey={sectionKey}
        />
      )}

      {/* Segments Configuration */}
      {data.inputType === 'segments' && (
        <SegmentsInputs
          data={data}
          segmentConfig={segmentConfig}
          onAddSegment={addSegment}
          onRemoveSegment={removeSegment}
          onToggleExpansion={toggleSegmentExpansion}
          onAddRowToSegment={addRowToSegment}
          onRemoveRowFromSegment={removeRowFromSegment}
          onUpdateSegment={updateSegmentFunction}
          onUpdateSegmentRow={updateSegmentRowFunction}
          expandedSegments={expandedSegments}
          periods={model.periods}
          sectionKey={sectionKey}
        />
      )}
    </div>
  );
};

// Consolidated Inputs Component
interface ConsolidatedInputsProps {
  data: any;
  consolidatedConfig: ConsolidatedInputConfig;
  onConsolidatedChange: (field: string, value: number | string) => void;
  onIndividualGrowthChange: (periodIndex: number, growthRate: number) => void;
  onIndividualPercentChange: (periodIndex: number, percent: number) => void;
  onYearlyValueChange: (periodIndex: number, value: number) => void;
  periods: any;
  sectionKey: string;
}

const ConsolidatedInputs: React.FC<ConsolidatedInputsProps> = ({
  data,
  consolidatedConfig,
  onConsolidatedChange,
  onIndividualGrowthChange,
  onIndividualPercentChange,
  onYearlyValueChange,
  periods,
  sectionKey,
}) => {
  const consolidated = data.consolidated;

  return (
    <div className="space-y-4">
      {/* Growth-based Configuration */}
      {consolidated?.inputMethod === 'growth' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Base Value ({periods.startYear}) ($M)
                </label>
                <input
                  type="number"
                  value={consolidated?.baseValue || ''}
                  onChange={(e) => onConsolidatedChange('baseValue', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter base value"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 mt-1">Base year value for {periods.startYear}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Growth Method</label>
                <select
                  value={consolidated?.growthMethod || 'uniform'}
                  onChange={(e) => onConsolidatedChange('growthMethod', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="uniform">Uniform Growth Rate</option>
                  <option value="individual">Individual Year Growth</option>
                </select>
              </div>
            </div>

            {consolidated?.growthMethod === 'uniform' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Annual Growth Rate (%)</label>
                <input
                  type="number"
                  value={consolidated?.growthRate || ''}
                  onChange={(e) => onConsolidatedChange('growthRate', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter growth rate"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 mt-1">Year-over-year growth rate</p>
              </div>
            )}

            {consolidated?.growthMethod === 'individual' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Individual Growth Rates (%)</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {periods.periodLabels.map((label: string, periodIndex: number) => (
                    <div key={periodIndex}>
                      <label className="block text-xs text-gray-500 mb-1">{label}</label>
                      {periodIndex === 0 ? (
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 text-center text-sm">
                          Base Year
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={consolidated?.individualGrowthRates?.[periodIndex] || ''}
                          onChange={(e) => onIndividualGrowthChange(periodIndex, Number(e.target.value))}
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
      {consolidated?.inputMethod === 'percentOfRevenue' && consolidatedConfig.allowPercentageOfRevenue && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Percentage Method</label>
              <select
                value={consolidated?.percentMethod || 'uniform'}
                onChange={(e) => onConsolidatedChange('percentMethod', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="uniform">Uniform Percentage</option>
                <option value="individual">Individual Year Percentages</option>
              </select>
            </div>

            {consolidated?.percentMethod === 'uniform' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {consolidatedConfig.percentageLabel || 'Percentage of Revenue (%)'}
                </label>
                <input
                  type="number"
                  value={consolidated?.percentOfRevenue || ''}
                  onChange={(e) => onConsolidatedChange('percentOfRevenue', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter percentage"
                  step="0.1"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {consolidatedConfig.percentageDescription || 'Calculated as Revenue × Percentage'}
                </p>
              </div>
            )}

            {consolidated?.percentMethod === 'individual' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Individual Percentages of Revenue (%)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {periods.periodLabels.map((label: string, periodIndex: number) => (
                    <div key={periodIndex}>
                      <label className="block text-xs text-gray-500 mb-1">{label}</label>
                      <input
                        type="number"
                        value={consolidated?.individualPercents?.[periodIndex] || ''}
                        onChange={(e) => onIndividualPercentChange(periodIndex, Number(e.target.value))}
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

      {/* Gross Margin Configuration (COGS-specific) */}
      {consolidated?.inputMethod === 'grossMargin' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Gross Margin (%)</label>
            <input
              type="number"
              value={consolidated?.grossMarginPercent || ''}
              onChange={(e) => onConsolidatedChange('grossMarginPercent', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter gross margin percentage"
              step="0.1"
              min="0"
              max="100"
            />
            <p className="text-xs text-gray-500 mt-1">COGS = Revenue × (1 - Gross Margin %)</p>
          </div>
        </div>
      )}

      {/* Revenue Margin Configuration (COGS-specific) */}
      {consolidated?.inputMethod === 'revenueMargin' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Percentage Method</label>
              <select
                value={consolidated?.percentMethod || 'uniform'}
                onChange={(e) => onConsolidatedChange('percentMethod', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="uniform">Uniform Percentage</option>
                <option value="individual">Individual Year Percentages</option>
              </select>
            </div>

            {consolidated?.percentMethod === 'uniform' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">COGS as % of Revenue</label>
                <input
                  type="number"
                  value={consolidated?.revenueMarginPercent || ''}
                  onChange={(e) => onConsolidatedChange('revenueMarginPercent', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter COGS percentage"
                  step="0.1"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">COGS = Revenue × COGS %</p>
              </div>
            )}

            {consolidated?.percentMethod === 'individual' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Individual COGS Percentages of Revenue (%)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {periods.periodLabels.map((label: string, periodIndex: number) => (
                    <div key={periodIndex}>
                      <label className="block text-xs text-gray-500 mb-1">{label}</label>
                      <input
                        type="number"
                        value={consolidated?.individualPercents?.[periodIndex] || ''}
                        onChange={(e) => onIndividualPercentChange(periodIndex, Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">COGS for each year = Revenue × Individual COGS %</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Direct Input Configuration */}
      {consolidated?.inputMethod === 'direct' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Direct Values by Year ($M)</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {periods.periodLabels.map((label: string, periodIndex: number) => (
                <div key={periodIndex}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input
                    type="number"
                    value={consolidated?.yearlyValues?.[periodIndex] || ''}
                    onChange={(e) => onYearlyValueChange(periodIndex, Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    step="0.1"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Segments Inputs Component
interface SegmentsInputsProps {
  data: any;
  segmentConfig: SegmentConfig;
  onAddSegment: () => void;
  onRemoveSegment: (segmentId: string) => void;
  onToggleExpansion: (segmentId: string) => void;
  onAddRowToSegment: (segmentId: string) => void;
  onRemoveRowFromSegment: (segmentId: string, rowId: string) => void;
  onUpdateSegment?: (segmentId: string, updates: any) => void;
  onUpdateSegmentRow?: (segmentId: string, rowId: string, updates: any) => void;
  expandedSegments: Set<string>;
  periods: any;
  sectionKey: string;
}

const SegmentsInputs: React.FC<SegmentsInputsProps> = ({
  data,
  segmentConfig,
  onAddSegment,
  onRemoveSegment,
  onToggleExpansion,
  onAddRowToSegment,
  onRemoveRowFromSegment,
  onUpdateSegment,
  onUpdateSegmentRow,
  expandedSegments,
  periods,
  sectionKey,
}) => {
  const segments = data.segments || [];

  return (
    <div className="space-y-4">
      {/* Add Segment Button */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <button
          onClick={onAddSegment}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add {segmentConfig.segmentTypeName}
        </button>
      </div>

      {/* Segments List */}
      {segments.map((segment: any) => (
        <SegmentInput
          key={segment.id}
          segment={segment}
          segmentConfig={segmentConfig}
          isExpanded={expandedSegments.has(segment.id)}
          onToggleExpansion={() => onToggleExpansion(segment.id)}
          onRemoveSegment={() => onRemoveSegment(segment.id)}
          onAddRowToSegment={() => onAddRowToSegment(segment.id)}
          onRemoveRowFromSegment={(rowId: string) => onRemoveRowFromSegment(segment.id, rowId)}
          onUpdateSegment={onUpdateSegment ? (updates: any) => onUpdateSegment(segment.id, updates) : undefined}
          onUpdateSegmentRow={
            onUpdateSegmentRow
              ? (rowId: string, updates: any) => onUpdateSegmentRow(segment.id, rowId, updates)
              : undefined
          }
          periods={periods}
        />
      ))}
    </div>
  );
};

// Individual Segment Input Component
interface SegmentInputProps {
  segment: any;
  segmentConfig: SegmentConfig;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onRemoveSegment: () => void;
  onAddRowToSegment: () => void;
  onRemoveRowFromSegment: (rowId: string) => void;
  onUpdateSegment?: (updates: any) => void;
  onUpdateSegmentRow?: (rowId: string, updates: any) => void;
  periods: any;
}

const SegmentInput: React.FC<SegmentInputProps> = ({
  segment,
  segmentConfig,
  isExpanded,
  onToggleExpansion,
  onRemoveSegment,
  onAddRowToSegment,
  onRemoveRowFromSegment,
  onUpdateSegment,
  onUpdateSegmentRow,
  periods,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Segment Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onToggleExpansion} className="p-1 hover:bg-gray-200 rounded transition-colors">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )}
            </button>
            <input
              type="text"
              value={segment.name}
              onChange={(e) => onUpdateSegment?.({ name: e.target.value })}
              className="text-sm font-medium bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder={`Enter ${segmentConfig.segmentTypeName.toLowerCase()} name`}
            />
          </div>
          <button
            onClick={onRemoveSegment}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            title={`Remove ${segmentConfig.segmentTypeName.toLowerCase()}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Segment Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Segment Type Toggle */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">{segmentConfig.segmentTypeName} Type</label>
            <div className="flex bg-gray-100 rounded-md p-1">
              <button
                onClick={() => onUpdateSegment?.({ segmentType: 'consolidated' })}
                className={`flex-1 px-3 py-1 text-xs font-medium rounded transition-colors ${
                  segment.segmentType === 'consolidated'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Single Row
              </button>
              {segmentConfig.allowFactorMultiplication && (
                <button
                  onClick={() => onUpdateSegment?.({ segmentType: 'multiplication' })}
                  className={`flex-1 px-3 py-1 text-xs font-medium rounded transition-colors ${
                    segment.segmentType === 'multiplication'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Factor Multiplication
                </button>
              )}
            </div>
          </div>

          {/* Segment Rows */}
          {segment.segmentType === 'consolidated' && segment.consolidatedRow && (
            <SegmentRowInput
              row={segment.consolidatedRow}
              onUpdateRow={
                onUpdateSegmentRow
                  ? (updates: any) => onUpdateSegmentRow(segment.consolidatedRow.id, updates)
                  : () => {}
              }
              periods={periods}
              allowPercentageOfRevenue={segmentConfig.allowPercentageOfRevenue}
              showRemoveButton={false}
            />
          )}

          {segment.segmentType === 'multiplication' && (
            <div className="space-y-3">
              {segment.rows?.map((row: any) => (
                <SegmentRowInput
                  key={row.id}
                  row={row}
                  onUpdateRow={onUpdateSegmentRow ? (updates: any) => onUpdateSegmentRow(row.id, updates) : () => {}}
                  onRemoveRow={() => onRemoveRowFromSegment(row.id)}
                  periods={periods}
                  allowPercentageOfRevenue={false}
                  showRemoveButton={true}
                />
              ))}
              <button
                onClick={onAddRowToSegment}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Factor Row
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Individual Segment Row Input Component
interface SegmentRowInputProps {
  row: any;
  onUpdateRow: (updates: any) => void;
  onRemoveRow?: () => void;
  periods: any;
  allowPercentageOfRevenue?: boolean;
  showRemoveButton?: boolean;
}

const SegmentRowInput: React.FC<SegmentRowInputProps> = ({
  row,
  onUpdateRow,
  onRemoveRow,
  periods,
  allowPercentageOfRevenue = false,
  showRemoveButton = false,
}) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Row Name</label>
          <input
            type="text"
            value={row.name}
            onChange={(e) => onUpdateRow({ name: e.target.value })}
            className="text-sm font-medium bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="Enter row name"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Input Method Toggle */}
          <div className="flex bg-gray-100 rounded p-1">
            <button
              onClick={() => onUpdateRow({ inputMethod: 'growth' })}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                row.inputMethod === 'growth' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Growth
            </button>
            <button
              onClick={() => onUpdateRow({ inputMethod: 'direct' })}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                row.inputMethod === 'direct' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Direct
            </button>
            {allowPercentageOfRevenue && (
              <button
                onClick={() => onUpdateRow({ inputMethod: 'percentOfRevenue' })}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  row.inputMethod === 'percentOfRevenue'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                % Revenue
              </button>
            )}
          </div>
          {showRemoveButton && onRemoveRow && (
            <button
              onClick={onRemoveRow}
              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              title="Remove row"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Row Input Configuration */}
      {row.inputMethod === 'growth' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Base Value ({periods.startYear})</label>
              <input
                type="number"
                value={row.baseValue || ''}
                onChange={(e) => onUpdateRow({ baseValue: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter base value"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Growth Method</label>
              <select
                value={row.growthMethod || 'uniform'}
                onChange={(e) => onUpdateRow({ growthMethod: e.target.value as 'uniform' | 'individual' })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="uniform">Uniform Growth Rate</option>
                <option value="individual">Individual Year Growth</option>
              </select>
            </div>
          </div>

          {row.growthMethod === 'uniform' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Growth Rate (%)</label>
              <input
                type="number"
                value={row.growthRate || ''}
                onChange={(e) => onUpdateRow({ growthRate: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter growth rate"
                step="0.1"
              />
            </div>
          )}

          {row.growthMethod === 'individual' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Individual Growth Rates (%)</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {periods.periodLabels.map((label: string, periodIndex: number) => (
                  <div key={periodIndex}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    {periodIndex === 0 ? (
                      <div className="px-2 py-1 text-sm bg-gray-100 border border-gray-300 rounded text-gray-500 text-center">
                        Base
                      </div>
                    ) : (
                      <input
                        type="number"
                        value={row.individualGrowthRates?.[periodIndex] || ''}
                        onChange={(e) => {
                          const currentRates = row.individualGrowthRates || {};
                          const newRates = { ...currentRates };
                          const value = Number(e.target.value);
                          if (value === 0) {
                            delete newRates[periodIndex];
                          } else {
                            newRates[periodIndex] = value;
                          }
                          onUpdateRow({ individualGrowthRates: newRates });
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
      )}

      {row.inputMethod === 'direct' && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Direct Values by Year</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {periods.periodLabels.map((label: string, periodIndex: number) => (
              <div key={periodIndex}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input
                  type="number"
                  value={row.yearlyValues?.[periodIndex] || ''}
                  onChange={(e) => {
                    const currentValues = row.yearlyValues || [];
                    const newValues = [...currentValues];
                    while (newValues.length <= periodIndex) {
                      newValues.push(0);
                    }
                    newValues[periodIndex] = Number(e.target.value);
                    onUpdateRow({ yearlyValues: newValues });
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  step="0.1"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Percentage of Revenue Configuration */}
      {row.inputMethod === 'percentOfRevenue' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Percentage Method</label>
            <select
              value={row.percentMethod || 'uniform'}
              onChange={(e) => onUpdateRow({ percentMethod: e.target.value as 'uniform' | 'individual' })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="uniform">Uniform Percentage</option>
              <option value="individual">Individual Year Percentages</option>
            </select>
          </div>

          {row.percentMethod === 'uniform' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">% of Revenue</label>
              <input
                type="number"
                value={row.percentOfRevenue || ''}
                onChange={(e) => onUpdateRow({ percentOfRevenue: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter percentage"
                step="0.1"
                min="0"
                max="100"
              />
            </div>
          )}

          {row.percentMethod === 'individual' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Individual Percentages (%)</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {periods.periodLabels.map((label: string, periodIndex: number) => (
                  <div key={periodIndex}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    <input
                      type="number"
                      value={row.individualPercents?.[periodIndex] || ''}
                      onChange={(e) => {
                        const currentPercents = row.individualPercents || {};
                        const newPercents = { ...currentPercents };
                        const value = Number(e.target.value);
                        if (value === 0) {
                          delete newPercents[periodIndex];
                        } else {
                          newPercents[periodIndex] = value;
                        }
                        onUpdateRow({ individualPercents: newPercents });
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
      )}
    </div>
  );
};
