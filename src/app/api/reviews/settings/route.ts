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
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "プロフィールが見つかりません", status: 404 };
  }

  return { profile };
}

// GET — Get review settings for authenticated user
export async function GET() {
  try {
    const result = await getAuthenticatedProfile();
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const { data: settings } = await supabaseAdmin
      .from("review_settings")
      .select("*")
      .eq("profile_id", result.profile.id)
      .maybeSingle();

    // Return defaults if no settings exist yet
    const defaults = {
      profile_id: result.profile.id,
      reviews_enabled: true,
      auto_approve: false,
      min_rating_to_show: 1,
      review_prompt_text:
        "サービスのご利用ありがとうございます。ぜひレビューをお寄せください。",
      display_style: "carousel",
      show_aggregate_rating: true,
      request_after_booking: false,
      request_delay_hours: 48,
    };

    return NextResponse.json({
      settings: settings || defaults,
    });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

// PATCH — Update review settings
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
    const {
      reviews_enabled,
      auto_approve,
      min_rating_to_show,
      review_prompt_text,
      display_style,
      show_aggregate_rating,
      request_after_booking,
      request_delay_hours,
    } = body;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (reviews_enabled !== undefined) updates.reviews_enabled = !!reviews_enabled;
    if (auto_approve !== undefined) updates.auto_approve = !!auto_approve;
    if (show_aggregate_rating !== undefined) updates.show_aggregate_rating = !!show_aggregate_rating;
    if (request_after_booking !== undefined) updates.request_after_booking = !!request_after_booking;

    if (min_rating_to_show !== undefined) {
      const val = Number(min_rating_to_show);
      if (val >= 1 && val <= 5) {
        updates.min_rating_to_show = val;
      }
    }

    if (review_prompt_text !== undefined) {
      if (typeof review_prompt_text === "string" && review_prompt_text.length <= 500) {
        updates.review_prompt_text = review_prompt_text;
      }
    }

    if (display_style !== undefined) {
      if (["grid", "carousel", "list"].includes(display_style)) {
        updates.display_style = display_style;
      }
    }

    if (request_delay_hours !== undefined) {
      const val = Number(request_delay_hours);
      if (val >= 1 && val <= 720) {
        updates.request_delay_hours = val;
      }
    }

    // Upsert: create if not exists, update if exists
    const { data, error } = await supabaseAdmin
      .from("review_settings")
      .upsert(
        {
          profile_id: result.profile.id,
          ...updates,
        },
        { onConflict: "profile_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("レビュー設定更新エラー:", error);
      return NextResponse.json(
        { error: "設定の更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ settings: data });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
