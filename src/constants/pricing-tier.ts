/**
 * HIERARCHICAL PRICING TIER SYSTEM
 *
 * This defines a 3-tier hierarchy where customers can only have one active plan at a time:
 * - Starter (Level 1): Basic plan for individuals
 * - Pro (Level 2): Enhanced plan for scaling teams
 * - Advanced (Level 3): Premium plan for extensive collaboration
 *
 * Key features:
 * - hierarchyLevel: Used for upgrade/downgrade determination (lower = cheaper)
 * - productId: Maps to Paddle product IDs for webhook processing
 * - Unique tier IDs ensure proper plan identification
 */
export interface Tier {
  name: string;
  id: 'starter' | 'pro' | 'advanced';
  productId: string;
  hierarchyLevel: number; // Lower number = lower tier (1=Starter, 2=Pro, 3=Advanced)
  icon: string;
  description: string;
  /**
   * Number of generic features to display for this tier.
   * Note: We intentionally use generic labels (e.g., "feature 1") to keep this template
   * product-agnostic. Apps can replace the generator below with real feature lists.
   */
  featureCount: number;
  featured: boolean;
  priceId: Record<string, string>;
}
/*
  Replace the priceId with the actual priceId from Paddle. You can find the priceId in the Paddle dashboard
  under Catalog > Products
*/
export const PricingTier: Tier[] = [
  {
    name: 'Inicial',
    id: 'starter',
    productId: 'pro_starter',
    hierarchyLevel: 1,
    icon: '/assets/icons/price-tiers/free-icon.svg',
    description: 'Descripción del plan inicial',
    featureCount: 3,
    featured: false,
    priceId: { month: 'pri_', year: 'pri_' },
  },
  {
    name: 'Pro',
    id: 'pro',
    productId: 'pro_pro',
    hierarchyLevel: 2,
    icon: '/assets/icons/price-tiers/basic-icon.svg',
    description: 'Descripción del plan Pro',
    featureCount: 4,
    featured: true,
    priceId: { month: 'pri_', year: 'pri_' },
  },
  {
    name: 'Avanzado',
    id: 'advanced',
    productId: 'pro_advanced',
    hierarchyLevel: 3,
    icon: '/assets/icons/price-tiers/pro-icon.svg',
    description: 'Descripción del plan Avanzado',
    featureCount: 5,
    featured: false,
    priceId: { month: 'pri_', year: 'pri_' },
  },
];

/**
 * TIER MANAGEMENT UTILITIES
 *
 * These helper functions enable the hierarchical subscription system by providing
 * easy lookups and comparisons between different pricing tiers.
 */

// Find tier by Paddle price ID (monthly or yearly)
export function getTierByPriceId(priceId: string): Tier | undefined {
  return PricingTier.find((tier) => tier.priceId.month === priceId || tier.priceId.year === priceId);
}

// Find tier by our internal tier ID
export function getTierById(id: string): Tier | undefined {
  return PricingTier.find((tier) => tier.id === id);
}

// Find tier by Paddle product ID (used in webhooks)
export function getTierByProductId(productId: string): Tier | undefined {
  return PricingTier.find((tier) => tier.productId === productId);
}

// Compare two tiers in the hierarchy (used for upgrade/downgrade logic)
export function compareTierHierarchy(tierA: Tier, tierB: Tier): 'higher' | 'lower' | 'same' {
  if (tierA.hierarchyLevel > tierB.hierarchyLevel) return 'higher';
  if (tierA.hierarchyLevel < tierB.hierarchyLevel) return 'lower';
  return 'same';
}

/**
 * Generate generic feature labels for a given tier.
 * Centralized so that all UI references stay consistent and editable in one place.
 */
export function getFeaturesForTier(tier: Tier): string[] {
  const count = Math.max(0, Math.floor(tier.featureCount || 0));
  return Array.from({ length: count }, (_, index) => `feature ${index + 1}`);
}
