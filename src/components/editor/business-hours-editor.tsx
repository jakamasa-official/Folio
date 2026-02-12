"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n/client";
import { DAYS_OF_WEEK, type BusinessHours } from "@/lib/types";

interface BusinessHoursEditorProps {
  value: BusinessHours | null;
  onChange: (hours: BusinessHours) => void;
}

function getDefaultHours(): BusinessHours {
  const hours: BusinessHours = {};
  for (const day of DAYS_OF_WEEK) {
    hours[day.key] = { open: "09:00", close: "17:00", closed: false };
  }
  return hours;
}

export function BusinessHoursEditor({ value, onChange }: BusinessHoursEditorProps) {
  const { t } = useTranslation();
  const hours = value || getDefaultHours();

  const updateDay = useCallback(
    (key: string, field: "open" | "close" | "closed", val: string | boolean) => {
      const updated = { ...hours };
      updated[key] = { ...updated[key], [field]: val };
      onChange(updated);
    },
    [hours, onChange]
  );

  return (
    <div className="space-y-2">
      {DAYS_OF_WEEK.map((day) => {
        const dayHours = hours[day.key] || { open: "09:00", close: "17:00", closed: false };
        const isClosed = dayHours.closed === true;

        return (
          <div
            key={day.key}
            className="flex items-center gap-3"
          >
            {/* Day label */}
            <Label className="w-12 shrink-0 text-sm">{day.short}</Label>

            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={!isClosed}
              onClick={() => updateDay(day.key, "closed", !isClosed)}
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                isClosed ? "bg-muted" : "bg-primary"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  isClosed ? "translate-x-0.5" : "translate-x-[18px]"
                }`}
              />
            </button>

            {/* Time inputs */}
            {isClosed ? (
              <span className="text-sm text-muted-foreground">{t("businessHoursClosed")}</span>
            ) : (
              <div className="flex items-center gap-1">
                <Input
                  type="time"
                  value={dayHours.open}
                  onChange={(e) => updateDay(day.key, "open", e.target.value)}
                  className="h-8 w-28 text-sm"
                />
                <span className="text-sm text-muted-foreground">-</span>
                <Input
                  type="time"
                  value={dayHours.close}
                  onChange={(e) => updateDay(day.key, "close", e.target.value)}
                  className="h-8 w-28 text-sm"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
