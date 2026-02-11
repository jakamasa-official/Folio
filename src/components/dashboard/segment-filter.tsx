"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api-client";

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface SegmentInfo {
  id: string;
  name: string;
  color: string;
  customer_count: number;
  customer_ids?: string[];
  is_active: boolean;
}

interface SegmentFilterProps {
  selectedSegmentId: string | null;
  onSegmentSelect: (segmentId: string | null, customerIds?: string[]) => void;
}

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

export default function SegmentFilter({
  selectedSegmentId,
  onSegmentSelect,
}: SegmentFilterProps) {
  const [segments, setSegments] = useState<SegmentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSegments = useCallback(async () => {
    try {
      const res = await apiFetch("/api/segments");
      const data = await res.json();
      if (res.ok && data.segments) {
        setSegments(
          data.segments.filter((s: SegmentInfo) => s.is_active)
        );
      }
    } catch (err) {
      console.error("セグメント取得エラー:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-7 w-20 animate-pulse rounded-full bg-muted"
          />
        ))}
      </div>
    );
  }

  if (segments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {/* All customers */}
      <button
        type="button"
        onClick={() => onSegmentSelect(null)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
          selectedSegmentId === null
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-background text-muted-foreground hover:bg-muted"
        }`}
      >
        全て
      </button>

      {/* Segment badges */}
      {segments.map((segment) => (
        <button
          key={segment.id}
          type="button"
          onClick={() => {
            if (selectedSegmentId === segment.id) {
              onSegmentSelect(null);
            } else {
              onSegmentSelect(segment.id, segment.customer_ids);
            }
          }}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            selectedSegmentId === segment.id
              ? "border-current text-white"
              : "border-border bg-background text-muted-foreground hover:bg-muted"
          }`}
          style={
            selectedSegmentId === segment.id
              ? { backgroundColor: segment.color, borderColor: segment.color }
              : undefined
          }
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{
              backgroundColor:
                selectedSegmentId === segment.id ? "#fff" : segment.color,
            }}
          />
          {segment.name}
          <span
            className={`${
              selectedSegmentId === segment.id
                ? "text-white/80"
                : "text-muted-foreground"
            }`}
          >
            {segment.customer_count}
          </span>
        </button>
      ))}
    </div>
  );
}
