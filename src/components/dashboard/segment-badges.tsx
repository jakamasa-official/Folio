"use client";

import { useMemo } from "react";
import type { Customer } from "@/lib/types";
import {
  computeCustomerFields,
  evaluateSegmentCriteria,
  getSystemSegments,
  type CustomerExtras,
  type SegmentCriteria,
} from "@/lib/segmentation";

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface SegmentBadgeInfo {
  name: string;
  color: string;
}

interface SegmentBadgesProps {
  customer: Customer;
  extras?: CustomerExtras;
  maxBadges?: number;
  /** Optional external segments to evaluate against (from API) */
  segments?: Array<{
    name: string;
    color: string;
    criteria: SegmentCriteria;
    is_active: boolean;
  }>;
}

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

export default function SegmentBadges({
  customer,
  extras,
  maxBadges = 3,
  segments,
}: SegmentBadgesProps) {
  const matchingSegments = useMemo(() => {
    const computed = computeCustomerFields(customer, extras);
    const matches: SegmentBadgeInfo[] = [];

    // Use provided segments or fallback to system segment definitions
    const segmentDefs = segments
      ? segments.filter((s) => s.is_active)
      : getSystemSegments("").map((s) => ({
          name: s.name,
          color: s.color,
          criteria: s.criteria,
          is_active: s.is_active,
        }));

    for (const seg of segmentDefs) {
      if (evaluateSegmentCriteria(customer, computed, seg.criteria, extras)) {
        matches.push({ name: seg.name, color: seg.color });
      }
    }

    return matches;
  }, [customer, extras, segments]);

  if (matchingSegments.length === 0) return null;

  const visible = matchingSegments.slice(0, maxBadges);
  const overflowCount = matchingSegments.length - maxBadges;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((seg) => (
        <span
          key={seg.name}
          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
          style={{ backgroundColor: seg.color }}
        >
          {seg.name}
        </span>
      ))}
      {overflowCount > 0 && (
        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          +{overflowCount}
        </span>
      )}
    </div>
  );
}
