/**
 * WACC (Weighted Average Cost of Capital) Calculation Utilities
 *
 * Provides consistent WACC calculations across the application.
 * WACC is always calculated at runtime from risk profile data to maintain
 * consistency when input parameters change.
 */

export interface RiskProfile {
  riskFreeRate: number;
  leveredBeta: number;
  equityRiskPremium: number;
  countryRiskPremium: number;
  adjustedDefaultSpread: number;
  companySpread: number;
  deRatio: number;
  corporateTaxRate: number;
  waccPremium?: number; // Optional additional premium added directly to final WACC
}

export interface WaccComponents {
  costOfEquity: number;
  costOfDebt: number;
  equityWeight: number;
  debtWeight: number;
  wacc: number;
}

/**
 * Calculate cost of equity using CAPM with country risk premium
 * Formula: Re = Rf + β × (ERP + CRP)
 */
export function calculateCostOfEquity(riskProfile: RiskProfile): number {
  return (
    riskProfile.riskFreeRate +
    riskProfile.leveredBeta * (riskProfile.equityRiskPremium + riskProfile.countryRiskPremium)
  );
}

/**
 * Calculate pre-tax cost of debt
 * Formula: Rd = Rf + Default Spread + Company Spread
 */
export function calculateCostOfDebt(riskProfile: RiskProfile): number {
  return riskProfile.riskFreeRate + riskProfile.adjustedDefaultSpread + riskProfile.companySpread;
}

/**
 * Calculate equity weight in capital structure
 * Formula: E/V = 1 / (1 + D/E)
 */
export function calculateEquityWeight(deRatio: number): number {
  return 1 / (1 + deRatio);
}

/**
 * Calculate debt weight in capital structure
 * Formula: D/V = (D/E) / (1 + D/E)
 */
export function calculateDebtWeight(deRatio: number): number {
  return deRatio / (1 + deRatio);
}

/**
 * Calculate WACC (Weighted Average Cost of Capital)
 * Formula: WACC = (E/V × Re) + (D/V × Rd × (1 - Tc)) + WACC Premium
 *
 * @param riskProfile - The risk profile containing all necessary parameters
 * @returns WACC as a decimal (e.g., 0.12 for 12%)
 */
export function calculateWacc(riskProfile: RiskProfile): number {
  const costOfEquity = calculateCostOfEquity(riskProfile);
  const costOfDebt = calculateCostOfDebt(riskProfile);
  const equityWeight = calculateEquityWeight(riskProfile.deRatio);
  const debtWeight = calculateDebtWeight(riskProfile.deRatio);

  const baseWacc = equityWeight * costOfEquity + debtWeight * costOfDebt * (1 - riskProfile.corporateTaxRate);
  return baseWacc + (riskProfile.waccPremium || 0);
}

/**
 * Calculate all WACC components at once
 * Useful for displaying detailed breakdowns in reports
 *
 * @param riskProfile - The risk profile containing all necessary parameters
 * @returns Object containing all WACC components and final WACC
 */
export function calculateWaccComponents(riskProfile: RiskProfile): WaccComponents {
  const costOfEquity = calculateCostOfEquity(riskProfile);
  const costOfDebt = calculateCostOfDebt(riskProfile);
  const equityWeight = calculateEquityWeight(riskProfile.deRatio);
  const debtWeight = calculateDebtWeight(riskProfile.deRatio);
  const baseWacc = equityWeight * costOfEquity + debtWeight * costOfDebt * (1 - riskProfile.corporateTaxRate);
  const wacc = baseWacc + (riskProfile.waccPremium || 0);

  return {
    costOfEquity,
    costOfDebt,
    equityWeight,
    debtWeight,
    wacc,
  };
}

/**
 * Calculate WACC as a percentage
 *
 * @param riskProfile - The risk profile containing all necessary parameters
 * @returns WACC as a percentage (e.g., 12 for 12%)
 */
export function calculateWaccPercent(riskProfile: RiskProfile): number {
  return calculateWacc(riskProfile) * 100;
}
