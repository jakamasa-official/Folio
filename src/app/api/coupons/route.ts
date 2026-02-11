import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

import { FREE_LIMITS } from "@/lib/pro-gate";

async function getProfileForUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, is_pro")
    .eq("user_id", user.id)
    .maybeSingle();

  return profile;
}

export async function GET() {
  try {
    const profile = await getProfileForUser();
    if (!profile) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { data: coupons, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("クーポン取得エラー:", error);
      return NextResponse.json(
        { error: "クーポンの取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ coupons: coupons || [] }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const profile = await getProfileForUser();
    if (!profile) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // --- Pro gate: enforce free-tier coupon limit ---
    if (!profile.is_pro) {
      const { count } = await supabaseAdmin
        .from("coupons")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile.id);

      if ((count ?? 0) >= FREE_LIMITS.coupons) {
        return NextResponse.json(
          { error: "フリープランではクーポンは3枚までです。アップグレードしてください。", upgrade: true },
          { status: 403 },
        );
      }
    }

    const body = await request.json();
    const {
      code,
      title,
      description,
      discount_type,
      discount_value,
      expires_at,
      usage_limit,
    } = body;

    if (!title || !code || !discount_type) {
      return NextResponse.json(
        { error: "タイトル、コード、割引タイプは必須です" },
        { status: 400 }
      );
    }

    // Check for duplicate code within this profile
    const { data: existing } = await supabaseAdmin
      .from("coupons")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("code", code.toUpperCase())
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "このクーポンコードは既に使用されています" },
        { status: 409 }
      );
    }

    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .insert({
        profile_id: profile.id,
        code: code.toUpperCase(),
        title,
        description: description || null,
        discount_type,
        discount_value: discount_value != null ? Number(discount_value) : null,
        expires_at: expires_at || null,
        usage_limit: usage_limit != null ? Number(usage_limit) : null,
        times_used: 0,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) {
      console.error("クーポン作成エラー:", error);
      return NextResponse.json(
        { error: "クーポンの作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ coupon }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const profile = await getProfileForUser();
    if (!profile) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "クーポンIDは必須です" },
        { status: 400 }
      );
    }

    // Whitelist allowed fields to prevent mass assignment
    const allowedFields: Record<string, unknown> = {};
    const whitelist = ["title", "description", "code", "discount_type", "discount_value", "expires_at", "usage_limit", "is_active"] as const;
    for (const key of whitelist) {
      if (body[key] !== undefined) allowedFields[key] = body[key];
    }
    // Ensure uppercase code
    if (typeof allowedFields.code === "string") {
      allowedFields.code = (allowedFields.code as string).toUpperCase();
    }
    allowedFields.updated_at = new Date().toISOString();

    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .update(allowedFields)
      .eq("id", id)
      .eq("profile_id", profile.id)
      .select("*")
      .single();

    if (error) {
      console.error("クーポン更新エラー:", error);
      return NextResponse.json(
        { error: "クーポンの更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ coupon }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const profile = await getProfileForUser();
    if (!profile) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "クーポンIDは必須です" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("coupons")
      .delete()
      .eq("id", id)
      .eq("profile_id", profile.id);

    if (error) {
      console.error("クーポン削除エラー:", error);
      return NextResponse.json(
        { error: "クーポンの削除に失敗しました" },
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
