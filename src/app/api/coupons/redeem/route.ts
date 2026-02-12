import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Rate limit: 10 redeem attempts per IP per hour
const redeemRateLimit = new Map<string, { count: number; resetAt: number }>();
let lastRedeemCleanup = Date.now();

function checkRedeemRateLimit(ip: string): boolean {
  const now = Date.now();
  // Periodically purge expired entries to prevent unbounded growth
  if (now - lastRedeemCleanup > 30 * 60 * 1000) {
    for (const [k, v] of redeemRateLimit) {
      if (now > v.resetAt) redeemRateLimit.delete(k);
    }
    lastRedeemCleanup = now;
  }
  const entry = redeemRateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    redeemRateLimit.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    if (!checkRedeemRateLimit(ip)) {
      return NextResponse.json(
        { error: "リクエスト回数の上限に達しました。しばらくしてからお試しください" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { profile_id, code } = body;

    if (!profile_id || typeof profile_id !== "string") {
      return NextResponse.json(
        { error: "プロフィールIDは必須です" },
        { status: 400 }
      );
    }

    if (!code || typeof code !== "string" || code.length > 50) {
      return NextResponse.json(
        { error: "クーポンコードが無効です" },
        { status: 400 }
      );
    }

    // Find the coupon
    const { data: coupon, error: fetchError } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("profile_id", profile_id)
      .eq("code", code.toUpperCase())
      .maybeSingle();

    if (fetchError || !coupon) {
      // Generic error to prevent code enumeration
      return NextResponse.json(
        { error: "クーポンが見つかりません" },
        { status: 404 }
      );
    }

    // Validate: is_active — use same generic error to prevent enumeration
    if (!coupon.is_active) {
      return NextResponse.json(
        { error: "クーポンが見つかりません" },
        { status: 404 }
      );
    }

    // Validate: not expired — use same generic error to prevent enumeration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "クーポンが見つかりません" },
        { status: 404 }
      );
    }

    // Atomic increment with usage_limit check to prevent race condition
    // Only increment if times_used < usage_limit (or no limit)
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("coupons")
      .update({ times_used: coupon.times_used + 1 })
      .eq("id", coupon.id)
      .lt("times_used", coupon.usage_limit ?? 2147483647)
      .select("id")
      .maybeSingle();

    if (updateError) {
      console.error("クーポン利用更新エラー:", updateError);
      return NextResponse.json(
        { error: "クーポンの利用処理に失敗しました" },
        { status: 500 }
      );
    }

    if (!updated) {
      return NextResponse.json(
        { error: "このクーポンは利用上限に達しました" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        coupon: {
          title: coupon.title,
          description: coupon.description,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
