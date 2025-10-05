'use client';

import React, { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useModelStore } from '../valuation/store/modelStore';
import { betasStatic } from '../valuation/betasStatic';
import { countryRiskPremiumStatic } from '../valuation/countryRiskPremiumStatic';
import { useUser } from '@clerk/nextjs';
import { SignIn } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import Header from '@/components/home/header/header';
import { useUserInfo } from '@/hooks/useUserInfo';
import type { CreateValuationInput, CreateScenarioInput } from '@/lib/valuation.types';
import { SimpleValuationForm } from '@/components/shared/valuation/simple-valuation-form';
import {
  AdvancedValuationForm,
  type AdvancedValuationState,
} from '@/components/shared/valuation/advanced-valuation-form';
import { ValuationResultsDisplay } from '@/components/shared/valuation/valuation-results-display';
import { CalculationLoading } from '@/components/shared/valuation/calculation-loading';
import { calculateSimpleScenario, calculateAllSensitivities, type SimpleScenarioParams } from '@/lib/valuation-helpers';
import { buildArrayFromList, buildIndividualPercentsMap } from '@/lib/array-helpers';

type Scenario = {
  id: string;
  name: string;
  ebitdaMarginPct: number;
  revenueGrowthPct: number;
};

export default function FreeValuationPage() {
  const {
    model,
    calculatedFinancials,
    updateRiskProfile,
    updateRevenue,
    updateOpEx,
    updateTaxes,
    updateTerminalValue,
    calculateFinancials,
    updateCapex,
    updateNetWorkingCapital,
    updateDA,
    updatePeriods,
  } = useModelStore();

  const industries = useMemo(() => Object.keys(betasStatic), []);
  const countries = useMemo(() => Object.keys(countryRiskPremiumStatic), []);
  const { toast } = useToast();
  const router = useRouter();
  const { user: headerUser } = useUserInfo();

  // Simple form state
  const [industry, setIndustry] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [lastYearRevenue, setLastYearRevenue] = useState<string>('');
  const [ebitdaMarginPct, setEbitdaMarginPct] = useState<string>('');
  const [revenueGrowthPct, setRevenueGrowthPct] = useState<string>('');
  const [step, setStep] = useState<number>(1);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'simple' | 'advanced'>('simple');

  // Advanced form state - consolidated
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
    deRatio: '0', // Default to no debt
    advStep: 1,
  });

  // Update arrays when advState.advYears changes
  React.useEffect(() => {
    setAdvState((prev) => ({
      ...prev,
      revenueDirectList: Array.from({ length: prev.advYears }, (_, i) => prev.revenueDirectList[i] ?? ''),
      growthPerYearList: Array.from(
        { length: Math.max(prev.advYears - 1, 1) },
        (_, i) => prev.growthPerYearList[i] ?? '',
      ),
      ebitdaPercentPerYearList: Array.from({ length: prev.advYears }, (_, i) => prev.ebitdaPercentPerYearList[i] ?? ''),
      ebitdaDirectList: Array.from({ length: prev.advYears }, (_, i) => prev.ebitdaDirectList[i] ?? ''),
      capexPercentsList: Array.from({ length: prev.advYears }, (_, i) => prev.capexPercentsList[i] ?? ''),
      nwcPercentsList: Array.from({ length: prev.advYears }, (_, i) => prev.nwcPercentsList[i] ?? ''),
      daPercentsList: Array.from({ length: prev.advYears }, (_, i) => prev.daPercentsList[i] ?? ''),
      taxesDirectList: Array.from({ length: prev.advYears }, (_, i) => prev.taxesDirectList[i] ?? ''),
      capexDirectList: Array.from({ length: prev.advYears }, (_, i) => prev.capexDirectList[i] ?? ''),
      nwcDirectList: Array.from({ length: prev.advYears }, (_, i) => prev.nwcDirectList[i] ?? ''),
      daDirectList: Array.from({ length: prev.advYears }, (_, i) => prev.daDirectList[i] ?? ''),
    }));
  }, [advState.advYears]);

  const scenarios: Scenario[] = useMemo(() => {
    const baseMargin = parseFloat(ebitdaMarginPct || '0');
    const baseGrowth = parseFloat(revenueGrowthPct || '0');
    return [
      {
        id: 'bear',
        name: 'Low',
        ebitdaMarginPct: Math.max(0, baseMargin - 5),
        revenueGrowthPct: Math.max(0, baseGrowth - 5),
      },
      { id: 'base', name: 'Base', ebitdaMarginPct: baseMargin, revenueGrowthPct: baseGrowth },
      { id: 'bull', name: 'High', ebitdaMarginPct: baseMargin + 5, revenueGrowthPct: baseGrowth + 5 },
    ];
  }, [ebitdaMarginPct, revenueGrowthPct]);

  const [results, setResults] = useState<
    { id: string; name: string; enterpriseValue: number; ebitdaMarginPct: number; revenueGrowthPct: number }[] | null
  >(null);

  const { isSignedIn, isLoaded } = useUser();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingCalculation, setPendingCalculation] = useState<'simple' | 'advanced' | null>(null);
  const [savedValuationId, setSavedValuationId] = useState<string | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [shouldAutoSave, setShouldAutoSave] = useState(false);

  // Local scenario state (before saving to database)
  type LocalScenario = {
    name: string;
    description?: string;
    minValue: number;
    maxValue: number;
  };
  const [localScenarios, setLocalScenarios] = useState<LocalScenario[]>([]);

  // Business information fields
  const [companyName, setCompanyName] = useState<string>('');
  const [companyWebsite, setCompanyWebsite] = useState<string>('');
  const [companyPhone, setCompanyPhone] = useState<string>('');
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>('+1');

  // Restore form data from sessionStorage on mount (after login redirect)
  React.useEffect(() => {
    const savedData = sessionStorage.getItem('valuation_form_data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.companyName) setCompanyName(data.companyName);
        if (data.companyWebsite) setCompanyWebsite(data.companyWebsite);
        if (data.companyPhone) {
          // Parse phone number to extract country code if present
          const phoneMatch = data.companyPhone.match(/^(\+\d{1,4})\s*(.*)$/);
          if (phoneMatch) {
            setPhoneCountryCode(phoneMatch[1]);
            setCompanyPhone(phoneMatch[2]);
          } else {
            setCompanyPhone(data.companyPhone);
          }
        }
        if (data.phoneCountryCode) setPhoneCountryCode(data.phoneCountryCode);
        if (data.industry) setIndustry(data.industry);
        if (data.country) setCountry(data.country);
        if (data.lastYearRevenue) setLastYearRevenue(data.lastYearRevenue);
        if (data.ebitdaMarginPct) setEbitdaMarginPct(data.ebitdaMarginPct);
        if (data.revenueGrowthPct) setRevenueGrowthPct(data.revenueGrowthPct);
        if (data.activeTab) setActiveTab(data.activeTab);
        if (data.step !== undefined) setStep(data.step);
        if (data.pendingCalculation) setPendingCalculation(data.pendingCalculation);
        // Restore advanced form data
        if (data.advState) setAdvState(data.advState);

        // Clear the saved data after restoring
        sessionStorage.removeItem('valuation_form_data');
      } catch (error) {
        console.error('Failed to restore form data:', error);
      }
    }
  }, []);

  // Effect to trigger calculation after user logs in
  React.useEffect(() => {
    if (isLoaded && isSignedIn && pendingCalculation) {
      setShowAuthDialog(false);
      // Small delay to ensure the dialog is closed and state is updated
      const timer = setTimeout(() => {
        if (pendingCalculation === 'simple') {
          performSimpleCalculation(true); // Pass true to indicate auto-save
        } else if (pendingCalculation === 'advanced') {
          performAdvancedCalculation(true); // Pass true to indicate auto-save
        }
        setPendingCalculation(null);
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, pendingCalculation]);

  // Effect to auto-save valuation when results are ready
  // Wait for both results AND localScenarios to be ready before auto-saving
  // The localScenarios are calculated by another useEffect that depends on results
  React.useEffect(() => {
    if (shouldAutoSave && results && results.length > 0 && isSignedIn && !isSaving && localScenarios.length > 0) {
      setShouldAutoSave(false); // Reset flag
      handleSaveValuation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoSave, results, isSignedIn, isSaving, localScenarios]);

  const performSimpleCalculation = (autoSave: boolean = false) => {
    const revenue0 = parseFloat(lastYearRevenue || '0');
    if (!industry || !country || !(revenue0 > 0)) {
      setResults(null);
      return;
    }

    setResults(null);
    setIsCalculating(true);
    setStep(4);

    setTimeout(() => {
      // Calculate all three scenarios using helper function
      const computed = scenarios.map((s) => ({
        id: s.id,
        name: s.name,
        enterpriseValue: calculateSimpleScenario({
          industry,
          country,
          baseRevenue: revenue0,
          revenueGrowthPct: s.revenueGrowthPct,
          ebitdaMarginPct: s.ebitdaMarginPct,
          deRatio: 0, // Simple valuation assumes no debt
        }),
        ebitdaMarginPct: s.ebitdaMarginPct,
        revenueGrowthPct: s.revenueGrowthPct,
      }));

      // Recompute base case to set store to base case values for graphs and saving
      const baseScenario = scenarios.find((s) => s.id === 'base');
      if (baseScenario) {
        calculateSimpleScenario({
          industry,
          country,
          baseRevenue: revenue0,
          revenueGrowthPct: baseScenario.revenueGrowthPct,
          ebitdaMarginPct: baseScenario.ebitdaMarginPct,
          deRatio: 0,
        });
      }

      // Use calculatedFinancials.enterpriseValue as truth source for base case
      const baseEV = useModelStore.getState().calculatedFinancials.enterpriseValue || 0;
      const updatedComputed = computed.map((result) => {
        if (result.id === 'base') {
          return { ...result, enterpriseValue: baseEV };
        }
        return result;
      });

      setResults(updatedComputed);
      setIsCalculating(false);

      // Set flag to auto-save if triggered after login
      if (autoSave && isSignedIn) {
        console.log('Setting shouldAutoSave flag to true', { autoSave, isSignedIn });
        setShouldAutoSave(true);
      }
    }, 3000);
  };

  // Calculate sensitivity ranges for football field chart using proper model manipulation
  // This effect runs after results are calculated to compute sensitivity scenarios
  React.useEffect(() => {
    if (!results || results.length === 0) {
      setLocalScenarios([]);
      return;
    }

    const baseScenario = results.find((r) => r.id === 'base');
    if (!baseScenario) {
      setLocalScenarios([]);
      return;
    }

    const revenue0 = parseFloat(lastYearRevenue || '0');
    const deRatio = activeTab === 'simple' ? 0 : parseFloat((advState.deRatio || '0').replace(',', '.'));

    // Calculate all sensitivities using helper function
    const baseParams: SimpleScenarioParams = {
      industry,
      country,
      baseRevenue: revenue0,
      revenueGrowthPct: baseScenario.revenueGrowthPct,
      ebitdaMarginPct: baseScenario.ebitdaMarginPct,
      deRatio,
    };

    const sensitivityScenarios = calculateAllSensitivities(baseParams);
    setLocalScenarios(sensitivityScenarios);

    // Restore base case after sensitivity calculations
    calculateSimpleScenario(baseParams);

    // Extract overall min and max from all sensitivity scenarios
    const allMinValues = sensitivityScenarios.map((s) => s.minValue).filter((v) => Number.isFinite(v) && v > 0);
    const allMaxValues = sensitivityScenarios.map((s) => s.maxValue).filter((v) => Number.isFinite(v) && v > 0);

    // Use calculatedFinancials.enterpriseValue as the truth source for base case
    const baseEV = calculatedFinancials.enterpriseValue || 0;
    const overallMin = allMinValues.length > 0 ? Math.min(...allMinValues) : baseEV;
    const overallMax = allMaxValues.length > 0 ? Math.max(...allMaxValues) : baseEV;

    // Check if we need to update results (prevent infinite loop)
    const bearResult = results.find((r) => r.id === 'bear');
    const bullResult = results.find((r) => r.id === 'bull');
    const baseResult = results.find((r) => r.id === 'base');
    const needsUpdate =
      bearResult?.enterpriseValue !== overallMin ||
      bullResult?.enterpriseValue !== overallMax ||
      baseResult?.enterpriseValue !== baseEV;

    // Update results with sensitivity-based low and high values, and base from calculatedFinancials
    if (needsUpdate) {
      setResults((prevResults) => {
        if (!prevResults) return prevResults;
        return prevResults.map((result) => {
          if (result.id === 'bear') {
            return { ...result, enterpriseValue: overallMin };
          } else if (result.id === 'bull') {
            return { ...result, enterpriseValue: overallMax };
          } else if (result.id === 'base') {
            // Always use calculatedFinancials as truth source for base case
            return { ...result, enterpriseValue: baseEV };
          }
          return result;
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, calculatedFinancials.enterpriseValue]);

  // Helper function to save scenarios after valuation is created
  const saveLocalScenarios = async (valuationId: string) => {
    if (localScenarios.length === 0) return;

    console.log('=== Saving Local Scenarios ===');
    console.log('Number of scenarios:', localScenarios.length);
    console.log('Scenarios to save:', localScenarios);

    try {
      // Save each local scenario to the database
      const scenarioPromises = localScenarios.map(async (scenario) => {
        const scenarioData: Omit<CreateScenarioInput, 'valuationId'> = {
          name: scenario.name,
          description: scenario.description,
          minValue: scenario.minValue,
          maxValue: scenario.maxValue,
        };

        console.log(`Saving scenario "${scenario.name}":`, {
          minValue: scenario.minValue,
          maxValue: scenario.maxValue,
          isValid: scenario.minValue < scenario.maxValue,
        });

        const response = await fetch(`/api/valuations/${valuationId}/scenarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...scenarioData, valuationId }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error(`Failed to save scenario: ${scenario.name}`, {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
            scenarioData,
          });
          return null;
        }

        return response.json();
      });

      await Promise.all(scenarioPromises);
    } catch (error) {
      console.error('Failed to save scenarios:', error);
      // Don't throw - scenarios are optional
    }
  };

  const performAdvancedCalculation = (autoSave: boolean = false) => {
    const revenue0 = parseFloat(lastYearRevenue || '0');
    if (!(revenue0 > 0) || advState.advYears < 2) {
      setResults(null);
      return;
    }

    setResults(null);
    setIsCalculating(true);
    setAdvState((prev) => ({ ...prev, advStep: 5 }));

    const industryData = betasStatic[industry as keyof typeof betasStatic];
    const countryData = countryRiskPremiumStatic[country as keyof typeof countryRiskPremiumStatic];

    const parsePerYearGrowth = (): number[] | null => {
      const arr = buildArrayFromList(Math.max(advState.advYears - 1, 1), advState.growthPerYearList);
      if (arr.length >= advState.advYears - 1) return arr.slice(0, advState.advYears - 1);
      return null;
    };

    // Function to setup the model with base case parameters
    const setupBaseCase = () => {
      // Optional: update risk profile if industry/country selected
      if (industry || country) {
        const unleveredBeta = industryData?.unleveredBeta ?? 0;
        const deRatio = parseFloat((advState.deRatio || '0').replace(',', '.'));
        const corporateTaxRate = countryData?.corporateTaxRate ?? 0.25;
        const leveredBeta = unleveredBeta * (1 + (1 - corporateTaxRate) * deRatio);

        updateRiskProfile({
          selectedIndustry: industry || null,
          selectedCountry: country || null,
          unleveredBeta: unleveredBeta,
          leveredBeta: leveredBeta,
          equityRiskPremium: countryData?.equityRiskPremium ?? 0,
          countryRiskPremium: countryData?.countryRiskPremium ?? 0,
          deRatio: deRatio,
          adjustedDefaultSpread: countryData?.adjDefaultSpread ?? 0,
        });
      }

      updatePeriods({ numberOfYears: advState.advYears, startYear: new Date().getFullYear() });

      // Revenue
      if (advState.advRevenueInputMethod === 'growth') {
        if (advState.growthMode === 'uniform') {
          const g = advState.advUniformGrowth.trim() !== '' ? parseFloat(advState.advUniformGrowth) : 0;
          updateRevenue({
            inputType: 'consolidated',
            consolidated: { inputMethod: 'growth', growthMethod: 'uniform', baseValue: revenue0, growthRate: g },
          });
        } else {
          const arr = parsePerYearGrowth();
          if (arr) {
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
          } else {
            updateRevenue({
              inputType: 'consolidated',
              consolidated: { inputMethod: 'growth', growthMethod: 'uniform', baseValue: revenue0, growthRate: 0 },
            });
          }
        }
      } else {
        const yearlyValues = buildArrayFromList(advState.advYears, advState.revenueDirectList);
        updateRevenue({ inputType: 'consolidated', consolidated: { inputMethod: 'direct', yearlyValues } });
      }

      // Terminal value with long-term growth
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
          const arr: number[] = [];
          for (let i = 0; i < advState.advYears; i++) {
            const ratio = advState.advYears === 1 ? 0 : i / (advState.advYears - 1);
            arr.push(startM + (targetM - startM) * ratio);
          }
          marginArr = arr.map((v) => Math.min(100, Math.max(0, v)));
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
        // Direct EBITDA -> set OpEx after we have revenue values
        updateOpEx({
          inputType: 'consolidated',
          consolidated: { inputMethod: 'direct', yearlyValues: Array(advState.advYears).fill(0) },
        });
      }

      // CAPEX
      if (advState.capexMethod === 'direct') {
        updateCapex({
          inputMethod: 'direct',
          yearlyValues: buildArrayFromList(advState.advYears, advState.capexPercentsList),
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
          yearlyValues: buildArrayFromList(advState.advYears, advState.nwcPercentsList),
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
          yearlyValues: buildArrayFromList(advState.advYears, advState.daPercentsList),
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
        const state = useModelStore.getState();
        const currentRevenue = state.calculatedFinancials.revenue;
        const targetEbitda = buildArrayFromList(advState.advYears, advState.ebitdaDirectList);
        const opexValues = currentRevenue.map((rev, i) => Math.max(0, (rev || 0) - (targetEbitda[i] || 0)));
        updateOpEx({ inputType: 'consolidated', consolidated: { inputMethod: 'direct', yearlyValues: opexValues } });
        calculateFinancials();
      }
    };

    setTimeout(() => {
      // Calculate base case
      setupBaseCase();
      const baseEV = useModelStore.getState().calculatedFinancials.enterpriseValue || 0;

      // For advanced mode, we'll use the sensitivity scenarios from the useEffect
      // For now, just create placeholder results that will be populated by the sensitivity analysis
      setResults([
        {
          id: 'bear',
          name: 'Low',
          enterpriseValue: baseEV, // Will be updated by sensitivity analysis
          ebitdaMarginPct:
            advState.ebitdaInputType === 'percent'
              ? advState.ebitdaPctMode === 'uniform'
                ? parseFloat(advState.advEbitdaUniformPct || '0')
                : parseFloat(advState.advEbitdaStart || '0')
              : 0,
          revenueGrowthPct:
            advState.advRevenueInputMethod === 'growth' && advState.growthMode === 'uniform'
              ? parseFloat(advState.advUniformGrowth || '0')
              : 0,
        },
        {
          id: 'base',
          name: 'Base',
          enterpriseValue: baseEV,
          ebitdaMarginPct:
            advState.ebitdaInputType === 'percent'
              ? advState.ebitdaPctMode === 'uniform'
                ? parseFloat(advState.advEbitdaUniformPct || '0')
                : parseFloat(advState.advEbitdaStart || '0')
              : 0,
          revenueGrowthPct:
            advState.advRevenueInputMethod === 'growth' && advState.growthMode === 'uniform'
              ? parseFloat(advState.advUniformGrowth || '0')
              : 0,
        },
        {
          id: 'bull',
          name: 'High',
          enterpriseValue: baseEV, // Will be updated by sensitivity analysis
          ebitdaMarginPct:
            advState.ebitdaInputType === 'percent'
              ? advState.ebitdaPctMode === 'uniform'
                ? parseFloat(advState.advEbitdaUniformPct || '0')
                : parseFloat(advState.advEbitdaStart || '0')
              : 0,
          revenueGrowthPct:
            advState.advRevenueInputMethod === 'growth' && advState.growthMode === 'uniform'
              ? parseFloat(advState.advUniformGrowth || '0')
              : 0,
        },
      ]);
      setIsCalculating(false);

      // Set flag to auto-save if triggered after login
      if (autoSave && isSignedIn) {
        setShouldAutoSave(true);
      }
    }, 3000);
  };

  const saveFormDataToSession = () => {
    const formData = {
      companyName,
      companyWebsite,
      companyPhone: companyPhone ? `${phoneCountryCode} ${companyPhone}` : '',
      phoneCountryCode,
      industry,
      country,
      lastYearRevenue,
      ebitdaMarginPct,
      revenueGrowthPct,
      activeTab,
      step,
      pendingCalculation,
      advState, // Save the entire advState object
    };
    sessionStorage.setItem('valuation_form_data', JSON.stringify(formData));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isLoaded) {
      return; // Wait for Clerk to load
    }

    if (!isSignedIn) {
      // Save form data before showing auth
      saveFormDataToSession();
      setPendingCalculation('simple');
      setShowAuthDialog(true);
      return;
    }

    // If already signed in, auto-save after calculation
    performSimpleCalculation(true);
  };

  const handleSubmitAdvanced = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isLoaded) {
      return; // Wait for Clerk to load
    }

    if (!isSignedIn) {
      // Save form data before showing auth
      saveFormDataToSession();
      setPendingCalculation('advanced');
      setShowAuthDialog(true);
      return;
    }

    // If already signed in, auto-save after calculation
    performAdvancedCalculation(true);
  };

  const handleSaveValuation = async () => {
    if (!isSignedIn || !results) return;

    setIsSaving(true);
    try {
      const defaultName = `Valuation - ${new Date().toLocaleDateString()}`;
      const valuationDisplayName = companyName.trim() || defaultName;
      const fullPhoneNumber = companyPhone.trim() ? `${phoneCountryCode} ${companyPhone}` : undefined;

      const payload: CreateValuationInput = {
        name: valuationDisplayName,
        modelData: model,
        resultsData: calculatedFinancials,
        enterpriseValue: calculatedFinancials.enterpriseValue,
        industry: industry || undefined,
        country: country || undefined,
        companyName: companyName.trim() || undefined,
        companyWebsite: companyWebsite.trim() || undefined,
        companyPhone: fullPhoneNumber,
      };

      let savedValuation;
      if (savedValuationId) {
        // Update existing valuation
        const response = await fetch(`/api/valuations/${savedValuationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update valuation');
        }

        savedValuation = await response.json();

        toast({
          title: 'Valuation updated',
          description: 'Your valuation has been updated successfully.',
        });
      } else {
        // Create new valuation
        const response = await fetch('/api/valuations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save valuation');
        }

        savedValuation = await response.json();
        setSavedValuationId(savedValuation.id);

        // Save local scenarios after valuation is created
        await saveLocalScenarios(savedValuation.id);

        // Show success dialog instead of toast
        setSuccessDialogOpen(true);
      }
    } catch (error) {
      console.error('Failed to save valuation:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to save valuation',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishReport = async () => {
    if (!savedValuationId) return;

    setIsPublishing(true);
    try {
      const response = await fetch(`/api/valuations/${savedValuationId}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to publish report');
      }

      const data = await response.json();

      toast({
        title: 'Report published!',
        description: 'Your report is now publicly accessible.',
      });

      // Open the report in a new tab
      if (data.shareToken) {
        window.open(`/reports/${data.shareToken}`, '_blank');
      }

      // Close the success dialog
      setSuccessDialogOpen(false);

      // Redirect to dashboard
      router.push('/dashboard/valuations');
    } catch (error) {
      console.error('Error publishing report:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish report',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      {/* Add a sentinel div for the header's sticky behavior */}
      <div id="nav-sentinel" className="absolute top-0 h-px w-full" />
      <Header user={headerUser} />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-2xl font-bold text-gray-900">Valuation</h1>
              <p className="mt-1 text-gray-600">Quick or advanced enterprise value estimate</p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'simple' | 'advanced')}>
            <TabsList>
              <TabsTrigger value="simple">Simple</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="simple">
              <SimpleValuationForm
                companyName={companyName}
                setCompanyName={setCompanyName}
                companyWebsite={companyWebsite}
                setCompanyWebsite={setCompanyWebsite}
                companyPhone={companyPhone}
                setCompanyPhone={setCompanyPhone}
                phoneCountryCode={phoneCountryCode}
                setPhoneCountryCode={setPhoneCountryCode}
                industry={industry}
                setIndustry={setIndustry}
                country={country}
                setCountry={setCountry}
                industries={industries}
                countries={countries}
                lastYearRevenue={lastYearRevenue}
                setLastYearRevenue={setLastYearRevenue}
                revenueGrowthPct={revenueGrowthPct}
                setRevenueGrowthPct={setRevenueGrowthPct}
                ebitdaMarginPct={ebitdaMarginPct}
                setEbitdaMarginPct={setEbitdaMarginPct}
                step={step}
                setStep={setStep}
                isCalculating={isCalculating}
                onSubmit={handleSubmit}
              />

              {isCalculating && <CalculationLoading />}

              {results && (
                <ValuationResultsDisplay
                  results={results}
                  model={model}
                  calculatedFinancials={calculatedFinancials}
                  localScenarios={localScenarios}
                  setLocalScenarios={setLocalScenarios}
                  savedValuationId={savedValuationId}
                  isSignedIn={isSignedIn}
                  isSaving={isSaving}
                  onSave={handleSaveValuation}
                  onNavigateToDashboard={() => router.push('/dashboard/valuations')}
                  showYears={5}
                  chartTitle="Revenue & EBITDA Margin Projection (5-Year)"
                />
              )}
            </TabsContent>

            <TabsContent value="advanced">
              <AdvancedValuationForm
                companyName={companyName}
                setCompanyName={setCompanyName}
                companyWebsite={companyWebsite}
                setCompanyWebsite={setCompanyWebsite}
                companyPhone={companyPhone}
                setCompanyPhone={setCompanyPhone}
                phoneCountryCode={phoneCountryCode}
                setPhoneCountryCode={setPhoneCountryCode}
                industry={industry}
                setIndustry={setIndustry}
                country={country}
                setCountry={setCountry}
                industries={industries}
                countries={countries}
                lastYearRevenue={lastYearRevenue}
                setLastYearRevenue={setLastYearRevenue}
                advState={advState}
                setAdvState={setAdvState}
                isCalculating={isCalculating}
                onSubmit={handleSubmitAdvanced}
              />

              {isCalculating && <CalculationLoading />}

              {results && (
                <ValuationResultsDisplay
                  results={results}
                  model={model}
                  calculatedFinancials={calculatedFinancials}
                  localScenarios={localScenarios}
                  setLocalScenarios={setLocalScenarios}
                  savedValuationId={savedValuationId}
                  isSignedIn={isSignedIn}
                  isSaving={isSaving}
                  onSave={handleSaveValuation}
                  onNavigateToDashboard={() => router.push('/dashboard/valuations')}
                  showYears={advState.advYears}
                  chartTitle={`Revenue & EBITDA Margin Projection (${advState.advYears}-Year)`}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Debug: Pretty print model and calculated financials */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-white border border-gray-200 rounded-lg">
            <div className="px-4 py-2 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Debug: Model & Calculations</h2>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium text-gray-700 mb-2">Model</div>
                <pre className="text-xs bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto max-h-96">
                  {JSON.stringify(model, null, 2)}
                </pre>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-700 mb-2">Calculated Financials</div>
                <pre className="text-xs bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto max-h-96">
                  {JSON.stringify(calculatedFinancials, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Auth Required Dialog */}
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Sign in to view your valuation</DialogTitle>
              <DialogDescription>
                To see your valuation results and save them for future reference, please sign in or create an account.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-4">
              <SignIn
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'shadow-none',
                  },
                }}
                routing="virtual"
                signUpFallbackRedirectUrl="/free-valuation"
                fallbackRedirectUrl="/free-valuation"
                forceRedirectUrl="/free-valuation"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <DialogTitle className="text-center text-2xl">Valuation Saved Successfully!</DialogTitle>
              <DialogDescription className="text-center">
                Your valuation has been saved to your dashboard. What would you like to do next?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              <Button onClick={() => router.push('/dashboard/valuations')} className="w-full" size="lg">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Go to Dashboard
              </Button>

              <Button
                onClick={handlePublishReport}
                disabled={isPublishing}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                {isPublishing ? 'Publishing...' : 'Publish & Share Report'}
              </Button>

              <div className="text-center">
                <button
                  onClick={() => setSuccessDialogOpen(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Continue editing
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Tip:</strong> Publishing your report creates a shareable public link that you can send to
                investors, advisors, or team members. The report is read-only and professional-looking.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
