"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Calendar, AtSign, ArrowRight, Target } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";
import type { AnalyticsData } from "./types";

interface ConversionsTabProps {
  data: AnalyticsData;
}

export function ConversionsTab({ data }: ConversionsTabProps) {
  const { t } = useTranslation();

  const clickRate = data.totalViews > 0
    ? ((data.totalClicks / data.totalViews) * 100).toFixed(1)
    : "0.0";

  const conversionFromClicks = data.totalClicks > 0
    ? ((data.conversions.total / data.totalClicks) * 100).toFixed(1)
    : "0.0";

  const conversionTypes = [
    {
      label: t("analytics.contactSubmit"),
      count: data.conversions.contact_submit,
      icon: Mail,
    },
    {
      label: t("analytics.bookingSubmit"),
      count: data.conversions.booking_submit,
      icon: Calendar,
    },
    {
      label: t("analytics.emailSubscribe"),
      count: data.conversions.email_subscribe,
      icon: AtSign,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Funnel overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("analytics.conversionFunnel")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2">
            {/* Page views */}
            <div className="flex-1 rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold">{data.totalViews.toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("analytics.pageViewsLabel")}</p>
            </div>

            {/* Arrow + percentage */}
            <div className="flex flex-col items-center gap-1">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{clickRate}%</span>
            </div>

            {/* Clicks */}
            <div className="flex-1 rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold">{data.totalClicks.toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("analytics.clicksLabel")}</p>
            </div>

            {/* Arrow + percentage */}
            <div className="flex flex-col items-center gap-1">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{conversionFromClicks}%</span>
            </div>

            {/* Conversions */}
            <div className="flex-1 rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold">{data.conversions.total.toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("analytics.conversionsLabel")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown by type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("analytics.conversionBreakdown")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {conversionTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.label}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium">{type.label}</span>
                </div>
                <span className="text-xl font-bold tabular-nums">
                  {type.count.toLocaleString()}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Overall conversion rate */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{t("analytics.overallConversionRate")}</p>
              <p className="text-xs text-muted-foreground">{t("analytics.conversionRateDescription")}</p>
            </div>
          </div>
          <p className="text-3xl font-bold tabular-nums">{data.conversionRate.toFixed(1)}%</p>
        </CardContent>
      </Card>
    </div>
  );
}
