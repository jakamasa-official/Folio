"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MousePointerClick, Link as LinkIcon } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";
import type { AnalyticsData } from "./types";

interface LinksTabProps {
  data: AnalyticsData;
}

function getCategory(link: { link_id: string; link_label: string }): string {
  const colonIdx = link.link_label.indexOf(":");
  if (colonIdx > 0) return link.link_label.slice(0, colonIdx).trim();
  if (link.link_id.startsWith("ext-")) return "External";
  return "Profile";
}

export function LinksTab({ data }: LinksTabProps) {
  const { t } = useTranslation();
  const sortedLinks = useMemo(
    () => [...data.linkClicks].sort((a, b) => b.count - a.count),
    [data.linkClicks]
  );

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    sortedLinks.forEach((link) => cats.add(getCategory(link)));
    return Array.from(cats).sort();
  }, [sortedLinks]);

  const [unchecked, setUnchecked] = useState<Set<string>>(new Set());

  const toggleCategory = (cat: string) => {
    setUnchecked((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const filteredLinks = useMemo(
    () => sortedLinks.filter((link) => !unchecked.has(getCategory(link))),
    [sortedLinks, unchecked]
  );

  const filteredTotal = useMemo(
    () => filteredLinks.reduce((sum, l) => sum + l.count, 0),
    [filteredLinks]
  );

  if (sortedLinks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <MousePointerClick className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {t("analytics.noLinkClicks")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LinkIcon className="h-4 w-4" />
          {t("analytics.linkClicks")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Category checkboxes */}
        {categories.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-3">
            <span className="text-xs font-medium text-muted-foreground self-center">
              {t("analytics.filterByType")}
            </span>
            {categories.map((cat) => {
              const count = sortedLinks
                .filter((l) => getCategory(l) === cat)
                .reduce((s, l) => s + l.count, 0);
              const checked = !unchecked.has(cat);
              return (
                <label
                  key={cat}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs cursor-pointer select-none transition-colors ${
                    checked
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-muted bg-muted/30 text-muted-foreground line-through"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(cat)}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary/50"
                  />
                  {cat}
                  <span className="tabular-nums text-muted-foreground">({count})</span>
                </label>
              );
            })}
          </div>
        )}

        {/* Header row */}
        <div className="mb-2 grid grid-cols-[1fr_1fr_auto_auto] gap-4 border-b pb-2 text-xs font-medium text-muted-foreground">
          <span>{t("analytics.linkName")}</span>
          <span>{t("analytics.url")}</span>
          <span className="w-16 text-right">{t("analytics.clickCount")}</span>
          <span className="w-16 text-right">{t("analytics.ctr")}</span>
        </div>

        {/* Data rows */}
        <div className="space-y-2">
          {filteredLinks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t("analytics.noMatchingClicks")}
            </p>
          ) : (
            filteredLinks.map((link) => {
              const ctr = data.totalViews > 0
                ? ((link.count / data.totalViews) * 100).toFixed(1)
                : "0.0";

              // Truncate URL for display
              let displayUrl = link.link_url;
              try {
                const url = new URL(link.link_url);
                displayUrl = url.hostname + (url.pathname !== "/" ? url.pathname : "");
              } catch {
                // keep original
              }
              if (displayUrl.length > 30) {
                displayUrl = displayUrl.slice(0, 30) + "...";
              }

              return (
                <div
                  key={link.link_id}
                  className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-4 rounded-md py-1.5 text-sm"
                >
                  <span className="truncate font-medium">{link.link_label}</span>
                  <span className="truncate text-muted-foreground">{displayUrl}</span>
                  <span className="w-16 text-right tabular-nums">{link.count}</span>
                  <span className="w-16 text-right tabular-nums text-muted-foreground">
                    {ctr}%
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Total */}
        <div className="mt-4 border-t pt-3">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>{t("analytics.totalClicks")}</span>
            <span className="tabular-nums">{filteredTotal}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
