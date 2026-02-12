import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getLocaleFromCookie, createTranslator } from "@/lib/i18n";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const UAParser = require("ua-parser-js");

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

export async function POST(request: NextRequest) {
  const locale = getLocaleFromCookie(request.headers.get("cookie") || "");
  const t = createTranslator(locale, "api");

  try {

    const body = await request.json();
    const { profile_id, utm_source, utm_medium, utm_campaign } = body;

    if (!profile_id) {
      return NextResponse.json(
        { error: t("profileIdRequired") },
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

    // Parse user-agent with ua-parser-js
    const parsed = UAParser(userAgent);
    const browser = parsed.browser.name || null;
    const os = parsed.os.name || null;
    const deviceType = parsed.device.type || "desktop"; // undefined means desktop

    // Rate limit: 1 view per profile per IP per 10 minutes
    const rateLimitKey = `analytics:${profile_id}:${ip}`;
    if (!checkRateLimit(rateLimitKey, 1, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: t("tooManyRequests") },
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
        { error: t("profileNotFound") },
        { status: 404 }
      );
    }

    const { error } = await supabaseAdmin.from("page_views").insert({
      profile_id,
      viewed_at: new Date().toISOString(),
      referrer,
      device_type: deviceType,
      country,
      browser,
      os,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
    });

    if (error) {
      console.error("Page view record error:", error);
      return NextResponse.json(
        { error: t("pageViewRecordFailed") },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: t("requestFailed") },
      { status: 500 }
    );
  }
}
