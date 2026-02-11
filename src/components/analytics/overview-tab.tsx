"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, TrendingUp, BarChart3, Target } from "lucide-react";
import { TimeSeriesChart } from "./time-series-chart";
import type { AnalyticsData } from "./types";

interface OverviewTabProps {
  data: AnalyticsData;
  range: string;
  onRangeChange: (range: string) => void;
}

const RANGE_OPTIONS = [
  { label: "日別", value: "30d" },
  { label: "週別", value: "12w" },
  { label: "月別", value: "12m" },
] as const;

export function OverviewTab({ data, range, onRangeChange }: OverviewTabProps) {
  const stats = [
    {
      label: "今日",
      value: data.todayViews.toLocaleString(),
      icon: Eye,
    },
    {
      label: "7日間",
      value: data.weekViews.toLocaleString(),
      icon: TrendingUp,
    },
    {
      label: "合計",
      value: data.totalViews.toLocaleString(),
      icon: BarChart3,
    },
    {
      label: "コンバージョン率",
      value: `${data.conversionRate.toFixed(1)}%`,
      icon: Target,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{stat.label}</span>
                </div>
                <p className="mt-1 text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Range toggle + Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">ページビュー</CardTitle>
            <div className="flex rounded-lg bg-muted p-1">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onRangeChange(opt.value)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    range === opt.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TimeSeriesChart data={data.timeSeries} range={range} />
        </CardContent>
      </Card>
    </div>
  );
}
