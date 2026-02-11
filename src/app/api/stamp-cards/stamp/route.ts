import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { StampMilestone } from "@/lib/types";

async function getProfileForUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  return profile ? { ...profile, user_id: user.id } : null;
}

export async function POST(request: NextRequest) {
  try {
    const profile = await getProfileForUser();
    if (!profile) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();
    const { stamp_card_id, customer_id, note } = body;

    if (!stamp_card_id || !customer_id) {
      return NextResponse.json(
        { error: "スタンプカードIDと顧客IDは必須です" },
        { status: 400 }
      );
    }

    // Get the stamp card to verify ownership and get total_stamps_required
    const { data: card, error: cardError } = await supabaseAdmin
      .from("stamp_cards")
      .select("*")
      .eq("id", stamp_card_id)
      .eq("profile_id", profile.id)
      .single();

    if (cardError || !card) {
      return NextResponse.json(
        { error: "スタンプカードが見つかりません" },
        { status: 404 }
      );
    }

    // Upsert customer_stamps
    const { data: existing } = await supabaseAdmin
      .from("customer_stamps")
      .select("*")
      .eq("stamp_card_id", stamp_card_id)
      .eq("customer_id", customer_id)
      .maybeSingle();

    let customerStamp;
    const now = new Date().toISOString();

    if (existing) {
      let newStamps = existing.current_stamps + 1;
      let newCompleted = existing.completed_count;

      // Check if card is completed
      if (newStamps >= card.total_stamps_required) {
        newCompleted += 1;
        newStamps = 0;
      }

      const { data: updated, error: updateError } = await supabaseAdmin
        .from("customer_stamps")
        .update({
          current_stamps: newStamps,
          completed_count: newCompleted,
          last_stamped_at: now,
        })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (updateError) {
        console.error("スタンプ更新エラー:", updateError);
        return NextResponse.json(
          { error: "スタンプの更新に失敗しました" },
          { status: 500 }
        );
      }

      customerStamp = updated;
    } else {
      // First stamp for this customer on this card
      let newStamps = 1;
      let newCompleted = 0;

      if (newStamps >= card.total_stamps_required) {
        newCompleted = 1;
        newStamps = 0;
      }

      const { data: created, error: createError } = await supabaseAdmin
        .from("customer_stamps")
        .insert({
          stamp_card_id,
          customer_id,
          current_stamps: newStamps,
          completed_count: newCompleted,
          last_stamped_at: now,
        })
        .select("*")
        .single();

      if (createError) {
        console.error("スタンプ作成エラー:", createError);
        return NextResponse.json(
          { error: "スタンプの追加に失敗しました" },
          { status: 500 }
        );
      }

      customerStamp = created;
    }

    // Create stamp event
    await supabaseAdmin.from("stamp_events").insert({
      customer_stamp_id: customerStamp.id,
      stamped_by: profile.user_id,
      note: note || null,
      stamped_at: now,
    });

    // Check milestones
    const milestones = (card.milestones || []) as StampMilestone[];
    const reachedMilestone = milestones.find(
      (m) => m.at === customerStamp.current_stamps
    );

    // Check if card was just completed (current_stamps reset to 0)
    const justCompleted =
      customerStamp.current_stamps === 0 &&
      (existing
        ? customerStamp.completed_count > existing.completed_count
        : customerStamp.completed_count > 0);

    return NextResponse.json(
      {
        stamp: customerStamp,
        milestone: reachedMilestone || null,
        completed: justCompleted,
        reward_description: justCompleted ? card.reward_description : null,
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stamp_card_id = searchParams.get("stamp_card_id");
    const customer_id = searchParams.get("customer_id");

    if (!stamp_card_id) {
      return NextResponse.json(
        { error: "スタンプカードIDは必須です" },
        { status: 400 }
      );
    }

    if (customer_id) {
      // Public path: get specific customer's stamp progress (no PII returned)
      const { data: stamp } = await supabaseAdmin
        .from("customer_stamps")
        .select("id, stamp_card_id, customer_id, current_stamps, completed_count, last_stamped_at")
        .eq("stamp_card_id", stamp_card_id)
        .eq("customer_id", customer_id)
        .maybeSingle();

      return NextResponse.json({ stamp: stamp || null }, { status: 200 });
    }

    // Dashboard use: requires authentication
    const profile = await getProfileForUser();
    if (!profile) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // Verify the stamp card belongs to this user
    const { data: card } = await supabaseAdmin
      .from("stamp_cards")
      .select("id")
      .eq("id", stamp_card_id)
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (!card) {
      return NextResponse.json(
        { error: "スタンプカードが見つかりません" },
        { status: 404 }
      );
    }

    const { data: stamps, error } = await supabaseAdmin
      .from("customer_stamps")
      .select("*, customer:customers(id, name, email)")
      .eq("stamp_card_id", stamp_card_id)
      .order("last_stamped_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("スタンプ一覧取得エラー:", error);
      return NextResponse.json(
        { error: "スタンプ情報の取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ stamps: stamps || [] }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
