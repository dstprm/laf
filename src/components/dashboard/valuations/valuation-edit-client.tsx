'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { DCFTable } from '@/app/valuation/components/DCFTable';
import { IndustryCountrySelector } from '@/app/valuation/components/IndustryCountrySelector';
import { useModelStore } from '@/app/valuation/store/modelStore';
import { RevenueEbitdaChart } from './revenue-ebitda-chart';
import { FootballFieldChart } from './football-field-chart';
import { ScenarioList } from './scenario-list';
import { betasStatic } from '@/app/valuation/betasStatic';
import { countryRiskPremiumStatic } from '@/app/valuation/countryRiskPremiumStatic';

import type { FinancialModel, CalculatedFinancials, ScenarioListItem } from '@/lib/valuation.types';

interface ValuationEditClientProps {
  valuationId: string;
  initialModelData: FinancialModel;
  initialResultsData: CalculatedFinancials;
  companyName?: string | null;
  industry?: string | null;
  country?: string | null;
  enterpriseValue?: number | null;
}

export default function ValuationEditClient({
  valuationId,
  initialModelData,
  initialResultsData,
  companyName,
  industry,
  country,
  enterpriseValue,
}: ValuationEditClientProps) {
  // Debug: Log what data we received from props
  console.log('ValuationEditClient mounted with props:', {
    hasModelData: !!initialModelData,
    hasResultsData: !!initialResultsData,
    hasRiskProfile: !!initialModelData?.riskProfile,
    riskProfileIndustry: initialModelData?.riskProfile?.selectedIndustry,
    riskProfileCountry: initialModelData?.riskProfile?.selectedCountry,
    propsIndustry: industry,
    propsCountry: country,
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState<'simple' | 'advanced' | 'full'>('simple');
  const [componentKey, setComponentKey] = useState(0); // Force re-mount when entering edit mode
  const [scenarios, setScenarios] = useState<ScenarioListItem[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const {
    model,
    calculatedFinancials,
    calculateFinancials,
    updateRiskProfile,
    updateRevenue,
    updateOpEx,
    updateTaxes,
    updateTerminalValue,
    updateCapex,
    updateNetWorkingCapital,
    updateDA,
  } = useModelStore();

  const industries = useMemo(() => Object.keys(betasStatic), []);
  const countries = useMemo(() => Object.keys(countryRiskPremiumStatic), []);

  // Initialize the model store with saved data when entering edit mode
  useEffect(() => {
    if (isEditMode && initialModelData && initialResultsData) {
      try {
        console.log('Loading valuation data into store:', {
          hasRiskProfile: !!initialModelData.riskProfile,
          riskProfile: initialModelData.riskProfile,
        });

        // Use Zustand's setState to load the saved model
        // Ensure we're loading the complete model including riskProfile
        useModelStore.setState({
          model: {
            ...initialModelData,
            // Ensure riskProfile is properly set, fallback to defaults if missing
            riskProfile: initialModelData.riskProfile || {
              selectedIndustry: industry || null,
              selectedCountry: country || null,
              unleveredBeta: 0,
              leveredBeta: 0,
              equityRiskPremium: 0,
              countryRiskPremium: 0,
              deRatio: 0,
              adjustedDefaultSpread: 0,
              companySpread: 0.05,
              riskFreeRate: 0.0444,
              corporateTaxRate: 0.25,
            },
          },
          calculatedFinancials: initialResultsData,
        });

        console.log('Model loaded. Current riskProfile:', useModelStore.getState().model.riskProfile);

        // Wait a tick to ensure store update has propagated, then force re-mount
        setTimeout(() => {
          console.log('Forcing component re-mount with new key');
          setComponentKey((prev) => prev + 1);
        }, 0);

        // Recalculate to ensure everything is in sync
        setTimeout(() => {
          calculateFinancials();
        }, 150);
      } catch (error) {
        console.error('Error loading valuation data:', error);
        toast({
          variant: 'destructive',
          title: 'Error loading valuation',
          description: 'Failed to load valuation data for editing.',
        });
      }
    }
  }, [isEditMode, initialModelData, initialResultsData, toast, calculateFinancials, industry, country]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/valuations/${valuationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelData: model,
          resultsData: calculatedFinancials,
          enterpriseValue: calculatedFinancials.enterpriseValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save changes');
      }

      toast({
        title: 'Changes saved successfully!',
        description: 'Your valuation has been updated.',
      });

      // Refresh the page data
      router.refresh();
      setIsEditMode(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to save changes',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset the model store to initial data
    if (initialModelData && initialResultsData) {
      useModelStore.setState({
        model: initialModelData as any,
        calculatedFinancials: initialResultsData as any,
      });
    }
    setIsEditMode(false);
  };

  // Convert saved scenarios to football field chart format
  const footballFieldData = React.useMemo(() => {
    const baseValue = isEditMode ? calculatedFinancials.enterpriseValue || enterpriseValue || 0 : enterpriseValue || 0;

    if (scenarios.length > 0) {
      return scenarios.map((scenario) => ({
        scenario: scenario.name,
        min: scenario.minValue,
        max: scenario.maxValue,
        base: baseValue,
      }));
    }

    // If no scenarios exist, return empty array (no default sensitivity ranges)
    return [];
  }, [scenarios, calculatedFinancials, enterpriseValue, isEditMode]);

  if (!isEditMode) {
    // Read-only mode - show summary and charts
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Valuation Summary</h2>
              <p className="text-sm text-gray-600 mt-1">Overview of key metrics and assumptions</p>
            </div>
            <Button onClick={() => setIsEditMode(true)}>Edit Valuation</Button>
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Info */}
            {(companyName || industry || country) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Company Information</h3>
                <dl className="space-y-2">
                  {companyName && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Company Name</dt>
                      <dd className="text-sm font-medium text-gray-900">{companyName}</dd>
                    </div>
                  )}
                  {industry && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Industry</dt>
                      <dd className="text-sm font-medium text-gray-900">{industry}</dd>
                    </div>
                  )}
                  {country && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Country</dt>
                      <dd className="text-sm font-medium text-gray-900">{country}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Valuation Metrics */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Valuation Metrics</h3>
              <dl className="space-y-2">
                <div className="flex justify-between items-center">
                  <dt className="text-sm text-gray-500">Enterprise Value</dt>
                  <dd className="text-lg font-bold text-green-600">
                    {enterpriseValue
                      ? new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          maximumFractionDigits: 0,
                        }).format(enterpriseValue)
                      : 'N/A'}
                  </dd>
                </div>
                {(initialResultsData as any)?.terminalValue && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Terminal Value</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0,
                      }).format((initialResultsData as any).terminalValue)}
                    </dd>
                  </div>
                )}
                {(initialModelData as any)?.periods && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Projection Period</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {(initialModelData as any).periods.numberOfYears} years
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Scenarios Section */}
        <ScenarioList
          valuationId={valuationId}
          baseValue={enterpriseValue || 0}
          baseModel={initialModelData}
          baseResults={initialResultsData}
          onScenariosChange={setScenarios}
        />

        {/* Charts */}
        {initialResultsData && (
          <div className="space-y-6">
            {(initialResultsData as any)?.revenue && (initialResultsData as any)?.revenue.length > 0 && (
              <RevenueEbitdaChart
                revenues={(initialResultsData as any).revenue.slice(0, 5)}
                ebitdaMargins={(initialResultsData as any).ebitdaMargin.slice(0, 5)}
                years={(initialModelData as any)?.periods?.periodLabels?.slice(0, 5)}
                title="Revenue & EBITDA Margin Projection"
              />
            )}

            {/* Football Field Chart - only show if there are scenarios */}
            {footballFieldData.length > 0 && (
              <FootballFieldChart ranges={footballFieldData} title="Scenario Analysis" />
            )}
          </div>
        )}
      </div>
    );
  }

  // Helper function to get revenue from model
  const getLastYearRevenue = () => {
    if (model.revenue?.inputType === 'consolidated' && model.revenue.consolidated?.inputMethod === 'growth') {
      return model.revenue.consolidated.baseValue || 0;
    }
    return calculatedFinancials.revenue?.[0] || 0;
  };

  // Helper function to get growth rate
  const getGrowthRate = () => {
    if (
      model.revenue?.inputType === 'consolidated' &&
      model.revenue.consolidated?.inputMethod === 'growth' &&
      model.revenue.consolidated?.growthMethod === 'uniform'
    ) {
      return model.revenue.consolidated.growthRate || 0;
    }
    return 0;
  };

  // Helper function to get EBITDA margin
  const getEbitdaMargin = () => {
    if (
      model.opex?.inputType === 'consolidated' &&
      model.opex.consolidated?.inputMethod === 'percentOfRevenue' &&
      model.opex.consolidated?.percentMethod === 'uniform'
    ) {
      return Math.max(0, 100 - (model.opex.consolidated.percentOfRevenue || 0));
    }
    return calculatedFinancials.ebitdaMargin?.[0] || 0;
  };

  // Simple mode handlers
  const handleSimpleUpdate = () => {
    const industryData = model.riskProfile?.selectedIndustry
      ? betasStatic[model.riskProfile.selectedIndustry as keyof typeof betasStatic]
      : null;
    const countryData = model.riskProfile?.selectedCountry
      ? countryRiskPremiumStatic[model.riskProfile.selectedCountry as keyof typeof countryRiskPremiumStatic]
      : null;

    // Update risk profile if industry/country selected
    if (industryData && countryData) {
      updateRiskProfile({
        unleveredBeta: industryData?.unleveredBeta ?? 0,
        leveredBeta: industryData
          ? industryData.unleveredBeta * (1 + (1 - (countryData?.corporateTaxRate ?? 0)) * (industryData.dERatio ?? 0))
          : 0,
        equityRiskPremium: countryData?.equityRiskPremium ?? 0,
        countryRiskPremium: countryData?.countryRiskPremium ?? 0,
        deRatio: industryData?.dERatio ?? 0,
        adjustedDefaultSpread: countryData?.adjDefaultSpread ?? 0,
        corporateTaxRate: countryData?.corporateTaxRate ?? 0.25,
      });
    }

    // Update terminal value to use multiples
    updateTerminalValue({ method: 'multiples', multipleMetric: 'ebitda', multipleValue: 10 });

    setTimeout(() => calculateFinancials(), 100);
  };

  // Edit mode - show editing interface with mode selector
  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Valuation</h2>
            <p className="text-sm text-gray-600 mt-1">Modify inputs, assumptions, and view real-time results</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <Tabs value={editMode} onValueChange={(v) => setEditMode(v as 'simple' | 'advanced' | 'full')}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="simple">Simple</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="full">Full DCF</TabsTrigger>
        </TabsList>

        <TabsContent value="simple" className="space-y-6">
          {/* Industry and Country Selector - WACC collapsed for simple mode */}
          <IndustryCountrySelector key={`simple-selector-${componentKey}`} waccExpanded={false} readOnly={true} />

          {/* Simple Inputs */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Assumptions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Year Revenue (USD)</label>
                <input
                  type="number"
                  value={getLastYearRevenue()}
                  onChange={(e) => {
                    updateRevenue({
                      inputType: 'consolidated',
                      consolidated: {
                        ...model.revenue.consolidated,
                        inputMethod: 'growth',
                        growthMethod: 'uniform',
                        baseValue: Number(e.target.value),
                      },
                    });
                    setTimeout(() => handleSimpleUpdate(), 100);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1000000"
                  step="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Revenue Growth (%/yr)</label>
                <input
                  type="number"
                  value={getGrowthRate()}
                  onChange={(e) => {
                    updateRevenue({
                      inputType: 'consolidated',
                      consolidated: {
                        ...model.revenue.consolidated,
                        inputMethod: 'growth',
                        growthMethod: 'uniform',
                        growthRate: Number(e.target.value),
                      },
                    });
                    setTimeout(() => handleSimpleUpdate(), 100);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">EBITDA Margin (%)</label>
                <input
                  type="number"
                  value={getEbitdaMargin()}
                  onChange={(e) => {
                    const targetOpexPercentOfRevenue = Math.max(0, 100 - Number(e.target.value));
                    updateOpEx({
                      inputType: 'consolidated',
                      consolidated: {
                        inputMethod: 'percentOfRevenue',
                        percentMethod: 'uniform',
                        percentOfRevenue: targetOpexPercentOfRevenue,
                      },
                    });
                    setTimeout(() => handleSimpleUpdate(), 100);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 20"
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          {/* Industry and Country Selector - WACC collapsed for advanced mode */}
          <IndustryCountrySelector key={`advanced-selector-${componentKey}`} waccExpanded={false} readOnly={true} />

          {/* Advanced Form - Same as /free-valuation */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Valuation Setup</h3>
            <p className="text-sm text-gray-600 mb-6">
              Configure detailed projections with flexible input methods for revenue, EBITDA, CAPEX, and more.
            </p>

            {/* Coming Soon Notice */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Advanced Mode Configuration</h4>
                  <p className="text-sm text-blue-800 mb-3">Configure multi-year projections with:</p>
                  <ul className="text-sm text-blue-700 space-y-1 mb-3">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      Revenue: Uniform growth, per-year rates, or direct values
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      EBITDA: Margin ramps, per-year margins, or direct EBITDA values
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      CAPEX, NWC, D&A: % of revenue (uniform/individual) or direct inputs
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      Taxes: % of EBIT or direct per-year values
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      Terminal Value: Long-term growth rate method
                    </li>
                  </ul>
                  <div className="flex gap-2 text-sm">
                    <button
                      onClick={() => setEditMode('simple')}
                      className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      ← Simple Mode
                    </button>
                    <button
                      onClick={() => setEditMode('full')}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Full DCF Table →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Temporary: Guide to use Full DCF for now */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>For now:</strong> Use the <strong>Full DCF</strong> tab above for complete control over all
                assumptions and line items. A streamlined Advanced interface will be added soon to bridge Simple and
                Full modes.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="full" className="space-y-6">
          {/* Industry and Country Selector - WACC expanded for full DCF */}
          <IndustryCountrySelector key={`full-selector-${componentKey}`} waccExpanded={true} readOnly={true} />

          {/* Full DCF Table */}
          <DCFTable key={`dcf-table-${componentKey}`} />
        </TabsContent>
      </Tabs>

      {/* Charts Section */}
      <div className="space-y-6">
        {/* Revenue & EBITDA Chart */}
        {calculatedFinancials.revenue && calculatedFinancials.revenue.length > 0 && (
          <RevenueEbitdaChart
            revenues={calculatedFinancials.revenue.slice(0, model.periods?.numberOfYears || 5)}
            ebitdaMargins={calculatedFinancials.ebitdaMargin.slice(0, model.periods?.numberOfYears || 5)}
            years={model.periods?.periodLabels?.slice(0, model.periods?.numberOfYears || 5)}
            title="Revenue & EBITDA Margin Projection"
          />
        )}

        {/* Football Field Chart - only show if there are scenarios */}
        {footballFieldData.length > 0 && <FootballFieldChart ranges={footballFieldData} title="Scenario Analysis" />}
      </div>

      {/* Key Metrics Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Valuation Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Enterprise Value</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0,
              }).format(calculatedFinancials.enterpriseValue || 0)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-medium">Terminal Value</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0,
              }).format(calculatedFinancials.terminalValue || 0)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-600 font-medium">PV of Terminal Value</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0,
              }).format(calculatedFinancials.presentValueTerminalValue || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
