import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, is_pro, plan_tier")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "プロフィールが見つかりません" },
        { status: 404 },
      );
    }

    // Fetch counts in parallel
    const [customerResult, stampCardResult, couponResult] = await Promise.all([
      supabaseAdmin
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile.id),
      supabaseAdmin
        .from("stamp_cards")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile.id),
      supabaseAdmin
        .from("coupons")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile.id),
    ]);

    const isPro = profile.is_pro || (profile.plan_tier && profile.plan_tier !== "free");

    return NextResponse.json({
      is_pro: isPro ?? false,
      customer_count: customerResult.count ?? 0,
      stamp_card_count: stampCardResult.count ?? 0,
      coupon_count: couponResult.count ?? 0,
    });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 },
    );
  }
}
