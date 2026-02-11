/**
 * Pro tier gating utilities.
 *
 * Free-plan limits and Pro-only feature checks used by both API routes
 * and client-side components.
 */

export const FREE_LIMITS = {
  customers: 50,
  stampCards: 1,
  coupons: 3,
  templates: 4, // number of free profile templates
} as const;

const PRO_ONLY_FEATURES = [
  "email_campaigns",
  "reviews",
  "referrals",
  "campaigns",
  "line_integration",
  "custom_domain",
  "segments",
] as const;

export type ProOnlyFeature = (typeof PRO_ONLY_FEATURES)[number];

/**
 * Returns true when the feature is available on the user's current plan.
 * Pro users always have access to every feature.
 */
export function isFeatureAvailable(feature: string, isPro: boolean): boolean {
  if (isPro) return true;
  return !(PRO_ONLY_FEATURES as readonly string[]).includes(feature);
}

/**
 * Returns true when the user is within the free-tier limit for a
 * countable resource (customers, stamp cards, coupons).
 */
export function isWithinFreeLimit(
  resource: keyof typeof FREE_LIMITS,
  currentCount: number,
  isPro: boolean,
): boolean {
  if (isPro) return true;
  return currentCount < FREE_LIMITS[resource];
}
