import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Rate limit: 5 POST requests per IP per hour
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = rateLimit.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, referred_name, referred_email } = body;

    // Validate required fields
    if (!code || !referred_name || !referred_email) {
      return NextResponse.json(
        { error: "すべての項目を入力してください" },
        { status: 400 }
      );
    }

    if (typeof code !== "string" || code.length > 20) {
      return NextResponse.json(
        { error: "無効なコードです" },
        { status: 400 }
      );
    }

    if (typeof referred_name !== "string" || referred_name.length > 200) {
      return NextResponse.json(
        { error: "名前が長すぎます" },
        { status: 400 }
      );
    }

    if (typeof referred_email !== "string" || referred_email.length > 320) {
      return NextResponse.json(
        { error: "メールアドレスが無効です" },
        { status: 400 }
      );
    }

    // Simple email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(referred_email)) {
      return NextResponse.json(
        { error: "メールアドレスの形式が無効です" },
        { status: 400 }
      );
    }

    // Rate limit check
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rateLimitKey = `referral-track:${ip}`;
    if (!checkRateLimit(rateLimitKey, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "リクエスト回数の上限に達しました。しばらくしてからお試しください" },
        { status: 429 }
      );
    }

    // Look up the referral code
    const { data: referralCode, error: codeErr } = await supabaseAdmin
      .from("referral_codes")
      .select("id, profile_id")
      .eq("code", code)
      .single();

    if (codeErr || !referralCode) {
      return NextResponse.json(
        { error: "紹介コードが見つかりません" },
        { status: 404 }
      );
    }

    // Check if this email has already been referred under this code
    const { data: existingReferrals } = await supabaseAdmin
      .from("referrals")
      .select("id, referred_customer_id")
      .eq("referral_code_id", referralCode.id);

    let alreadyReferred = false;
    if (existingReferrals && existingReferrals.length > 0) {
      const customerIds = existingReferrals
        .map((r: { referred_customer_id: string | null }) => r.referred_customer_id)
        .filter(Boolean);

      if (customerIds.length > 0) {
        const { data: referredCustomers } = await supabaseAdmin
          .from("customers")
          .select("id, email")
          .in("id", customerIds);

        alreadyReferred = !!referredCustomers?.some(
          (c: { email: string | null }) =>
            c.email?.toLowerCase() === referred_email.toLowerCase()
        );
      }
    }

    if (alreadyReferred) {
      return NextResponse.json(
        { error: "このメールアドレスは既に紹介済みです" },
        { status: 409 }
      );
    }

    // Create or find the referred customer
    const now = new Date().toISOString();

    const { data: existingCustomer } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("profile_id", referralCode.profile_id)
      .ilike("email", referred_email)
      .maybeSingle();

    let customerId: string;

    if (existingCustomer) {
      customerId = existingCustomer.id;
      // Update last_seen_at
      await supabaseAdmin
        .from("customers")
        .update({ last_seen_at: now })
        .eq("id", customerId);
    } else {
      const { data: newCustomer, error: createErr } = await supabaseAdmin
        .from("customers")
        .insert({
          profile_id: referralCode.profile_id,
          name: referred_name,
          email: referred_email,
          tags: ["紹介"],
          source: "referral",
          first_seen_at: now,
          last_seen_at: now,
          total_bookings: 0,
          total_messages: 0,
        })
        .select("id")
        .single();

      if (createErr || !newCustomer) {
        console.error("紹介顧客作成エラー:", createErr);
        return NextResponse.json(
          { error: "登録に失敗しました" },
          { status: 500 }
        );
      }

      customerId = newCustomer.id;
    }

    // Create the referral record
    const { error: refErr } = await supabaseAdmin
      .from("referrals")
      .insert({
        referral_code_id: referralCode.id,
        referred_customer_id: customerId,
        status: "signed_up",
      });

    if (refErr) {
      console.error("紹介レコード作成エラー:", refErr);
      return NextResponse.json(
        { error: "紹介の記録に失敗しました" },
        { status: 500 }
      );
    }

    // Increment referral_count on the code
    await supabaseAdmin.rpc("increment_referral_count", {
      code_id: referralCode.id,
    }).then(async (rpcResult) => {
      // If RPC doesn't exist, fall back to manual increment
      if (rpcResult.error) {
        const { data: currentCode } = await supabaseAdmin
          .from("referral_codes")
          .select("referral_count")
          .eq("id", referralCode.id)
          .single();

        await supabaseAdmin
          .from("referral_codes")
          .update({
            referral_count: (currentCode?.referral_count || 0) + 1,
          })
          .eq("id", referralCode.id);
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
