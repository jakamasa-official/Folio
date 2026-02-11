import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function getAuthenticatedProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "認証が必要です", status: 401 };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, is_pro")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "プロフィールが見つかりません", status: 404 };
  }

  return { profile };
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "REF-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const result = await getAuthenticatedProfile();
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const codeId = searchParams.get("code_id");

    // If code_id is provided, return referrals for that specific code
    if (codeId) {
      // Verify the code belongs to this profile
      const { data: ownedCode } = await supabaseAdmin
        .from("referral_codes")
        .select("id")
        .eq("id", codeId)
        .eq("profile_id", result.profile.id)
        .maybeSingle();

      if (!ownedCode) {
        return NextResponse.json(
          { error: "紹介コードが見つかりません" },
          { status: 404 }
        );
      }

      const { data: referralsData, error: refError } = await supabaseAdmin
        .from("referrals")
        .select(`
          *,
          referred_customer:customers!referrals_referred_customer_id_fkey(id, name, email)
        `)
        .eq("referral_code_id", codeId)
        .order("created_at", { ascending: false });

      if (refError) {
        console.error("紹介取得エラー:", refError);
        return NextResponse.json(
          { error: "紹介データの取得に失敗しました" },
          { status: 500 }
        );
      }

      return NextResponse.json({ referrals: referralsData || [] }, { status: 200 });
    }

    // Default: return all referral codes
    const { data, error } = await supabaseAdmin
      .from("referral_codes")
      .select(`
        *,
        customer:customers!referral_codes_customer_id_fkey(id, name, email),
        reward_coupon:coupons!referral_codes_reward_coupon_id_fkey(id, title, code)
      `)
      .eq("profile_id", result.profile.id)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("紹介コード取得エラー:", error);
      return NextResponse.json(
        { error: "紹介コードの取得に失敗しました" },
        { status: 500 }
      );
    }

    // Also fetch referral_enabled from profile
    const { data: profileData } = await supabaseAdmin
      .from("profiles")
      .select("referral_enabled")
      .eq("id", result.profile.id)
      .single();

    return NextResponse.json({
      referral_codes: data || [],
      referral_enabled: profileData?.referral_enabled ?? false,
    }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await getAuthenticatedProfile();
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    // --- Pro gate: referral codes require Pro ---
    if (!result.profile.is_pro) {
      return NextResponse.json(
        { error: "紹介プログラムはプロプランでご利用いただけます", upgrade: true },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { customer_id, reward_coupon_id } = body;

    if (!customer_id || typeof customer_id !== "string") {
      return NextResponse.json(
        { error: "顧客IDが必要です" },
        { status: 400 }
      );
    }

    // Verify customer belongs to this profile
    const { data: customer, error: custErr } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("id", customer_id)
      .eq("profile_id", result.profile.id)
      .single();

    if (custErr || !customer) {
      return NextResponse.json(
        { error: "指定された顧客が見つかりません" },
        { status: 404 }
      );
    }

    // If reward_coupon_id provided, verify it belongs to this profile
    if (reward_coupon_id) {
      const { data: coupon, error: coupErr } = await supabaseAdmin
        .from("coupons")
        .select("id")
        .eq("id", reward_coupon_id)
        .eq("profile_id", result.profile.id)
        .single();

      if (coupErr || !coupon) {
        return NextResponse.json(
          { error: "指定されたクーポンが見つかりません" },
          { status: 404 }
        );
      }
    }

    // Generate a unique code (retry up to 5 times)
    let code = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      code = generateCode();
      const { data: existing } = await supabaseAdmin
        .from("referral_codes")
        .select("id")
        .eq("profile_id", result.profile.id)
        .eq("code", code)
        .maybeSingle();

      if (!existing) break;
      if (attempt === 4) {
        return NextResponse.json(
          { error: "コード生成に失敗しました。再度お試しください" },
          { status: 500 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from("referral_codes")
      .insert({
        profile_id: result.profile.id,
        customer_id,
        code,
        reward_coupon_id: reward_coupon_id || null,
        referral_count: 0,
      })
      .select(`
        *,
        customer:customers!referral_codes_customer_id_fkey(id, name, email),
        reward_coupon:coupons!referral_codes_reward_coupon_id_fkey(id, title, code)
      `)
      .single();

    if (error) {
      console.error("紹介コード作成エラー:", error);
      return NextResponse.json(
        { error: "紹介コードの作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ referral_code: data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const result = await getAuthenticatedProfile();
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const body = await request.json();
    const { referral_enabled } = body;

    if (typeof referral_enabled !== "boolean") {
      return NextResponse.json(
        { error: "referral_enabled must be a boolean" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ referral_enabled })
      .eq("id", result.profile.id);

    if (error) {
      console.error("紹介設定更新エラー:", error);
      return NextResponse.json(
        { error: "設定の更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ referral_enabled }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const result = await getAuthenticatedProfile();
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "紹介コードIDが必要です" },
        { status: 400 }
      );
    }

    // Verify ownership first, then delete children
    const { data: ownedCode } = await supabaseAdmin
      .from("referral_codes")
      .select("id")
      .eq("id", id)
      .eq("profile_id", result.profile.id)
      .maybeSingle();

    if (!ownedCode) {
      return NextResponse.json(
        { error: "紹介コードが見つかりません" },
        { status: 404 }
      );
    }

    // Now safe to delete children — ownership verified
    await supabaseAdmin
      .from("referrals")
      .delete()
      .eq("referral_code_id", id);

    const { error } = await supabaseAdmin
      .from("referral_codes")
      .delete()
      .eq("id", id)
      .eq("profile_id", result.profile.id);

    if (error) {
      console.error("紹介コード削除エラー:", error);
      return NextResponse.json(
        { error: "紹介コードの削除に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
