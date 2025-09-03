import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { DashboardLayout } from '@/components/dashboard/layout/dashboard-layout';
import { syncUserSubscriptionsIfStale } from '@/utils/database/sync-subscriptions';

interface Props {
  children: ReactNode;
}

export default async function Layout({ children }: Props) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
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
