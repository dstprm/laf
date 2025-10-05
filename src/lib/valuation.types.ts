/**
 * Centralized type definitions for valuation data
 *
 * This file provides type-safe definitions for financial model data
 * that gets stored in the database and used throughout the application.
 *
 * These types ensure consistency between:
 * - Frontend state (modelStore)
 * - API payloads
 * - Database storage (Prisma Json fields)
 * - Component props
 */

import type {
  FinancialModel,
  CalculatedFinancials,
  ModelPeriods,
  RiskProfile,
  RevenueAssumptions,
  COGSAssumptions,
  OpExAssumptions,
  OtherIncomeAssumptions,
  OtherExpensesAssumptions,
  TerminalValueAssumptions,
  EquityValueAssumptions,
  GrowthRates,
  ManualOverrides,
} from '@/app/valuation/types/financial';

// Re-export the core financial types for convenience
export type {
  FinancialModel,
  CalculatedFinancials,
  ModelPeriods,
  RiskProfile,
  RevenueAssumptions,
  COGSAssumptions,
  OpExAssumptions,
  OtherIncomeAssumptions,
  OtherExpensesAssumptions,
  TerminalValueAssumptions,
  EquityValueAssumptions,
  GrowthRates,
  ManualOverrides,
};

/**
 * Type guard to check if data is a valid FinancialModel
 */
export function isFinancialModel(data: unknown): data is FinancialModel {
  if (!data || typeof data !== 'object') return false;
  const model = data as Partial<FinancialModel>;
  return (
    typeof model.periods === 'object' &&
    typeof model.revenue === 'object' &&
    typeof model.cogs === 'object' &&
    typeof model.opex === 'object' &&
    typeof model.da === 'object' &&
    typeof model.taxes === 'object' &&
    typeof model.capex === 'object' &&
    typeof model.netWorkingCapital === 'object' &&
    typeof model.terminalValue === 'object' &&
    typeof model.equityValue === 'object'
  );
}

/**
 * Type guard to check if data is valid CalculatedFinancials
 */
export function isCalculatedFinancials(data: unknown): data is CalculatedFinancials {
  if (!data || typeof data !== 'object') return false;
  const calcs = data as Partial<CalculatedFinancials>;
  return (
    Array.isArray(calcs.revenue) &&
    Array.isArray(calcs.cogs) &&
    Array.isArray(calcs.grossProfit) &&
    Array.isArray(calcs.opex) &&
    Array.isArray(calcs.ebitda) &&
    Array.isArray(calcs.freeCashFlow) &&
    typeof calcs.enterpriseValue === 'number' &&
    typeof calcs.equityValue === 'number'
  );
}

/**
 * Database valuation record type
 * Matches the Prisma Valuation model
 */
export interface ValuationRecord {
  id: string;
  userId: string;
  name: string | null;
  modelData: FinancialModel; // Typed as FinancialModel instead of Json
  resultsData: CalculatedFinancials; // Typed as CalculatedFinancials instead of Json
  enterpriseValue: number | null;
  industry: string | null;
  country: string | null;
  companyName: string | null;
  companyWebsite: string | null;
  companyPhone: string | null;
  reportComment: string | null;
  preferredEditMode?: 'simple' | 'advanced' | 'full' | null;
  isPublished?: boolean;
  shareToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Type for creating a new valuation
 * Used in API POST requests
 */
export interface CreateValuationInput {
  name?: string;
  modelData: FinancialModel;
  resultsData: CalculatedFinancials;
  enterpriseValue?: number;
  industry?: string;
  country?: string;
  companyName?: string;
  companyWebsite?: string;
  companyPhone?: string;
  reportComment?: string;
  preferredEditMode?: 'simple' | 'advanced' | 'full';
}

/**
 * Type for updating an existing valuation
 * All fields are optional
 */
export interface UpdateValuationInput {
  name?: string;
  modelData?: FinancialModel;
  resultsData?: CalculatedFinancials;
  enterpriseValue?: number;
  industry?: string;
  country?: string;
  companyName?: string;
  companyWebsite?: string;
  companyPhone?: string;
  reportComment?: string;
  preferredEditMode?: 'simple' | 'advanced' | 'full';
}

/**
 * Type for valuation list items
 * Used when fetching multiple valuations
 */
export interface ValuationListItem {
  id: string;
  name: string | null;
  enterpriseValue: number | null;
  industry: string | null;
  country: string | null;
  companyName: string | null;
  isPublished?: boolean;
  shareToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * API response types
 */
export interface CreateValuationResponse extends ValuationRecord {}
export interface UpdateValuationResponse extends ValuationRecord {}
export interface GetValuationResponse extends ValuationRecord {}
export interface GetValuationsResponse extends Array<ValuationListItem> {}

/**
 * Helper function to safely parse modelData from database
 * Validates the structure and provides type safety
 */
export function parseModelData(data: unknown): FinancialModel {
  if (!isFinancialModel(data)) {
    throw new Error('Invalid model data structure');
  }
  return data;
}

/**
 * Helper function to safely parse resultsData from database
 * Validates the structure and provides type safety
 */
export function parseResultsData(data: unknown): CalculatedFinancials {
  if (!isCalculatedFinancials(data)) {
    throw new Error('Invalid results data structure');
  }
  return data;
}

/**
 * Helper function to serialize FinancialModel for database storage
 * Ensures consistent serialization
 */
export function serializeModelData(model: FinancialModel): string {
  return JSON.stringify(model);
}

/**
 * Helper function to serialize CalculatedFinancials for database storage
 * Ensures consistent serialization
 */
export function serializeResultsData(results: CalculatedFinancials): string {
  return JSON.stringify(results);
}

/**
 * Type for valuation data used in forms and calculations
 * Extends the core types with UI-specific fields
 */
export interface ValuationFormData {
  // Business information
  companyName?: string;
  companyWebsite?: string;
  companyPhone?: string;
  industry?: string;
  country?: string;

  // Financial inputs
  lastYearRevenue?: number;
  revenueGrowthPct?: number;
  ebitdaMarginPct?: number;

  // Advanced inputs
  forecastYears?: number;
  longTermGrowthRate?: number;
}

/**
 * Type for valuation scenario results
 * Used in the free valuation page
 */
export interface ValuationScenario {
  id: string;
  name: string;
  enterpriseValue: number;
  ebitdaMarginPct: number;
  revenueGrowthPct: number;
}

/**
 * Type for sensitivity analysis ranges
 * Used in football field charts
 */
export interface SensitivityRange {
  scenario: string;
  min: number;
  max: number;
  base: number;
}

/**
 * Database scenario record type
 * Matches the Prisma Scenario model
 */
export interface ScenarioRecord {
  id: string;
  valuationId: string;
  name: string;
  description: string | null;
  minValue: number;
  maxValue: number;
  minModelData: FinancialModel | null;
  maxModelData: FinancialModel | null;
  minResultsData: CalculatedFinancials | null;
  maxResultsData: CalculatedFinancials | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Type for creating a new scenario
 * Used in API POST requests
 */
export interface CreateScenarioInput {
  valuationId: string;
  name: string;
  description?: string;
  minValue: number;
  maxValue: number;
  minModelData?: FinancialModel;
  maxModelData?: FinancialModel;
  minResultsData?: CalculatedFinancials;
  maxResultsData?: CalculatedFinancials;
}

/**
 * Type for updating an existing scenario
 * All fields are optional
 */
export interface UpdateScenarioInput {
  name?: string;
  description?: string;
  minValue?: number;
  maxValue?: number;
  minModelData?: FinancialModel;
  maxModelData?: FinancialModel;
  minResultsData?: CalculatedFinancials;
  maxResultsData?: CalculatedFinancials;
}

/**
 * Type for scenario list items
 * Used when fetching multiple scenarios
 */
export interface ScenarioListItem {
  id: string;
  valuationId: string;
  name: string;
  description: string | null;
  minValue: number;
  maxValue: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Scenario API response types
 */
export interface CreateScenarioResponse extends ScenarioRecord {}
export interface UpdateScenarioResponse extends ScenarioRecord {}
export interface GetScenarioResponse extends ScenarioRecord {}
export interface GetScenariosResponse extends Array<ScenarioListItem> {}
