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

export async function PATCH(request: NextRequest) {
  try {
    const result = await getAuthenticatedProfile();
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    // --- Pro gate: LINE integration requires Pro ---
    if (!result.profile.is_pro) {
      return NextResponse.json(
        { error: "LINE連携はプロプランでご利用いただけます", upgrade: true },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { line_channel_id, line_channel_secret, line_channel_access_token } = body;

    // Validate: all fields must be strings or null/empty
    if (line_channel_id !== undefined && line_channel_id !== null && typeof line_channel_id !== "string") {
      return NextResponse.json(
        { error: "チャネルIDが無効です" },
        { status: 400 }
      );
    }
    if (line_channel_secret !== undefined && line_channel_secret !== null && typeof line_channel_secret !== "string") {
      return NextResponse.json(
        { error: "チャネルシークレットが無効です" },
        { status: 400 }
      );
    }
    if (line_channel_access_token !== undefined && line_channel_access_token !== null && typeof line_channel_access_token !== "string") {
      return NextResponse.json(
        { error: "チャネルアクセストークンが無効です" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
        line_channel_id: line_channel_id || null,
        line_channel_secret: line_channel_secret || null,
        line_channel_access_token: line_channel_access_token || null,
      })
      .eq("id", result.profile.id)
      .select("id, username, display_name, line_channel_id, line_friend_url")
      .single();

    if (error) {
      console.error("LINE設定更新エラー:", error);
      return NextResponse.json(
        { error: "設定の保存に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
