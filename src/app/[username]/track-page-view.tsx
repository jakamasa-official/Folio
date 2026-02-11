"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function TrackPageView({ profileId }: { profileId: string }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile_id: profileId,
        utm_source: searchParams.get("utm_source") || undefined,
        utm_medium: searchParams.get("utm_medium") || undefined,
        utm_campaign: searchParams.get("utm_campaign") || undefined,
      }),
    }).catch(() => {});
  }, [profileId, searchParams]);

  return null;
}
