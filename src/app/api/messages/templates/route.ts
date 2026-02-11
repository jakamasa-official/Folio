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

// GET: List all message templates for user's profile
export async function GET() {
  try {
    const result = await getAuthenticatedProfile();
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("message_templates")
      .select("*")
      .eq("profile_id", result.profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("テンプレート取得エラー:", error);
      return NextResponse.json(
        { error: "テンプレートの取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ templates: data || [] }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

// POST: Create a new template
export async function POST(request: NextRequest) {
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
      name,
      subject,
      body: templateBody,
      template_type,
      trigger_type,
      trigger_delay_hours,
      is_active,
    } = body;

    if (!name || typeof name !== "string" || name.length > 200) {
      return NextResponse.json(
        { error: "テンプレート名を入力してください（200文字以内）" },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string" || subject.length > 500) {
      return NextResponse.json(
        { error: "件名を入力してください（500文字以内）" },
        { status: 400 }
      );
    }

    if (!templateBody || typeof templateBody !== "string" || templateBody.length > 10000) {
      return NextResponse.json(
        { error: "本文を入力してください（10000文字以内）" },
        { status: 400 }
      );
    }

    const validTypes = ["follow_up", "review_request", "campaign", "reminder", "thank_you"];
    if (!template_type || !validTypes.includes(template_type)) {
      return NextResponse.json(
        { error: "テンプレートタイプが無効です" },
        { status: 400 }
      );
    }

    const validTriggers = ["manual", "after_booking", "after_days", "after_contact"];
    if (!trigger_type || !validTriggers.includes(trigger_type)) {
      return NextResponse.json(
        { error: "トリガータイプが無効です" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("message_templates")
      .insert({
        profile_id: result.profile.id,
        name,
        subject,
        body: templateBody,
        template_type,
        trigger_type,
        trigger_delay_hours: trigger_delay_hours || 0,
        is_active: is_active ?? true,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error("テンプレート作成エラー:", error);
      return NextResponse.json(
        { error: "テンプレートの作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ template: data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

// PATCH: Update a template
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
    const { id, ...fields } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "テンプレートIDが必要です" },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (fields.name !== undefined) {
      if (typeof fields.name !== "string" || fields.name.length > 200) {
        return NextResponse.json(
          { error: "テンプレート名は200文字以内で入力してください" },
          { status: 400 }
        );
      }
      updates.name = fields.name;
    }

    if (fields.subject !== undefined) {
      if (typeof fields.subject !== "string" || fields.subject.length > 500) {
        return NextResponse.json(
          { error: "件名は500文字以内で入力してください" },
          { status: 400 }
        );
      }
      updates.subject = fields.subject;
    }

    if (fields.body !== undefined) {
      if (typeof fields.body !== "string" || fields.body.length > 10000) {
        return NextResponse.json(
          { error: "本文は10000文字以内で入力してください" },
          { status: 400 }
        );
      }
      updates.body = fields.body;
    }

    if (fields.template_type !== undefined) {
      const validTypes = ["follow_up", "review_request", "campaign", "reminder", "thank_you"];
      if (!validTypes.includes(fields.template_type)) {
        return NextResponse.json(
          { error: "テンプレートタイプが無効です" },
          { status: 400 }
        );
      }
      updates.template_type = fields.template_type;
    }

    if (fields.trigger_type !== undefined) {
      const validTriggers = ["manual", "after_booking", "after_days", "after_contact"];
      if (!validTriggers.includes(fields.trigger_type)) {
        return NextResponse.json(
          { error: "トリガータイプが無効です" },
          { status: 400 }
        );
      }
      updates.trigger_type = fields.trigger_type;
    }

    if (fields.trigger_delay_hours !== undefined) {
      updates.trigger_delay_hours = fields.trigger_delay_hours;
    }

    if (fields.is_active !== undefined) {
      updates.is_active = !!fields.is_active;
    }

    const { data, error } = await supabaseAdmin
      .from("message_templates")
      .update(updates)
      .eq("id", id)
      .eq("profile_id", result.profile.id)
      .select()
      .single();

    if (error) {
      console.error("テンプレート更新エラー:", error);
      return NextResponse.json(
        { error: "テンプレートの更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ template: data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a template
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
        { error: "テンプレートIDが必要です" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("message_templates")
      .delete()
      .eq("id", id)
      .eq("profile_id", result.profile.id);

    if (error) {
      console.error("テンプレート削除エラー:", error);
      return NextResponse.json(
        { error: "テンプレートの削除に失敗しました" },
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
