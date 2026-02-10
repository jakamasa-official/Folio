import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Rate limit: max 1 view per profile per IP per 10 minutes
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = rateLimit.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

function parseDeviceType(ua: string): string {
  if (/Mobile|Android|iPhone/i.test(ua)) return "mobile";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  return "desktop";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id } = body;

    if (!profile_id) {
      return NextResponse.json(
        { error: "profile_id は必須です" },
        { status: 400 }
      );
    }

    // Get request metadata from headers
    const headersList = request.headers;
    const referrer = headersList.get("referer") || null;
    const userAgent = headersList.get("user-agent") || "";
    const country = headersList.get("x-vercel-ip-country") || null;
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // Rate limit: 1 view per profile per IP per 10 minutes
    const rateLimitKey = `analytics:${profile_id}:${ip}`;
    if (!checkRateLimit(rateLimitKey, 1, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: "リクエストが多すぎます。しばらくしてからお試しください" },
        { status: 429 }
      );
    }

    // Validate that profile exists
    const { data: profileExists } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", profile_id)
      .maybeSingle();

    if (!profileExists) {
      return NextResponse.json(
        { error: "プロフィールが見つかりません" },
        { status: 404 }
      );
    }

    const device_type = parseDeviceType(userAgent);

    const { error } = await supabaseAdmin.from("page_views").insert({
      profile_id,
      viewed_at: new Date().toISOString(),
      referrer,
      device_type,
      country,
    });

    if (error) {
      console.error("ページビュー記録エラー:", error);
      return NextResponse.json(
        { error: "ページビューの記録に失敗しました" },
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
