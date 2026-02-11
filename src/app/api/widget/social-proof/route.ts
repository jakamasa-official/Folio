import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profile_id = searchParams.get("profile_id");

    if (!profile_id) {
      return NextResponse.json(
        { error: "profile_id は必須です" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // --- 1. Viewer count (page views in last 5 minutes) ---
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    let viewers = 0;
    try {
      const { count, error } = await supabaseAdmin
        .from("page_views")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profile_id)
        .gte("viewed_at", fiveMinutesAgo);

      if (!error) {
        viewers = count || 0;
      }
    } catch {
      // page_views table might not exist — graceful fallback
    }

    // --- 2. Review data (only if reviews are enabled) ---
    let reviews: { average: number; count: number } | null = null;
    let recentReviews: {
      reviewer_name: string;
      rating: number;
      body: string;
      created_at: string;
    }[] = [];

    try {
      // Check if reviews are enabled
      const { data: settings } = await supabaseAdmin
        .from("review_settings")
        .select("reviews_enabled")
        .eq("profile_id", profile_id)
        .maybeSingle();

      const reviewsEnabled = settings?.reviews_enabled !== false;

      if (reviewsEnabled) {
        // Get aggregate stats from approved reviews
        const { data: allReviews } = await supabaseAdmin
          .from("reviews")
          .select("rating, reviewer_name, body, created_at")
          .eq("profile_id", profile_id)
          .eq("status", "approved")
          .order("created_at", { ascending: false });

        if (allReviews && allReviews.length > 0) {
          const total = allReviews.length;
          const sum = allReviews.reduce((s, r) => s + r.rating, 0);
          reviews = {
            average: Math.round((sum / total) * 10) / 10,
            count: total,
          };

          // Get up to 5 recent reviews for carousel mode
          recentReviews = allReviews.slice(0, 5).map((r) => ({
            reviewer_name: r.reviewer_name,
            rating: r.rating,
            body: r.body,
            created_at: r.created_at,
          }));
        }
      }
    } catch {
      // reviews or review_settings table might not exist — graceful fallback
    }

    // --- 3. Recent bookings (last 30 days) ---
    let recentBookings = 0;
    try {
      const thirtyDaysAgo = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString();

      const { count, error } = await supabaseAdmin
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profile_id)
        .gte("created_at", thirtyDaysAgo);

      if (!error) {
        recentBookings = count || 0;
      }
    } catch {
      // bookings table might not exist — graceful fallback
    }

    // --- 4. Total customers ---
    let totalCustomers = 0;
    try {
      const { count, error } = await supabaseAdmin
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profile_id);

      if (!error) {
        totalCustomers = count || 0;
      }
    } catch {
      // customers table might not exist — graceful fallback
    }

    return NextResponse.json(
      {
        viewers,
        reviews,
        recentReviews,
        recentBookings,
        totalCustomers,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
