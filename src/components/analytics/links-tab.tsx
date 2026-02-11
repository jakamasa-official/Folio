"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MousePointerClick, Link as LinkIcon } from "lucide-react";
import type { AnalyticsData } from "./types";

interface LinksTabProps {
  data: AnalyticsData;
}

export function LinksTab({ data }: LinksTabProps) {
  const sortedLinks = [...data.linkClicks].sort((a, b) => b.count - a.count);

  if (sortedLinks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <MousePointerClick className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            リンクのクリックデータはまだありません
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
          リンククリック
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Header row */}
        <div className="mb-2 grid grid-cols-[1fr_1fr_auto_auto] gap-4 border-b pb-2 text-xs font-medium text-muted-foreground">
          <span>リンク名</span>
          <span>URL</span>
          <span className="w-16 text-right">クリック数</span>
          <span className="w-16 text-right">CTR</span>
        </div>

        {/* Data rows */}
        <div className="space-y-2">
          {sortedLinks.map((link) => {
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
          })}
        </div>

        {/* Total */}
        <div className="mt-4 border-t pt-3">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>合計クリック数</span>
            <span className="tabular-nums">{data.totalClicks}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
