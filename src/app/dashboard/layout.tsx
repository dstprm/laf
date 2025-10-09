import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { DashboardLayout } from '@/components/dashboard/layout/dashboard-layout';
import { syncUserSubscriptionsIfStale } from '@/utils/database/sync-subscriptions';
import { getUserByClerkId, getUserByEmail, upsertUser } from '@/utils/database/user';
import { prisma } from '@/lib/prisma';

interface Props {
  children: ReactNode;
}

export default async function Layout({ children }: Props) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  // Ensure a corresponding local User exists for the authenticated Clerk user.
  // This prevents redirect loops when pages expect a DB user but webhooks haven't created it yet.
  try {
    const dbUser = await getUserByClerkId(userId);
    if (!dbUser) {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);

      const primaryEmail = clerkUser.emailAddresses.find(
        (email: { id: string }) => email.id === clerkUser.primaryEmailAddressId,
      );

      if (primaryEmail?.emailAddress) {
        // If a user exists with this email but a different Clerk ID, link it to this Clerk ID
        const existingByEmail = await getUserByEmail(primaryEmail.emailAddress);
        if (existingByEmail && existingByEmail.clerkUserId !== userId) {
          try {
            await prisma.user.update({
              where: { id: existingByEmail.id },
              data: {
                clerkUserId: userId,
                firstName: clerkUser.firstName || undefined,
                lastName: clerkUser.lastName || undefined,
                avatar: clerkUser.imageUrl || undefined,
                updatedAt: new Date(),
              },
            });
          } catch (linkErr) {
            console.error('Failed to link existing user by email to Clerk ID:', linkErr);
          }
        } else {
          await upsertUser({
            clerkUserId: clerkUser.id,
            email: primaryEmail.emailAddress,
            firstName: clerkUser.firstName || undefined,
            lastName: clerkUser.lastName || undefined,
            avatar: clerkUser.imageUrl || undefined,
          });
        }
      }
    }
  } catch (ensureUserError) {
    console.error('Failed to ensure local user exists:', ensureUserError);
    // Do not block rendering; continue gracefully.
  }

  // SUBSCRIPTION SYNC FALLBACK: Sync subscription data from Paddle if stale
  // This runs in the background as a fallback in case webhooks fail
  // Only syncs if data hasn't been updated in the last 10 minutes
  syncUserSubscriptionsIfStale(10).catch((error) => {
    // Silently handle errors to avoid breaking user experience
    console.error('Background subscription sync failed:', error);
  });

  return <DashboardLayout>{children}</DashboardLayout>;
}
