import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function getContactRequests(page: number = 1, limit: number = 10, query?: string) {
  const take = Math.max(1, Math.min(100, limit));
  const skip = Math.max(0, (page - 1) * take);
  const where: Prisma.ContactRequestWhereInput | undefined = query
    ? {
        OR: [
          { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { subject: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { message: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { source: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : undefined;

  const [total, requests] = await Promise.all([
    prisma.contactRequest.count({ where }),
    prisma.contactRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
  ]);

  const totalPages = Math.ceil(total / take) || 1;

  return {
    requests,
    total,
    page,
    totalPages,
  };
}

export async function deleteContactRequest(id: string) {
  await prisma.contactRequest.delete({ where: { id } });
}
