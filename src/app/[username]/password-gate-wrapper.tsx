"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";
import { PasswordGate } from "@/components/profile/password-gate";
import { ProfilePage } from "@/components/profile/profile-page";
import { TrackPageView } from "./track-page-view";

interface Props {
  profileId: string;
  profile: Profile;
}

export function PasswordGateWrapper({ profileId, profile }: Props) {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return <PasswordGate profileId={profileId} onSuccess={() => setUnlocked(true)} />;
  }

  return (
    <>
      <TrackPageView profileId={profileId} />
      <ProfilePage profile={profile} showBranding={!profile.is_pro} />
    </>
  );
}
