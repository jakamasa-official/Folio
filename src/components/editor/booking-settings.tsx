"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n/client";
import type { BookingSlots } from "@/lib/types";

interface BookingSettingsProps {
  slots: BookingSlots | null;
  onChange: (slots: BookingSlots) => void;
}

const DAYS = [
  { value: 1, key: "bookingDayMon" },
  { value: 2, key: "bookingDayTue" },
  { value: 3, key: "bookingDayWed" },
  { value: 4, key: "bookingDayThu" },
  { value: 5, key: "bookingDayFri" },
  { value: 6, key: "bookingDaySat" },
  { value: 0, key: "bookingDaySun" },
] as const;

const DURATION_OPTIONS = [
  { value: 30, key: "bookingDuration30" },
  { value: 60, key: "bookingDuration60" },
  { value: 90, key: "bookingDuration90" },
  { value: 120, key: "bookingDuration120" },
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
  const { t } = useTranslation();
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
        <Label>{t("bookingDaysLabel")}</Label>
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
                {t(day.key)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time range */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="booking-start">{t("bookingStartLabel")}</Label>
          <Input
            id="booking-start"
            type="time"
            value={current.start}
            onChange={(e) => update("start", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="booking-end">{t("bookingEndLabel")}</Label>
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
        <Label htmlFor="booking-duration">{t("bookingDurationLabel")}</Label>
        <select
          id="booking-duration"
          value={current.duration}
          onChange={(e) => update("duration", Number(e.target.value))}
          className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          {DURATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.key)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
