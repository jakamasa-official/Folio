import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

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

  return profile;
}

// GET: List all automation rules for authenticated profile
export async function GET() {
  try {
    const profile = await getProfileForUser();
    if (!profile) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { data: rules, error } = await supabaseAdmin
      .from("automation_rules")
      .select(`
        *,
        template:message_templates(id, name),
        coupon:coupons(id, title, code)
      `)
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("自動化ルール取得エラー:", error);
      return NextResponse.json(
        { error: "ルールの取得に失敗しました" },
        { status: 500 }
      );
    }

    // Fetch stats for each rule
    const rulesWithStats = await Promise.all(
      (rules || []).map(async (rule) => {
        const { count: sentCount } = await supabaseAdmin
          .from("automation_logs")
          .select("id", { count: "exact", head: true })
          .eq("rule_id", rule.id)
          .eq("status", "sent");

        const { count: pendingCount } = await supabaseAdmin
          .from("automation_logs")
          .select("id", { count: "exact", head: true })
          .eq("rule_id", rule.id)
          .eq("status", "pending");

        return {
          ...rule,
          sent_count: sentCount ?? 0,
          pending_count: pendingCount ?? 0,
        };
      })
    );

    return NextResponse.json({ rules: rulesWithStats }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

// POST: Create a new automation rule
export async function POST(request: NextRequest) {
  try {
    const profile = await getProfileForUser();
    if (!profile) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();
    const { name, trigger_type, action_type, delay_hours, template_id, coupon_id, subject, body: ruleBody } = body;

    if (!name || !trigger_type || !action_type) {
      return NextResponse.json(
        { error: "名前、トリガー、アクションは必須です" },
        { status: 400 }
      );
    }

    const validTriggers = [
      "after_booking", "after_contact", "after_subscribe",
      "after_stamp_complete", "no_visit_30d", "no_visit_60d", "no_visit_90d",
      "birthday",
    ];
    const validActions = ["send_email", "send_review_request", "send_coupon"];

    if (!validTriggers.includes(trigger_type)) {
      return NextResponse.json({ error: "無効なトリガータイプです" }, { status: 400 });
    }
    if (!validActions.includes(action_type)) {
      return NextResponse.json({ error: "無効なアクションタイプです" }, { status: 400 });
    }

    const { data: rule, error } = await supabaseAdmin
      .from("automation_rules")
      .insert({
        profile_id: profile.id,
        name,
        trigger_type,
        action_type,
        delay_hours: delay_hours != null ? Number(delay_hours) : 0,
        template_id: template_id || null,
        coupon_id: coupon_id || null,
        subject: subject || null,
        body: ruleBody || null,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) {
      console.error("自動化ルール作成エラー:", error);
      return NextResponse.json(
        { error: "ルールの作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ rule }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

// PATCH: Update an automation rule
export async function PATCH(request: NextRequest) {
  try {
    const profile = await getProfileForUser();
    if (!profile) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ルールIDは必須です" }, { status: 400 });
    }

    const allowedFields: Record<string, unknown> = {};
    const whitelist = [
      "name", "trigger_type", "action_type", "delay_hours",
      "template_id", "coupon_id", "subject", "body", "is_active",
    ] as const;

    for (const key of whitelist) {
      if (body[key] !== undefined) allowedFields[key] = body[key];
    }
    allowedFields.updated_at = new Date().toISOString();

    const { data: rule, error } = await supabaseAdmin
      .from("automation_rules")
      .update(allowedFields)
      .eq("id", id)
      .eq("profile_id", profile.id)
      .select("*")
      .single();

    if (error) {
      console.error("自動化ルール更新エラー:", error);
      return NextResponse.json(
        { error: "ルールの更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ rule }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an automation rule
export async function DELETE(request: NextRequest) {
  try {
    const profile = await getProfileForUser();
    if (!profile) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ルールIDは必須です" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("automation_rules")
      .delete()
      .eq("id", id)
      .eq("profile_id", profile.id);

    if (error) {
      console.error("自動化ルール削除エラー:", error);
      return NextResponse.json(
        { error: "ルールの削除に失敗しました" },
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
