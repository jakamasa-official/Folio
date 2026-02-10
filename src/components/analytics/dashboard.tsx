"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_URL } from "@/lib/constants";
import { BarChart3, Eye, TrendingUp, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ViewData {
  viewed_at: string;
}

interface Props {
  views: ViewData[];
  totalViews: number;
  username: string;
}

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
    </div>
  );
}
