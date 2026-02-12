"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Globe } from "lucide-react";
import { BreakdownList } from "./traffic-tab";
import { useTranslation } from "@/lib/i18n/client";
import type { AnalyticsData } from "./types";

interface VisitorsTabProps {
  data: AnalyticsData;
}

export function VisitorsTab({ data }: VisitorsTabProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Monitor className="h-4 w-4" />
            {t("analytics.devices")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BreakdownList items={data.devices} />
        </CardContent>
      </Card>

      {/* Browsers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("analytics.browsers")}</CardTitle>
        </CardHeader>
        <CardContent>
          <BreakdownList items={data.browsers} />
        </CardContent>
      </Card>

      {/* Operating Systems */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("analytics.os")}</CardTitle>
        </CardHeader>
        <CardContent>
          <BreakdownList items={data.operatingSystems} />
        </CardContent>
      </Card>

      {/* Countries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            {t("analytics.regions")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BreakdownList items={data.countries} />
        </CardContent>
      </Card>
    </div>
  );
}
