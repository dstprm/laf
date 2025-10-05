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
import {
  AdvancedValuationForm,
  type AdvancedValuationState,
} from '@/components/shared/valuation/advanced-valuation-form';

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
  console.log('[ValuationEditClient] Component rendered', {
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
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Advanced form state
  const [advState, setAdvState] = useState<AdvancedValuationState>({
    advYears: 5,
    advRevenueInputMethod: 'growth',
    growthMode: 'uniform',
    advUniformGrowth: '',
    revenueDirectList: Array.from({ length: 5 }, () => ''),
    growthPerYearList: Array.from({ length: 4 }, () => ''),
    advLTG: '',
    ebitdaInputType: 'percent',
    ebitdaPctMode: 'ramp',
    advEbitdaUniformPct: '',
    advEbitdaStart: '',
    advEbitdaTarget: '',
    ebitdaPercentPerYearList: Array.from({ length: 5 }, () => ''),
    ebitdaDirectList: Array.from({ length: 5 }, () => ''),
    capexMethod: 'percentOfRevenue',
    capexPercentMode: 'uniform',
    advCapexPct: '',
    capexPercentsList: Array.from({ length: 5 }, () => ''),
    capexDirectList: Array.from({ length: 5 }, () => ''),
    nwcMethod: 'percentOfRevenue',
    nwcPercentMode: 'uniform',
    advNwcPct: '',
    nwcPercentsList: Array.from({ length: 5 }, () => ''),
    nwcDirectList: Array.from({ length: 5 }, () => ''),
    daMethod: 'percentOfRevenue',
    daPercentMode: 'uniform',
    advDaPct: '',
    daPercentsList: Array.from({ length: 5 }, () => ''),
    daDirectList: Array.from({ length: 5 }, () => ''),
    taxesMethod: 'percentOfEBIT',
    taxesPct: '',
    taxesDirectList: Array.from({ length: 5 }, () => ''),
    deRatio: '0', // Default to no debt (D/E ratio managed in WACC section)
    advStep: 1,
  });

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
    updatePeriods,
  } = useModelStore();

  const industries = useMemo(() => Object.keys(betasStatic), []);
  const countries = useMemo(() => Object.keys(countryRiskPremiumStatic), []);

  // Initialize the model store with saved data when mounting
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    console.log('[ValuationEditClient] Initialization useEffect triggered', {
      hasInitialized,
      hasModelData: !!initialModelData,
      hasResultsData: !!initialResultsData,
    });

    // Only initialize once
    if (hasInitialized || !initialModelData || !initialResultsData) {
      console.log('[ValuationEditClient] Skipping initialization (already done or missing data)');
      return;
    }

    try {
      console.log('[ValuationEditClient] Starting initialization...');

      // Get the selected industry and country (fallback to denormalized values)
      const selectedIndustry = initialModelData.riskProfile?.selectedIndustry || industry || null;
      const selectedCountry = initialModelData.riskProfile?.selectedCountry || country || null;

      // Check if WACC parameters are all defaults/zeros (indicating they need to be recalculated)
      const hasDefaultWaccParams =
        initialModelData.riskProfile &&
        initialModelData.riskProfile.unleveredBeta === 0 &&
        initialModelData.riskProfile.leveredBeta === 0 &&
        initialModelData.riskProfile.equityRiskPremium === 0 &&
        initialModelData.riskProfile.countryRiskPremium === 0 &&
        initialModelData.riskProfile.deRatio === 0;

      console.log('[ValuationEditClient] WACC check:', {
        hasDefaultWaccParams,
        selectedIndustry,
        selectedCountry,
      });

      let riskProfile;

      // If WACC params are defaults but we have industry/country, recalculate from static data
      if (hasDefaultWaccParams && selectedIndustry && selectedCountry) {
        console.log('[ValuationEditClient] Recalculating WACC from industry/country data');
        const industryData = betasStatic[selectedIndustry as keyof typeof betasStatic];
        const countryData = countryRiskPremiumStatic[selectedCountry as keyof typeof countryRiskPremiumStatic];

        if (industryData && countryData) {
          const unleveredBeta = industryData.unleveredBeta;
          const deRatio = industryData.dERatio;
          const corporateTaxRate = countryData.corporateTaxRate;
          const leveredBeta = unleveredBeta * (1 + (1 - corporateTaxRate) * deRatio);

          riskProfile = {
            selectedIndustry,
            selectedCountry,
            unleveredBeta,
            leveredBeta,
            equityRiskPremium: countryData.equityRiskPremium,
            countryRiskPremium: countryData.countryRiskPremium,
            deRatio,
            adjustedDefaultSpread: countryData.adjDefaultSpread,
            companySpread: initialModelData.riskProfile?.companySpread || 0.05,
            riskFreeRate: initialModelData.riskProfile?.riskFreeRate || 0.0444,
            corporateTaxRate,
          };
        } else {
          // Fallback to existing data with updated industry/country
          riskProfile = {
            ...initialModelData.riskProfile,
            selectedIndustry,
            selectedCountry,
          };
        }
      } else if (initialModelData.riskProfile) {
        // Use existing riskProfile with updated industry/country
        riskProfile = {
          ...initialModelData.riskProfile,
          selectedIndustry,
          selectedCountry,
        };
      } else {
        // No riskProfile exists, create default one
        riskProfile = {
          selectedIndustry,
          selectedCountry,
          unleveredBeta: 0,
          leveredBeta: 0,
          equityRiskPremium: 0,
          countryRiskPremium: 0,
          deRatio: 0,
          adjustedDefaultSpread: 0,
          companySpread: 0.05,
          riskFreeRate: 0.0444,
          corporateTaxRate: 0.25,
        };
      }

      // Use Zustand's setState to load the saved model
      useModelStore.setState({
        model: {
          ...initialModelData,
          riskProfile,
        },
        calculatedFinancials: initialResultsData,
      });

      console.log('[ValuationEditClient] ✅ Initialization complete! Final riskProfile:', {
        selectedIndustry: riskProfile.selectedIndustry,
        selectedCountry: riskProfile.selectedCountry,
        unleveredBeta: riskProfile.unleveredBeta,
        leveredBeta: riskProfile.leveredBeta,
        wacc: 'will be calculated',
      });

      setHasInitialized(true);

      // Recalculate to ensure everything is in sync
      setTimeout(() => {
        console.log('[ValuationEditClient] Triggering financial recalculation...');
        calculateFinancials();
      }, 150);
    } catch (error) {
      console.error('[ValuationEditClient] ❌ Error loading valuation data:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading valuation',
        description: 'Failed to load valuation data for editing.',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasInitialized, initialModelData, initialResultsData, industry, country]);

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

  // Helper functions for advanced mode
  const buildArrayFromList = (years: number, list: string[]): number[] => {
    const arr: number[] = [];
    for (let i = 0; i < years; i++) {
      const v = parseFloat((list[i] || '').trim());
      arr.push(Number.isFinite(v) ? v : 0);
    }
    return arr;
  };

  const buildIndividualPercentsMap = (years: number, list: string[]): { [k: number]: number } => {
    const arr = buildArrayFromList(years, list);
    const map: { [k: number]: number } = {};
    for (let i = 0; i < years; i++) map[i] = arr[i] ?? 0;
    return map;
  };

  const buildMarginArray = (startPct: number, targetPct: number, years: number, delta: number) => {
    const s = Math.max(0, startPct + delta);
    const t = Math.max(0, targetPct + delta);
    const arr: number[] = [];
    for (let i = 0; i < years; i++) {
      const ratio = years === 1 ? 0 : i / (years - 1);
      arr.push(s + (t - s) * ratio);
    }
    return arr.map((v) => Math.min(100, Math.max(0, v)));
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
    // Simple mode assumes no debt (D/E ratio = 0)
    if (industryData && countryData) {
      const unleveredBeta = industryData?.unleveredBeta ?? 0;

      updateRiskProfile({
        unleveredBeta: unleveredBeta,
        leveredBeta: unleveredBeta, // No debt, so levered = unlevered
        equityRiskPremium: countryData?.equityRiskPremium ?? 0,
        countryRiskPremium: countryData?.countryRiskPremium ?? 0,
        deRatio: 0, // Assume no debt for simple mode
        adjustedDefaultSpread: countryData?.adjDefaultSpread ?? 0,
        corporateTaxRate: countryData?.corporateTaxRate ?? 0.25,
      });
    }

    // Update terminal value to use multiples
    updateTerminalValue({ method: 'multiples', multipleMetric: 'ebitda', multipleValue: 10 });

    setTimeout(() => calculateFinancials(), 100);
  };

  // Advanced mode handler
  const handleAdvancedUpdate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const revenue0 = getLastYearRevenue();
    if (!(revenue0 > 0) || advState.advYears < 2) return;

    setIsCalculating(true);

    const industryData = model.riskProfile?.selectedIndustry
      ? betasStatic[model.riskProfile.selectedIndustry as keyof typeof betasStatic]
      : null;
    const countryData = model.riskProfile?.selectedCountry
      ? countryRiskPremiumStatic[model.riskProfile.selectedCountry as keyof typeof countryRiskPremiumStatic]
      : null;

    setTimeout(() => {
      // Update periods
      updatePeriods({ numberOfYears: advState.advYears, startYear: new Date().getFullYear() });

      // Update risk profile if industry/country selected
      // In dashboard edit mode, we preserve the saved D/E ratio from the model
      // (which was set either in Advanced mode as 0, or manually in Full DCF mode)
      if (industryData && countryData) {
        const unleveredBeta = industryData?.unleveredBeta ?? 0;
        const currentDeRatio = model.riskProfile?.deRatio ?? 0; // Preserve saved D/E ratio or default to 0
        const corporateTaxRate = countryData?.corporateTaxRate ?? 0.25;
        const leveredBeta = unleveredBeta * (1 + (1 - corporateTaxRate) * currentDeRatio);

        updateRiskProfile({
          unleveredBeta: unleveredBeta,
          leveredBeta: leveredBeta,
          equityRiskPremium: countryData?.equityRiskPremium ?? 0,
          countryRiskPremium: countryData?.countryRiskPremium ?? 0,
          deRatio: currentDeRatio, // Preserve saved D/E ratio from model
          adjustedDefaultSpread: countryData?.adjDefaultSpread ?? 0,
          corporateTaxRate: corporateTaxRate,
        });
      }

      // Revenue
      if (advState.advRevenueInputMethod === 'growth') {
        if (advState.growthMode === 'uniform') {
          const g = advState.advUniformGrowth.trim() !== '' ? parseFloat(advState.advUniformGrowth) : 0;
          updateRevenue({
            inputType: 'consolidated',
            consolidated: { inputMethod: 'growth', growthMethod: 'uniform', baseValue: revenue0, growthRate: g },
          });
        } else {
          const arr = buildArrayFromList(Math.max(advState.advYears - 1, 1), advState.growthPerYearList);
          const individualGrowthRates: { [k: number]: number } = {};
          for (let i = 1; i < advState.advYears; i++) {
            individualGrowthRates[i] = arr[i - 1] ?? 0;
          }
          updateRevenue({
            inputType: 'consolidated',
            consolidated: {
              inputMethod: 'growth',
              growthMethod: 'individual',
              baseValue: revenue0,
              individualGrowthRates,
            },
          });
        }
      } else {
        const yearlyValues = buildArrayFromList(advState.advYears, advState.revenueDirectList);
        updateRevenue({ inputType: 'consolidated', consolidated: { inputMethod: 'direct', yearlyValues } });
      }

      // Terminal value
      const ltg = advState.advLTG.trim() !== '' ? parseFloat(advState.advLTG) : 0;
      updateTerminalValue({ method: 'growth', growthRate: ltg });

      // EBITDA via OpEx
      if (advState.ebitdaInputType === 'percent') {
        let marginArr: number[] = [];
        if (advState.ebitdaPctMode === 'uniform') {
          const m = advState.advEbitdaUniformPct.trim() !== '' ? parseFloat(advState.advEbitdaUniformPct) : 0;
          marginArr = Array.from({ length: advState.advYears }, () => m);
        } else if (advState.ebitdaPctMode === 'perYear') {
          const parts = buildArrayFromList(advState.advYears, advState.ebitdaPercentPerYearList);
          marginArr = Array.from({ length: advState.advYears }, (_, i) =>
            i < parts.length ? parts[i] || 0 : parts[parts.length - 1] || 0,
          );
        } else {
          const startM = parseFloat(advState.advEbitdaStart || '0');
          const targetM = parseFloat(advState.advEbitdaTarget || advState.advEbitdaStart || '0');
          marginArr = buildMarginArray(startM, targetM, advState.advYears, 0);
        }
        const individualPercents: { [k: number]: number } = {};
        for (let i = 0; i < advState.advYears; i++) {
          individualPercents[i] = Math.max(0, 100 - (marginArr[i] || 0));
        }
        updateOpEx({
          inputType: 'consolidated',
          consolidated: { inputMethod: 'percentOfRevenue', percentMethod: 'individual', individualPercents },
        });
      } else {
        updateOpEx({
          inputType: 'consolidated',
          consolidated: { inputMethod: 'direct', yearlyValues: Array(advState.advYears).fill(0) },
        });
      }

      // CAPEX
      if (advState.capexMethod === 'direct') {
        updateCapex({
          inputMethod: 'direct',
          yearlyValues: buildArrayFromList(advState.advYears, advState.capexDirectList),
        });
      } else if (advState.capexPercentMode === 'uniform') {
        updateCapex({
          inputMethod: 'percentOfRevenue',
          percentMethod: 'uniform',
          percentOfRevenue: parseFloat(advState.advCapexPct || '0'),
        });
      } else {
        updateCapex({
          inputMethod: 'percentOfRevenue',
          percentMethod: 'individual',
          individualPercents: buildIndividualPercentsMap(advState.advYears, advState.capexPercentsList),
        });
      }

      // NWC
      if (advState.nwcMethod === 'direct') {
        updateNetWorkingCapital({
          inputMethod: 'direct',
          yearlyValues: buildArrayFromList(advState.advYears, advState.nwcDirectList),
        });
      } else if (advState.nwcPercentMode === 'uniform') {
        updateNetWorkingCapital({
          inputMethod: 'percentOfRevenue',
          percentMethod: 'uniform',
          percentOfRevenue: parseFloat(advState.advNwcPct || '0'),
        });
      } else {
        updateNetWorkingCapital({
          inputMethod: 'percentOfRevenue',
          percentMethod: 'individual',
          individualPercents: buildIndividualPercentsMap(advState.advYears, advState.nwcPercentsList),
        });
      }

      // D&A
      if (advState.daMethod === 'direct') {
        updateDA({
          inputMethod: 'direct',
          yearlyValues: buildArrayFromList(advState.advYears, advState.daDirectList),
        });
      } else if (advState.daPercentMode === 'uniform') {
        updateDA({
          inputMethod: 'percentOfRevenue',
          percentMethod: 'uniform',
          percentOfRevenue: parseFloat(advState.advDaPct || '0'),
        });
      } else {
        updateDA({
          inputMethod: 'percentOfRevenue',
          percentMethod: 'individual',
          individualPercents: buildIndividualPercentsMap(advState.advYears, advState.daPercentsList),
        });
      }

      // Taxes
      if (advState.taxesMethod === 'direct') {
        updateTaxes({
          inputMethod: 'direct',
          yearlyValues: buildArrayFromList(advState.advYears, advState.taxesDirectList),
        });
      } else {
        const taxPct = advState.taxesPct.trim() !== '' ? parseFloat(advState.taxesPct) : 0;
        updateTaxes({ inputMethod: 'percentOfEBIT', percentMethod: 'uniform', percentOfEBIT: taxPct });
      }

      calculateFinancials();

      // Adjust OpEx if using direct EBITDA
      if (advState.ebitdaInputType === 'direct') {
        const currentRevenue = useModelStore.getState().calculatedFinancials.revenue;
        const targetEbitda = buildArrayFromList(advState.advYears, advState.ebitdaDirectList);
        const opexValues = currentRevenue.map((rev, i) => Math.max(0, (rev || 0) - (targetEbitda[i] || 0)));
        updateOpEx({ inputType: 'consolidated', consolidated: { inputMethod: 'direct', yearlyValues: opexValues } });
        calculateFinancials();
      }

      setIsCalculating(false);
    }, 100);
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

          {/* Advanced Form - hide D/E ratio input since it's in WACC section */}
          <AdvancedValuationForm
            companyName={companyName || ''}
            setCompanyName={() => {}}
            companyWebsite={''}
            setCompanyWebsite={() => {}}
            companyPhone={''}
            setCompanyPhone={() => {}}
            phoneCountryCode={'+1'}
            setPhoneCountryCode={() => {}}
            industry={model.riskProfile?.selectedIndustry || ''}
            setIndustry={() => {}}
            country={model.riskProfile?.selectedCountry || ''}
            setCountry={() => {}}
            industries={industries}
            countries={countries}
            lastYearRevenue={getLastYearRevenue().toString()}
            setLastYearRevenue={() => {}}
            advState={advState}
            setAdvState={setAdvState}
            isCalculating={isCalculating}
            onSubmit={handleAdvancedUpdate}
            hideDeRatio={true}
          />
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
