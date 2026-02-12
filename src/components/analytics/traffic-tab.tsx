"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";
import type { AnalyticsData, BreakdownItem } from "./types";

interface TrafficTabProps {
  data: AnalyticsData;
}

export function BreakdownList({ items, emptyMessage }: { items: BreakdownItem[]; emptyMessage?: string }) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{emptyMessage || t("analytics.noData")}</p>
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
  const { t } = useTranslation();

  const sections = [
    { title: t("analytics.referrers"), items: data.referrers, icon: ExternalLink },
    { title: t("analytics.utmSource"), items: data.utmSources },
    { title: t("analytics.utmMedium"), items: data.utmMediums },
    { title: t("analytics.utmCampaign"), items: data.utmCampaigns },
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
