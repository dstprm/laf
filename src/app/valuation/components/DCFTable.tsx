'use client';

import React, { useEffect, useState } from 'react';
import { useModelStore } from '../store/modelStore';
import { TableRowData, SegmentRow, COGSSegment } from '../types/financial';
import { ChevronDownIcon, ChevronRightIcon, CalculatorIcon, TrashIcon, Cog } from 'lucide-react';

import { RevenueInput } from './RevenueInput';
import { COGSInput } from './COGSInput';
import { OpExInput } from './OpExInput';
import { OtherIncomeInput } from './OtherIncomeInput';
import { OtherExpensesInput } from './OtherExpensesInput';
import { DAInput } from './DAInput';
import { TaxInput } from './TaxInput';
import { CAPEXInput } from './CAPEXInput';
import { NWCInput } from './NWCInput';
import { TerminalValueInput } from './TerminalValueInput';
import { EquityValueInput } from './EquityValueInput';
import { EditableCell } from './EditableCell';
// import { ExcelEmailDialog } from './ExcelEmailDialog';

import { IndustrySuggestionsPanel } from './IndustrySuggestionsPanel';
import { hasSuggestionsForSection, IndustrySuggestions } from '../utils/industryHelper';

export const DCFTable: React.FC = () => {
  const {
    model,
    selectedIndustry,
    getTableData,
    calculateFinancials,
    updateCellValue,
    clearCellOverride,
    segmentsVisible,
    cogsSegmentsVisible,
    opexSegmentsVisible,
    otherIncomeSegmentsVisible,
    otherExpensesSegmentsVisible,
    toggleSegmentsVisibility,
    toggleCOGSSegmentsVisibility,
    toggleOpExSegmentsVisibility,
    toggleOtherIncomeSegmentsVisibility,
    toggleOtherExpensesSegmentsVisibility,
    expandedSegmentFactors,
    toggleSegmentFactors,
  } = useModelStore();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(['periods']));
  const [suggestionsPanelOpen, setSuggestionsPanelOpen] = useState<{
    isOpen: boolean;
    sectionType: keyof IndustrySuggestions | null;
  }>({ isOpen: false, sectionType: null });
  const [displayYears, setDisplayYears] = useState(model.periods.numberOfYears.toString());

  useEffect(() => {
    // Sync local state if the global state changes from elsewhere
    setDisplayYears(model.periods.numberOfYears.toString());
  }, [model.periods.numberOfYears]);

  const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Update local state to allow smooth typing
    setDisplayYears(value);

    // Update global state only if the value is a valid number within the 1-100 range
    const years = parseInt(value, 10);
    if (!isNaN(years) && years >= 1 && years <= 100) {
      useModelStore.getState().updatePeriods({ numberOfYears: years });
      setTimeout(() => calculateFinancials(), 100);
    }
  };

  const handleYearsBlur = () => {
    // When the user leaves the input, if it's empty or invalid,
    // reset it to the last valid value from the global store.
    const years = parseInt(displayYears, 10);
    if (isNaN(years) || years < 1 || years > 100) {
      setDisplayYears(model.periods.numberOfYears.toString());
    }
  };

  useEffect(() => {
    calculateFinancials();
  }, [model, calculateFinancials]);

  const tableData = getTableData();

  const formatValue = (value: number | string, format: 'currency' | 'percentage' | 'number'): string => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'currency':
        return value === 0 ? '-' : value.toFixed(1);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return value.toFixed(1);
      default:
        return value.toString();
    }
  };

  const toggleRowExpansion = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const isRowConfigurable = (row: TableRowData): boolean => {
    // Main revenue row is configurable
    if (row.id === 'revenue') return true;

    // Individual revenue segments are configurable
    if (row.id.startsWith('segment_')) return true;

    // Individual COGS segments are configurable
    if (row.id.startsWith('cogs_segment_')) return true;

    // Individual Other Income segments are configurable
    if (row.id.startsWith('otherIncome_segment_')) return true;

    // Individual Other Expenses segments are configurable
    if (row.id.startsWith('otherExpenses_segment_')) return true;

    // Other configurable rows
    if (
      [
        'cogs',
        'opex',
        'otherIncome',
        'otherExpenses',
        'da',
        'taxes',
        'capex',
        'netWorkingCapital',
        'terminalValue',
        'equityValue',
      ].includes(row.id)
    )
      return true;

    return false;
  };

  const renderConfigurationPanel = (row: TableRowData) => {
    if (row.id === 'revenue') {
      return <RevenueInput />;
    } else if (row.id.startsWith('segment_') && row.segmentId) {
      return <SegmentConfigPanel segmentId={row.segmentId} />;
    } else if (row.id.startsWith('cogs_segment_') && row.segmentId) {
      return <COGSSegmentConfigPanel segmentId={row.segmentId} />;
    } else if (row.id === 'cogs') {
      return <COGSInput />;
    } else if (row.id === 'opex') {
      return <OpExInput />;
    } else if (row.id === 'otherIncome') {
      return <OtherIncomeInput />;
    } else if (row.id === 'otherExpenses') {
      return <OtherExpensesInput />;
    } else if (row.id === 'da') {
      return <DAInput />;
    } else if (row.id === 'taxes') {
      return <TaxInput />;
    } else if (row.id === 'capex') {
      return <CAPEXInput />;
    } else if (row.id === 'netWorkingCapital') {
      return <NWCInput />;
    } else if (row.id === 'terminalValue') {
      return <TerminalValueInput />;
    } else if (row.id === 'equityValue') {
      return <EquityValueInput />;
    }

    return <div className="p-4 text-sm text-gray-500">Configuration panel for {row.label} coming soon...</div>;
  };

  const getRowStyle = (row: TableRowData): string => {
    // Consolidating rows (EBITDA, EBIT, Net Income, etc.) - Bold and prominent
    if (
      [
        'ebitda',
        'ebit',
        'netIncome',
        'grossProfit',
        'freeCashFlow',
        'discountedCashFlows',
        'enterpriseValue',
        'equityValue',
      ].includes(row.id)
    ) {
      return 'bg-gray-100 text-gray-900 text-sm font-bold leading-tight border-t-2 border-gray-300';
    }

    // Unify styling for all factor rows
    if (row.id.includes('_factor_') || row.id.startsWith('factor_')) {
      return 'bg-green-50 text-green-800 text-xs leading-tight'; // Style factor rows with deeper indent and tight spacing
    }

    // Unify styling for all segment rows
    if (row.id.includes('_segment_')) {
      return 'bg-blue-50 text-blue-900 text-xs leading-tight'; // Indent and style segment rows with compact text
    }

    if (row.id.includes('Growth') || row.id.includes('Margin')) {
      return 'bg-gray-50 text-gray-700 text-xs italic leading-tight'; // Style secondary metrics with compact text
    }
    return 'bg-white text-gray-900 leading-tight';
  };

  const handleCellSave = (rowId: string, periodIndex: number, value: number) => {
    updateCellValue(rowId, periodIndex, value);
    setTimeout(() => calculateFinancials(), 100);
  };

  const handleCellClear = (rowId: string, periodIndex: number) => {
    clearCellOverride(rowId, periodIndex);
    setTimeout(() => calculateFinancials(), 100);
  };

  const openSuggestionsPanel = (sectionType: keyof IndustrySuggestions) => {
    setSuggestionsPanelOpen({ isOpen: true, sectionType });
  };

  const closeSuggestionsPanel = () => {
    setSuggestionsPanelOpen({ isOpen: false, sectionType: null });
  };

  const getSuggestionIndicator = (sectionType: keyof IndustrySuggestions) => {
    if (!selectedIndustry || !hasSuggestionsForSection(selectedIndustry, sectionType)) {
      return null;
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          openSuggestionsPanel(sectionType);
        }}
        className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-md hover:bg-yellow-200 transition-colors flex items-center gap-1 flex-shrink-0"
        title={`View ${sectionType} suggestions for ${selectedIndustry}`}
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M9.664 1.319a.75.75 0 01.672 0 11.947 11.947 0 006.912 2.423 2.25 2.25 0 011.772 2.197v4.897c0 1.73-.47 3.429-1.409 4.9a8.487 8.487 0 01-3.296 2.919 2.25 2.25 0 01-2.414 0 8.487 8.487 0 01-3.296-2.92C2.467 14.293 2 12.594 2 10.864V5.967a2.25 2.25 0 011.772-2.197 11.947 11.947 0 006.912-2.423zM10 9a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0v-2.5A.75.75 0 0110 9zm0-5a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 0110 4z"
            clipRule="evenodd"
          />
        </svg>
        Suggestions
      </button>
    );
  };

  const handleChevronClick = (e: React.MouseEvent, row: TableRowData) => {
    e.stopPropagation();

    // Handle revenue segments visibility
    if (row.id === 'revenue' && model.revenue.inputType === 'segments') {
      toggleSegmentsVisibility();
      return;
    }

    // Handle COGS segments visibility
    if (row.id === 'cogs' && model.cogs.inputType === 'segments') {
      toggleCOGSSegmentsVisibility();
      return;
    }

    // Handle COGS segment factor expansion
    if (row.id.startsWith('cogs_segment_') && row.segmentId) {
      toggleSegmentFactors(row.segmentId);
      return;
    }

    // Handle OpEx segments visibility
    if (row.id === 'opex' && model.opex.inputType === 'segments') {
      toggleOpExSegmentsVisibility();
      return;
    }

    // Handle Other Income segments visibility
    if (row.id === 'otherIncome' && model.otherIncome.inputType === 'segments') {
      toggleOtherIncomeSegmentsVisibility();
      return;
    }

    // Handle Other Expenses segments visibility
    if (row.id === 'otherExpenses' && model.otherExpenses.inputType === 'segments') {
      toggleOtherExpensesSegmentsVisibility();
      return;
    }

    // Handle segment factor visibility
    if (row.id.startsWith('segment_') && row.segmentId) {
      const segment = model.revenue.segments?.find((s) => s.id === row.segmentId);
      if (segment?.segmentType === 'multiplication' && segment.rows && segment.rows.length > 0) {
        toggleSegmentFactors(row.segmentId);
        return;
      }
    }

    // Handle OpEx segment factor visibility
    if (row.id.startsWith('opex_segment_') && row.segmentId) {
      const opexSegment = model.opex.segments?.find((s) => s.id === row.segmentId);
      if (opexSegment?.segmentType === 'multiplication' && opexSegment.rows && opexSegment.rows.length > 0) {
        toggleSegmentFactors(row.segmentId);
        return;
      }
    }

    // Handle Other Income segment factor visibility
    if (row.id.startsWith('otherIncome_segment_') && row.segmentId) {
      const otherIncomeSegment = model.otherIncome.segments?.find((s) => s.id === row.segmentId);
      if (
        otherIncomeSegment?.segmentType === 'multiplication' &&
        otherIncomeSegment.rows &&
        otherIncomeSegment.rows.length > 0
      ) {
        toggleSegmentFactors(row.segmentId);
        return;
      }
    }

    // Handle Other Expenses segment factor visibility
    if (row.id.startsWith('otherExpenses_segment_') && row.segmentId) {
      const otherExpensesSegment = model.otherExpenses.segments?.find((s) => s.id === row.segmentId);
      if (
        otherExpensesSegment?.segmentType === 'multiplication' &&
        otherExpensesSegment.rows &&
        otherExpensesSegment.rows.length > 0
      ) {
        toggleSegmentFactors(row.segmentId);
        return;
      }
    }

    // Handle regular row expansion for configuration
    if (isRowConfigurable(row)) {
      toggleRowExpansion(row.id);
    }
  };

  const shouldShowChevron = (row: TableRowData): boolean => {
    // Show chevron for revenue when using segments and has actual segments
    if (row.id === 'revenue' && model.revenue.inputType === 'segments') {
      return !!(model.revenue.segments && model.revenue.segments.length > 0);
    }

    // Show chevron for COGS when using segments and has actual segments
    if (row.id === 'cogs' && model.cogs.inputType === 'segments') {
      return !!(model.cogs.segments && model.cogs.segments.length > 0);
    }

    // Show chevron for OpEx when using segments and has actual segments
    if (row.id === 'opex' && model.opex.inputType === 'segments') {
      return !!(model.opex.segments && model.opex.segments.length > 0);
    }

    // Show chevron for Other Income when using segments and has actual segments
    if (row.id === 'otherIncome' && model.otherIncome.inputType === 'segments') {
      return !!(model.otherIncome.segments && model.otherIncome.segments.length > 0);
    }

    // Show chevron for Other Expenses when using segments and has actual segments
    if (row.id === 'otherExpenses' && model.otherExpenses.inputType === 'segments') {
      return !!(model.otherExpenses.segments && model.otherExpenses.segments.length > 0);
    }

    // Show chevron for multiplication segments with factors
    if (row.id.startsWith('segment_') && row.segmentId) {
      const segment = model.revenue.segments?.find((s) => s.id === row.segmentId);
      if (segment?.segmentType === 'multiplication' && segment.rows && segment.rows.length > 0) {
        return true;
      }
    }

    // Show chevron for OpEx multiplication segments with factors
    if (row.id.startsWith('opex_segment_') && row.segmentId) {
      const opexSegment = model.opex.segments?.find((s) => s.id === row.segmentId);
      if (opexSegment?.segmentType === 'multiplication' && opexSegment.rows && opexSegment.rows.length > 0) {
        return true;
      }
    }

    // Show chevron for Other Income multiplication segments with factors
    if (row.id.startsWith('otherIncome_segment_') && row.segmentId) {
      const otherIncomeSegment = model.otherIncome.segments?.find((s) => s.id === row.segmentId);
      if (
        otherIncomeSegment?.segmentType === 'multiplication' &&
        otherIncomeSegment.rows &&
        otherIncomeSegment.rows.length > 0
      ) {
        return true;
      }
    }

    // Show chevron for Other Expenses multiplication segments with factors
    if (row.id.startsWith('otherExpenses_segment_') && row.segmentId) {
      const otherExpensesSegment = model.otherExpenses.segments?.find((s) => s.id === row.segmentId);
      if (
        otherExpensesSegment?.segmentType === 'multiplication' &&
        otherExpensesSegment.rows &&
        otherExpensesSegment.rows.length > 0
      ) {
        return true;
      }
    }

    // Only show chevron for configurable rows that don't fall into the above categories if they're periods
    if (row.id === 'periods') {
      return true;
    }

    // Show chevron for revenue segments that have factors to expand/collapse
    if (row.id.startsWith('segment_') && row.segmentId) {
      const segment = model.revenue.segments?.find((s) => s.id === row.segmentId);
      return !!(segment?.segmentType === 'multiplication' && segment.rows && segment.rows.length > 0);
    }

    // Show chevron for COGS segments that have factors
    if (row.id.startsWith('cogs_segment_') && row.segmentId) {
      const cogsSegment = model.cogs.segments?.find((s) => s.id === row.segmentId);
      return !!(cogsSegment?.segmentType === 'multiplication' && cogsSegment.rows && cogsSegment.rows.length > 0);
    }

    // Show chevron for OpEx segments that have factors
    if (row.id.startsWith('opex_segment_') && row.segmentId) {
      const opexSegment = model.opex.segments?.find((s) => s.id === row.segmentId);
      return !!(opexSegment?.segmentType === 'multiplication' && opexSegment.rows && opexSegment.rows.length > 0);
    }

    return false;
  };

  const getChevronState = (row: TableRowData): boolean => {
    // Check revenue segments visibility
    if (row.id === 'revenue' && model.revenue.inputType === 'segments') {
      return segmentsVisible;
    }

    // Check COGS segments visibility
    if (row.id === 'cogs' && model.cogs.inputType === 'segments') {
      return cogsSegmentsVisible;
    }

    // Check OpEx segments visibility
    if (row.id === 'opex' && model.opex.inputType === 'segments') {
      return opexSegmentsVisible;
    }

    // Check Other Income segments visibility
    if (row.id === 'otherIncome' && model.otherIncome.inputType === 'segments') {
      return otherIncomeSegmentsVisible;
    }

    // Check Other Expenses segments visibility
    if (row.id === 'otherExpenses' && model.otherExpenses.inputType === 'segments') {
      return otherExpensesSegmentsVisible;
    }

    // Check segment factors visibility
    if (row.id.startsWith('segment_') && row.segmentId) {
      const segment = model.revenue.segments?.find((s) => s.id === row.segmentId);
      if (segment?.segmentType === 'multiplication' && segment.rows && segment.rows.length > 0) {
        return expandedSegmentFactors.has(row.segmentId);
      }
    }

    // Check COGS segment factors visibility
    if (row.id.startsWith('cogs_segment_') && row.segmentId) {
      const cogsSegment = model.cogs.segments?.find((s) => s.id === row.segmentId);
      if (cogsSegment?.segmentType === 'multiplication' && cogsSegment.rows && cogsSegment.rows.length > 0) {
        return expandedSegmentFactors.has(row.segmentId);
      }
    }

    // Check OpEx segment factors visibility
    if (row.id.startsWith('opex_segment_') && row.segmentId) {
      const opexSegment = model.opex.segments?.find((s) => s.id === row.segmentId);
      if (opexSegment?.segmentType === 'multiplication' && opexSegment.rows && opexSegment.rows.length > 0) {
        return expandedSegmentFactors.has(row.segmentId);
      }
    }

    // Check Other Income segment factors visibility
    if (row.id.startsWith('otherIncome_segment_') && row.segmentId) {
      const otherIncomeSegment = model.otherIncome.segments?.find((s) => s.id === row.segmentId);
      if (
        otherIncomeSegment?.segmentType === 'multiplication' &&
        otherIncomeSegment.rows &&
        otherIncomeSegment.rows.length > 0
      ) {
        return expandedSegmentFactors.has(row.segmentId);
      }
    }

    // Check Other Expenses segment factors visibility
    if (row.id.startsWith('otherExpenses_segment_') && row.segmentId) {
      const otherExpensesSegment = model.otherExpenses.segments?.find((s) => s.id === row.segmentId);
      if (
        otherExpensesSegment?.segmentType === 'multiplication' &&
        otherExpensesSegment.rows &&
        otherExpensesSegment.rows.length > 0
      ) {
        return expandedSegmentFactors.has(row.segmentId);
      }
    }

    // Check regular row expansion
    return expandedRows.has(row.id);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden min-w-0">
      {/* Table Header - More Compact */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-semibold text-gray-900">DCF Financial Model</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <CalculatorIcon className="w-3 h-3" />
            <span>Click rows to configure • Double-click cells to edit</span>
          </div>
        </div>
      </div>

      {/* Periods Configuration Row - More Compact */}
      <div className="border-b border-gray-200">
        <div className="cursor-pointer hover:bg-gray-50" onClick={() => toggleRowExpansion('periods')}>
          <div className="px-3 py-2 font-medium text-sm text-gray-900 bg-gray-100 border-r border-gray-200 flex items-center gap-2">
            {expandedRows.has('periods') ? (
              <ChevronDownIcon className="w-3 h-3 text-gray-500" />
            ) : (
              <ChevronRightIcon className="w-3 h-3 text-gray-500" />
            )}
            Financial Projections
          </div>
        </div>

        {expandedRows.has('periods') && (
          <div className="border-t border-gray-200 bg-gray-50 p-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Year</label>
                <input
                  type="number"
                  value={model.periods.startYear}
                  onChange={(e) => {
                    const store = useModelStore.getState();
                    store.updatePeriods({ startYear: parseInt(e.target.value) });
                    setTimeout(() => calculateFinancials(), 100);
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Number of Years</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={displayYears}
                  onChange={handleYearsChange}
                  onBlur={handleYearsBlur}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter number of years"
                />
                <p className="text-xs text-gray-500 mt-1">Enter 1-100 years</p>
              </div>

              <div className="flex items-end">
                <div className="text-xs text-gray-500">
                  Projecting {model.periods.numberOfYears} years from {model.periods.startYear}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table - More Compact */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="w-full table-fixed min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-56 min-w-56">
                Line Item
              </th>
              {model.periods.periodLabels.map((period, index) => (
                <th
                  key={index}
                  className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32"
                >
                  {period}
                </th>
              ))}
              <th className="px-3 py-2 w-6"></th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {tableData.map((row) => (
              <React.Fragment key={row.id}>
                {/* Main Row - More Compact */}
                <tr
                  className={`${getRowStyle(row)} ${
                    isRowConfigurable(row) ? 'cursor-pointer table-row-hover' : ''
                  } ${expandedRows.has(row.id) ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                  onClick={() => isRowConfigurable(row) && toggleRowExpansion(row.id)}
                >
                  <td className="px-4 py-2 whitespace-nowrap w-56 min-w-56">
                    <div className="flex items-center justify-between min-w-0">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {shouldShowChevron(row) && (
                          <button
                            onClick={(e) => handleChevronClick(e, row)}
                            className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                          >
                            {getChevronState(row) ? (
                              <ChevronDownIcon className="w-3 h-3 text-gray-500" />
                            ) : (
                              <ChevronRightIcon className="w-3 h-3 text-gray-500" />
                            )}
                          </button>
                        )}
                        {!shouldShowChevron(row) && isRowConfigurable(row) && (
                          <div className="w-3 h-3 flex items-center justify-center" title="Click to configure">
                            <Cog className="w-3 h-3 text-blue-500 opacity-60" />
                          </div>
                        )}
                        {!shouldShowChevron(row) && !isRowConfigurable(row) && row.id === 'revenueGrowth' && (
                          <div className="w-3 h-3 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                          </div>
                        )}
                        <span
                          className={`${
                            ['ebitda', 'ebit', 'netIncome', 'grossProfit', 'freeCashFlow'].includes(row.id)
                              ? 'text-sm font-bold text-gray-900'
                              : row.id === 'revenueGrowth'
                                ? 'text-xs text-gray-600 italic'
                                : isRowConfigurable(row)
                                  ? 'text-xs text-gray-900 font-medium'
                                  : 'text-xs text-gray-900'
                          } truncate flex-shrink-0`}
                        >
                          {row.label}
                        </span>
                        {/* Suggestion indicators for main sections */}
                        {row.id === 'revenue' && getSuggestionIndicator('revenue')}
                        {row.id === 'cogs' && getSuggestionIndicator('cogs')}
                        {row.id === 'opex' && getSuggestionIndicator('opex')}
                        {row.id === 'otherIncome' && getSuggestionIndicator('otherIncome')}
                        {row.id === 'otherExpenses' && getSuggestionIndicator('otherExpenses')}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {row.id === 'revenueGrowth' && (
                          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">YoY Growth</span>
                        )}
                      </div>
                    </div>
                  </td>
                  {row.values.map((value, index) => (
                    <td
                      key={index}
                      className="px-2 py-1 whitespace-nowrap text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.isEditable && !row.id.startsWith('segment_') ? (
                        <EditableCell
                          value={value as number}
                          format={row.format}
                          isEditable={row.isEditable}
                          isOverridden={row.manualOverrides?.[index] !== undefined}
                          onSave={(newValue) => handleCellSave(row.id, index, newValue)}
                          onClear={() => handleCellClear(row.id, index)}
                          rowId={row.id}
                          cellIndex={index}
                        />
                      ) : (
                        <div
                          className={`px-2 py-1 text-center ${
                            [
                              'ebitda',
                              'ebit',
                              'netIncome',
                              'grossProfit',
                              'freeCashFlow',
                              'discountedCashFlows',
                              'enterpriseValue',
                              'equityValue',
                            ].includes(row.id)
                              ? 'text-sm font-bold text-gray-900'
                              : 'text-xs'
                          }`}
                        >
                          {formatValue(value, row.format)}
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2 whitespace-nowrap text-right">{/* Empty cell for spacing */}</td>
                </tr>

                {/* Expanded Configuration Row - More Compact */}
                {expandedRows.has(row.id) && isRowConfigurable(row) && (
                  <tr>
                    <td colSpan={model.periods.periodLabels.length + 2} className="px-0 py-0">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-200 shadow-inner animate-slideDown">
                        <div className="px-4 py-3">
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{row.label.charAt(0)}</span>
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-gray-900">Configure {row.label}</h3>
                                <p className="text-xs text-gray-600">
                                  Set assumptions and input methods for {row.label.toLowerCase()} calculations
                                </p>
                              </div>
                            </div>
                            <div className="bg-blue-100 border border-blue-200 rounded-lg p-2">
                              <p className="text-xs text-blue-800">
                                💡 <strong>Tip:</strong> You can also double-click individual cells in the table above
                                to manually override specific values.
                              </p>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
                            {renderConfigurationPanel(row)}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer - More Compact */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            Projection Period: {model.periods.startYear} - {model.periods.startYear + model.periods.numberOfYears - 1}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
              Manual Override
            </span>
            <span>{tableData.length} line items</span>
          </div>
        </div>

        {/* Get Excel Button */}
        {/* <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-center">
            <ExcelEmailDialog>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Get Excel
              </button>
            </ExcelEmailDialog>
          </div>
        </div> */}
      </div>

      {/* Industry Suggestions Panel */}
      {selectedIndustry && suggestionsPanelOpen.isOpen && suggestionsPanelOpen.sectionType && (
        <IndustrySuggestionsPanel
          industryName={selectedIndustry}
          sectionType={suggestionsPanelOpen.sectionType}
          isOpen={suggestionsPanelOpen.isOpen}
          onClose={closeSuggestionsPanel}
        />
      )}
    </div>
  );
};

// Component for individual segment configuration
const SegmentConfigPanel: React.FC<{ segmentId: string }> = ({ segmentId }) => {
  const { model, updateSegment, updateSegmentRow, calculateFinancials } = useModelStore();

  const segment = model.revenue.segments?.find((s) => s.id === segmentId);

  if (!segment) {
    return <div className="p-4 text-sm text-gray-500">Segment not found</div>;
  }

  const renderSegmentRowInputs = (row: SegmentRow) => {
    return (
      <div key={row.id} className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Row Name</label>
            <input
              type="text"
              value={row.name}
              onChange={(e) => {
                updateSegmentRow(segmentId, row.id, { name: e.target.value });
                setTimeout(() => calculateFinancials(), 100);
              }}
              className="text-sm font-medium bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
              placeholder="Enter row name (e.g., Price, Quantity, Users)"
            />
          </div>
          <div className="flex bg-gray-100 rounded p-1">
            <button
              onClick={() => {
                updateSegmentRow(segmentId, row.id, { inputMethod: 'growth' });
                setTimeout(() => calculateFinancials(), 100);
              }}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                row.inputMethod === 'growth' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Growth
            </button>
            <button
              onClick={() => {
                updateSegmentRow(segmentId, row.id, { inputMethod: 'direct' });
                setTimeout(() => calculateFinancials(), 100);
              }}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                row.inputMethod === 'direct' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Direct
            </button>
          </div>
        </div>

        {row.inputMethod === 'growth' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Base Value</label>
                <input
                  type="number"
                  value={row.baseValue || ''}
                  onChange={(e) => {
                    updateSegmentRow(segmentId, row.id, { baseValue: Number(e.target.value) });
                    setTimeout(() => calculateFinancials(), 100);
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0.0"
                  step="0.1"
                />
              </div>

              {row.growthMethod === 'uniform' && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Growth Rate (%)</label>
                  <input
                    type="number"
                    value={row.growthRate || ''}
                    onChange={(e) => {
                      updateSegmentRow(segmentId, row.id, { growthRate: Number(e.target.value) });
                      setTimeout(() => calculateFinancials(), 100);
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="0.0"
                    step="0.1"
                  />
                </div>
              )}
            </div>

            <div className="flex bg-gray-100 rounded p-1">
              <button
                onClick={() => {
                  updateSegmentRow(segmentId, row.id, { growthMethod: 'uniform' });
                  setTimeout(() => calculateFinancials(), 100);
                }}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                  row.growthMethod === 'uniform'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Uniform Growth
              </button>
              <button
                onClick={() => {
                  updateSegmentRow(segmentId, row.id, { growthMethod: 'individual' });
                  setTimeout(() => calculateFinancials(), 100);
                }}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                  row.growthMethod === 'individual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Individual Growth
              </button>
            </div>

            {row.growthMethod === 'individual' && (
              <div className="grid grid-cols-5 gap-2">
                {model.periods.periodLabels.map((period, index) => (
                  <div key={index}>
                    <label className="block text-xs text-gray-500 mb-1">{period}</label>
                    {index === 0 ? (
                      <div className="px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-center text-gray-500">
                        Base
                      </div>
                    ) : (
                      <input
                        type="number"
                        value={row.individualGrowthRates?.[index] || ''}
                        onChange={(e) => {
                          const newRates = { ...row.individualGrowthRates };
                          if (e.target.value) {
                            newRates[index] = Number(e.target.value);
                          } else {
                            delete newRates[index];
                          }
                          updateSegmentRow(segmentId, row.id, { individualGrowthRates: newRates });
                          setTimeout(() => calculateFinancials(), 100);
                        }}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                        placeholder="0.0"
                        step="0.1"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-xs text-gray-600 mb-2">Values by Period</label>
            <div className="grid grid-cols-5 gap-2">
              {model.periods.periodLabels.map((period, index) => (
                <div key={index}>
                  <label className="block text-xs text-gray-500 mb-1">{period}</label>
                  <input
                    type="number"
                    value={row.yearlyValues?.[index] || ''}
                    onChange={(e) => {
                      const newValues = [...(row.yearlyValues || [])];
                      while (newValues.length <= index) {
                        newValues.push(0);
                      }
                      newValues[index] = Number(e.target.value) || 0;
                      updateSegmentRow(segmentId, row.id, { yearlyValues: newValues });
                      setTimeout(() => calculateFinancials(), 100);
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                    placeholder="0.0"
                    step="0.1"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={segment.name}
            onChange={(e) => {
              updateSegment(segmentId, { name: e.target.value });
              setTimeout(() => calculateFinancials(), 100);
            }}
            className="font-medium text-gray-900 bg-transparent border-none outline-none text-lg"
            placeholder="Segment name"
          />
        </div>
        <div className="flex bg-gray-100 rounded p-1">
          <button
            onClick={() => {
              updateSegment(segmentId, {
                segmentType: 'consolidated',
                consolidatedRow: segment.consolidatedRow || {
                  id: `row_${Date.now()}`,
                  name: 'Revenue',
                  inputMethod: 'growth',
                  baseValue: 0,
                  growthMethod: 'uniform',
                  growthRate: 0,
                },
                rows: undefined,
              });
              setTimeout(() => calculateFinancials(), 100);
            }}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              segment.segmentType === 'consolidated'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Consolidated
          </button>
          <button
            onClick={() => {
              updateSegment(segmentId, {
                segmentType: 'multiplication',
                consolidatedRow: undefined,
                rows: segment.rows || [
                  {
                    id: `row_${Date.now()}_1`,
                    name: 'Factor 1',
                    inputMethod: 'growth',
                    baseValue: 0,
                    growthMethod: 'uniform',
                    growthRate: 0,
                  },
                  {
                    id: `row_${Date.now()}_2`,
                    name: 'Factor 2',
                    inputMethod: 'growth',
                    baseValue: 0,
                    growthMethod: 'uniform',
                    growthRate: 0,
                  },
                ],
              });
              setTimeout(() => calculateFinancials(), 100);
            }}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              segment.segmentType === 'multiplication'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Row Multiplication (PxQ)
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {segment.segmentType === 'consolidated' &&
          segment.consolidatedRow &&
          renderSegmentRowInputs(segment.consolidatedRow)}

        {segment.segmentType === 'multiplication' && segment.rows && (
          <>
            {segment.rows.map((row) => renderSegmentRowInputs(row))}
            <button
              onClick={() => {
                const currentRows = segment.rows || [];
                const newRow = {
                  id: `row_${Date.now()}`,
                  name: `Factor ${currentRows.length + 1}`,
                  inputMethod: 'growth' as const,
                  baseValue: 0,
                  growthMethod: 'uniform' as const,
                  growthRate: 0,
                };
                updateSegment(segmentId, { rows: [...currentRows, newRow] });
                setTimeout(() => calculateFinancials(), 100);
              }}
              className="w-full py-2 text-sm font-medium text-blue-600 border border-blue-200 border-dashed rounded-md hover:bg-blue-50"
            >
              + Add Row
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// COGS Segment Configuration Panel
const COGSSegmentConfigPanel: React.FC<{ segmentId: string }> = ({ segmentId }) => {
  const { model, updateCOGSSegment, calculateFinancials } = useModelStore();

  const segment = model.cogs.segments?.find((s) => s.id === segmentId);
  if (!segment) return null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={segment.name}
            onChange={(e) => {
              updateCOGSSegment(segmentId, { name: e.target.value });
              setTimeout(() => calculateFinancials(), 100);
            }}
            className="font-medium text-gray-900 bg-transparent border-none outline-none text-lg"
            placeholder="COGS segment name"
          />
        </div>

        {/* Input Method Selection */}
        <div className="flex bg-gray-100 rounded p-1">
          {model.cogs.useSameSegmentsAsRevenue && (
            <button
              onClick={() => {
                updateCOGSSegment(segmentId, { inputMethod: 'margin' });
                setTimeout(() => calculateFinancials(), 100);
              }}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                segment.inputMethod === 'margin'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Margin
            </button>
          )}
          <button
            onClick={() => {
              updateCOGSSegment(segmentId, { inputMethod: 'growth' });
              setTimeout(() => calculateFinancials(), 100);
            }}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              segment.inputMethod === 'growth'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Growth-based
          </button>
          <button
            onClick={() => {
              updateCOGSSegment(segmentId, { inputMethod: 'direct' });
              setTimeout(() => calculateFinancials(), 100);
            }}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              segment.inputMethod === 'direct'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Direct Values
          </button>
        </div>
      </div>

      {/* Margin Input */}
      {segment.inputMethod === 'margin' && (
        <div className="space-y-4">
          {/* Margin Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Margin Method</label>
            <div className="flex bg-gray-100 rounded p-1">
              <button
                onClick={() => {
                  updateCOGSSegment(segmentId, { marginMethod: 'uniform' });
                  setTimeout(() => calculateFinancials(), 100);
                }}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  (segment.marginMethod || 'uniform') === 'uniform'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Uniform Margin
              </button>
              <button
                onClick={() => {
                  updateCOGSSegment(segmentId, { marginMethod: 'individual' });
                  setTimeout(() => calculateFinancials(), 100);
                }}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  segment.marginMethod === 'individual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Individual Margins
              </button>
            </div>
          </div>

          {/* Uniform Margin Input */}
          {(segment.marginMethod || 'uniform') === 'uniform' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                COGS Margin (% of corresponding revenue segment)
              </label>
              <input
                type="number"
                value={segment.marginPercent || ''}
                onChange={(e) => {
                  updateCOGSSegment(segmentId, { marginPercent: Number(e.target.value) });
                  setTimeout(() => calculateFinancials(), 100);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter margin percentage"
                step="0.1"
                min="0"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">
                COGS for this segment = Revenue segment × {segment.marginPercent || 0}%
              </p>
            </div>
          )}

          {/* Individual Margins Input */}
          {segment.marginMethod === 'individual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Individual Margin Percentages by Year
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {model.periods.periodLabels.map((label, index) => (
                  <div key={index}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input
                      type="number"
                      value={segment.individualMarginPercents?.[index] || ''}
                      onChange={(e) => {
                        const newMargins = { ...segment.individualMarginPercents };
                        newMargins[index] = Number(e.target.value);
                        updateCOGSSegment(segmentId, { individualMarginPercents: newMargins });
                        setTimeout(() => calculateFinancials(), 100);
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="0.0"
                      step="0.1"
                      min="0"
                      max="100"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">COGS for each year = Revenue segment × Individual margin %</p>
            </div>
          )}
        </div>
      )}

      {/* Segment Type Selection for non-margin methods */}
      {segment.inputMethod !== 'margin' && (
        <div className="space-y-4">
          {/* Segment Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Segment Type</label>
            <div className="flex bg-gray-100 rounded p-1">
              <button
                onClick={() => {
                  updateCOGSSegment(segmentId, {
                    segmentType: 'consolidated',
                    consolidatedRow: segment.consolidatedRow || {
                      id: `row_${Date.now()}`,
                      name: 'COGS',
                      inputMethod: 'growth',
                      baseValue: 0,
                      growthMethod: 'uniform',
                      growthRate: 0,
                    },
                    rows: undefined,
                  });
                  setTimeout(() => calculateFinancials(), 100);
                }}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  segment.segmentType === 'consolidated'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Consolidated
              </button>
              <button
                onClick={() => {
                  updateCOGSSegment(segmentId, {
                    segmentType: 'multiplication',
                    consolidatedRow: undefined,
                    rows: segment.rows || [
                      {
                        id: `row_${Date.now()}_1`,
                        name: 'Factor 1',
                        inputMethod: 'growth',
                        baseValue: 0,
                        growthMethod: 'uniform',
                        growthRate: 0,
                      },
                      {
                        id: `row_${Date.now()}_2`,
                        name: 'Factor 2',
                        inputMethod: 'growth',
                        baseValue: 0,
                        growthMethod: 'uniform',
                        growthRate: 0,
                      },
                    ],
                  });
                  setTimeout(() => calculateFinancials(), 100);
                }}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  segment.segmentType === 'multiplication'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Row Multiplication (PxQ)
              </button>
            </div>
          </div>

          {/* Segment Configuration */}
          <div className="space-y-3">
            {segment.segmentType === 'consolidated' && segment.consolidatedRow && (
              <COGSSegmentRowConfig
                segment={segment}
                row={segment.consolidatedRow}
                onUpdateRow={(updates) => {
                  updateCOGSSegment(segmentId, {
                    consolidatedRow: { ...segment.consolidatedRow!, ...updates },
                  });
                  setTimeout(() => calculateFinancials(), 100);
                }}
              />
            )}

            {segment.segmentType === 'multiplication' && segment.rows && (
              <>
                {segment.rows.map((row) => (
                  <div key={row.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-sm text-gray-700">{row.name}</span>
                      {segment.rows && segment.rows.length > 1 && (
                        <button
                          onClick={() => {
                            const updatedRows = segment.rows!.filter((r) => r.id !== row.id);
                            updateCOGSSegment(segmentId, { rows: updatedRows });
                            setTimeout(() => calculateFinancials(), 100);
                          }}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <COGSSegmentRowConfig
                      segment={segment}
                      row={row}
                      onUpdateRow={(updates) => {
                        const updatedRows = segment.rows!.map((r) => (r.id === row.id ? { ...r, ...updates } : r));
                        updateCOGSSegment(segmentId, { rows: updatedRows });
                        setTimeout(() => calculateFinancials(), 100);
                      }}
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    const currentRows = segment.rows || [];
                    const newRow = {
                      id: `row_${Date.now()}`,
                      name: `Factor ${currentRows.length + 1}`,
                      inputMethod: 'growth' as const,
                      baseValue: 0,
                      growthMethod: 'uniform' as const,
                      growthRate: 0,
                    };
                    updateCOGSSegment(segmentId, { rows: [...currentRows, newRow] });
                    setTimeout(() => calculateFinancials(), 100);
                  }}
                  className="w-full py-2 text-sm font-medium text-blue-600 border border-blue-200 border-dashed rounded-md hover:bg-blue-50"
                >
                  + Add Row
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Component for configuring individual COGS segment rows
interface COGSSegmentRowConfigProps {
  segment: COGSSegment;
  row: SegmentRow;
  onUpdateRow: (updates: Partial<SegmentRow>) => void;
}

const COGSSegmentRowConfig: React.FC<COGSSegmentRowConfigProps> = ({ segment, row, onUpdateRow }) => {
  const { model } = useModelStore();

  return (
    <div className="space-y-4">
      {/* Row Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {segment.segmentType === 'consolidated' ? 'COGS Name' : 'Factor Name'}
        </label>
        <input
          type="text"
          value={row.name}
          onChange={(e) => onUpdateRow({ name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={segment.segmentType === 'consolidated' ? 'Enter COGS name' : 'Enter factor name'}
        />
      </div>

      {/* Input Method Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Input Method</label>
        <div className="flex bg-gray-100 rounded p-1">
          <button
            onClick={() => onUpdateRow({ inputMethod: 'growth' })}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              row.inputMethod === 'growth' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Growth-based
          </button>
          <button
            onClick={() => onUpdateRow({ inputMethod: 'direct' })}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              row.inputMethod === 'direct' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Direct Values
          </button>
        </div>
      </div>

      {/* Growth-based Configuration */}
      {row.inputMethod === 'growth' && (
        <div className="space-y-4">
          {/* Base Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Year Value ($M)</label>
            <input
              type="number"
              value={row.baseValue || ''}
              onChange={(e) => onUpdateRow({ baseValue: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter base value"
              step="0.1"
            />
            <p className="text-xs text-gray-500 mt-1">Value for year {model.periods.startYear}</p>
          </div>

          {/* Growth Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Growth Method</label>
            <div className="flex bg-gray-100 rounded p-1">
              <button
                onClick={() => onUpdateRow({ growthMethod: 'uniform' })}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  row.growthMethod === 'uniform'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Uniform Rate
              </button>
              <button
                onClick={() => onUpdateRow({ growthMethod: 'individual' })}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  row.growthMethod === 'individual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Individual Rates
              </button>
            </div>
          </div>

          {/* Uniform Growth Rate */}
          {row.growthMethod === 'uniform' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Annual Growth Rate (%)</label>
              <input
                type="number"
                value={row.growthRate || ''}
                onChange={(e) => onUpdateRow({ growthRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter growth rate"
                step="0.1"
              />
            </div>
          )}

          {/* Individual Growth Rates */}
          {row.growthMethod === 'individual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Growth Rates by Year (%)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {model.periods.periodLabels.slice(1).map((period, index) => (
                  <div key={period}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{period}</label>
                    <input
                      type="number"
                      value={row.individualGrowthRates?.[index + 1] || ''}
                      onChange={(e) =>
                        onUpdateRow({
                          individualGrowthRates: {
                            ...row.individualGrowthRates,
                            [index + 1]: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="0"
                      step="0.1"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Direct Values Configuration */}
      {row.inputMethod === 'direct' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Values by Year ($M)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {model.periods.periodLabels.map((period, index) => (
              <div key={period}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{period}</label>
                <input
                  type="number"
                  value={row.yearlyValues?.[index] || ''}
                  onChange={(e) => {
                    const newYearlyValues = [...(row.yearlyValues || Array(model.periods.numberOfYears).fill(0))];
                    newYearlyValues[index] = Number(e.target.value);
                    onUpdateRow({ yearlyValues: newYearlyValues });
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0"
                  step="0.1"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
