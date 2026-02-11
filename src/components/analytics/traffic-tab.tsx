"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import type { AnalyticsData, BreakdownItem } from "./types";

interface TrafficTabProps {
  data: AnalyticsData;
}

export function BreakdownList({ items, emptyMessage = "データなし" }: { items: BreakdownItem[]; emptyMessage?: string }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{emptyMessage}</p>
    );
  }

  const maxCount = items[0]?.count || 1;
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
        const totalPct = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0.0";
        return (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate">{item.label}</span>
              <span className="ml-2 shrink-0 text-muted-foreground">
                {item.count} ({totalPct}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary/70"
                style={{ width: `${Math.max(pct, 1)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TrafficTab({ data }: TrafficTabProps) {
  const sections = [
    { title: "流入元", items: data.referrers, icon: ExternalLink },
    { title: "UTMソース", items: data.utmSources },
    { title: "UTMメディア", items: data.utmMediums },
    { title: "UTMキャンペーン", items: data.utmCampaigns },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {Icon && <Icon className="h-4 w-4" />}
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BreakdownList items={section.items} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
