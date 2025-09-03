/**
 * User DB helpers
 *
 * getUserByEmail/getUserByClerkId: lookups used by webhooks and actions.
 * upsertUser: creates or updates basic profile fields; may set isAdmin based on business policy.
 */
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function getUserByClerkId(clerkUserId: string) {
  return await prisma.user.findUnique({
    where: {
      clerkUserId,
    },
    include: {
      customer: {
        include: {
          subscriptions: true,
        },
      },
    },
  });
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      customer: true,
    },
  });
}

export async function upsertUser(data: {
  clerkUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isAdmin?: boolean;
}) {
  // First-user admin bootstrap is gated by env to avoid accidental elevation in prod. Can be removed safely if we don't want to allow first-user admin.
  const userCount = await prisma.user.count();
  const allowFirstUserAdmin = (process.env.ALLOW_FIRST_USER_ADMIN || 'false').toLowerCase() === 'true';
  const shouldBeAdmin = data.isAdmin || (allowFirstUserAdmin && userCount === 0);

  return await prisma.user.upsert({
    where: {
      clerkUserId: data.clerkUserId,
    },
    update: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: data.avatar,
      isAdmin: data.isAdmin !== undefined ? data.isAdmin : undefined,
      updatedAt: new Date(),
    },
    create: {
      clerkUserId: data.clerkUserId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: data.avatar,
      isAdmin: shouldBeAdmin,
    },
  });
}

export async function createCustomerForUser(userId: string, paddleCustomerId: string) {
  return await prisma.customer.create({
    data: {
      userId,
      paddleCustomerId,
    },
  });
}

// Admin-specific functions
export async function getAllUsers(page: number = 1, limit: number = 10, query?: string) {
  const skip = (page - 1) * limit;
  const where = query
    ? {
        OR: [
          { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { firstName: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { lastName: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      where,
      include: {
        customer: {
          include: {
            subscriptions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateUserAdmin(userId: string, isAdmin: boolean) {
  return await prisma.user.update({
    where: { id: userId },
    data: { isAdmin },
  });
}

export async function deleteUser(userId: string) {
  // This will cascade delete the customer and subscriptions due to onDelete: Cascade
  return await prisma.user.delete({
    where: { id: userId },
  });
}

export async function isUserAdmin(clerkUserId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { isAdmin: true },
  });

  return user?.isAdmin || false;
}
