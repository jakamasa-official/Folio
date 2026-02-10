"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_URL } from "@/lib/constants";
import { BarChart3, Eye, TrendingUp, Copy, Globe, Monitor, Smartphone, Tablet, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ViewData {
  viewed_at: string;
  referrer: string | null;
  device_type: string | null;
  country: string | null;
}

interface Props {
  views: ViewData[];
  totalViews: number;
  username: string;
}

function BreakdownBar({ label, count, max, icon }: { label: string; count: number; max: number; icon?: React.ReactNode }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between text-sm">
          <span className="truncate">{label}</span>
          <span className="ml-2 text-muted-foreground">{count}</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary/70"
            style={{ width: `${Math.max(pct, 1)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  desktop: <Monitor className="h-4 w-4" />,
  mobile: <Smartphone className="h-4 w-4" />,
  tablet: <Tablet className="h-4 w-4" />,
};

const DEVICE_LABELS: Record<string, string> = {
  desktop: "デスクトップ",
  mobile: "モバイル",
  tablet: "タブレット",
};

export function AnalyticsDashboard({ views, totalViews, username }: Props) {
  const chartData = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();

    // Initialize last 30 days with 0
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      days[key] = 0;
    }

    // Count views per day
    views.forEach((v) => {
      const key = new Date(v.viewed_at).toISOString().split("T")[0];
      if (days[key] !== undefined) {
        days[key]++;
      }
    });

    return Object.entries(days).map(([date, count]) => ({
      date,
      label: `${parseInt(date.split("-")[1])}/${parseInt(date.split("-")[2])}`,
      count,
    }));
  }, [views]);

  const deviceBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    views.forEach((v) => {
      const device = v.device_type || "unknown";
      counts[device] = (counts[device] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([device, count]) => ({ device, count }));
  }, [views]);

  const referrerBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    views.forEach((v) => {
      let source = "直接アクセス";
      if (v.referrer) {
        try {
          source = new URL(v.referrer).hostname;
        } catch {
          source = v.referrer;
        }
      }
      counts[source] = (counts[source] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([source, count]) => ({ source, count }));
  }, [views]);

  const countryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    views.forEach((v) => {
      const country = v.country || "不明";
      counts[country] = (counts[country] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([country, count]) => ({ country, count }));
  }, [views]);

  const todayViews = chartData[chartData.length - 1]?.count || 0;
  const weekViews = chartData.slice(-7).reduce((sum, d) => sum + d.count, 0);
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  function copyUrl() {
    navigator.clipboard.writeText(`${APP_URL}/${username}`);
    toast.success("URLをコピーしました");
  }

  return (
    <div className="space-y-6">
      {/* URL */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-sm text-muted-foreground">あなたのページURL</p>
            <p className="font-mono text-sm">
              {APP_URL.replace(/https?:\/\//, "")}/{username}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={copyUrl}>
            <Copy className="mr-1 h-4 w-4" />
            コピー
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span className="text-xs">今日</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{todayViews}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">7日間</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{weekViews}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">合計</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{totalViews}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">30日間のページビュー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-end gap-[2px]">
            {chartData.map((d) => (
              <div
                key={d.date}
                className="group relative flex-1"
                title={`${d.label}: ${d.count}回`}
              >
                <div
                  className="w-full rounded-t bg-primary/80 transition-colors hover:bg-primary"
                  style={{
                    height: `${Math.max((d.count / maxCount) * 100, 2)}%`,
                    minHeight: "2px",
                  }}
                />
                {/* Tooltip */}
                <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background opacity-0 group-hover:opacity-100 whitespace-nowrap">
                  {d.label}: {d.count}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>{chartData[0]?.label}</span>
            <span>{chartData[chartData.length - 1]?.label}</span>
          </div>
        </CardContent>
      </Card>

      {/* Breakdowns */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Device breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Monitor className="h-4 w-4" />
              デバイス
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deviceBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">データがありません</p>
            ) : (
              deviceBreakdown.map((d) => (
                <BreakdownBar
                  key={d.device}
                  label={DEVICE_LABELS[d.device] || d.device}
                  count={d.count}
                  max={deviceBreakdown[0].count}
                  icon={DEVICE_ICONS[d.device]}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Country breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              国 / 地域
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {countryBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">データがありません</p>
            ) : (
              countryBreakdown.map((c) => (
                <BreakdownBar
                  key={c.country}
                  label={c.country}
                  count={c.count}
                  max={countryBreakdown[0].count}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Referrer breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ExternalLink className="h-4 w-4" />
            流入元
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {referrerBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">データがありません</p>
          ) : (
            referrerBreakdown.map((r) => (
              <BreakdownBar
                key={r.source}
                label={r.source}
                count={r.count}
                max={referrerBreakdown[0].count}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
