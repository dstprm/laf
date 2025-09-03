'use client';

import React from 'react';
import { useModelStore } from '../store/modelStore';
import { FinancialInputSection, ConsolidatedInputConfig, SegmentConfig } from './FinancialInputSection';

export const RevenueInput: React.FC = () => {
  const { 
    model, 
    updateRevenue,
    updateSegment,
    updateSegmentRow
  } = useModelStore();

  // Revenue-specific configuration
  const consolidatedConfig: ConsolidatedInputConfig = {
    inputMethods: [
      { key: 'growth', label: 'Growth-based', description: 'Base value plus growth rate' },
      { key: 'direct', label: 'Direct Input', description: 'Enter values directly for each year' }
    ],
    allowPercentageOfRevenue: false, // Revenue doesn't depend on itself
  };

  const segmentConfig: SegmentConfig = {
    segmentTypeName: 'Revenue Segment',
    defaultSegmentName: 'Revenue Segment',
    defaultRowName: 'Revenue',
    allowFactorMultiplication: true,
    allowPercentageOfRevenue: false, // Revenue segments don't use percentage of revenue
  };

  return (
    <FinancialInputSection
      title="Revenue"
      sectionKey="revenue"
      consolidatedConfig={consolidatedConfig}
      segmentConfig={segmentConfig}
      data={model.revenue}
      updateFunction={updateRevenue}
      updateSegmentFunction={updateSegment}
      updateSegmentRowFunction={updateSegmentRow}
    />
  );
}; 