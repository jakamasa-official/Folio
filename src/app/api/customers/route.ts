import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

import { FREE_LIMITS } from "@/lib/pro-gate";

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
    const search = searchParams.get("search")?.trim() || "";

    let query = supabaseAdmin
      .from("customers")
      .select("*")
      .eq("profile_id", result.profile.id)
      .order("last_seen_at", { ascending: false })
      .limit(500);

    if (search) {
      // Sanitize search input to prevent PostgREST filter injection
      const sanitized = search.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3000-\u303F@\s-]/g, "").slice(0, 100);
      if (sanitized) {
        query = query.or(`name.ilike.%${sanitized}%,email.ilike.%${sanitized}%`);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("顧客取得エラー:", error);
      return NextResponse.json(
        { error: "顧客データの取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ customers: data || [] }, { status: 200 });
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

    // --- Pro gate: enforce free-tier customer limit ---
    if (!result.profile.is_pro) {
      const { count } = await supabaseAdmin
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", result.profile.id);

      if ((count ?? 0) >= FREE_LIMITS.customers) {
        return NextResponse.json(
          { error: "フリープランでは顧客は50件までです。アップグレードしてください。", upgrade: true },
          { status: 403 },
        );
      }
    }

    const body = await request.json();
    const { name, email, phone, tags, notes } = body;

    if (!name || typeof name !== "string" || name.length > 200) {
      return NextResponse.json(
        { error: "名前を入力してください（200文字以内）" },
        { status: 400 }
      );
    }

    if (email && (typeof email !== "string" || email.length > 320)) {
      return NextResponse.json(
        { error: "メールアドレスが無効です" },
        { status: 400 }
      );
    }

    if (phone && (typeof phone !== "string" || phone.length > 50)) {
      return NextResponse.json(
        { error: "電話番号が無効です" },
        { status: 400 }
      );
    }

    if (notes && (typeof notes !== "string" || notes.length > 2000)) {
      return NextResponse.json(
        { error: "メモは2000文字以内で入力してください" },
        { status: 400 }
      );
    }

    // Validate tags array contents
    let validatedTags: string[] = [];
    if (Array.isArray(tags)) {
      validatedTags = tags
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.slice(0, 50));

      if (validatedTags.length > 20) {
        return NextResponse.json(
          { error: "タグは最大20個までです" },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("customers")
      .insert({
        profile_id: result.profile.id,
        name,
        email: email || null,
        phone: phone || null,
        tags: validatedTags,
        notes: notes || null,
        source: "manual",
        first_seen_at: now,
        last_seen_at: now,
        total_bookings: 0,
        total_messages: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("顧客作成エラー:", error);
      return NextResponse.json(
        { error: "顧客の作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ customer: data }, { status: 200 });
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
    const { id, tags, notes, phone } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "顧客IDが必要です" },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return NextResponse.json(
          { error: "タグは配列で指定してください" },
          { status: 400 }
        );
      }

      const validatedTags = tags
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.slice(0, 50));

      if (validatedTags.length > 20) {
        return NextResponse.json(
          { error: "タグは最大20個までです" },
          { status: 400 }
        );
      }

      updates.tags = validatedTags;
    }

    if (notes !== undefined) {
      if (notes !== null && (typeof notes !== "string" || notes.length > 2000)) {
        return NextResponse.json(
          { error: "メモは2000文字以内で入力してください" },
          { status: 400 }
        );
      }
      updates.notes = notes;
    }

    if (phone !== undefined) {
      if (phone !== null && (typeof phone !== "string" || phone.length > 50)) {
        return NextResponse.json(
          { error: "電話番号が無効です" },
          { status: 400 }
        );
      }
      updates.phone = phone;
    }

    const { data, error } = await supabaseAdmin
      .from("customers")
      .update(updates)
      .eq("id", id)
      .eq("profile_id", result.profile.id)
      .select()
      .single();

    if (error) {
      console.error("顧客更新エラー:", error);
      return NextResponse.json(
        { error: "顧客の更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ customer: data }, { status: 200 });
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
        { error: "顧客IDが必要です" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("customers")
      .delete()
      .eq("id", id)
      .eq("profile_id", result.profile.id);

    if (error) {
      console.error("顧客削除エラー:", error);
      return NextResponse.json(
        { error: "顧客の削除に失敗しました" },
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
