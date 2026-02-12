import Stripe from "stripe";

export { PLANS } from "./plans";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

// Map Stripe Price IDs to plan tiers
export function getTierFromPriceId(priceId: string): "pro" | "pro_plus" {
  const proPriceIds = [
    process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
    process.env.STRIPE_PRICE_ID_PRO_YEARLY,
  ];
  const proPlusPriceIds = [
    process.env.STRIPE_PRICE_ID_PRO_PLUS_MONTHLY,
    process.env.STRIPE_PRICE_ID_PRO_PLUS_YEARLY,
  ];

  if (proPlusPriceIds.includes(priceId)) return "pro_plus";
  if (proPriceIds.includes(priceId)) return "pro";

  // Default to pro if unknown
  return "pro";
}
