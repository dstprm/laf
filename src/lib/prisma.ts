/**
 * Prisma client singleton
 *
 * Dev: enables query logging
 * Prod: plain client (no logging) for performance and security
 */
import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isProduction = process.env.NODE_ENV === 'production';

const clientOptions: Prisma.PrismaClientOptions | undefined = isProduction ? undefined : { log: ['query'] };

export const prisma = globalForPrisma.prisma ?? new PrismaClient(clientOptions);

if (!isProduction) globalForPrisma.prisma = prisma;
