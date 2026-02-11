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
    .select("id, username, is_pro")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "プロフィールが見つかりません", status: 404 };
  }

  return { profile };
}

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
      .from("campaign_pages")
      .select(`
        *,
        coupon:coupons!campaign_pages_coupon_id_fkey(id, title, code, discount_type, discount_value)
      `)
      .eq("profile_id", result.profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("キャンペーン取得エラー:", error);
      return NextResponse.json(
        { error: "キャンペーンの取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { campaigns: data || [], username: result.profile.username },
      { status: 200 }
    );
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

    // --- Pro gate: campaign pages require Pro ---
    if (!result.profile.is_pro) {
      return NextResponse.json(
        { error: "キャンペーンページはプロプランでご利用いただけます", upgrade: true },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      slug,
      title,
      description,
      hero_image_url,
      cta_text,
      cta_url,
      coupon_id,
      expires_at,
      template,
      is_published,
    } = body;

    // Validate required fields
    if (!title || typeof title !== "string" || title.length > 200) {
      return NextResponse.json(
        { error: "タイトルを入力してください（200文字以内）" },
        { status: 400 }
      );
    }

    if (!slug || typeof slug !== "string" || slug.length > 100) {
      return NextResponse.json(
        { error: "スラッグを入力してください（100文字以内）" },
        { status: 400 }
      );
    }

    // Validate slug format (alphanumeric, hyphens only)
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) && !/^[a-z0-9]$/.test(slug)) {
      return NextResponse.json(
        { error: "スラッグは英数字とハイフンのみ使用できます" },
        { status: 400 }
      );
    }

    if (description && (typeof description !== "string" || description.length > 5000)) {
      return NextResponse.json(
        { error: "説明は5000文字以内で入力してください" },
        { status: 400 }
      );
    }

    if (hero_image_url && (typeof hero_image_url !== "string" || hero_image_url.length > 2000)) {
      return NextResponse.json(
        { error: "画像URLが無効です" },
        { status: 400 }
      );
    }

    if (cta_text && (typeof cta_text !== "string" || cta_text.length > 100)) {
      return NextResponse.json(
        { error: "CTAテキストは100文字以内で入力してください" },
        { status: 400 }
      );
    }

    if (cta_url && (typeof cta_url !== "string" || cta_url.length > 2000)) {
      return NextResponse.json(
        { error: "CTAリンクが無効です" },
        { status: 400 }
      );
    }

    const validTemplates = ["default", "minimal", "bold", "festive"];
    const finalTemplate = validTemplates.includes(template) ? template : "default";

    // If coupon_id provided, verify it belongs to this profile
    if (coupon_id) {
      const { data: coupon, error: coupErr } = await supabaseAdmin
        .from("coupons")
        .select("id")
        .eq("id", coupon_id)
        .eq("profile_id", result.profile.id)
        .single();

      if (coupErr || !coupon) {
        return NextResponse.json(
          { error: "指定されたクーポンが見つかりません" },
          { status: 404 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from("campaign_pages")
      .insert({
        profile_id: result.profile.id,
        slug,
        title,
        description: description || null,
        hero_image_url: hero_image_url || null,
        cta_text: cta_text || "予約する",
        cta_url: cta_url || null,
        coupon_id: coupon_id || null,
        expires_at: expires_at || null,
        template: finalTemplate,
        is_published: is_published ?? false,
      })
      .select(`
        *,
        coupon:coupons!campaign_pages_coupon_id_fkey(id, title, code, discount_type, discount_value)
      `)
      .single();

    if (error) {
      console.error("キャンペーン作成エラー:", error);
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "このスラッグは既に使用されています" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "キャンペーンの作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ campaign: data }, { status: 200 });
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
    const { id, ...fields } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "キャンペーンIDが必要です" },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};

    if (fields.title !== undefined) {
      if (typeof fields.title !== "string" || fields.title.length > 200) {
        return NextResponse.json(
          { error: "タイトルは200文字以内で入力してください" },
          { status: 400 }
        );
      }
      updates.title = fields.title;
    }

    if (fields.slug !== undefined) {
      if (typeof fields.slug !== "string" || fields.slug.length > 100) {
        return NextResponse.json(
          { error: "スラッグは100文字以内で入力してください" },
          { status: 400 }
        );
      }
      if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(fields.slug) && !/^[a-z0-9]$/.test(fields.slug)) {
        return NextResponse.json(
          { error: "スラッグは英数字とハイフンのみ使用できます" },
          { status: 400 }
        );
      }
      updates.slug = fields.slug;
    }

    if (fields.description !== undefined) {
      updates.description = fields.description || null;
    }

    if (fields.hero_image_url !== undefined) {
      updates.hero_image_url = fields.hero_image_url || null;
    }

    if (fields.cta_text !== undefined) {
      updates.cta_text = fields.cta_text || "予約する";
    }

    if (fields.cta_url !== undefined) {
      updates.cta_url = fields.cta_url || null;
    }

    if (fields.coupon_id !== undefined) {
      if (fields.coupon_id) {
        const { data: coupon, error: coupErr } = await supabaseAdmin
          .from("coupons")
          .select("id")
          .eq("id", fields.coupon_id)
          .eq("profile_id", result.profile.id)
          .single();

        if (coupErr || !coupon) {
          return NextResponse.json(
            { error: "指定されたクーポンが見つかりません" },
            { status: 404 }
          );
        }
      }
      updates.coupon_id = fields.coupon_id || null;
    }

    if (fields.expires_at !== undefined) {
      updates.expires_at = fields.expires_at || null;
    }

    if (fields.template !== undefined) {
      const validTemplates = ["default", "minimal", "bold", "festive"];
      updates.template = validTemplates.includes(fields.template) ? fields.template : "default";
    }

    if (fields.is_published !== undefined) {
      updates.is_published = !!fields.is_published;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "更新するフィールドがありません" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("campaign_pages")
      .update(updates)
      .eq("id", id)
      .eq("profile_id", result.profile.id)
      .select(`
        *,
        coupon:coupons!campaign_pages_coupon_id_fkey(id, title, code, discount_type, discount_value)
      `)
      .single();

    if (error) {
      console.error("キャンペーン更新エラー:", error);
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "このスラッグは既に使用されています" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "キャンペーンの更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ campaign: data }, { status: 200 });
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
        { error: "キャンペーンIDが必要です" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("campaign_pages")
      .delete()
      .eq("id", id)
      .eq("profile_id", result.profile.id);

    if (error) {
      console.error("キャンペーン削除エラー:", error);
      return NextResponse.json(
        { error: "キャンペーンの削除に失敗しました" },
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
