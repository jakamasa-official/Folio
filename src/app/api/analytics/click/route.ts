import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const UAParser = require("ua-parser-js");

// Rate limit: 1 click per profile+link+IP per 5 minutes
const rateLimit = new Map<string, { count: number; resetAt: number }>();
let lastCleanup = Date.now();

function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  // Periodically purge expired entries to prevent unbounded growth
  if (now - lastCleanup > 10 * 60 * 1000) {
    for (const [k, v] of rateLimit) {
      if (now > v.resetAt) rateLimit.delete(k);
    }
    lastCleanup = now;
  }
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
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Truncate string fields to prevent storage bloat
    const safeStr = (v: unknown, max: number) =>
      typeof v === "string" ? v.slice(0, max) : undefined;
    const safeLinkUrl = safeStr(link_url, 2000) as string;
    const safeLinkLabel = safeStr(link_label, 200);
    const safeUtmSource = safeStr(utm_source, 200);
    const safeUtmMedium = safeStr(utm_medium, 200);
    const safeUtmCampaign = safeStr(utm_campaign, 200);

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
      link_url: safeLinkUrl,
      link_label: safeLinkLabel || null,
      clicked_at: new Date().toISOString(),
      referrer,
      device_type,
      browser,
      os,
      country,
      utm_source: safeUtmSource || null,
      utm_medium: safeUtmMedium || null,
      utm_campaign: safeUtmCampaign || null,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
