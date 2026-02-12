import { NextResponse } from "next/server";
import { stripe, getTierFromPriceId } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const profileId = session.metadata?.profile_id;
        const tier = (session.metadata?.tier as "pro" | "pro_plus") || "pro";

        if (profileId) {
          await supabaseAdmin
            .from("profiles")
            .update({
              is_pro: true,
              plan_tier: tier,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
            })
            .eq("id", profileId);

          console.log(`[Stripe] Profile upgraded to ${tier}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const isActive = subscription.status === "active" || subscription.status === "trialing";

        // Determine tier from the subscription's price
        const priceId = subscription.items.data[0]?.price?.id;
        const tier = priceId ? getTierFromPriceId(priceId) : "pro";

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (profile) {
          await supabaseAdmin
            .from("profiles")
            .update({
              is_pro: isActive,
              plan_tier: isActive ? tier : "free",
              stripe_subscription_id: subscription.id,
            })
            .eq("id", profile.id);

          console.log(`[Stripe] Subscription updated: tier=${isActive ? tier : "free"}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (profile) {
          await supabaseAdmin
            .from("profiles")
            .update({
              is_pro: false,
              plan_tier: "free",
              stripe_subscription_id: null,
            })
            .eq("id", profile.id);

          console.log("[Stripe] Subscription canceled");
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        console.warn("[Stripe] Payment failed for a customer");
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`[Stripe] Error processing webhook event ${event.type}:`, error);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
