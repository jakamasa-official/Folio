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
    .select("id, line_channel_access_token")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "プロフィールが見つかりません", status: 404 };
  }

  return { profile };
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

    const { line_user_id, message } = await request.json();

    if (!line_user_id || typeof line_user_id !== "string") {
      return NextResponse.json(
        { error: "LINE User IDが必要です" },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.length > 5000) {
      return NextResponse.json(
        { error: "メッセージを入力してください（5000文字以内）" },
        { status: 400 }
      );
    }

    const accessToken = result.profile.line_channel_access_token;
    if (!accessToken) {
      return NextResponse.json(
        { error: "LINEチャネルアクセストークンが設定されていません" },
        { status: 400 }
      );
    }

    // Verify this contact belongs to the user's profile
    const { data: contact } = await supabaseAdmin
      .from("line_contacts")
      .select("id, customer_id")
      .eq("profile_id", result.profile.id)
      .eq("line_user_id", line_user_id)
      .maybeSingle();

    if (!contact) {
      return NextResponse.json(
        { error: "この連絡先が見つかりません" },
        { status: 404 }
      );
    }

    // Send message via LINE Messaging API
    const lineRes = await fetch(
      "https://api.line.me/v2/bot/message/push",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: line_user_id,
          messages: [{ type: "text", text: message }],
        }),
      }
    );

    if (!lineRes.ok) {
      const errorData = await lineRes.json().catch(() => ({}));
      console.error("LINE送信エラー:", lineRes.status, errorData);
      return NextResponse.json(
        { error: "LINEメッセージの送信に失敗しました" },
        { status: 502 }
      );
    }

    // Record the sent message
    await supabaseAdmin.from("sent_messages").insert({
      profile_id: result.profile.id,
      customer_id: contact.customer_id || null,
      channel: "line",
      body: message,
      status: "sent",
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
