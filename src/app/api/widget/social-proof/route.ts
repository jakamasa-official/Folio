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

    // Count page views from the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { count, error } = await supabaseAdmin
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", profile_id)
      .gte("viewed_at", fiveMinutesAgo);

    if (error) {
      console.error("閲覧者数取得エラー:", error);
      return NextResponse.json(
        { error: "閲覧者数の取得に失敗しました" },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { count: count || 0 },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
