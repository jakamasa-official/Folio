"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/client";
import type { TimeSeriesPoint } from "./types";

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  range: string;
}

export function TimeSeriesChart({ data, range }: TimeSeriesChartProps) {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        {t("analytics.chartNoData")}
      </div>
    );
  }

  const maxViews = Math.max(...data.map((d) => d.views), 1);
  const maxClicks = Math.max(...data.map((d) => d.clicks), 1);
  const maxValue = Math.max(maxViews, maxClicks, 1);

  const middleIndex = Math.floor(data.length / 2);

  return (
    <div className="relative">
      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md whitespace-nowrap">
          {t("analytics.chartTooltip", {
            label: data[hoveredIndex].label,
            views: String(data[hoveredIndex].views),
            clicks: String(data[hoveredIndex].clicks),
          })}
        </div>
      )}

      {/* Bars */}
      <div className="flex h-[200px] items-end gap-[2px]">
        {data.map((d, i) => {
          const viewHeight = Math.max((d.views / maxValue) * 200, 2);
          const clickHeight = Math.max((d.clicks / maxValue) * 200, 2);

          return (
            <div
              key={d.date}
              className="group relative flex flex-1 items-end justify-center gap-[1px]"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Views bar */}
              <div
                className="flex-1 rounded-t bg-primary/80 transition-colors hover:bg-primary"
                style={{ height: `${viewHeight}px` }}
              />
              {/* Clicks bar */}
              <div
                className="flex-1 rounded-t bg-orange-400/80 transition-colors hover:bg-orange-500"
                style={{ height: `${clickHeight}px` }}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>{data[0]?.label}</span>
        <span>{data[middleIndex]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-primary/80" />
          <span>{t("analytics.chartViews")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-orange-400/80" />
          <span>{t("analytics.chartClicks")}</span>
        </div>
      </div>
    </div>
  );
}
