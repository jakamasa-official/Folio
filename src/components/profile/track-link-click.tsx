"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";

export function useTrackLinkClick(profileId: string) {
  const searchParams = useSearchParams();

  return useCallback((linkId: string, linkUrl: string, linkLabel: string) => {
    const data = JSON.stringify({
      profile_id: profileId,
      link_id: linkId,
      link_url: linkUrl,
      link_label: linkLabel,
      utm_source: searchParams.get("utm_source") || undefined,
      utm_medium: searchParams.get("utm_medium") || undefined,
      utm_campaign: searchParams.get("utm_campaign") || undefined,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/click", new Blob([data], { type: "application/json" }));
    } else {
      fetch("/api/analytics/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
        keepalive: true,
      }).catch(() => {});
    }
  }, [profileId, searchParams]);
}
