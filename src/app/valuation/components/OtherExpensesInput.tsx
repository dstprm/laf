'use client';

import React from 'react';
import { useModelStore } from '../store/modelStore';
import { FinancialInputSection, ConsolidatedInputConfig, SegmentConfig } from './FinancialInputSection';

export const OtherExpensesInput: React.FC = () => {
  const { 
    model, 
    updateOtherExpenses,
    updateOtherExpensesSegment,
    updateOtherExpensesSegmentRow
  } = useModelStore();

  // Other Expenses-specific configuration
  const consolidatedConfig: ConsolidatedInputConfig = {
    inputMethods: [
      { key: 'growth', label: 'Growth-based', description: 'Base value plus growth rate' },
      { key: 'percentOfRevenue', label: '% of Revenue', description: 'Percentage of revenue' },
      { key: 'direct', label: 'Direct Input', description: 'Enter values directly for each year' }
    ],
    allowPercentageOfRevenue: true,
    percentageLabel: 'Other Expenses as % of Revenue',
    percentageDescription: 'Other Expenses = Revenue × Percentage'
  };

  const segmentConfig: SegmentConfig = {
    segmentTypeName: 'Other Expenses Segment',
    defaultSegmentName: 'Other Expenses Segment',
    defaultRowName: 'Other Expenses',
    allowFactorMultiplication: true,
    allowPercentageOfRevenue: true,
  };

  return (
    <FinancialInputSection
      title="Other Expenses"
      sectionKey="otherExpenses"
      consolidatedConfig={consolidatedConfig}
      segmentConfig={segmentConfig}
      data={model.otherExpenses}
      updateFunction={updateOtherExpenses}
      updateSegmentFunction={updateOtherExpensesSegment}
      updateSegmentRowFunction={updateOtherExpensesSegmentRow}
    />
  );
}; 