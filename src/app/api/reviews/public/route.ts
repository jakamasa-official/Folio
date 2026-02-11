import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET — Public endpoint for fetching approved reviews for a profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profile_id");

    if (!profileId) {
      return NextResponse.json(
        { error: "プロフィールIDが必要です" },
        { status: 400 }
      );
    }

    // Fetch settings
    const { data: settings } = await supabaseAdmin
      .from("review_settings")
      .select("*")
      .eq("profile_id", profileId)
      .maybeSingle();

    const reviewsEnabled = settings?.reviews_enabled !== false;
    const minRating = settings?.min_rating_to_show ?? 1;
    const displayStyle = settings?.display_style ?? "carousel";
    const showAggregateRating = settings?.show_aggregate_rating !== false;

    if (!reviewsEnabled) {
      return NextResponse.json({
        reviews: [],
        stats: { approvedCount: 0, averageRating: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
        settings: { display_style: displayStyle, show_aggregate_rating: showAggregateRating },
      });
    }

    // Fetch approved reviews with rating >= min
    const { data: reviews, error } = await supabaseAdmin
      .from("reviews")
      .select(
        "id, reviewer_name, rating, title, body, is_featured, service_tags, response, response_at, verified, created_at"
      )
      .eq("profile_id", profileId)
      .eq("status", "approved")
      .gte("rating", minRating)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("公開レビュー取得エラー:", error);
      return NextResponse.json(
        { error: "レビューの取得に失敗しました" },
        { status: 500 }
      );
    }

    const allReviews = reviews || [];

    // Compute aggregate stats from approved reviews
    const approvedCount = allReviews.length;
    const averageRating =
      approvedCount > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / approvedCount
        : 0;

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of allReviews) {
      distribution[r.rating]++;
    }

    return NextResponse.json({
      reviews: allReviews,
      stats: {
        approvedCount,
        averageRating: Math.round(averageRating * 10) / 10,
        distribution,
      },
      settings: {
        display_style: displayStyle,
        show_aggregate_rating: showAggregateRating,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
