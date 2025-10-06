/**
 * Valuation Calculation Helpers
 *
 * Centralized utilities for performing valuation calculations,
 * reducing duplication across the application.
 */

import { useModelStore } from '@/app/valuation/store/modelStore';
import { betasStatic } from '@/app/valuation/betasStatic';
import { countryRiskPremiumStatic } from '@/app/valuation/countryRiskPremiumStatic';

/**
 * Get industry and country data from static sources
 */
export function getMarketData(industry: string, country: string) {
  const industryData = betasStatic[industry as keyof typeof betasStatic];
  const countryData = countryRiskPremiumStatic[country as keyof typeof countryRiskPremiumStatic];

  return { industryData, countryData };
}

/**
 * Calculate levered beta from unlevered beta, D/E ratio, and tax rate
 */
export function calculateLeveredBeta(unleveredBeta: number, deRatio: number, corporateTaxRate: number): number {
  return unleveredBeta * (1 + (1 - corporateTaxRate) * deRatio);
}

/**
 * Parameters for updating the risk profile
 */
export interface RiskProfileParams {
  industry: string | null;
  country: string | null;
  deRatio: number;
  waccAdjustment?: number;
}

/**
 * Update risk profile with calculated values
 * Handles WACC adjustments by modifying equity risk premium (no debt) or company spread (with debt)
 */
export function updateModelRiskProfile(params: RiskProfileParams): void {
  const { industry, country, deRatio, waccAdjustment = 0 } = params;
  const { updateRiskProfile, model } = useModelStore.getState();

  if (!industry || !country) return;

  const { industryData, countryData } = getMarketData(industry, country);
  if (!industryData || !countryData) return;

  const unleveredBeta = industryData.unleveredBeta ?? 0;
  const corporateTaxRate = countryData.corporateTaxRate ?? 0.25;
  const leveredBeta = calculateLeveredBeta(unleveredBeta, deRatio, corporateTaxRate);

  // Adjust equity risk premium or company spread based on D/E ratio
  const baseCompanySpread = model.riskProfile?.companySpread ?? 0.05;
  const baseEquityRiskPremium = countryData.equityRiskPremium ?? 0;

  let adjustedCompanySpread = baseCompanySpread;
  let adjustedEquityRiskPremium = baseEquityRiskPremium;

  if (deRatio === 0) {
    // No debt: adjust equity risk premium to affect cost of equity (which is 100% of WACC)
    adjustedEquityRiskPremium = baseEquityRiskPremium + waccAdjustment;
  } else {
    // Has debt: adjust company spread to affect cost of debt
    adjustedCompanySpread = baseCompanySpread + waccAdjustment;
  }

  updateRiskProfile({
    selectedIndustry: industry,
    selectedCountry: country,
    unleveredBeta,
    leveredBeta,
    equityRiskPremium: adjustedEquityRiskPremium,
    countryRiskPremium: countryData.countryRiskPremium ?? 0,
    deRatio,
    adjustedDefaultSpread: countryData.adjDefaultSpread ?? 0,
    companySpread: adjustedCompanySpread,
    riskFreeRate: model.riskProfile?.riskFreeRate ?? 0.0444,
    corporateTaxRate,
  });
}

/**
 * Parameters for updating revenue assumptions
 */
export interface RevenueParams {
  baseValue: number;
  growthRate: number;
}

/**
 * Update revenue with uniform growth rate
 */
export function updateModelRevenue(params: RevenueParams): void {
  const { updateRevenue } = useModelStore.getState();

  updateRevenue({
    inputType: 'consolidated',
    consolidated: {
      inputMethod: 'growth',
      growthMethod: 'uniform',
      baseValue: params.baseValue,
      growthRate: params.growthRate,
    },
  });
}

/**
 * Parameters for updating OpEx (derived from EBITDA margin)
 */
export interface OpExParams {
  ebitdaMarginPct: number;
}

/**
 * Update OpEx based on target EBITDA margin
 * OpEx = Revenue - EBITDA, so OpEx% = 100% - EBITDA%
 */
export function updateModelOpEx(params: OpExParams): void {
  const { updateOpEx } = useModelStore.getState();

  const targetOpexPercentOfRevenue = Math.max(0, 100 - params.ebitdaMarginPct);

  updateOpEx({
    inputType: 'consolidated',
    consolidated: {
      inputMethod: 'percentOfRevenue',
      percentMethod: 'uniform',
      percentOfRevenue: targetOpexPercentOfRevenue,
    },
  });
}

/**
 * Parameters for updating taxes
 */
export interface TaxesParams {
  taxRatePct: number;
}

/**
 * Update tax assumptions as percentage of EBIT
 */
export function updateModelTaxes(params: TaxesParams): void {
  const { updateTaxes } = useModelStore.getState();

  updateTaxes({
    inputMethod: 'percentOfEBIT',
    percentMethod: 'uniform',
    percentOfEBIT: params.taxRatePct,
  });
}

/**
 * Parameters for terminal value
 */
export interface TerminalValueParams {
  method: 'multiples' | 'growth';
  multipleMetric?: 'ebitda' | 'revenue';
  multipleValue?: number;
  growthRate?: number;
}

/**
 * Update terminal value assumptions
 */
export function updateModelTerminalValue(params: TerminalValueParams): void {
  const { updateTerminalValue } = useModelStore.getState();
  updateTerminalValue(params);
}

/**
 * Complete model configuration for a simple valuation scenario
 */
export interface SimpleScenarioParams {
  industry: string;
  country: string;
  baseRevenue: number;
  revenueGrowthPct: number;
  ebitdaMarginPct: number;
  deRatio?: number;
  waccAdjustment?: number;
}

/**
 * Configure the model for a simple valuation scenario and calculate
 * Returns the enterprise value
 */
export function calculateSimpleScenario(params: SimpleScenarioParams): number {
  const { calculateFinancials } = useModelStore.getState();
  const { countryData } = getMarketData(params.industry, params.country);
  const deRatio = params.deRatio ?? 0;

  // Update risk profile
  updateModelRiskProfile({
    industry: params.industry,
    country: params.country,
    deRatio,
    waccAdjustment: params.waccAdjustment,
  });

  // Update revenue
  updateModelRevenue({
    baseValue: params.baseRevenue,
    growthRate: params.revenueGrowthPct,
  });

  // Update OpEx
  updateModelOpEx({
    ebitdaMarginPct: params.ebitdaMarginPct,
  });

  // Update taxes
  const taxRate = (countryData?.corporateTaxRate ?? 0.25) * 100;
  updateModelTaxes({
    taxRatePct: taxRate,
  });

  // Update terminal value
  updateModelTerminalValue({
    method: 'multiples',
    multipleMetric: 'ebitda',
    multipleValue: 10,
  });

  // Calculate and return enterprise value
  calculateFinancials();
  const ev = useModelStore.getState().calculatedFinancials.enterpriseValue || 0;

  return ev;
}

/**
 * Parameters for sensitivity analysis
 */
export interface SensitivityParams {
  baseParams: SimpleScenarioParams;
  growthDelta?: number;
  marginDelta?: number;
  waccDelta?: number;
}

/**
 * Calculate enterprise value with sensitivity adjustments
 */
export function calculateSensitivityScenario(params: SensitivityParams): number {
  const { growthDelta = 0, marginDelta = 0, waccDelta = 0 } = params;

  return calculateSimpleScenario({
    ...params.baseParams,
    revenueGrowthPct: params.baseParams.revenueGrowthPct + growthDelta,
    ebitdaMarginPct: Math.max(0, Math.min(100, params.baseParams.ebitdaMarginPct + marginDelta)),
    waccAdjustment: (params.baseParams.waccAdjustment ?? 0) + waccDelta,
  });
}

/**
 * Result type for sensitivity analysis
 */
export interface SensitivityResult {
  name: string;
  description?: string;
  minValue: number;
  maxValue: number;
}

/**
 * Calculate all sensitivity scenarios for a base case
 * Returns growth, margin, and WACC sensitivity ranges
 */
export function calculateAllSensitivities(baseParams: SimpleScenarioParams): SensitivityResult[] {
  // Calculate sensitivity scenarios
  const growthLow = calculateSensitivityScenario({ baseParams, growthDelta: -5 });
  const growthHigh = calculateSensitivityScenario({ baseParams, growthDelta: 5 });

  const marginLow = calculateSensitivityScenario({ baseParams, marginDelta: -5 });
  const marginHigh = calculateSensitivityScenario({ baseParams, marginDelta: 5 });

  const waccHigh = calculateSensitivityScenario({ baseParams, waccDelta: 0.02 }); // Higher WACC → Lower EV
  const waccLow = calculateSensitivityScenario({ baseParams, waccDelta: -0.02 }); // Lower WACC → Higher EV

  return [
    {
      name: 'Crecimiento de ingresos (±5%)',
      description: 'Análisis de sensibilidad: crecimiento de ingresos (±5%)',
      minValue: Math.min(growthLow, growthHigh),
      maxValue: Math.max(growthLow, growthHigh),
    },
    {
      name: 'Margen EBITDA (±5%)',
      description: 'Análisis de sensibilidad: margen EBITDA (±5%)',
      minValue: Math.min(marginLow, marginHigh),
      maxValue: Math.max(marginLow, marginHigh),
    },
    {
      name: 'Sensibilidad WACC (±2%)',
      description: 'Análisis de sensibilidad: WACC (±2%)',
      minValue: Math.min(waccHigh, waccLow),
      maxValue: Math.max(waccHigh, waccLow),
    },
  ];
}
