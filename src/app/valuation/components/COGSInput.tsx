'use client';

import React from 'react';
import { useModelStore } from '../store/modelStore';
import { FinancialInputSection, ConsolidatedInputConfig, SegmentConfig } from './FinancialInputSection';

export const COGSInput: React.FC = () => {
  const { 
    model, 
    updateCOGS,
    updateCOGSSegment,
    updateCOGSSegmentRow
  } = useModelStore();

  // COGS-specific configuration
  const consolidatedConfig: ConsolidatedInputConfig = {
    inputMethods: [
      { key: 'growth', label: 'Growth-based', description: 'Base value plus growth rate' },
      { key: 'direct', label: 'Direct Input', description: 'Enter values directly for each year' },
      { key: 'revenueMargin', label: 'COGS % of Revenue', description: 'COGS as percentage of revenue' }
    ],
    allowPercentageOfRevenue: true, // COGS uses its own margin methods
    percentageLabel: 'COGS as % of Revenue',
    percentageDescription: 'COGS = Revenue × COGS %'
  };

  const segmentConfig: SegmentConfig = {
    segmentTypeName: 'COGS Segment',
    defaultSegmentName: 'COGS Segment',
    defaultRowName: 'COGS',
    allowFactorMultiplication: true,
    allowPercentageOfRevenue: true, // Allow COGS segments to use percentage of revenue
  };

  return (
    <FinancialInputSection
      title="COGS"
      sectionKey="cogs"
      consolidatedConfig={consolidatedConfig}
      segmentConfig={segmentConfig}
      data={model.cogs}
      updateFunction={updateCOGS}
      updateSegmentFunction={updateCOGSSegment}
      updateSegmentRowFunction={updateCOGSSegmentRow}
    />
  );
}; 