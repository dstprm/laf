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
import { PhoneCountryCodeSelect } from '@/components/shared/phone-country-code-select';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import Header from '@/components/home/header/header';
import { useUserInfo } from '@/hooks/useUserInfo';
import { RevenueEbitdaChart } from '@/components/dashboard/valuations/revenue-ebitda-chart';
import { FootballFieldChart } from '@/components/dashboard/valuations/football-field-chart';
import { ScenarioList } from '@/components/dashboard/valuations/scenario-list';
import { ScenarioListLocal } from '@/components/dashboard/valuations/scenario-list-local';
import type { CreateValuationInput, CreateScenarioInput } from '@/lib/valuation.types';

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

  const [industry, setIndustry] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [lastYearRevenue, setLastYearRevenue] = useState<string>('');
  const [ebitdaMarginPct, setEbitdaMarginPct] = useState<string>('');
  const [revenueGrowthPct, setRevenueGrowthPct] = useState<string>('');
  const [step, setStep] = useState<number>(1); // 1: revenue, 2: growth, 3: margin
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'simple' | 'advanced'>('simple');

  // Advanced inputs
  const [advYears, setAdvYears] = useState<number>(5);
  const [growthMode, setGrowthMode] = useState<'uniform' | 'perYear'>('uniform');
  const [advUniformGrowth, setAdvUniformGrowth] = useState<string>('');
  // deprecated CSV state kept earlier; replaced by per-year inputs
  const [advEbitdaStart, setAdvEbitdaStart] = useState<string>('');
  const [advEbitdaTarget, setAdvEbitdaTarget] = useState<string>('');
  const [advCapexPct, setAdvCapexPct] = useState<string>('');
  const [advNwcPct, setAdvNwcPct] = useState<string>('');
  const [advDaPct, setAdvDaPct] = useState<string>('');
  // Advanced sequential UI state
  // EBITDA mode: per year list, or ramp (start->target)
  // deprecated CSV state kept earlier; replaced by per-year inputs
  const [capexMethod, setCapexMethod] = useState<'percentOfRevenue' | 'direct'>('percentOfRevenue');
  // deprecated CSV state kept earlier; replaced by per-year inputs
  const [nwcMethod, setNwcMethod] = useState<'percentOfRevenue' | 'direct'>('percentOfRevenue');
  // deprecated CSV state kept earlier; replaced by per-year inputs
  const [daMethod, setDaMethod] = useState<'percentOfRevenue' | 'direct'>('percentOfRevenue');
  // deprecated CSV state kept earlier; replaced by per-year inputs
  const [taxesMethod, setTaxesMethod] = useState<'percentOfEBIT' | 'direct'>('percentOfEBIT');
  const [taxesPct, setTaxesPct] = useState<string>('');
  // deprecated CSV state kept earlier; replaced by per-year inputs
  // New advanced sequential flow and flexible options
  const [advStep, setAdvStep] = useState<number>(1);
  const [advRevenueInputMethod, setAdvRevenueInputMethod] = useState<'growth' | 'direct'>('growth');
  // deprecated CSV state kept earlier; replaced by per-year inputs
  const [advLTG, setAdvLTG] = useState<string>('');
  const [ebitdaInputType, setEbitdaInputType] = useState<'percent' | 'direct'>('percent');
  const [ebitdaPctMode, setEbitdaPctMode] = useState<'uniform' | 'perYear' | 'ramp'>('ramp');
  const [advEbitdaUniformPct, setAdvEbitdaUniformPct] = useState<string>('');
  const [capexPercentMode, setCapexPercentMode] = useState<'uniform' | 'individual'>('uniform');
  // deprecated CSV state kept earlier; replaced by per-year inputs
  const [nwcPercentMode, setNwcPercentMode] = useState<'uniform' | 'individual'>('uniform');
  // deprecated CSV state kept earlier; replaced by per-year inputs
  const [daPercentMode, setDaPercentMode] = useState<'uniform' | 'individual'>('uniform');
  // deprecated CSV state kept earlier; replaced by per-year inputs

  // Per-year arrays (UI-friendly alternative to CSV)
  const [revenueDirectList, setRevenueDirectList] = useState<string[]>(Array.from({ length: advYears }, () => ''));
  const [growthPerYearList, setGrowthPerYearList] = useState<string[]>(
    Array.from({ length: Math.max(advYears - 1, 1) }, () => ''),
  );
  const [ebitdaPercentPerYearList, setEbitdaPercentPerYearList] = useState<string[]>(
    Array.from({ length: advYears }, () => ''),
  );
  const [ebitdaDirectList, setEbitdaDirectList] = useState<string[]>(Array.from({ length: advYears }, () => ''));
  const [capexPercentsList, setCapexPercentsList] = useState<string[]>(Array.from({ length: advYears }, () => ''));
  const [nwcPercentsList, setNwcPercentsList] = useState<string[]>(Array.from({ length: advYears }, () => ''));
  const [daPercentsList, setDaPercentsList] = useState<string[]>(Array.from({ length: advYears }, () => ''));
  const [taxesDirectList, setTaxesDirectList] = useState<string[]>(Array.from({ length: advYears }, () => ''));
  const [capexDirectList, setCapexDirectList] = useState<string[]>(Array.from({ length: advYears }, () => ''));
  const [nwcDirectList, setNwcDirectList] = useState<string[]>(Array.from({ length: advYears }, () => ''));
  const [daDirectList, setDaDirectList] = useState<string[]>(Array.from({ length: advYears }, () => ''));

  React.useEffect(() => {
    setRevenueDirectList((prev) => Array.from({ length: advYears }, (_, i) => prev[i] ?? ''));
    setGrowthPerYearList((prev) => Array.from({ length: Math.max(advYears - 1, 1) }, (_, i) => prev[i] ?? ''));
    setEbitdaPercentPerYearList((prev) => Array.from({ length: advYears }, (_, i) => prev[i] ?? ''));
    setEbitdaDirectList((prev) => Array.from({ length: advYears }, (_, i) => prev[i] ?? ''));
    setCapexPercentsList((prev) => Array.from({ length: advYears }, (_, i) => prev[i] ?? ''));
    setNwcPercentsList((prev) => Array.from({ length: advYears }, (_, i) => prev[i] ?? ''));
    setDaPercentsList((prev) => Array.from({ length: advYears }, (_, i) => prev[i] ?? ''));
    setTaxesDirectList((prev) => Array.from({ length: advYears }, (_, i) => prev[i] ?? ''));
    setCapexDirectList((prev) => Array.from({ length: advYears }, (_, i) => prev[i] ?? ''));
    setNwcDirectList((prev) => Array.from({ length: advYears }, (_, i) => prev[i] ?? ''));
    setDaDirectList((prev) => Array.from({ length: advYears }, (_, i) => prev[i] ?? ''));
  }, [advYears]);

  // Helpers to build arrays/maps from per-year lists
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
  // intentionally not used directly after simplifying compute path

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
        // Restore advanced form data
        if (data.advYears) setAdvYears(data.advYears);
        if (data.growthMode) setGrowthMode(data.growthMode);
        if (data.advUniformGrowth) setAdvUniformGrowth(data.advUniformGrowth);
        if (data.advEbitdaStart) setAdvEbitdaStart(data.advEbitdaStart);
        if (data.advEbitdaTarget) setAdvEbitdaTarget(data.advEbitdaTarget);
        if (data.advCapexPct) setAdvCapexPct(data.advCapexPct);
        if (data.advNwcPct) setAdvNwcPct(data.advNwcPct);
        if (data.advDaPct) setAdvDaPct(data.advDaPct);
        if (data.taxesPct) setTaxesPct(data.taxesPct);
        if (data.advLTG) setAdvLTG(data.advLTG);
        if (data.advEbitdaUniformPct) setAdvEbitdaUniformPct(data.advEbitdaUniformPct);
        if (data.advStep !== undefined) setAdvStep(data.advStep);
        if (data.pendingCalculation) setPendingCalculation(data.pendingCalculation);
        if (data.advRevenueInputMethod) setAdvRevenueInputMethod(data.advRevenueInputMethod);
        if (data.ebitdaInputType) setEbitdaInputType(data.ebitdaInputType);
        if (data.ebitdaPctMode) setEbitdaPctMode(data.ebitdaPctMode);
        if (data.capexMethod) setCapexMethod(data.capexMethod);
        if (data.capexPercentMode) setCapexPercentMode(data.capexPercentMode);
        if (data.nwcMethod) setNwcMethod(data.nwcMethod);
        if (data.nwcPercentMode) setNwcPercentMode(data.nwcPercentMode);
        if (data.daMethod) setDaMethod(data.daMethod);
        if (data.daPercentMode) setDaPercentMode(data.daPercentMode);
        if (data.taxesMethod) setTaxesMethod(data.taxesMethod);
        // Restore arrays
        if (data.revenueDirectList) setRevenueDirectList(data.revenueDirectList);
        if (data.growthPerYearList) setGrowthPerYearList(data.growthPerYearList);
        if (data.ebitdaPercentPerYearList) setEbitdaPercentPerYearList(data.ebitdaPercentPerYearList);
        if (data.ebitdaDirectList) setEbitdaDirectList(data.ebitdaDirectList);
        if (data.capexPercentsList) setCapexPercentsList(data.capexPercentsList);
        if (data.nwcPercentsList) setNwcPercentsList(data.nwcPercentsList);
        if (data.daPercentsList) setDaPercentsList(data.daPercentsList);
        if (data.taxesDirectList) setTaxesDirectList(data.taxesDirectList);
        if (data.capexDirectList) setCapexDirectList(data.capexDirectList);
        if (data.nwcDirectList) setNwcDirectList(data.nwcDirectList);
        if (data.daDirectList) setDaDirectList(data.daDirectList);

        // Clear the saved data after restoring
        sessionStorage.removeItem('valuation_form_data');
      } catch (error) {
        console.error('Failed to restore form data:', error);
      }
    }
  }, []);

  // Effect to trigger calculation after user logs in
  React.useEffect(() => {
    if (isSignedIn && pendingCalculation) {
      setShowAuthDialog(false);
      if (pendingCalculation === 'simple') {
        performSimpleCalculation();
      } else if (pendingCalculation === 'advanced') {
        performAdvancedCalculation();
      }
      setPendingCalculation(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, pendingCalculation]);

  const performSimpleCalculation = () => {
    const revenue0 = parseFloat(lastYearRevenue || '0');
    if (!industry || !country || !(revenue0 > 0)) {
      setResults(null);
      return;
    }

    setResults(null);
    setIsCalculating(true);
    setStep(4);

    const industryData = betasStatic[industry as keyof typeof betasStatic];
    const countryData = countryRiskPremiumStatic[country as keyof typeof countryRiskPremiumStatic];

    const computeEVForScenario = (scenario: Scenario): number => {
      updateRiskProfile({
        selectedIndustry: industry,
        selectedCountry: country,
        unleveredBeta: industryData?.unleveredBeta ?? 0,
        leveredBeta: industryData
          ? industryData.unleveredBeta * (1 + (1 - (countryData?.corporateTaxRate ?? 0)) * (industryData.dERatio ?? 0))
          : 0,
        equityRiskPremium: countryData?.equityRiskPremium ?? 0,
        countryRiskPremium: countryData?.countryRiskPremium ?? 0,
        deRatio: industryData?.dERatio ?? 0,
        adjustedDefaultSpread: countryData?.adjDefaultSpread ?? 0,
        companySpread: model.riskProfile?.companySpread ?? 0.05,
        riskFreeRate: model.riskProfile?.riskFreeRate ?? 0.0444,
        corporateTaxRate: countryData?.corporateTaxRate ?? model.riskProfile?.corporateTaxRate ?? 0.25,
      });

      updateRevenue({
        inputType: 'consolidated',
        consolidated: {
          inputMethod: 'growth',
          growthMethod: 'uniform',
          baseValue: revenue0,
          growthRate: scenario.revenueGrowthPct,
        },
      });

      const targetOpexPercentOfRevenue = Math.max(0, 100 - scenario.ebitdaMarginPct);
      updateOpEx({
        inputType: 'consolidated',
        consolidated: {
          inputMethod: 'percentOfRevenue',
          percentMethod: 'uniform',
          percentOfRevenue: targetOpexPercentOfRevenue,
        },
      });

      updateTaxes({
        inputMethod: 'percentOfEBIT',
        percentMethod: 'uniform',
        percentOfEBIT: (countryData?.corporateTaxRate ?? 0.25) * 100,
      });

      updateTerminalValue({ method: 'multiples', multipleMetric: 'ebitda', multipleValue: 10 });

      calculateFinancials();
      const ev = useModelStore.getState().calculatedFinancials.enterpriseValue || 0;
      return ev;
    };

    setTimeout(() => {
      const computed = scenarios.map((s) => ({
        id: s.id,
        name: s.name,
        enterpriseValue: computeEVForScenario(s),
        ebitdaMarginPct: s.ebitdaMarginPct,
        revenueGrowthPct: s.revenueGrowthPct,
      }));

      // Recompute base case to set store to base case values for graphs and saving
      const baseScenario = scenarios.find((s) => s.id === 'base');
      if (baseScenario) {
        computeEVForScenario(baseScenario);
      }

      setResults(computed);
      setIsCalculating(false);
    }, 3000);
  };

  const currency = (v: number) =>
    v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

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
    const industryData = betasStatic[industry as keyof typeof betasStatic];
    const countryData = countryRiskPremiumStatic[country as keyof typeof countryRiskPremiumStatic];

    // Helper to calculate EV with modified parameters using actual model store
    const calculateSensitivityEV = (growthDelta: number, marginDelta: number, waccDelta: number = 0): number => {
      // Update risk profile with WACC adjustment
      updateRiskProfile({
        selectedIndustry: industry,
        selectedCountry: country,
        unleveredBeta: industryData?.unleveredBeta ?? 0,
        leveredBeta: industryData
          ? industryData.unleveredBeta * (1 + (1 - (countryData?.corporateTaxRate ?? 0)) * (industryData.dERatio ?? 0))
          : 0,
        equityRiskPremium: countryData?.equityRiskPremium ?? 0,
        countryRiskPremium: countryData?.countryRiskPremium ?? 0,
        deRatio: industryData?.dERatio ?? 0,
        adjustedDefaultSpread: countryData?.adjDefaultSpread ?? 0,
        companySpread: (model.riskProfile?.companySpread ?? 0.05) + waccDelta,
        riskFreeRate: model.riskProfile?.riskFreeRate ?? 0.0444,
        corporateTaxRate: countryData?.corporateTaxRate ?? model.riskProfile?.corporateTaxRate ?? 0.25,
      });

      // Update revenue with growth adjustment
      const adjustedGrowth = baseScenario.revenueGrowthPct + growthDelta;
      updateRevenue({
        inputType: 'consolidated',
        consolidated: {
          inputMethod: 'growth',
          growthMethod: 'uniform',
          baseValue: revenue0,
          growthRate: adjustedGrowth,
        },
      });

      // Update OpEx with margin adjustment
      const adjustedMargin = Math.max(0, Math.min(100, baseScenario.ebitdaMarginPct + marginDelta));
      const targetOpexPercentOfRevenue = Math.max(0, 100 - adjustedMargin);
      updateOpEx({
        inputType: 'consolidated',
        consolidated: {
          inputMethod: 'percentOfRevenue',
          percentMethod: 'uniform',
          percentOfRevenue: targetOpexPercentOfRevenue,
        },
      });

      updateTaxes({
        inputMethod: 'percentOfEBIT',
        percentMethod: 'uniform',
        percentOfEBIT: (countryData?.corporateTaxRate ?? 0.25) * 100,
      });

      updateTerminalValue({ method: 'multiples', multipleMetric: 'ebitda', multipleValue: 10 });

      calculateFinancials();
      return useModelStore.getState().calculatedFinancials.enterpriseValue || 0;
    };

    // Calculate each sensitivity scenario
    const waccMin = calculateSensitivityEV(0, 0, 0.02);
    const waccMax = calculateSensitivityEV(0, 0, -0.02);

    const marginMin = calculateSensitivityEV(0, -5, 0);
    const marginMax = calculateSensitivityEV(0, 5, 0);

    const growthMin = calculateSensitivityEV(-5, 0, 0);
    const growthMax = calculateSensitivityEV(5, 0, 0);

    // Restore base case after sensitivity calculations
    const baseScenarioData = scenarios.find((s) => s.id === 'base');
    if (baseScenarioData) {
      updateRiskProfile({
        selectedIndustry: industry,
        selectedCountry: country,
        unleveredBeta: industryData?.unleveredBeta ?? 0,
        leveredBeta: industryData
          ? industryData.unleveredBeta * (1 + (1 - (countryData?.corporateTaxRate ?? 0)) * (industryData.dERatio ?? 0))
          : 0,
        equityRiskPremium: countryData?.equityRiskPremium ?? 0,
        countryRiskPremium: countryData?.countryRiskPremium ?? 0,
        deRatio: industryData?.dERatio ?? 0,
        adjustedDefaultSpread: countryData?.adjDefaultSpread ?? 0,
        companySpread: model.riskProfile?.companySpread ?? 0.05,
        riskFreeRate: model.riskProfile?.riskFreeRate ?? 0.0444,
        corporateTaxRate: countryData?.corporateTaxRate ?? model.riskProfile?.corporateTaxRate ?? 0.25,
      });

      updateRevenue({
        inputType: 'consolidated',
        consolidated: {
          inputMethod: 'growth',
          growthMethod: 'uniform',
          baseValue: revenue0,
          growthRate: baseScenario.revenueGrowthPct,
        },
      });

      const targetOpexPercentOfRevenue = Math.max(0, 100 - baseScenario.ebitdaMarginPct);
      updateOpEx({
        inputType: 'consolidated',
        consolidated: {
          inputMethod: 'percentOfRevenue',
          percentMethod: 'uniform',
          percentOfRevenue: targetOpexPercentOfRevenue,
        },
      });

      calculateFinancials();
    }

    const sensitivityScenarios: LocalScenario[] = [
      {
        name: 'Revenue Growth (±5%)',
        description: 'Sensitivity analysis: Revenue Growth (±5%)',
        minValue: growthMin,
        maxValue: growthMax,
      },
      {
        name: 'EBITDA Margin (±5%)',
        description: 'Sensitivity analysis: EBITDA Margin (±5%)',
        minValue: marginMin,
        maxValue: marginMax,
      },
      {
        name: 'WACC Sensitivity (±2%)',
        description: 'Sensitivity analysis: WACC Sensitivity (±2%)',
        minValue: waccMin,
        maxValue: waccMax,
      },
    ];

    setLocalScenarios(sensitivityScenarios);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  // Helper function to save scenarios after valuation is created
  const saveLocalScenarios = async (valuationId: string) => {
    if (localScenarios.length === 0) return;

    try {
      // Save each local scenario to the database
      const scenarioPromises = localScenarios.map(async (scenario) => {
        const scenarioData: Omit<CreateScenarioInput, 'valuationId'> = {
          name: scenario.name,
          description: scenario.description,
          minValue: scenario.minValue,
          maxValue: scenario.maxValue,
        };

        const response = await fetch(`/api/valuations/${valuationId}/scenarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...scenarioData, valuationId }),
        });

        if (!response.ok) {
          console.error(`Failed to save scenario: ${scenario.name}`);
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

  const performAdvancedCalculation = () => {
    const revenue0 = parseFloat(lastYearRevenue || '0');
    if (!(revenue0 > 0) || advYears < 2) {
      setResults(null);
      return;
    }

    setResults(null);
    setIsCalculating(true);
    setAdvStep(5);

    const industryData = betasStatic[industry as keyof typeof betasStatic];
    const countryData = countryRiskPremiumStatic[country as keyof typeof countryRiskPremiumStatic];

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

    const parsePerYearGrowth = (): number[] | null => {
      const arr = buildArrayFromList(Math.max(advYears - 1, 1), growthPerYearList);
      if (arr.length >= advYears - 1) return arr.slice(0, advYears - 1);
      return null;
    };

    const computeEVForScenarioAdvanced = (growthDelta: number, marginDelta: number): number => {
      // Optional: update risk profile if industry/country selected
      if (industry || country) {
        updateRiskProfile({
          selectedIndustry: industry || null,
          selectedCountry: country || null,
          unleveredBeta: industryData?.unleveredBeta ?? 0,
          leveredBeta: industryData
            ? industryData.unleveredBeta *
              (1 + (1 - (countryData?.corporateTaxRate ?? 0)) * (industryData.dERatio ?? 0))
            : 0,
          equityRiskPremium: countryData?.equityRiskPremium ?? 0,
          countryRiskPremium: countryData?.countryRiskPremium ?? 0,
          deRatio: industryData?.dERatio ?? 0,
          adjustedDefaultSpread: countryData?.adjDefaultSpread ?? 0,
        });
      }

      updatePeriods({ numberOfYears: advYears, startYear: new Date().getFullYear() });

      // Revenue
      if (advRevenueInputMethod === 'growth') {
        if (growthMode === 'uniform') {
          const g = (advUniformGrowth.trim() !== '' ? parseFloat(advUniformGrowth) : 0) + growthDelta;
          updateRevenue({
            inputType: 'consolidated',
            consolidated: { inputMethod: 'growth', growthMethod: 'uniform', baseValue: revenue0, growthRate: g },
          });
        } else {
          const arr = parsePerYearGrowth();
          if (arr) {
            const individualGrowthRates: { [k: number]: number } = {};
            for (let i = 1; i < advYears; i++) {
              individualGrowthRates[i] = (arr[i - 1] ?? 0) + growthDelta;
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
              consolidated: {
                inputMethod: 'growth',
                growthMethod: 'uniform',
                baseValue: revenue0,
                growthRate: growthDelta,
              },
            });
          }
        }
      } else {
        const yearlyValues = buildArrayFromList(advYears, revenueDirectList);
        updateRevenue({ inputType: 'consolidated', consolidated: { inputMethod: 'direct', yearlyValues } });
      }

      // Terminal value with long-term growth
      const ltg = advLTG.trim() !== '' ? parseFloat(advLTG) : 0;
      updateTerminalValue({ method: 'growth', growthRate: ltg });

      // EBITDA via OpEx
      if (ebitdaInputType === 'percent') {
        let marginArr: number[] = [];
        if (ebitdaPctMode === 'uniform') {
          const m = (advEbitdaUniformPct.trim() !== '' ? parseFloat(advEbitdaUniformPct) : 0) + marginDelta;
          marginArr = Array.from({ length: advYears }, () => m);
        } else if (ebitdaPctMode === 'perYear') {
          const parts = buildArrayFromList(advYears, ebitdaPercentPerYearList);
          marginArr = Array.from({ length: advYears }, (_, i) =>
            i < parts.length ? (parts[i] || 0) + marginDelta : (parts[parts.length - 1] || 0) + marginDelta,
          );
        } else {
          const startM = parseFloat(advEbitdaStart || '0');
          const targetM = parseFloat(advEbitdaTarget || advEbitdaStart || '0');
          marginArr = buildMarginArray(startM, targetM, advYears, marginDelta);
        }
        const individualPercents: { [k: number]: number } = {};
        for (let i = 0; i < advYears; i++) {
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
          consolidated: { inputMethod: 'direct', yearlyValues: Array(advYears).fill(0) },
        });
      }

      // CAPEX
      if (capexMethod === 'direct') {
        updateCapex({ inputMethod: 'direct', yearlyValues: buildArrayFromList(advYears, capexPercentsList) });
      } else if (capexPercentMode === 'uniform') {
        updateCapex({
          inputMethod: 'percentOfRevenue',
          percentMethod: 'uniform',
          percentOfRevenue: parseFloat(advCapexPct || '0'),
        });
      } else {
        updateCapex({
          inputMethod: 'percentOfRevenue',
          percentMethod: 'individual',
          individualPercents: buildIndividualPercentsMap(advYears, capexPercentsList),
        });
      }

      // NWC
      if (nwcMethod === 'direct') {
        updateNetWorkingCapital({ inputMethod: 'direct', yearlyValues: buildArrayFromList(advYears, nwcPercentsList) });
      } else if (nwcPercentMode === 'uniform') {
        updateNetWorkingCapital({
          inputMethod: 'percentOfRevenue',
          percentMethod: 'uniform',
          percentOfRevenue: parseFloat(advNwcPct || '0'),
        });
      } else {
        updateNetWorkingCapital({
          inputMethod: 'percentOfRevenue',
          percentMethod: 'individual',
          individualPercents: buildIndividualPercentsMap(advYears, nwcPercentsList),
        });
      }

      // D&A
      if (daMethod === 'direct') {
        updateDA({ inputMethod: 'direct', yearlyValues: buildArrayFromList(advYears, daPercentsList) });
      } else if (daPercentMode === 'uniform') {
        updateDA({
          inputMethod: 'percentOfRevenue',
          percentMethod: 'uniform',
          percentOfRevenue: parseFloat(advDaPct || '0'),
        });
      } else {
        updateDA({
          inputMethod: 'percentOfRevenue',
          percentMethod: 'individual',
          individualPercents: buildIndividualPercentsMap(advYears, daPercentsList),
        });
      }

      // Taxes
      if (taxesMethod === 'direct') {
        updateTaxes({ inputMethod: 'direct', yearlyValues: buildArrayFromList(advYears, taxesDirectList) });
      } else {
        const taxPct = taxesPct.trim() !== '' ? parseFloat(taxesPct) : 0;
        updateTaxes({ inputMethod: 'percentOfEBIT', percentMethod: 'uniform', percentOfEBIT: taxPct });
      }

      calculateFinancials();

      // Adjust OpEx if using direct EBITDA
      if (ebitdaInputType === 'direct') {
        const state = useModelStore.getState();
        const currentRevenue = state.calculatedFinancials.revenue;
        const targetEbitda = buildArrayFromList(advYears, ebitdaDirectList);
        const opexValues = currentRevenue.map((rev, i) => Math.max(0, (rev || 0) - (targetEbitda[i] || 0)));
        updateOpEx({ inputType: 'consolidated', consolidated: { inputMethod: 'direct', yearlyValues: opexValues } });
        calculateFinancials();
      }

      return useModelStore.getState().calculatedFinancials.enterpriseValue || 0;
    };

    setTimeout(() => {
      const baseEV = computeEVForScenarioAdvanced(0, 0);
      const lowEV = computeEVForScenarioAdvanced(-5, -5);
      const highEV = computeEVForScenarioAdvanced(5, 5);

      // Recompute base case to set store to base case values for graphs and saving
      computeEVForScenarioAdvanced(0, 0);

      setResults([
        {
          id: 'bear',
          name: 'Low',
          enterpriseValue: lowEV,
          ebitdaMarginPct:
            ebitdaInputType === 'percent'
              ? ebitdaPctMode === 'uniform'
                ? Math.max(0, (parseFloat(advEbitdaUniformPct || '0') || 0) - 5)
                : Math.max(0, parseFloat(advEbitdaStart || '0') - 5)
              : 0,
          revenueGrowthPct:
            advRevenueInputMethod === 'growth' && growthMode === 'uniform'
              ? (parseFloat(advUniformGrowth || '0') || 0) - 5
              : 0,
        },
        {
          id: 'base',
          name: 'Base',
          enterpriseValue: baseEV,
          ebitdaMarginPct:
            ebitdaInputType === 'percent'
              ? ebitdaPctMode === 'uniform'
                ? parseFloat(advEbitdaUniformPct || '0')
                : parseFloat(advEbitdaStart || '0')
              : 0,
          revenueGrowthPct:
            advRevenueInputMethod === 'growth' && growthMode === 'uniform' ? parseFloat(advUniformGrowth || '0') : 0,
        },
        {
          id: 'bull',
          name: 'High',
          enterpriseValue: highEV,
          ebitdaMarginPct:
            ebitdaInputType === 'percent'
              ? ebitdaPctMode === 'uniform'
                ? (parseFloat(advEbitdaUniformPct || '0') || 0) + 5
                : parseFloat(advEbitdaStart || '0') + 5
              : 0,
          revenueGrowthPct:
            advRevenueInputMethod === 'growth' && growthMode === 'uniform'
              ? (parseFloat(advUniformGrowth || '0') || 0) + 5
              : 0,
        },
      ]);
      setIsCalculating(false);
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
      advYears,
      growthMode,
      advUniformGrowth,
      advEbitdaStart,
      advEbitdaTarget,
      advCapexPct,
      advNwcPct,
      advDaPct,
      taxesPct,
      advLTG,
      advEbitdaUniformPct,
      advStep,
      pendingCalculation,
      advRevenueInputMethod,
      ebitdaInputType,
      ebitdaPctMode,
      capexMethod,
      capexPercentMode,
      nwcMethod,
      nwcPercentMode,
      daMethod,
      daPercentMode,
      taxesMethod,
      // Save arrays
      revenueDirectList,
      growthPerYearList,
      ebitdaPercentPerYearList,
      ebitdaDirectList,
      capexPercentsList,
      nwcPercentsList,
      daPercentsList,
      taxesDirectList,
      capexDirectList,
      nwcDirectList,
      daDirectList,
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

    performSimpleCalculation();
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

    performAdvancedCalculation();
  };

  const handleSaveValuation = async () => {
    if (!isSignedIn || !results) return;

    setIsSaving(true);
    try {
      const baseScenario = results?.find((r) => r.id === 'base');
      const defaultName = `Valuation - ${new Date().toLocaleDateString()}`;
      const valuationDisplayName = companyName.trim() || defaultName;
      const fullPhoneNumber = companyPhone.trim() ? `${phoneCountryCode} ${companyPhone}` : undefined;

      // Log the model data to verify riskProfile is included
      console.log('Saving valuation with riskProfile:', model.riskProfile);

      const payload: CreateValuationInput = {
        name: valuationDisplayName,
        modelData: model,
        resultsData: calculatedFinancials,
        enterpriseValue: baseScenario?.enterpriseValue || calculatedFinancials.enterpriseValue,
        industry: industry || undefined,
        country: country || undefined,
        companyName: companyName.trim() || undefined,
        companyWebsite: companyWebsite.trim() || undefined,
        companyPhone: fullPhoneNumber,
      };

      const response = await fetch('/api/valuations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save valuation');
      }

      const savedValuation = await response.json();
      setSavedValuationId(savedValuation.id);

      // Save local scenarios after valuation is created
      await saveLocalScenarios(savedValuation.id);

      // Show success dialog instead of toast
      setSuccessDialogOpen(true);
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
              <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                {/* Business Information Section */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Business Information (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="url"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="e.g. www.example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Contact</label>
                      <div className="flex gap-2">
                        <PhoneCountryCodeSelect
                          value={phoneCountryCode}
                          onChange={setPhoneCountryCode}
                          className="w-28"
                        />
                        <input
                          type="tel"
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(e.target.value)}
                          placeholder="234 567 8900"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select...</option>
                      {industries.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select...</option>
                      {countries.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div
                    className={`transition-all duration-500 ease-out ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      What was last year&#39;s revenue (USD)?
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={lastYearRevenue}
                        onChange={(e) => setLastYearRevenue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <button
                        type="button"
                        className="px-3 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                        disabled={!(parseFloat(lastYearRevenue || '0') > 0)}
                        onClick={() => setStep(2)}
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  <div
                    className={`transition-all duration-500 ease-out ${step >= 2 ? 'opacity-100 translate-y-0 max-h-40' : 'opacity-0 -translate-y-2 max-h-0'} overflow-hidden`}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      What is expected revenue growth (%/yr)?
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.1"
                        value={revenueGrowthPct}
                        onChange={(e) => setRevenueGrowthPct(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <button
                        type="button"
                        className="px-3 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                        disabled={revenueGrowthPct.trim() === ''}
                        onClick={() => setStep(3)}
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  <div
                    className={`transition-all duration-500 ease-out ${step >= 3 ? 'opacity-100 translate-y-0 max-h-40' : 'opacity-0 -translate-y-2 max-h-0'} overflow-hidden`}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      What is the EBITDA margin (%)?
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={ebitdaMarginPct}
                        onChange={(e) => setEbitdaMarginPct(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
                        disabled={ebitdaMarginPct.trim() === '' || isCalculating}
                      >
                        Estimate
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {isCalculating && (
                <div className="mt-4">
                  <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4">
                    <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Crunching numbers…</div>
                      <div className="text-xs text-gray-600">This will take a few seconds</div>
                    </div>
                  </div>
                </div>
              )}

              {results && (
                <>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {results.map((r) => (
                      <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="text-sm text-gray-600">{r.name} scenario</div>
                        <div className="text-2xl font-semibold text-gray-900 mt-1">{currency(r.enterpriseValue)}</div>
                        <div className="text-xs text-gray-600 mt-2">
                          <div>EBITDA margin: {r.ebitdaMarginPct}%</div>
                          <div>Revenue growth: {r.revenueGrowthPct}%/yr</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Revenue & EBITDA Margin Chart */}
                  {calculatedFinancials.revenue.length > 0 && (
                    <div className="mt-6">
                      <RevenueEbitdaChart
                        revenues={calculatedFinancials.revenue.slice(0, 5)}
                        ebitdaMargins={calculatedFinancials.ebitdaMargin.slice(0, 5)}
                        years={model.periods.periodLabels.slice(0, 5)}
                        title="Revenue & EBITDA Margin Projection (5-Year)"
                      />
                    </div>
                  )}

                  {/* Football Field Valuation Chart */}
                  {localScenarios.length > 0 && (
                    <div className="mt-6">
                      <FootballFieldChart
                        ranges={localScenarios.map((s) => ({
                          scenario: s.name,
                          min: s.minValue,
                          max: s.maxValue,
                          base:
                            results?.find((r) => r.id === 'base')?.enterpriseValue ||
                            calculatedFinancials.enterpriseValue ||
                            0,
                        }))}
                        title="Valuation Sensitivity Analysis"
                      />
                    </div>
                  )}

                  {/* Scenario Management - Show immediately (before saving) */}
                  {!savedValuationId && (
                    <div className="mt-6">
                      <ScenarioListLocal
                        scenarios={localScenarios}
                        onChange={setLocalScenarios}
                        baseModel={model}
                        baseResults={calculatedFinancials}
                        baseValue={
                          results?.find((r) => r.id === 'base')?.enterpriseValue ||
                          calculatedFinancials.enterpriseValue ||
                          0
                        }
                      />
                    </div>
                  )}

                  {/* After saving, show database-backed scenario list */}
                  {savedValuationId && (
                    <div className="mt-6">
                      <ScenarioList
                        valuationId={savedValuationId}
                        baseValue={
                          results?.find((r) => r.id === 'base')?.enterpriseValue ||
                          calculatedFinancials.enterpriseValue ||
                          0
                        }
                        baseModel={model}
                        baseResults={calculatedFinancials}
                        onScenariosChange={() => {}}
                      />
                    </div>
                  )}

                  {isSignedIn && !savedValuationId && (
                    <div className="mt-4 flex justify-end">
                      <Button onClick={handleSaveValuation} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Valuation'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="advanced">
              <form
                onSubmit={handleSubmitAdvanced}
                className="bg-white border border-gray-200 rounded-lg p-4 space-y-6"
              >
                {/* Business Information Section */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Business Information (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="url"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="e.g. www.example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Contact</label>
                      <div className="flex gap-2">
                        <PhoneCountryCodeSelect
                          value={phoneCountryCode}
                          onChange={setPhoneCountryCode}
                          className="w-28"
                        />
                        <input
                          type="tel"
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(e.target.value)}
                          placeholder="234 567 8900"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk profile: Industry & Country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select...</option>
                      {industries.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select...</option>
                      {countries.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Step 1: Revenue */}
                <div
                  className={`transition-all duration-500 ease-out ${advStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'} ${advStep >= 1 ? '' : 'pointer-events-none'}`}
                >
                  <div className="mb-2 text-sm font-medium text-gray-700">1. Revenue</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last year&#39;s revenue (USD)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={lastYearRevenue}
                        onChange={(e) => setLastYearRevenue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Forecast years</label>
                      <select
                        value={advYears}
                        onChange={(e) => setAdvYears(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      className="px-3 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                      disabled={!(parseFloat(lastYearRevenue || '0') > 0) || advYears < 2}
                      onClick={() => setAdvStep(2)}
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Step 2: Revenue growth / direct and LTG */}
                <div
                  className={`transition-all duration-500 ease-out ${advStep >= 2 ? 'opacity-100 translate-y-0 max-h-[1000px]' : 'opacity-0 -translate-y-2 max-h-0'} overflow-hidden`}
                >
                  <div className="mb-2 text-sm font-medium text-gray-700">2. Revenue growth</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Input method</label>
                      <select
                        value={advRevenueInputMethod}
                        onChange={(e) => setAdvRevenueInputMethod(e.target.value as 'growth' | 'direct')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="growth">Growth based</option>
                        <option value="direct">Direct revenue per year</option>
                      </select>
                    </div>
                    {advRevenueInputMethod === 'growth' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Growth mode</label>
                        <select
                          value={growthMode}
                          onChange={(e) => setGrowthMode(e.target.value as 'uniform' | 'perYear')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="uniform">Uniform (%/yr)</option>
                          <option value="perYear">Per-year list</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Revenues per year:</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {revenueDirectList.map((val, idx) => (
                            <div key={idx} className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                              <input
                                type="number"
                                step="0.01"
                                value={val}
                                onChange={(e) => {
                                  const next = [...revenueDirectList];
                                  next[idx] = e.target.value;
                                  setRevenueDirectList(next);
                                }}
                                className="px-2 py-2 border border-gray-300 rounded-md"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {advRevenueInputMethod === 'growth' && (
                    <div className="mt-3 grid grid-cols-1 gap-4">
                      {growthMode === 'uniform' ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Uniform growth (%/yr)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={advUniformGrowth}
                            onChange={(e) => setAdvUniformGrowth(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Per-year growth rates (%):
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {growthPerYearList.map((val, idx) => (
                              <div key={idx} className="flex flex-col">
                                <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={val}
                                  onChange={(e) => {
                                    const next = [...growthPerYearList];
                                    next[idx] = e.target.value;
                                    setGrowthPerYearList(next);
                                  }}
                                  className="px-2 py-2 border border-gray-300 rounded-md"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Long-term growth (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={advLTG}
                          onChange={(e) => setAdvLTG(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="e.g. 2.5"
                        />
                      </div>
                    </div>
                  )}
                  {advRevenueInputMethod === 'direct' && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Long-term growth (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={advLTG}
                        onChange={(e) => setAdvLTG(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="e.g. 2.5"
                      />
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md"
                      onClick={() => setAdvStep(1)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="px-3 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                      disabled={
                        advRevenueInputMethod === 'growth'
                          ? (growthMode === 'uniform'
                              ? advUniformGrowth.trim() === ''
                              : growthPerYearList.slice(0, Math.max(advYears - 1, 1)).some((v) => v.trim() === '')) ||
                            advLTG.trim() === ''
                          : revenueDirectList.slice(0, advYears).some((v) => v.trim() === '') || advLTG.trim() === ''
                      }
                      onClick={() => setAdvStep(3)}
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Step 3: EBITDA */}
                <div
                  className={`transition-all duration-500 ease-out ${advStep >= 3 ? 'opacity-100 translate-y-0 max-h-[1000px]' : 'opacity-0 -translate-y-2 max-h-0'} overflow-hidden`}
                >
                  <div className="mb-2 text-sm font-medium text-gray-700">3. EBITDA</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Input type</label>
                      <select
                        value={ebitdaInputType}
                        onChange={(e) => setEbitdaInputType(e.target.value as 'percent' | 'direct')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="percent">% EBITDA</option>
                        <option value="direct">Direct EBITDA per year</option>
                      </select>
                    </div>
                    {ebitdaInputType === 'percent' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">% mode</label>
                        <select
                          value={ebitdaPctMode}
                          onChange={(e) => setEbitdaPctMode(e.target.value as 'uniform' | 'perYear' | 'ramp')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="uniform">Uniform</option>
                          <option value="ramp">Start → Target</option>
                          <option value="perYear">Per-year list</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">EBITDA per year:</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {ebitdaDirectList.map((val, idx) => (
                            <div key={idx} className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                              <input
                                type="number"
                                step="0.01"
                                value={val}
                                onChange={(e) => {
                                  const next = [...ebitdaDirectList];
                                  next[idx] = e.target.value;
                                  setEbitdaDirectList(next);
                                }}
                                className="px-2 py-2 border border-gray-300 rounded-md"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {ebitdaInputType === 'percent' && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ebitdaPctMode === 'uniform' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">EBITDA margin (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={advEbitdaUniformPct}
                            onChange={(e) => setAdvEbitdaUniformPct(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      )}
                      {ebitdaPctMode === 'ramp' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start EBITDA margin (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={advEbitdaStart}
                              onChange={(e) => setAdvEbitdaStart(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Target EBITDA margin (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={advEbitdaTarget}
                              onChange={(e) => setAdvEbitdaTarget(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        </>
                      )}
                      {ebitdaPctMode === 'perYear' && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            EBITDA margin (%) per year:
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {ebitdaPercentPerYearList.map((val, idx) => (
                              <div key={idx} className="flex flex-col">
                                <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={val}
                                  onChange={(e) => {
                                    const next = [...ebitdaPercentPerYearList];
                                    next[idx] = e.target.value;
                                    setEbitdaPercentPerYearList(next);
                                  }}
                                  className="px-2 py-2 border border-gray-300 rounded-md"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md"
                      onClick={() => setAdvStep(2)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="px-3 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                      disabled={
                        ebitdaInputType === 'percent'
                          ? ebitdaPctMode === 'uniform'
                            ? advEbitdaUniformPct.trim() === ''
                            : ebitdaPctMode === 'ramp'
                              ? advEbitdaStart.trim() === '' || advEbitdaTarget.trim() === ''
                              : ebitdaPercentPerYearList.slice(0, advYears).some((v) => v.trim() === '')
                          : ebitdaDirectList.slice(0, advYears).some((v) => v.trim() === '')
                      }
                      onClick={() => setAdvStep(4)}
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Step 4: Others */}
                <div
                  className={`transition-all duration-500 ease-out ${advStep >= 4 ? 'opacity-100 translate-y-0 max-h-[2000px]' : 'opacity-0 -translate-y-2 max-h-0'} overflow-hidden`}
                >
                  <div className="mb-2 text-sm font-medium text-gray-700">4. Others</div>
                  {/* CAPEX */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CAPEX method</label>
                      <select
                        value={capexMethod}
                        onChange={(e) => setCapexMethod(e.target.value as 'percentOfRevenue' | 'direct')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="percentOfRevenue">% of revenue</option>
                        <option value="direct">Direct</option>
                      </select>
                    </div>
                    {capexMethod === 'percentOfRevenue' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Percent mode</label>
                          <select
                            value={capexPercentMode}
                            onChange={(e) => setCapexPercentMode(e.target.value as 'uniform' | 'individual')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="uniform">Uniform</option>
                            <option value="individual">Each year</option>
                          </select>
                        </div>
                        {capexPercentMode === 'uniform' ? (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CAPEX (% of revenue)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={advCapexPct}
                              onChange={(e) => setAdvCapexPct(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CAPEX percents per year:
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                              {capexPercentsList.map((val, idx) => (
                                <div key={idx} className="flex flex-col">
                                  <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={val}
                                    onChange={(e) => {
                                      const next = [...capexPercentsList];
                                      next[idx] = e.target.value;
                                      setCapexPercentsList(next);
                                    }}
                                    className="px-2 py-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">CAPEX direct per year:</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {capexDirectList.map((val, idx) => (
                            <div key={idx} className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                              <input
                                type="number"
                                step="0.01"
                                value={val}
                                onChange={(e) => {
                                  const next = [...capexDirectList];
                                  next[idx] = e.target.value;
                                  setCapexDirectList(next);
                                }}
                                className="px-2 py-2 border border-gray-300 rounded-md"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* NWC */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NWC method</label>
                      <select
                        value={nwcMethod}
                        onChange={(e) => setNwcMethod(e.target.value as 'percentOfRevenue' | 'direct')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="percentOfRevenue">% of revenue</option>
                        <option value="direct">Direct</option>
                      </select>
                    </div>
                    {nwcMethod === 'percentOfRevenue' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Percent mode</label>
                          <select
                            value={nwcPercentMode}
                            onChange={(e) => setNwcPercentMode(e.target.value as 'uniform' | 'individual')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="uniform">Uniform</option>
                            <option value="individual">Each year</option>
                          </select>
                        </div>
                        {nwcPercentMode === 'uniform' ? (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">NWC (% of revenue)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={advNwcPct}
                              onChange={(e) => setAdvNwcPct(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              NWC percents per year:
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                              {nwcPercentsList.map((val, idx) => (
                                <div key={idx} className="flex flex-col">
                                  <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={val}
                                    onChange={(e) => {
                                      const next = [...nwcPercentsList];
                                      next[idx] = e.target.value;
                                      setNwcPercentsList(next);
                                    }}
                                    className="px-2 py-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">NWC direct per year:</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {nwcDirectList.map((val, idx) => (
                            <div key={idx} className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                              <input
                                type="number"
                                step="0.01"
                                value={val}
                                onChange={(e) => {
                                  const next = [...nwcDirectList];
                                  next[idx] = e.target.value;
                                  setNwcDirectList(next);
                                }}
                                className="px-2 py-2 border border-gray-300 rounded-md"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* D&A */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">D&A method</label>
                      <select
                        value={daMethod}
                        onChange={(e) => setDaMethod(e.target.value as 'percentOfRevenue' | 'direct')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="percentOfRevenue">% of revenue</option>
                        <option value="direct">Direct</option>
                      </select>
                    </div>
                    {daMethod === 'percentOfRevenue' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Percent mode</label>
                          <select
                            value={daPercentMode}
                            onChange={(e) => setDaPercentMode(e.target.value as 'uniform' | 'individual')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="uniform">Uniform</option>
                            <option value="individual">Each year</option>
                          </select>
                        </div>
                        {daPercentMode === 'uniform' ? (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">D&A (% of revenue)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={advDaPct}
                              onChange={(e) => setAdvDaPct(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              D&A percents per year:
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                              {daPercentsList.map((val, idx) => (
                                <div key={idx} className="flex flex-col">
                                  <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={val}
                                    onChange={(e) => {
                                      const next = [...daPercentsList];
                                      next[idx] = e.target.value;
                                      setDaPercentsList(next);
                                    }}
                                    className="px-2 py-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">D&A direct per year:</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {daDirectList.map((val, idx) => (
                            <div key={idx} className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                              <input
                                type="number"
                                step="0.01"
                                value={val}
                                onChange={(e) => {
                                  const next = [...daDirectList];
                                  next[idx] = e.target.value;
                                  setDaDirectList(next);
                                }}
                                className="px-2 py-2 border border-gray-300 rounded-md"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md"
                      onClick={() => setAdvStep(3)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="px-3 py-2 bg-blue-600 text-white rounded-md"
                      onClick={() => setAdvStep(5)}
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Step 5: Taxes */}
                <div
                  className={`transition-all duration-500 ease-out ${advStep >= 5 ? 'opacity-100 translate-y-0 max-h-[1000px]' : 'opacity-0 -translate-y-2 max-h-0'} overflow-hidden`}
                >
                  <div className="mb-2 text-sm font-medium text-gray-700">5. Taxes</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                      <select
                        value={taxesMethod}
                        onChange={(e) => setTaxesMethod(e.target.value as 'percentOfEBIT' | 'direct')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="percentOfEBIT">% of EBIT</option>
                        <option value="direct">Direct per year</option>
                      </select>
                    </div>
                    <div>
                      {taxesMethod === 'percentOfEBIT' ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tax % of EBIT</label>
                          <input
                            type="number"
                            step="0.1"
                            value={taxesPct}
                            onChange={(e) => setTaxesPct(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="e.g. 25"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Taxes direct per year:</label>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {taxesDirectList.map((val, idx) => (
                              <div key={idx} className="flex flex-col">
                                <span className="text-xs text-gray-500 mb-1">Year {idx + 1}</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={val}
                                  onChange={(e) => {
                                    const next = [...taxesDirectList];
                                    next[idx] = e.target.value;
                                    setTaxesDirectList(next);
                                  }}
                                  className="px-2 py-2 border border-gray-300 rounded-md"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md"
                      onClick={() => setAdvStep(4)}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                      disabled={isCalculating}
                    >
                      Estimate
                    </button>
                  </div>
                </div>
              </form>

              {isCalculating && (
                <div className="mt-4">
                  <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4">
                    <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Crunching numbers…</div>
                      <div className="text-xs text-gray-600">This will take a few seconds</div>
                    </div>
                  </div>
                </div>
              )}

              {results && (
                <>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {results.map((r) => (
                      <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="text-sm text-gray-600">{r.name} scenario</div>
                        <div className="text-2xl font-semibold text-gray-900 mt-1">{currency(r.enterpriseValue)}</div>
                        <div className="text-xs text-gray-600 mt-2">
                          <div>EBITDA margin: {r.ebitdaMarginPct}%</div>
                          <div>Revenue growth: {r.revenueGrowthPct}%/yr</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Revenue & EBITDA Margin Chart - Advanced (shows user-selected years) */}
                  {calculatedFinancials.revenue.length > 0 && (
                    <div className="mt-6">
                      <RevenueEbitdaChart
                        revenues={calculatedFinancials.revenue.slice(0, advYears)}
                        ebitdaMargins={calculatedFinancials.ebitdaMargin.slice(0, advYears)}
                        years={model.periods.periodLabels.slice(0, advYears)}
                        title={`Revenue & EBITDA Margin Projection (${advYears}-Year)`}
                      />
                    </div>
                  )}

                  {/* Football Field Valuation Chart */}
                  {localScenarios.length > 0 && (
                    <div className="mt-6">
                      <FootballFieldChart
                        ranges={localScenarios.map((s) => ({
                          scenario: s.name,
                          min: s.minValue,
                          max: s.maxValue,
                          base:
                            results?.find((r) => r.id === 'base')?.enterpriseValue ||
                            calculatedFinancials.enterpriseValue ||
                            0,
                        }))}
                        title="Valuation Sensitivity Analysis"
                      />
                    </div>
                  )}

                  {/* Scenario Management - Show immediately (before saving) */}
                  {!savedValuationId && (
                    <div className="mt-6">
                      <ScenarioListLocal
                        scenarios={localScenarios}
                        onChange={setLocalScenarios}
                        baseModel={model}
                        baseResults={calculatedFinancials}
                        baseValue={
                          results?.find((r) => r.id === 'base')?.enterpriseValue ||
                          calculatedFinancials.enterpriseValue ||
                          0
                        }
                      />
                    </div>
                  )}

                  {/* After saving, show database-backed scenario list */}
                  {savedValuationId && (
                    <div className="mt-6">
                      <ScenarioList
                        valuationId={savedValuationId}
                        baseValue={
                          results?.find((r) => r.id === 'base')?.enterpriseValue ||
                          calculatedFinancials.enterpriseValue ||
                          0
                        }
                        baseModel={model}
                        baseResults={calculatedFinancials}
                        onScenariosChange={() => {}}
                      />
                    </div>
                  )}

                  {isSignedIn && !savedValuationId && (
                    <div className="mt-4 flex justify-end">
                      <Button onClick={handleSaveValuation} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Valuation'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Debug: Pretty print model and calculated financials */}
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
                routing="hash"
                forceRedirectUrl="/free-valuation"
                fallbackRedirectUrl="/free-valuation"
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
