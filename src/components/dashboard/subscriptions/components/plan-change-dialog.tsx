'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Subscription } from '@paddle/paddle-node-sdk';
import { PricingTier, Tier, getFeaturesForTier } from '@/constants/pricing-tier';
import { previewPlanChange, updateSubscriptionPlan } from '@/app/dashboard/subscriptions/actions';
import { usePaddlePrices } from '@/hooks/usePaddlePrices';
import { initializePaddle, Environments, Paddle } from '@paddle/paddle-js';
import { CheckCircle, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { Toggle } from '@/components/shared/toggle/toggle';
import { BillingFrequency, IBillingFrequency } from '@/constants/billing-frequency';
import Image from 'next/image';

interface Props {
  subscription: Subscription;
  trigger?: React.ReactNode;
}

export function PlanChangeDialog({ subscription, trigger }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paddle, setPaddle] = useState<Paddle | undefined>(undefined);
  const { toast } = useToast();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    priceId: string;
    tierName: string;
    planType: 'current' | 'upgrade' | 'downgrade';
    planPriceFormatted: string;
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    currency: string;
    todayTotalFormatted: string;
    creditToBalanceFormatted?: string;
    prorationMode: 'prorated_immediately' | 'do_not_bill';
  } | null>(null);

  // Current active price and inferred frequency
  const currentPriceId = subscription.items[0].price?.id;
  const currentFrequency = subscription.billingCycle.interval;
  const [frequency, setFrequency] = useState<IBillingFrequency>(
    BillingFrequency.find((f) => f.value === currentFrequency) || BillingFrequency[0],
  );

  const { prices, loading: pricesLoading } = usePaddlePrices(paddle, 'US');

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN && process.env.NEXT_PUBLIC_PADDLE_ENV) {
      initializePaddle({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        environment: process.env.NEXT_PUBLIC_PADDLE_ENV as Environments,
      }).then((paddle) => {
        if (paddle) {
          setPaddle(paddle);
        }
      });
    }
  }, []);

  /**
   * Derive the current tier from the known monthly/yearly price IDs.
   * Centralized here to keep tier lookups consistent with PricingTier mapping.
   */
  function getCurrentTier(): Tier | null {
    return (
      PricingTier.find((tier) => tier.priceId.month === currentPriceId || tier.priceId.year === currentPriceId) || null
    );
  }

  // HIERARCHY-BASED PLAN COMPARISON with frequency-awareness for same-tier switches
  function getPlanType(
    tier: Tier,
    currentTier: Tier | null,
    targetPriceId: string,
  ): 'current' | 'upgrade' | 'downgrade' {
    if (!currentTier) return 'upgrade';

    // Exact same plan (same tier and same billing frequency)
    if (targetPriceId === currentPriceId) return 'current';

    // Same tier, switching frequency
    if (tier.id === currentTier.id) {
      const isMonthToYear = currentPriceId === currentTier.priceId.month && targetPriceId === currentTier.priceId.year;
      const isYearToMonth = currentPriceId === currentTier.priceId.year && targetPriceId === currentTier.priceId.month;
      if (isMonthToYear) return 'upgrade';
      if (isYearToMonth) return 'downgrade';
      return 'current';
    }

    // Different tier: compare by hierarchy level
    return tier.hierarchyLevel > currentTier.hierarchyLevel ? 'upgrade' : 'downgrade';
  }

  async function handlePlanChange(newPriceId: string, tierName: string) {
    // Guard: avoid redundant calls
    if (newPriceId === currentPriceId) return;

    setLoading(true);
    try {
      const result = await updateSubscriptionPlan(subscription.id, newPriceId);

      if ('error' in result) {
        toast({
          description: (
            <div className="flex items-center gap-3">
              <div className="text-destructive font-medium">Error updating plan</div>
              <div className="text-muted-foreground text-sm">{result.error}</div>
            </div>
          ),
        });
      } else {
        toast({
          description: (
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-500" />
              <div className="flex flex-col gap-1">
                <span className="text-primary font-medium">Plan updated successfully</span>
                <span className="text-muted-foreground text-sm">Your subscription has been updated to {tierName}</span>
              </div>
            </div>
          ),
        });
        setIsOpen(false);

        // FORCE REFRESH MECHANISM: Ensure UI updates immediately after plan change
        // 1. Call force refresh API to invalidate Next.js caches
        // 2. Hard reload the page to fetch fresh data from server
        setTimeout(async () => {
          try {
            await fetch('/dashboard/subscriptions/force-refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            });

            // Hard reload ensures all cached subscription data is refreshed
            window.location.reload();
          } catch (error) {
            console.error('Failed to force refresh:', error);
            // Fallback to regular reload
            window.location.reload();
          }
        }, 800);
      }
    } catch {
      toast({
        description: (
          <div className="flex items-center gap-3">
            <div className="text-destructive font-medium">Error</div>
            <div className="text-muted-foreground text-sm">Something went wrong, please try again later</div>
          </div>
        ),
      });
    } finally {
      setLoading(false);
    }
  }

  const currentTier = getCurrentTier();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Change Plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Change Your Plan</DialogTitle>
          <DialogDescription>
            Select a new plan for your subscription. Upgrades are billed immediately and prorated; downgrades do not
            bill immediately.
          </DialogDescription>
        </DialogHeader>

        {/* Billing frequency toggle (Monthly / Annual) */}
        <div className="mt-2">
          <Toggle frequency={frequency} setFrequency={setFrequency} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-6">
          {PricingTier.map((tier) => {
            const priceId = frequency.value === 'month' ? tier.priceId.month : tier.priceId.year;
            const planType = getPlanType(tier, currentTier, priceId);
            const isCurrentPlan = priceId === currentPriceId;

            // Get real price from Paddle
            const paddlePrice = prices[priceId];
            const formattedPrice = paddlePrice || '$0';

            return (
              <Card
                key={tier.id}
                className={`relative ${isCurrentPlan ? 'ring-2 ring-primary' : ''} ${tier.featured ? 'border-primary' : ''}`}
              >
                {isCurrentPlan && <Badge className="absolute -top-2 left-4 bg-primary">Current Plan</Badge>}
                {tier.featured && !isCurrentPlan && (
                  <Badge className="absolute -top-2 left-4 bg-blue-500">Recommended</Badge>
                )}

                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Image src={tier.icon} alt={tier.name} width={32} height={32} className="w-8 h-8" />
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {tier.name}
                        {planType === 'upgrade' && <ArrowUp className="w-4 h-4 text-green-500" />}
                        {planType === 'downgrade' && <ArrowDown className="w-4 h-4 text-orange-500" />}
                      </CardTitle>
                      <CardDescription>{tier.description}</CardDescription>
                    </div>
                  </div>

                  <div className="text-2xl font-bold">
                    {pricesLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <>
                        {formattedPrice.replace(/\.00$/, '')}
                        <span className="text-sm font-normal text-muted-foreground">/{frequency.value}</span>
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {getFeaturesForTier(tier).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full mt-4"
                    variant={isCurrentPlan ? 'secondary' : 'default'}
                    disabled={isCurrentPlan || loading || pricesLoading}
                    onClick={() => {
                      setPendingChange({ priceId, tierName: tier.name, planType, planPriceFormatted: formattedPrice });
                      setConfirmOpen(true);
                      setPreviewLoading(true);
                      setPreviewError(null);
                      setPreviewData(null);
                      previewPlanChange(subscription.id, priceId).then((res) => {
                        if ('error' in res) {
                          setPreviewError(res.error);
                          setPreviewData(null);
                        } else {
                          setPreviewData({
                            currency: res.currency,
                            todayTotalFormatted: res.todayTotalFormatted,
                            creditToBalanceFormatted: res.creditToBalanceFormatted,
                            prorationMode: res.prorationMode,
                          });
                        }
                        setPreviewLoading(false);
                      });
                    }}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : pricesLoading ? (
                      'Loading...'
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : planType === 'upgrade' ? (
                      'Upgrade'
                    ) : (
                      'Downgrade'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Confirmation dialog */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {pendingChange?.planType === 'upgrade'
                  ? 'Confirm upgrade'
                  : pendingChange?.planType === 'downgrade'
                    ? 'Confirm downgrade'
                    : 'Confirm plan change'}
              </DialogTitle>
              <DialogDescription>
                {`You're about to change your plan to ${pendingChange?.tierName ?? ''} (${frequency.value}).`}
                <br />
                {pendingChange?.planType === 'upgrade'
                  ? 'Upgrades apply immediately.'
                  : pendingChange?.planType === 'downgrade'
                    ? 'Downgrades apply immediately (no immediate charge; any credit may offset future invoices).'
                    : 'This change will update your current subscription.'}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 text-sm space-y-2">
              {pendingChange && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plan price</span>
                  <span className="font-medium">
                    {pendingChange.planPriceFormatted.replace(/\.00$/, '')}
                    <span className="text-sm font-normal text-muted-foreground">/{frequency.value}</span>
                  </span>
                </div>
              )}
              {previewLoading ? (
                <div className="text-muted-foreground">Calculating your estimated charge…</div>
              ) : previewError ? (
                <div className="text-destructive">{previewError}</div>
              ) : previewData ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Estimated today</span>
                    <span className="font-medium">
                      {previewData.prorationMode === 'do_not_bill' ? '—' : previewData.todayTotalFormatted}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {previewData.prorationMode === 'do_not_bill'
                      ? 'No immediate charge. Your next invoice will reflect this change.'
                      : 'Billed now with prorated amount for the remainder of this period.'}
                  </div>
                  {previewData.creditToBalanceFormatted && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Credit to balance</span>
                      <span className="font-medium">{previewData.creditToBalanceFormatted}</span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            {/* Following Paddle defaults: no end-of-term scheduler is exposed by default.
                See SUBSCRIPTION_PLAN_CHANGES.md for enabling a scheduled downgrade option. */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (pendingChange) {
                    setConfirmOpen(false);
                    handlePlanChange(pendingChange.priceId, pendingChange.tierName);
                  }
                }}
                disabled={loading}
              >
                Confirm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
