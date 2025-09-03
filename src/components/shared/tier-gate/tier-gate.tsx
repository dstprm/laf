'use client';

import { ReactNode } from 'react';
import { useUserTier } from '@/hooks/useUserTier';
import { getTierById } from '@/constants/pricing-tier';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Zap, Crown, Star } from 'lucide-react';
import Link from 'next/link';

interface TierGateProps {
  /**
   * The minimum tier level required to access this content
   * 1 = Starter, 2 = Pro, 3 = Advanced
   */
  requiredLevel: 1 | 2 | 3;

  /**
   * The content to show when user has access
   */
  children: ReactNode;

  /**
   * Custom fallback content when access is denied
   * If not provided, shows default upgrade prompt
   */
  fallback?: ReactNode;

  /**
   * Title for the upgrade prompt (optional)
   */
  featureTitle?: string;

  /**
   * Description for what this feature does (optional)
   */
  featureDescription?: string;
}

/**
 * TierGate Component
 *
 * Wraps content and only shows it if the user's subscription tier
 * meets or exceeds the required level. Shows upgrade prompt otherwise.
 *
 * @example
 * <TierGate requiredLevel={2} featureTitle="Advanced Analytics">
 *   <AdvancedAnalyticsComponent />
 * </TierGate>
 */
export function TierGate({ requiredLevel, children, fallback, featureTitle, featureDescription }: TierGateProps) {
  const { hasAccess, isLoading, tier } = useUserTier();

  // Show loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Loading access level...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // User has access - show the content
  if (hasAccess(requiredLevel)) {
    return <>{children}</>;
  }

  // User doesn't have access - show fallback or upgrade prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  const requiredTier = getTierById(['starter', 'pro', 'advanced'][requiredLevel - 1]);
  const tierIcons = { 1: Star, 2: Zap, 3: Crown };
  const TierIcon = tierIcons[requiredLevel];

  return (
    <Card className="w-full border-dashed border-2 border-muted-foreground/20">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg font-semibold">{featureTitle || `${requiredTier?.name} Feature`}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          {featureDescription || `This feature requires a ${requiredTier?.name} subscription or higher to access.`}
        </p>

        {/* Show current tier vs required */}
        <div className="flex items-center justify-center gap-3 md:gap-4 text-xs flex-wrap">
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>Current:</span>
            <span className="font-medium">{tier ? tier.name : 'Free'}</span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <div className="flex items-center gap-1 text-primary">
            <TierIcon className="h-3 w-3 shrink-0" />
            <span>Required:</span>
            <span className="font-medium">{requiredTier?.name}</span>
          </div>
        </div>

        {/* Upgrade button */}
        <div className="pt-2">
          <Button asChild size="sm" className="w-full">
            <Link href="/dashboard/subscriptions">Upgrade to {requiredTier?.name}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
