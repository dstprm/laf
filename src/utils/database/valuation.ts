/**
 * Database utilities for Valuation operations
 */
import { prisma } from '@/lib/prisma';

interface CreateValuationData {
  userId: string;
  name?: string;
  modelData: unknown;
  resultsData: unknown;
  enterpriseValue?: number;
  industry?: string;
  country?: string;
  companyName?: string;
  companyWebsite?: string;
  companyPhone?: string;
}

interface UpdateValuationData {
  name?: string;
  modelData?: unknown;
  resultsData?: unknown;
  enterpriseValue?: number;
  industry?: string;
  country?: string;
  companyName?: string;
  companyWebsite?: string;
  companyPhone?: string;
}

/**
 * Create a new valuation
 */
export async function createValuation(data: CreateValuationData) {
  return prisma.valuation.create({
    data: {
      userId: data.userId,
      name: data.name,
      modelData: data.modelData as any,
      resultsData: data.resultsData as any,
      enterpriseValue: data.enterpriseValue,
      industry: data.industry,
      country: data.country,
      companyName: data.companyName,
      companyWebsite: data.companyWebsite,
      companyPhone: data.companyPhone,
    },
  });
}

/**
 * Get all valuations for a user
 */
export async function getUserValuations(userId: string) {
  return prisma.valuation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      enterpriseValue: true,
      industry: true,
      country: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Get a single valuation by ID (with full data)
 */
export async function getValuationById(id: string, userId: string) {
  return prisma.valuation.findFirst({
    where: { id, userId },
  });
}

/**
 * Update a valuation
 */
export async function updateValuation(id: string, userId: string, data: UpdateValuationData) {
  return prisma.valuation.update({
    where: { id, userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.modelData !== undefined && { modelData: data.modelData as any }),
      ...(data.resultsData !== undefined && { resultsData: data.resultsData as any }),
      ...(data.enterpriseValue !== undefined && { enterpriseValue: data.enterpriseValue }),
      ...(data.industry !== undefined && { industry: data.industry }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.companyName !== undefined && { companyName: data.companyName }),
      ...(data.companyWebsite !== undefined && { companyWebsite: data.companyWebsite }),
      ...(data.companyPhone !== undefined && { companyPhone: data.companyPhone }),
    },
  });
}

/**
 * Delete a valuation
 */
export async function deleteValuation(id: string, userId: string) {
  return prisma.valuation.delete({
    where: { id, userId },
  });
}

/**
 * Get valuation count for a user
 */
export async function getUserValuationCount(userId: string) {
  return prisma.valuation.count({
    where: { userId },
  });
}
