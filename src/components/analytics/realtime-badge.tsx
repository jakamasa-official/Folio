"use client";

import { Users } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";

interface RealtimeBadgeProps {
  count: number;
}

export function RealtimeBadge({ count }: RealtimeBadgeProps) {
  const { t } = useTranslation();

  if (count <= 0) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
      </span>
      <Users className="h-3 w-3" />
      <span>{t("analytics.viewingNow", { count: String(count) })}</span>
    </div>
  );
}
