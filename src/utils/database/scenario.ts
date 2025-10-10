/**
 * Database utilities for Scenario operations
 */
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { FinancialModel, CalculatedFinancials, ScenarioRecord, ScenarioListItem } from '@/lib/valuation.types';
import { generateAutoScenarios } from '@/lib/auto-scenarios';

interface CreateScenarioData {
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

interface UpdateScenarioData {
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
 * Create a new scenario for a valuation
 */
export async function createScenario(data: CreateScenarioData) {
  return prisma.scenario.create({
    data: {
      valuationId: data.valuationId,
      name: data.name,
      description: data.description,
      minValue: data.minValue,
      maxValue: data.maxValue,
      minModelData: data.minModelData as unknown as Prisma.InputJsonValue,
      maxModelData: data.maxModelData as unknown as Prisma.InputJsonValue,
      minResultsData: data.minResultsData as unknown as Prisma.InputJsonValue,
      maxResultsData: data.maxResultsData as unknown as Prisma.InputJsonValue,
    },
  });
}

/**
 * Get all scenarios for a valuation
 */
export async function getValuationScenarios(valuationId: string): Promise<ScenarioListItem[]> {
  return prisma.scenario.findMany({
    where: { valuationId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      valuationId: true,
      name: true,
      description: true,
      minValue: true,
      maxValue: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Get a single scenario by ID (with full data)
 * Returns the raw database record - use parseScenarioRecord to get typed data
 */
export async function getScenarioById(id: string, valuationId: string) {
  return prisma.scenario.findFirst({
    where: { id, valuationId },
  });
}

/**
 * Helper to safely parse a scenario record with typed modelData and resultsData
 */
export function parseScenarioRecord(record: any): ScenarioRecord {
  return {
    ...record,
    minModelData: record.minModelData as FinancialModel | null,
    maxModelData: record.maxModelData as FinancialModel | null,
    minResultsData: record.minResultsData as CalculatedFinancials | null,
    maxResultsData: record.maxResultsData as CalculatedFinancials | null,
  };
}

/**
 * Update a scenario
 */
export async function updateScenario(id: string, valuationId: string, data: UpdateScenarioData) {
  return prisma.scenario.update({
    where: { id, valuationId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.minValue !== undefined && { minValue: data.minValue }),
      ...(data.maxValue !== undefined && { maxValue: data.maxValue }),
      ...(data.minModelData !== undefined && {
        minModelData: data.minModelData as unknown as Prisma.InputJsonValue,
      }),
      ...(data.maxModelData !== undefined && {
        maxModelData: data.maxModelData as unknown as Prisma.InputJsonValue,
      }),
      ...(data.minResultsData !== undefined && {
        minResultsData: data.minResultsData as unknown as Prisma.InputJsonValue,
      }),
      ...(data.maxResultsData !== undefined && {
        maxResultsData: data.maxResultsData as unknown as Prisma.InputJsonValue,
      }),
    },
  });
}

/**
 * Delete a scenario
 */
export async function deleteScenario(id: string, valuationId: string) {
  return prisma.scenario.delete({
    where: { id, valuationId },
  });
}

/**
 * Upsert a scenario by name for a valuation. If a scenario with the same name exists, update it; otherwise, create.
 */
export async function upsertScenarioByName(
  valuationId: string,
  name: string,
  data: {
    description?: string;
    minValue: number;
    maxValue: number;
    minModelData?: FinancialModel;
    maxModelData?: FinancialModel;
    minResultsData?: CalculatedFinancials;
    maxResultsData?: CalculatedFinancials;
  },
) {
  const existing = await prisma.scenario.findFirst({ where: { valuationId, name } });
  if (existing) {
    return prisma.scenario.update({
      where: { id: existing.id },
      data: {
        description: data.description,
        minValue: data.minValue,
        maxValue: data.maxValue,
        minModelData: data.minModelData as unknown as Prisma.InputJsonValue,
        maxModelData: data.maxModelData as unknown as Prisma.InputJsonValue,
        minResultsData: data.minResultsData as unknown as Prisma.InputJsonValue,
        maxResultsData: data.maxResultsData as unknown as Prisma.InputJsonValue,
      },
    });
  }

  return prisma.scenario.create({
    data: {
      valuationId,
      name,
      description: data.description,
      minValue: data.minValue,
      maxValue: data.maxValue,
      minModelData: data.minModelData as unknown as Prisma.InputJsonValue,
      maxModelData: data.maxModelData as unknown as Prisma.InputJsonValue,
      minResultsData: data.minResultsData as unknown as Prisma.InputJsonValue,
      maxResultsData: data.maxResultsData as unknown as Prisma.InputJsonValue,
    },
  });
}

/**
 * Ensure the three standard auto scenarios exist and are up to date for a valuation.
 */
export async function upsertAutoScenarios(
  valuationId: string,
  baseModel: FinancialModel,
  baseResults: CalculatedFinancials,
) {
  const generated = generateAutoScenarios(baseModel, baseResults);
  for (const s of generated) {
    await upsertScenarioByName(valuationId, s.name, {
      description: s.description,
      minValue: s.minValue,
      maxValue: s.maxValue,
      minModelData: s.minModel,
      maxModelData: s.maxModel,
      minResultsData: s.minResults,
      maxResultsData: s.maxResults,
    });
  }
}

/**
 * Get scenario count for a valuation
 */
export async function getValuationScenarioCount(valuationId: string) {
  return prisma.scenario.count({
    where: { valuationId },
  });
}

/**
 * Convert scenarios to football field chart format
 */
export function scenariosToFootballFieldData(scenarios: ScenarioListItem[], baseValue: number) {
  return scenarios.map((scenario) => ({
    scenario: scenario.name,
    min: scenario.minValue,
    max: scenario.maxValue,
    base: baseValue,
  }));
}
