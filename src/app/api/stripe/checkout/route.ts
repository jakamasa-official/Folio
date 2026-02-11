import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    if (
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY === "sk_test_placeholder"
    ) {
      return NextResponse.json(
        { error: "Stripe の設定が必要です" },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "プロフィールが見つかりません" }, { status: 404 });
    }

    const body = await request.json();
    const tier = body.tier as "pro" | "pro_plus";
    const period = body.period as "monthly" | "yearly";

    if (tier !== "pro" && tier !== "pro_plus") {
      return NextResponse.json({ error: "無効なプランです" }, { status: 400 });
    }
    if (period !== "monthly" && period !== "yearly") {
      return NextResponse.json({ error: "無効な期間です" }, { status: 400 });
    }

    // Get or create Stripe customer
    let customerId = profile.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { profile_id: profile.id, user_id: user.id },
      });
      customerId = customer.id;

      await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", profile.id);
    }

    // Determine price ID based on tier + period
    const priceIdMap: Record<string, string | undefined> = {
      pro_monthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
      pro_yearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY,
      pro_plus_monthly: process.env.STRIPE_PRICE_ID_PRO_PLUS_MONTHLY,
      pro_plus_yearly: process.env.STRIPE_PRICE_ID_PRO_PLUS_YEARLY,
    };

    const priceId = priceIdMap[`${tier}_${period}`];

    if (!priceId) {
      return NextResponse.json(
        { error: "このプランの価格が設定されていません" },
        { status: 503 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/billing?canceled=true`,
      metadata: {
        profile_id: profile.id,
        tier,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "チェックアウトセッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
