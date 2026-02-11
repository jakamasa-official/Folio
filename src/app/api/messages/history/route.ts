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

// GET: List sent messages with optional filters
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
    const status = searchParams.get("status");
    const templateId = searchParams.get("template_id");

    let query = supabaseAdmin
      .from("sent_messages")
      .select(`
        *,
        customer:customers(id, name, email),
        template:message_templates(id, name, template_type)
      `)
      .eq("profile_id", result.profile.id)
      .order("sent_at", { ascending: false })
      .limit(500);

    if (status) {
      const validStatuses = ["pending", "sent", "delivered", "opened", "clicked", "failed"];
      if (validStatuses.includes(status)) {
        query = query.eq("status", status);
      }
    }

    if (templateId) {
      query = query.eq("template_id", templateId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("送信履歴取得エラー:", error);
      return NextResponse.json(
        { error: "送信履歴の取得に失敗しました" },
        { status: 500 }
      );
    }

    // Compute summary stats
    const messages = data || [];
    const stats = {
      total: messages.length,
      pending: messages.filter((m: { status: string }) => m.status === "pending").length,
      sent: messages.filter((m: { status: string }) => m.status === "sent").length,
      delivered: messages.filter((m: { status: string }) => m.status === "delivered").length,
      opened: messages.filter((m: { status: string }) => m.status === "opened").length,
      clicked: messages.filter((m: { status: string }) => m.status === "clicked").length,
      failed: messages.filter((m: { status: string }) => m.status === "failed").length,
    };

    return NextResponse.json({ messages, stats }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
