'use client';

import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { Pricing } from '@/components/home/pricing/pricing';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState } from 'react';

export function NoSubscriptionView() {
  const [country] = useState('US');

  return (
    <>
      <DashboardPageHeader pageTitle={'Subscriptions'} />
      <div className={'w-full'}>
        <div className={'mx-auto max-w-7xl px-[32px] mb-6'}>
          <Alert>
            <AlertTitle>No active subscription</AlertTitle>
            <AlertDescription>You have not yet subscribed. Choose a plan below to get started.</AlertDescription>
          </Alert>
        </div>
        <Pricing country={country} />
      </div>
    </>
  );
}
