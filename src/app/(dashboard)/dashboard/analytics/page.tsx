"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api-client";
import { AnalyticsDashboard } from "@/components/analytics/dashboard";
import { useTranslation } from "@/lib/i18n/client";
import type { AnalyticsData } from "@/components/analytics/types";

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<{ analytics: AnalyticsData; username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState("30d");
  const [source, setSource] = useState("all");

  const fetchData = useCallback(async (r: string, s: string = "all") => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/analytics/dashboard?range=${r}&source=${s}`);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || t("analytics.fetchError"));
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("analytics.unknownError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData(range, source);
  }, [range, source, fetchData]);

  function handleRangeChange(newRange: string) {
    setRange(newRange);
  }

  function handleSourceChange(newSource: string) {
    setSource(newSource);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">{t("analytics.title")}</h1>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">{t("analytics.title")}</h1>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">{t("analytics.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("analytics.emptyState")}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">{t("analytics.title")}</h1>
      <AnalyticsDashboard
        data={data.analytics}
        username={data.username}
        range={range}
        onRangeChange={handleRangeChange}
        source={source}
        onSourceChange={handleSourceChange}
      />
    </div>
  );
}
