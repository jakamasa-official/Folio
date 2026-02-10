"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BookingSlots } from "@/lib/types";

interface BookingSettingsProps {
  slots: BookingSlots | null;
  onChange: (slots: BookingSlots) => void;
}

const DAYS = [
  { value: 1, label: "月" },
  { value: 2, label: "火" },
  { value: 3, label: "水" },
  { value: 4, label: "木" },
  { value: 5, label: "金" },
  { value: 6, label: "土" },
  { value: 0, label: "日" },
] as const;

const DURATION_OPTIONS = [
  { value: 30, label: "30分" },
  { value: 60, label: "60分" },
  { value: 90, label: "90分" },
  { value: 120, label: "120分" },
] as const;

function getDefaults(): BookingSlots {
  return {
    days: [1, 2, 3, 4, 5],
    start: "09:00",
    end: "17:00",
    duration: 60,
  };
}

export function BookingSettings({ slots, onChange }: BookingSettingsProps) {
  const current = slots || getDefaults();

  const update = useCallback(
    (field: keyof BookingSlots, value: BookingSlots[keyof BookingSlots]) => {
      onChange({ ...current, [field]: value });
    },
    [current, onChange]
  );

  function toggleDay(day: number) {
    const days = current.days.includes(day)
      ? current.days.filter((d) => d !== day)
      : [...current.days, day];
    update("days", days);
  }

  return (
    <div className="space-y-4">
      {/* Day toggles */}
      <div className="space-y-2">
        <Label>受付曜日</Label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => {
            const active = current.days.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time range */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="booking-start">開始時間</Label>
          <Input
            id="booking-start"
            type="time"
            value={current.start}
            onChange={(e) => update("start", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="booking-end">終了時間</Label>
          <Input
            id="booking-end"
            type="time"
            value={current.end}
            onChange={(e) => update("end", e.target.value)}
          />
        </div>
      </div>

      {/* Duration select */}
      <div className="space-y-2">
        <Label htmlFor="booking-duration">1枠の長さ</Label>
        <select
          id="booking-duration"
          value={current.duration}
          onChange={(e) => update("duration", Number(e.target.value))}
          className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          {DURATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
