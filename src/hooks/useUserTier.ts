'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { getTierById } from '@/constants/pricing-tier';
import type { Tier } from '@/constants/pricing-tier';

interface UserTierData {
  tier: Tier | null;
  hierarchyLevel: number;
  isLoading: boolean;
  subscriptionStatus?: string | null;
  isActiveOrTrialing: boolean;
  hasAccess: (requiredLevel: number) => boolean;
}

interface TierCacheData {
  tier: Tier | null;
  hierarchyLevel: number;
  isActiveOrTrialing: boolean;
  subscriptionStatus: string | null;
  timestamp: number;
}

// Global cache to share data across all hook instances
let tierCache: TierCacheData | null = null;
let activeRequest: Promise<TierCacheData> | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Shared function to fetch tier data with request deduplication
 * Multiple simultaneous calls will share the same request
 */
async function fetchTierData(): Promise<TierCacheData> {
  // If there's already an active request, return it
  if (activeRequest) {
    return activeRequest;
  }

  // If we have fresh cached data, return it
  if (tierCache && Date.now() - tierCache.timestamp < CACHE_DURATION) {
    return Promise.resolve(tierCache);
  }

  // Create new request
  activeRequest = (async () => {
    try {
      const response = await fetch('/api/user/tier', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const currentTierId = data.currentTier as string | null | undefined;

        if (currentTierId) {
          const tier = getTierById(currentTierId);
          const result: TierCacheData = {
            tier: tier || null,
            hierarchyLevel: tier?.hierarchyLevel || 0,
            isActiveOrTrialing: Boolean(data.isActiveOrTrialing),
            subscriptionStatus: (data.subscriptionStatus as string | null | undefined) ?? null,
            timestamp: Date.now(),
          };
          tierCache = result;
          return result;
        } else {
          // User exists but no subscription
          const result: TierCacheData = {
            tier: null,
            hierarchyLevel: 0,
            isActiveOrTrialing: false,
            subscriptionStatus: null,
            timestamp: Date.now(),
          };
          tierCache = result;
          return result;
        }
      } else {
        console.error('Failed to fetch user tier');
        const result: TierCacheData = {
          tier: null,
          hierarchyLevel: 0,
          isActiveOrTrialing: false,
          subscriptionStatus: null,
          timestamp: Date.now(),
        };
        tierCache = result;
        return result;
      }
    } catch (error) {
      console.error('Error fetching user tier:', error);
      const result: TierCacheData = {
        tier: null,
        hierarchyLevel: 0,
        isActiveOrTrialing: false,
        subscriptionStatus: null,
        timestamp: Date.now(),
      };
      tierCache = result;
      return result;
    } finally {
      // Clear active request
      activeRequest = null;
    }
  })();

  return activeRequest;
}

/**
 * Hook to get the current user's subscription tier and check access levels
 * Uses shared cache and request deduplication for optimal performance
 *
 * @returns UserTierData with tier info and access checking function
 */
export function useUserTier(): UserTierData {
  const { user, isLoaded } = useUser();
  const [tierData, setTierData] = useState<{
    tier: Tier | null;
    hierarchyLevel: number;
    isActiveOrTrialing: boolean;
    subscriptionStatus: string | null;
  }>({
    tier: null,
    hierarchyLevel: 0, // 0 = no subscription (free user)
    isActiveOrTrialing: false,
    subscriptionStatus: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUserTier() {
      if (!isLoaded) return;

      setIsLoading(true);

      try {
        if (!user) {
          // No user = no access
          setTierData({ tier: null, hierarchyLevel: 0, isActiveOrTrialing: false, subscriptionStatus: null });
          return;
        }

        // Use shared fetch function with caching and deduplication
        const result = await fetchTierData();
        setTierData({
          tier: result.tier,
          hierarchyLevel: result.hierarchyLevel,
          isActiveOrTrialing: result.isActiveOrTrialing,
          subscriptionStatus: result.subscriptionStatus,
        });
      } catch (error) {
        console.error('Error loading user tier:', error);
        setTierData({ tier: null, hierarchyLevel: 0, isActiveOrTrialing: false, subscriptionStatus: null });
      } finally {
        setIsLoading(false);
      }
    }

    loadUserTier();
  }, [user, isLoaded]);

  /**
   * Check if user has access to a feature requiring a certain tier level
   * @param requiredLevel - The minimum hierarchy level required (1=Starter, 2=Pro, 3=Advanced)
   * @returns true if user has access, false otherwise
   */
  const hasAccess = (requiredLevel: number): boolean => {
    // Must meet tier AND have an eligible subscription status
    return tierData.hierarchyLevel >= requiredLevel && tierData.isActiveOrTrialing;
  };

  return {
    tier: tierData.tier,
    hierarchyLevel: tierData.hierarchyLevel,
    isLoading,
    subscriptionStatus: tierData.subscriptionStatus,
    isActiveOrTrialing: tierData.isActiveOrTrialing,
    hasAccess,
  };
}

/**
 * Function to invalidate the tier cache
 * Call this after subscription changes to force fresh data
 */
export function invalidateTierCache(): void {
  tierCache = null;
  activeRequest = null;
}
