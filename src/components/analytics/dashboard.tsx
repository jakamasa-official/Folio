"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { APP_URL } from "@/lib/constants";
import { OverviewTab } from "./overview-tab";
import { TrafficTab } from "./traffic-tab";
import { VisitorsTab } from "./visitors-tab";
import { LinksTab } from "./links-tab";
import { ConversionsTab } from "./conversions-tab";
import { RealtimeBadge } from "./realtime-badge";
import type { AnalyticsData } from "./types";

interface Props {
  data: AnalyticsData;
  username: string;
  range: string;
  onRangeChange: (range: string) => void;
}

export function AnalyticsDashboard({ data, username, range, onRangeChange }: Props) {
  function copyUrl() {
    navigator.clipboard.writeText(`${APP_URL}/${username}`);
    toast.success("URLをコピーしました");
  }

  return (
    <div className="space-y-6">
      {/* URL bar + Realtime badge */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-sm text-muted-foreground">あなたのページURL</p>
            <p className="font-mono text-sm">
              {APP_URL.replace(/https?:\/\//, "")}/{username}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <RealtimeBadge count={data.realtimeViewers} />
            <Button variant="outline" size="sm" onClick={copyUrl}>
              <Copy className="mr-1 h-4 w-4" />
              コピー
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed layout */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="traffic">流入元</TabsTrigger>
          <TabsTrigger value="visitors">訪問者</TabsTrigger>
          <TabsTrigger value="links">リンク</TabsTrigger>
          <TabsTrigger value="conversions">コンバージョン</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab data={data} range={range} onRangeChange={onRangeChange} />
        </TabsContent>

        <TabsContent value="traffic" className="mt-6">
          <TrafficTab data={data} />
        </TabsContent>

        <TabsContent value="visitors" className="mt-6">
          <VisitorsTab data={data} />
        </TabsContent>

        <TabsContent value="links" className="mt-6">
          <LinksTab data={data} />
        </TabsContent>

        <TabsContent value="conversions" className="mt-6">
          <ConversionsTab data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
