/**
 * Customer DB helpers
 *
 * createCustomer: link a local User to a Paddle customer id (1:1).
 * Invariant: a Customer must reference an existing User; do not create orphan customers.
 */
import { prisma } from '@/lib/prisma';

export async function getCustomerByPaddleId(paddleCustomerId: string) {
  return await prisma.customer.findUnique({
    where: {
      paddleCustomerId,
    },
    include: {
      user: true,
      subscriptions: true,
    },
  });
}

export async function getCustomerByUserId(userId: string) {
  return await prisma.customer.findUnique({
    where: {
      userId,
    },
    include: {
      user: true,
      subscriptions: true,
    },
  });
}

export async function createCustomer(data: { userId: string; paddleCustomerId: string }) {
  return await prisma.customer.create({
    data: {
      userId: data.userId,
      paddleCustomerId: data.paddleCustomerId,
    },
    include: {
      user: true,
    },
  });
}

export async function updateCustomer(customerId: string, data: { paddleCustomerId?: string }) {
  return await prisma.customer.update({
    where: {
      id: customerId,
    },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

export async function setCustomerOverride(userId: string, overrideTier: string | null, overrideExpiresAt: Date | null) {
  return await prisma.customer.update({
    where: { userId },
    data: {
      overrideTier,
      overrideExpiresAt,
      updatedAt: new Date(),
    },
  });
}
