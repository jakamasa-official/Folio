import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const UAParser = require("ua-parser-js");

// Rate limit: 1 click per profile+link+IP per 5 minutes
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
  try {
    const body = await request.json();
    const {
      profile_id,
      link_id,
      link_url,
      link_label,
      utm_source,
      utm_medium,
      utm_campaign,
    } = body;

    if (!profile_id || !link_id || !link_url) {
      // Always return success to avoid leaking info
      return NextResponse.json({ success: true }, { status: 200 });
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
    const device_type = parsed.device.type || "desktop";

    // Rate limit: 1 click per profile+link+IP per 5 minutes
    const rateLimitKey = `click:${profile_id}:${link_id}:${ip}`;
    if (!checkRateLimit(rateLimitKey, 1, 5 * 60 * 1000)) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    await supabaseAdmin.from("link_clicks").insert({
      profile_id,
      link_id,
      link_url,
      link_label: link_label || null,
      clicked_at: new Date().toISOString(),
      referrer,
      device_type,
      browser,
      os,
      country,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
