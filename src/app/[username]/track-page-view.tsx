"use client";

import { useEffect } from "react";

export function TrackPageView({ profileId }: { profileId: string }) {
  useEffect(() => {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_id: profileId }),
    }).catch(() => {});
  }, [profileId]);

  return null;
}
