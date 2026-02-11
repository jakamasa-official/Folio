import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type RangeType = "30d" | "12w" | "12m";

interface TimeSeriesEntry {
  date: string;
  label: string;
  views: number;
  clicks: number;
}

interface CountEntry {
  label: string;
  count: number;
}

interface LinkClickEntry {
  link_id: string;
  link_label: string;
  link_url: string;
  count: number;
}

function getDateRange(range: RangeType): Date {
  const now = new Date();
  switch (range) {
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "12w":
      return new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
    case "12m":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

function getDateKey(dateStr: string, range: RangeType): string {
  const d = new Date(dateStr);
  switch (range) {
    case "30d":
      return d.toISOString().slice(0, 10); // YYYY-MM-DD
    case "12w": {
      // ISO week: get the Thursday of the week to determine the ISO week number
      const temp = new Date(d.getTime());
      temp.setDate(temp.getDate() - ((temp.getDay() + 6) % 7) + 3);
      const firstThursday = new Date(temp.getFullYear(), 0, 4);
      firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);
      const weekNum = 1 + Math.round((temp.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return `${temp.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
    }
    case "12m":
      return d.toISOString().slice(0, 7); // YYYY-MM
    default:
      return d.toISOString().slice(0, 10);
  }
}

function getDateLabel(key: string, range: RangeType): string {
  switch (range) {
    case "30d": {
      const [, m, day] = key.split("-");
      return `${parseInt(m)}/${parseInt(day)}`;
    }
    case "12w":
      return key; // e.g. 2026-W06
    case "12m": {
      const [y, m] = key.split("-");
      return `${y}/${m}`;
    }
    default:
      return key;
  }
}

function extractHostname(url: string | null): string {
  if (!url) return "直接アクセス";
  try {
    const hostname = new URL(url).hostname;
    return hostname || "直接アクセス";
  } catch {
    return "直接アクセス";
  }
}

function topN(map: Map<string, number>, n: number): CountEntry[] {
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // Look up profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, username")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json(
        { error: "プロフィールが見つかりません" },
        { status: 401 }
      );
    }

    const profileId = profile.id;
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get("range") || "30d") as RangeType;

    if (!["30d", "12w", "12m"].includes(range)) {
      return NextResponse.json(
        { error: "無効な範囲パラメータです" },
        { status: 400 }
      );
    }

    const rangeStart = getDateRange(range);
    const rangeStartISO = rangeStart.toISOString();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    // Fetch all data in parallel
    const [viewsResult, clicksResult, conversionsResult, realtimeResult] =
      await Promise.all([
        supabaseAdmin
          .from("page_views")
          .select("viewed_at, referrer, device_type, browser, os, country, utm_source, utm_medium, utm_campaign")
          .eq("profile_id", profileId)
          .gte("viewed_at", rangeStartISO)
          .order("viewed_at", { ascending: true }),
        supabaseAdmin
          .from("link_clicks")
          .select("clicked_at, link_id, link_url, link_label, referrer, device_type, browser, os, country, utm_source, utm_medium, utm_campaign")
          .eq("profile_id", profileId)
          .gte("clicked_at", rangeStartISO)
          .order("clicked_at", { ascending: true }),
        supabaseAdmin
          .from("conversion_events")
          .select("event_type, converted_at")
          .eq("profile_id", profileId)
          .gte("converted_at", rangeStartISO),
        supabaseAdmin
          .from("page_views")
          .select("id", { count: "exact", head: true })
          .eq("profile_id", profileId)
          .gte("viewed_at", fiveMinutesAgo),
      ]);

    const views = viewsResult.data || [];
    const clicks = clicksResult.data || [];
    const conversions = conversionsResult.data || [];
    const realtimeViewers = realtimeResult.count || 0;

    // === Aggregate views ===
    const totalViews = views.length;
    const today = new Date().toISOString().slice(0, 10);
    const todayViews = views.filter(
      (v) => v.viewed_at?.slice(0, 10) === today
    ).length;

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString();
    const weekViews = views.filter(
      (v) => v.viewed_at >= weekAgo
    ).length;

    // Time series
    const timeSeriesMap = new Map<string, { views: number; clicks: number }>();
    for (const v of views) {
      const key = getDateKey(v.viewed_at, range);
      const entry = timeSeriesMap.get(key) || { views: 0, clicks: 0 };
      entry.views++;
      timeSeriesMap.set(key, entry);
    }
    for (const c of clicks) {
      const key = getDateKey(c.clicked_at, range);
      const entry = timeSeriesMap.get(key) || { views: 0, clicks: 0 };
      entry.clicks++;
      timeSeriesMap.set(key, entry);
    }

    const timeSeries: TimeSeriesEntry[] = Array.from(timeSeriesMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        label: getDateLabel(date, range),
        views: data.views,
        clicks: data.clicks,
      }));

    // Breakdowns
    const deviceMap = new Map<string, number>();
    const browserMap = new Map<string, number>();
    const osMap = new Map<string, number>();
    const countryMap = new Map<string, number>();
    const referrerMap = new Map<string, number>();
    const utmSourceMap = new Map<string, number>();
    const utmMediumMap = new Map<string, number>();
    const utmCampaignMap = new Map<string, number>();

    for (const v of views) {
      const device = v.device_type || "unknown";
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1);

      const browser = v.browser || "unknown";
      browserMap.set(browser, (browserMap.get(browser) || 0) + 1);

      const os = v.os || "unknown";
      osMap.set(os, (osMap.get(os) || 0) + 1);

      const country = v.country || "unknown";
      countryMap.set(country, (countryMap.get(country) || 0) + 1);

      const referrer = extractHostname(v.referrer);
      referrerMap.set(referrer, (referrerMap.get(referrer) || 0) + 1);

      if (v.utm_source) {
        utmSourceMap.set(v.utm_source, (utmSourceMap.get(v.utm_source) || 0) + 1);
      }
      if (v.utm_medium) {
        utmMediumMap.set(v.utm_medium, (utmMediumMap.get(v.utm_medium) || 0) + 1);
      }
      if (v.utm_campaign) {
        utmCampaignMap.set(v.utm_campaign, (utmCampaignMap.get(v.utm_campaign) || 0) + 1);
      }
    }

    // Link clicks aggregation
    const linkClickMap = new Map<string, { link_id: string; link_label: string; link_url: string; count: number }>();
    for (const c of clicks) {
      const key = c.link_id;
      const entry = linkClickMap.get(key) || {
        link_id: c.link_id,
        link_label: c.link_label || "",
        link_url: c.link_url,
        count: 0,
      };
      entry.count++;
      linkClickMap.set(key, entry);
    }
    const linkClicks: LinkClickEntry[] = Array.from(linkClickMap.values())
      .sort((a, b) => b.count - a.count);
    const totalClicks = clicks.length;

    // Conversions aggregation
    const conversionCounts = {
      contact_submit: 0,
      booking_submit: 0,
      email_subscribe: 0,
      total: 0,
    };
    for (const c of conversions) {
      const eventType = c.event_type as keyof typeof conversionCounts;
      if (eventType in conversionCounts && eventType !== "total") {
        conversionCounts[eventType]++;
      }
      conversionCounts.total++;
    }
    const conversionRate =
      totalViews > 0
        ? Math.round((conversionCounts.total / totalViews) * 10000) / 100
        : 0;

    return NextResponse.json({
      username: profile.username,
      analytics: {
        totalViews,
        todayViews,
        weekViews,
        realtimeViewers,
        timeSeries,
        devices: topN(deviceMap, 8),
        browsers: topN(browserMap, 8),
        operatingSystems: topN(osMap, 8),
        countries: topN(countryMap, 8),
        referrers: topN(referrerMap, 8),
        utmSources: topN(utmSourceMap, 8),
        utmMediums: topN(utmMediumMap, 8),
        utmCampaigns: topN(utmCampaignMap, 8),
        linkClicks,
        totalClicks,
        conversions: conversionCounts,
        conversionRate,
      },
    });
  } catch (err) {
    console.error("アナリティクスダッシュボードエラー:", err);
    return NextResponse.json(
      { error: "アナリティクスデータの取得に失敗しました" },
      { status: 500 }
    );
  }
}
