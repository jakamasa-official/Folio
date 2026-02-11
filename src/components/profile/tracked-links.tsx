"use client";

import { Suspense } from "react";
import { ExternalLink } from "lucide-react";
import type { ProfileLink } from "@/lib/types";
import { useTrackLinkClick } from "./track-link-click";

function TrackedLinksInner({ profileId, links, linkBtnClass }: {
  profileId: string;
  links: ProfileLink[];
  linkBtnClass: string;
}) {
  const trackClick = useTrackLinkClick(profileId);

  return (
    <div className="mt-6 space-y-3">
      {links.map((link) => (
        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
          onClick={() => trackClick(link.id, link.url, link.label)}
          className={`flex items-center justify-between rounded-lg px-5 py-3.5 text-sm font-medium transition-all hover:scale-[1.02] md:text-base ${linkBtnClass}`}>
          <span>{link.label}</span>
          <ExternalLink className="h-4 w-4 opacity-50" />
        </a>
      ))}
    </div>
  );
}

export function TrackedLinks(props: { profileId: string; links: ProfileLink[]; linkBtnClass: string }) {
  return (
    <Suspense fallback={
      <div className="mt-6 space-y-3">
        {props.links.map((link) => (
          <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
            className={`flex items-center justify-between rounded-lg px-5 py-3.5 text-sm font-medium transition-all hover:scale-[1.02] md:text-base ${props.linkBtnClass}`}>
            <span>{link.label}</span>
            <ExternalLink className="h-4 w-4 opacity-50" />
          </a>
        ))}
      </div>
    }>
      <TrackedLinksInner {...props} />
    </Suspense>
  );
}
