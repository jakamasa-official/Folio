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

// GET — Fetch reviews for authenticated user's profile (dashboard view)
export async function GET() {
  try {
    const result = await getAuthenticatedProfile();
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const { data: reviews, error } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .eq("profile_id", result.profile.id)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("レビュー取得エラー:", error);
      return NextResponse.json(
        { error: "レビューの取得に失敗しました" },
        { status: 500 }
      );
    }

    const allReviews = reviews || [];

    // Compute aggregate stats
    const approvedReviews = allReviews.filter((r) => r.status === "approved");
    const totalCount = allReviews.length;
    const approvedCount = approvedReviews.length;
    const averageRating =
      approvedCount > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedCount
        : 0;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of approvedReviews) {
      const key = r.rating as 1 | 2 | 3 | 4 | 5;
      distribution[key]++;
    }

    return NextResponse.json({
      reviews: allReviews,
      stats: {
        totalCount,
        approvedCount,
        averageRating: Math.round(averageRating * 10) / 10,
        distribution,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

// POST — Submit a new review (public, no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      profile_id,
      reviewer_name,
      reviewer_email,
      rating,
      title,
      body: reviewBody,
      token,
      service_tags,
    } = body;

    // Validate required fields
    if (!profile_id || typeof profile_id !== "string") {
      return NextResponse.json(
        { error: "プロフィールIDが必要です" },
        { status: 400 }
      );
    }

    if (
      !reviewer_name ||
      typeof reviewer_name !== "string" ||
      reviewer_name.trim().length === 0 ||
      reviewer_name.length > 100
    ) {
      return NextResponse.json(
        { error: "お名前を入力してください（100文字以内）" },
        { status: 400 }
      );
    }

    if (
      !rating ||
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 5 ||
      !Number.isInteger(rating)
    ) {
      return NextResponse.json(
        { error: "評価は1〜5の整数で指定してください" },
        { status: 400 }
      );
    }

    if (
      !reviewBody ||
      typeof reviewBody !== "string" ||
      reviewBody.trim().length === 0 ||
      reviewBody.length > 2000
    ) {
      return NextResponse.json(
        { error: "レビュー本文を入力してください（2000文字以内）" },
        { status: 400 }
      );
    }

    if (title && (typeof title !== "string" || title.length > 200)) {
      return NextResponse.json(
        { error: "タイトルは200文字以内で入力してください" },
        { status: 400 }
      );
    }

    if (
      reviewer_email &&
      (typeof reviewer_email !== "string" || reviewer_email.length > 320)
    ) {
      return NextResponse.json(
        { error: "メールアドレスが無効です" },
        { status: 400 }
      );
    }

    // Validate profile exists
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", profile_id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "プロフィールが見つかりません" },
        { status: 404 }
      );
    }

    // Rate limit: max 3 reviews per email per profile per day
    if (reviewer_email) {
      const oneDayAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toISOString();
      const { count } = await supabaseAdmin
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile_id)
        .eq("reviewer_email", reviewer_email)
        .gte("created_at", oneDayAgo);

      if (count && count >= 3) {
        return NextResponse.json(
          { error: "1日のレビュー投稿上限に達しました。明日また投稿してください。" },
          { status: 429 }
        );
      }
    }

    // Check review settings for auto_approve
    const { data: settings } = await supabaseAdmin
      .from("review_settings")
      .select("auto_approve")
      .eq("profile_id", profile_id)
      .maybeSingle();

    const autoApprove = settings?.auto_approve === true;

    // Determine source and verified status
    let source = "direct";
    let verified = false;

    if (token) {
      // Verify token matches an existing review placeholder
      const { data: tokenReview } = await supabaseAdmin
        .from("reviews")
        .select("id")
        .eq("token", token)
        .eq("profile_id", profile_id)
        .maybeSingle();

      if (tokenReview) {
        source = "request";
        verified = true;
        // Delete the placeholder so the token cannot be reused
        await supabaseAdmin.from("reviews").delete().eq("id", tokenReview.id);
      }
    }

    // Validate service_tags
    let validatedTags: string[] = [];
    if (Array.isArray(service_tags)) {
      validatedTags = service_tags
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.slice(0, 50))
        .slice(0, 10);
    }

    const { data: newReview, error } = await supabaseAdmin
      .from("reviews")
      .insert({
        profile_id,
        reviewer_name: reviewer_name.trim(),
        reviewer_email: reviewer_email?.trim() || null,
        rating,
        title: title?.trim() || null,
        body: reviewBody.trim(),
        source,
        status: autoApprove ? "approved" : "pending",
        verified,
        service_tags: validatedTags,
      })
      .select()
      .single();

    if (error) {
      console.error("レビュー作成エラー:", error);
      return NextResponse.json(
        { error: "レビューの投稿に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        review: newReview,
        auto_approved: autoApprove,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

// PATCH — Update review (authenticated, dashboard)
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
    const { id, status, is_featured, response } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "レビューIDが必要です" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) {
      if (!["pending", "approved", "rejected"].includes(status)) {
        return NextResponse.json(
          { error: "無効なステータスです" },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    if (is_featured !== undefined) {
      updates.is_featured = !!is_featured;
    }

    if (response !== undefined) {
      if (response !== null && typeof response !== "string") {
        return NextResponse.json(
          { error: "返信は文字列で指定してください" },
          { status: 400 }
        );
      }
      updates.response = response || null;
      updates.response_at = response ? new Date().toISOString() : null;
    }

    const { data, error } = await supabaseAdmin
      .from("reviews")
      .update(updates)
      .eq("id", id)
      .eq("profile_id", result.profile.id)
      .select()
      .single();

    if (error) {
      console.error("レビュー更新エラー:", error);
      return NextResponse.json(
        { error: "レビューの更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ review: data });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

// DELETE — Delete review (authenticated, dashboard)
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
        { error: "レビューIDが必要です" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("reviews")
      .delete()
      .eq("id", id)
      .eq("profile_id", result.profile.id);

    if (error) {
      console.error("レビュー削除エラー:", error);
      return NextResponse.json(
        { error: "レビューの削除に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
