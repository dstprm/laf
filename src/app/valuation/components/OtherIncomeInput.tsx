'use client';

import React from 'react';
import { useModelStore } from '../store/modelStore';
import { FinancialInputSection, ConsolidatedInputConfig, SegmentConfig } from './FinancialInputSection';

export const OtherIncomeInput: React.FC = () => {
  const { 
    model, 
    updateOtherIncome,
    updateOtherIncomeSegment,
    updateOtherIncomeSegmentRow
  } = useModelStore();

  // Other Income-specific configuration
  const consolidatedConfig: ConsolidatedInputConfig = {
    inputMethods: [
      { key: 'growth', label: 'Growth-based', description: 'Base value plus growth rate' },
      { key: 'percentOfRevenue', label: '% of Revenue', description: 'Percentage of revenue' },
      { key: 'direct', label: 'Direct Input', description: 'Enter values directly for each year' }
    ],
    allowPercentageOfRevenue: true,
    percentageLabel: 'Other Income as % of Revenue',
    percentageDescription: 'Other Income = Revenue × Percentage'
  };

  const segmentConfig: SegmentConfig = {
    segmentTypeName: 'Other Income Segment',
    defaultSegmentName: 'Other Income Segment',
    defaultRowName: 'Other Income',
    allowFactorMultiplication: true,
    allowPercentageOfRevenue: true,
  };

  return (
    <FinancialInputSection
      title="Other Income"
      sectionKey="otherIncome"
      consolidatedConfig={consolidatedConfig}
      segmentConfig={segmentConfig}
      data={model.otherIncome}
      updateFunction={updateOtherIncome}
      updateSegmentFunction={updateOtherIncomeSegment}
      updateSegmentRowFunction={updateOtherIncomeSegmentRow}
    />
  );
}; 