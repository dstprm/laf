'use client';

import React from 'react';
import { useModelStore } from '../store/modelStore';
import { FinancialInputSection, ConsolidatedInputConfig, SegmentConfig } from './FinancialInputSection';

export const OpExInput: React.FC = () => {
  const { 
    model, 
    updateOpEx,
    updateOpExSegment,
    updateOpExSegmentRow
  } = useModelStore();

  // OPEX-specific configuration
  const consolidatedConfig: ConsolidatedInputConfig = {
    inputMethods: [
      { key: 'growth', label: 'Growth-based', description: 'Base value plus growth rate' },
      { key: 'percentOfRevenue', label: '% of Revenue', description: 'Percentage of revenue' },
      { key: 'direct', label: 'Direct Input', description: 'Enter values directly for each year' }
    ],
    allowPercentageOfRevenue: true,
    percentageLabel: 'OpEx as % of Revenue',
    percentageDescription: 'OpEx = Revenue × OpEx %'
  };

  const segmentConfig: SegmentConfig = {
    segmentTypeName: 'OpEx Segment',
    defaultSegmentName: 'OpEx Segment',
    defaultRowName: 'Operating Expense',
    allowFactorMultiplication: true,
    allowPercentageOfRevenue: true,
  };

  return (
    <FinancialInputSection
      title="OpEx"
      sectionKey="opex"
      consolidatedConfig={consolidatedConfig}
      segmentConfig={segmentConfig}
      data={model.opex}
      updateFunction={updateOpEx}
      updateSegmentFunction={updateOpExSegment}
      updateSegmentRowFunction={updateOpExSegmentRow}
    />
  );
}; 