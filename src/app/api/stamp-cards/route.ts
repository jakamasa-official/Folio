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

    const { data: cards, error } = await supabaseAdmin
      .from("stamp_cards")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("スタンプカード取得エラー:", error);
      return NextResponse.json(
        { error: "スタンプカードの取得に失敗しました" },
        { status: 500 }
      );
    }

    // Get customer count per card
    const cardsWithCounts = await Promise.all(
      (cards || []).map(async (card) => {
        const { count } = await supabaseAdmin
          .from("customer_stamps")
          .select("*", { count: "exact", head: true })
          .eq("stamp_card_id", card.id);
        return { ...card, customer_count: count || 0 };
      })
    );

    return NextResponse.json({ cards: cardsWithCounts }, { status: 200 });
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

    // --- Pro gate: enforce free-tier stamp card limit ---
    if (!profile.is_pro) {
      const { count } = await supabaseAdmin
        .from("stamp_cards")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile.id);

      if ((count ?? 0) >= FREE_LIMITS.stampCards) {
        return NextResponse.json(
          { error: "フリープランではスタンプカードは1枚までです。アップグレードしてください。", upgrade: true },
          { status: 403 },
        );
      }
    }

    const body = await request.json();
    const {
      name,
      total_stamps_required,
      reward_type,
      reward_coupon_id,
      reward_description,
      icon,
      color,
      milestones,
    } = body;

    if (!name || typeof name !== "string" || name.length > 200) {
      return NextResponse.json(
        { error: "カード名を入力してください（200文字以内）" },
        { status: 400 }
      );
    }

    if (
      !total_stamps_required ||
      typeof total_stamps_required !== "number" ||
      !Number.isInteger(total_stamps_required) ||
      total_stamps_required < 1 ||
      total_stamps_required > 100
    ) {
      return NextResponse.json(
        { error: "スタンプ数は1〜100の整数で指定してください" },
        { status: 400 }
      );
    }

    const { data: card, error } = await supabaseAdmin
      .from("stamp_cards")
      .insert({
        profile_id: profile.id,
        name,
        total_stamps_required: Number(total_stamps_required),
        reward_type: reward_type || "custom",
        reward_coupon_id: reward_coupon_id || null,
        reward_description: reward_description || null,
        is_active: true,
        icon: icon || "star",
        color: color || "#6366f1",
        milestones: milestones || [],
      })
      .select("*")
      .single();

    if (error) {
      console.error("スタンプカード作成エラー:", error);
      return NextResponse.json(
        { error: "スタンプカードの作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ card }, { status: 200 });
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
        { error: "カードIDは必須です" },
        { status: 400 }
      );
    }

    // Whitelist allowed fields to prevent mass assignment
    const allowedFields: Record<string, unknown> = {};
    const whitelist = ["name", "total_stamps_required", "reward_type", "reward_coupon_id", "reward_description", "is_active", "icon", "color", "milestones"] as const;
    for (const key of whitelist) {
      if (body[key] !== undefined) allowedFields[key] = body[key];
    }
    allowedFields.updated_at = new Date().toISOString();

    const { data: card, error } = await supabaseAdmin
      .from("stamp_cards")
      .update(allowedFields)
      .eq("id", id)
      .eq("profile_id", profile.id)
      .select("*")
      .single();

    if (error) {
      console.error("スタンプカード更新エラー:", error);
      return NextResponse.json(
        { error: "スタンプカードの更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ card }, { status: 200 });
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
        { error: "カードIDは必須です" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("stamp_cards")
      .delete()
      .eq("id", id)
      .eq("profile_id", profile.id);

    if (error) {
      console.error("スタンプカード削除エラー:", error);
      return NextResponse.json(
        { error: "スタンプカードの削除に失敗しました" },
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
