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

    if (!profile_id || typeof profile_id !== "string") {
      return NextResponse.json(
        { error: "profile_id is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, display_name, is_pro, plan_tier, settings, contact_form_enabled"
      )
      .eq("id", profile_id)
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      console.error("Widget config query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found or not published" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    if (!profile.is_pro) {
      return NextResponse.json(
        { error: "Pro plan required", upgrade: true },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const settings = profile.settings as
      | { custom_colors?: { accent?: string } }
      | null
      | undefined;

    const accentColor =
      settings?.custom_colors?.accent || "#6366f1";

    return NextResponse.json(
      {
        profile_id: profile.id,
        display_name: profile.display_name,
        widgets: {
          tracking: true,
          contact: true,
          review: true,
          subscribe: true,
          badge: true,
        },
        theme: {
          accent_color: accentColor,
        },
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { error: "Request failed" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
