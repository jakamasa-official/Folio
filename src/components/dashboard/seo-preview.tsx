"use client";

import type { Profile } from "@/lib/types";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/client";

interface SeoPreviewProps {
  profile: Profile;
  appUrl: string;
}

export function SeoPreview({ profile, appUrl }: SeoPreviewProps) {
  const { t } = useTranslation();
  const url = `${appUrl}/${profile.username}`;
  const displayUrl = url.replace(/^https?:\/\//, "");

  const title = profile.title
    ? `${profile.display_name} - ${profile.title}`
    : profile.display_name;

  const description =
    profile.bio || t("seoPreview.defaultDescription", { name: profile.display_name });

  // Truncate description for preview (approx 2 lines worth)
  const truncatedDescription =
    description.length > 100 ? description.slice(0, 100) + "..." : description;

  return (
    <div className="space-y-4">
      {/* Twitter/X Card Preview */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          X (Twitter)
        </p>
        <div className="group overflow-hidden rounded-2xl border border-border/60 bg-card transition-colors hover:bg-accent/30">
          <div className="flex items-start gap-0">
            {/* Text content */}
            <div className="min-w-0 flex-1 p-3">
              <p className="truncate text-xs text-muted-foreground">
                {displayUrl}
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                {title}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {truncatedDescription}
              </p>
            </div>
            {/* Avatar thumbnail */}
            {profile.avatar_url && (
              <div className="shrink-0 p-3 pl-0">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LINE / Facebook OG Preview */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          LINE / Facebook
        </p>
        <div className="group overflow-hidden rounded-xl border border-border/60 bg-card transition-colors hover:bg-accent/30">
          {/* OG Image area */}
          {profile.avatar_url && (
            <div className="relative flex h-40 items-center justify-center bg-muted/50">
              <div className="relative h-20 w-20 overflow-hidden rounded-full">
                <Image
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            </div>
          )}
          <div className="border-t border-border/40 p-3">
            <p className="truncate text-xs uppercase text-muted-foreground">
              {displayUrl}
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
              {title}
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {truncatedDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
