/**
 * Database utilities for Valuation operations
 */
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type {
  FinancialModel,
  CalculatedFinancials,
  ValuationRecord,
  ValuationListItem,
  parseModelData,
  parseResultsData,
} from '@/lib/valuation.types';

interface CreateValuationData {
  userId: string;
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
}

interface UpdateValuationData {
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
}

/**
 * Create a new valuation
 */
export async function createValuation(data: CreateValuationData) {
  return prisma.valuation.create({
    data: {
      userId: data.userId,
      name: data.name,
      modelData: data.modelData as unknown as Prisma.InputJsonValue,
      resultsData: data.resultsData as unknown as Prisma.InputJsonValue,
      enterpriseValue: data.enterpriseValue,
      industry: data.industry,
      country: data.country,
      companyName: data.companyName,
      companyWebsite: data.companyWebsite,
      companyPhone: data.companyPhone,
      reportComment: data.reportComment,
    },
  });
}

/**
 * Get all valuations for a user
 */
export async function getUserValuations(userId: string): Promise<ValuationListItem[]> {
  return prisma.valuation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      enterpriseValue: true,
      industry: true,
      country: true,
      companyName: true,
      isPublished: true,
      shareToken: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Get a single valuation by ID (with full data)
 * Returns the raw database record - use parseValuationRecord to get typed data
 */
export async function getValuationById(id: string, userId: string) {
  return prisma.valuation.findFirst({
    where: { id, userId },
  });
}

/**
 * Helper to safely parse a valuation record with typed modelData and resultsData
 */
export function parseValuationRecord(record: any): ValuationRecord {
  return {
    ...record,
    modelData: record.modelData as FinancialModel,
    resultsData: record.resultsData as CalculatedFinancials,
  };
}

/**
 * Update a valuation
 */
export async function updateValuation(id: string, userId: string, data: UpdateValuationData) {
  return prisma.valuation.update({
    where: { id, userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.modelData !== undefined && { modelData: data.modelData as unknown as Prisma.InputJsonValue }),
      ...(data.resultsData !== undefined && { resultsData: data.resultsData as unknown as Prisma.InputJsonValue }),
      ...(data.enterpriseValue !== undefined && { enterpriseValue: data.enterpriseValue }),
      ...(data.industry !== undefined && { industry: data.industry }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.companyName !== undefined && { companyName: data.companyName }),
      ...(data.companyWebsite !== undefined && { companyWebsite: data.companyWebsite }),
      ...(data.companyPhone !== undefined && { companyPhone: data.companyPhone }),
      ...(data.reportComment !== undefined && { reportComment: data.reportComment }),
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

/**
 * Generate a unique share token
 */
function generateShareToken(): string {
  // Generate a random 16-character alphanumeric string
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Publish a valuation report (make it publicly accessible)
 */
export async function publishValuation(id: string, userId: string) {
  // Check if valuation exists and belongs to user
  const valuation = await getValuationById(id, userId);
  if (!valuation) {
    throw new Error('Valuation not found');
  }

  // Generate a unique share token if it doesn't exist
  const shareToken = valuation.shareToken || generateShareToken();

  return prisma.valuation.update({
    where: { id, userId },
    data: {
      isPublished: true,
      shareToken,
    },
  });
}

/**
 * Unpublish a valuation report (make it private)
 */
export async function unpublishValuation(id: string, userId: string) {
  return prisma.valuation.update({
    where: { id, userId },
    data: {
      isPublished: false,
    },
  });
}

/**
 * Get a published valuation by share token (public access, no auth required)
 */
export async function getPublishedValuationByToken(shareToken: string) {
  return prisma.valuation.findFirst({
    where: {
      shareToken,
      isPublished: true,
    },
    include: {
      scenarios: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

/**
 * Get a valuation by share token with owner check
 * Returns the valuation if:
 * - It's published (anyone can see), OR
 * - The requesting user is the owner (can preview unpublished)
 */
export async function getValuationByTokenWithOwnerCheck(shareToken: string, userId?: string) {
  const valuation = await prisma.valuation.findFirst({
    where: { shareToken },
    include: {
      scenarios: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!valuation) {
    return null;
  }

  // If published, anyone can see it
  if (valuation.isPublished) {
    return valuation;
  }

  // If not published, only the owner can see it
  if (userId && valuation.userId === userId) {
    return valuation;
  }

  // Not published and not the owner
  return null;
}

/**
 * Ensure a valuation has a share token (generates one if missing)
 */
export async function ensureShareToken(id: string, userId: string) {
  const valuation = await getValuationById(id, userId);
  if (!valuation) {
    throw new Error('Valuation not found');
  }

  if (valuation.shareToken) {
    return valuation;
  }

  // Generate a new share token
  const shareToken = generateShareToken();
  return prisma.valuation.update({
    where: { id, userId },
    data: { shareToken },
  });
}
