"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BookingSlots } from "@/lib/types";
import { useTranslation } from "@/lib/i18n/client";

interface BookingWidgetProps {
  profileId: string;
  slots: BookingSlots;
}


export function BookingWidget({ profileId, slots }: BookingWidgetProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Calendar data for current month
  const calendarDays = useMemo(() => {
    const { year, month } = currentMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay(); // 0=Sun

    const days: (Date | null)[] = [];

    // Padding for days before the first
    for (let i = 0; i < startDow; i++) {
      days.push(null);
    }

    // Actual days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentMonth]);

  const monthLabel = useMemo(() => {
    const { year, month } = currentMonth;
    const monthKeys = [
      "bookingMonth1", "bookingMonth2", "bookingMonth3", "bookingMonth4",
      "bookingMonth5", "bookingMonth6", "bookingMonth7", "bookingMonth8",
      "bookingMonth9", "bookingMonth10", "bookingMonth11", "bookingMonth12",
    ];
    return t("bookingMonthFormat", { year: String(year), month: t(monthKeys[month]) });
  }, [currentMonth, t]);

  function isAvailableDay(date: Date): boolean {
    if (date < today) return false;
    const dow = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    return slots.days.includes(dow);
  }

  function prevMonth() {
    setCurrentMonth((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  }

  function nextMonth() {
    setCurrentMonth((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  }

  function handleSelectDate(date: Date) {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep(2);
  }

  // Generate time slots for the selected day
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const result: string[] = [];
    const [startH, startM] = slots.start.split(":").map(Number);
    const [endH, endM] = slots.end.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    for (let t = startMinutes; t + slots.duration <= endMinutes; t += slots.duration) {
      const fromH = Math.floor(t / 60).toString().padStart(2, "0");
      const fromM = (t % 60).toString().padStart(2, "0");
      const toT = t + slots.duration;
      const toH = Math.floor(toT / 60).toString().padStart(2, "0");
      const toM = (toT % 60).toString().padStart(2, "0");
      result.push(`${fromH}:${fromM}-${toH}:${toM}`);
    }

    return result;
  }, [selectedDate, slots]);

  // Fetch existing bookings when a date is selected
  useEffect(() => {
    if (!selectedDate || step !== 2) return;

    const dateStr = formatDate(selectedDate);
    setLoadingSlots(true);
    setBookedSlots([]);

    fetch(`/api/bookings?profile_id=${profileId}&date=${dateStr}`)
      .then((res) => res.json())
      .then((data: { bookedSlots?: string[] }) => {
        if (Array.isArray(data.bookedSlots)) {
          setBookedSlots(data.bookedSlots);
        }
      })
      .catch(() => {
        // If fetch fails, assume no booked slots
      })
      .finally(() => {
        setLoadingSlots(false);
      });
  }, [selectedDate, step, profileId]);

  function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function formatDateDisplay(date: Date): string {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const dowKeys = [
      "bookingDowSun", "bookingDowMon", "bookingDowTue", "bookingDowWed",
      "bookingDowThu", "bookingDowFri", "bookingDowSat",
    ];
    const monthKeys = [
      "", "bookingMonth1", "bookingMonth2", "bookingMonth3", "bookingMonth4",
      "bookingMonth5", "bookingMonth6", "bookingMonth7", "bookingMonth8",
      "bookingMonth9", "bookingMonth10", "bookingMonth11", "bookingMonth12",
    ];
    return t("bookingDateFormat", {
      month: t(monthKeys[m]),
      day: String(d),
      dow: t(dowKeys[date.getDay()]),
    });
  }

  function handleSelectSlot(slot: string) {
    setSelectedSlot(slot);
    setStep(3);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: profileId,
          booker_name: name,
          booker_email: email,
          booking_date: formatDate(selectedDate),
          time_slot: selectedSlot,
          note: note || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t("bookingError"));
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("bookingError"));
    } finally {
      setLoading(false);
    }
  }

  function isSameDate(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  const dowHeaders = [
    t("bookingDowSun"), t("bookingDowMon"), t("bookingDowTue"), t("bookingDowWed"),
    t("bookingDowThu"), t("bookingDowFri"), t("bookingDowSat"),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          {t("bookingTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="flex items-center gap-2 rounded-md bg-green-50 p-4 text-sm text-green-800">
            <Check className="h-4 w-4 shrink-0" />
            {t("bookingSuccess")}
          </div>
        ) : (
          <>
            {/* Step 1: Calendar */}
            {step === 1 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <Button variant="ghost" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{monthLabel}</span>
                  <Button variant="ghost" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {dowHeaders.map((d) => (
                    <div
                      key={d}
                      className="pb-1 text-xs font-medium text-muted-foreground"
                    >
                      {d}
                    </div>
                  ))}
                  {calendarDays.map((day, i) => {
                    if (!day) {
                      return <div key={`empty-${i}`} />;
                    }

                    const available = isAvailableDay(day);
                    const isToday = isSameDate(day, today);

                    return (
                      <button
                        key={day.toISOString()}
                        disabled={!available}
                        onClick={() => handleSelectDate(day)}
                        className={`relative rounded-md p-2 text-sm transition-colors ${
                          available
                            ? "cursor-pointer hover:bg-primary/10 text-foreground font-medium"
                            : "cursor-not-allowed text-muted-foreground/40"
                        } ${isToday ? "ring-1 ring-primary" : ""}`}
                      >
                        {day.getDate()}
                        {available && (
                          <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Time slots */}
            {step === 2 && selectedDate && (
              <div>
                <button
                  onClick={() => setStep(1)}
                  className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("bookingBackToCalendar")}
                </button>

                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  {formatDateDisplay(selectedDate)}
                </div>

                {loadingSlots ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    {t("bookingLoadingSlots")}
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    {t("bookingNoSlots")}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      return (
                        <button
                          key={slot}
                          disabled={isBooked}
                          onClick={() => handleSelectSlot(slot)}
                          className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                            isBooked
                              ? "cursor-not-allowed border-muted bg-muted text-muted-foreground line-through"
                              : "cursor-pointer border-border hover:border-primary hover:bg-primary/5"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Booking form */}
            {step === 3 && selectedDate && selectedSlot && (
              <div>
                <button
                  onClick={() => setStep(2)}
                  className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("bookingBackToTime")}
                </button>

                <div className="mb-4 rounded-md bg-muted/50 p-3 text-sm">
                  <div className="font-medium">
                    {formatDateDisplay(selectedDate)}
                  </div>
                  <div className="text-muted-foreground">{selectedSlot}</div>
                </div>

                {error && (
                  <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="booking-name">お名前 *</Label>
                    <Input
                      id="booking-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="山田 太郎"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="booking-email">メールアドレス *</Label>
                    <Input
                      id="booking-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="booking-note">備考</Label>
                    <Textarea
                      id="booking-note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="ご要望があればご記入ください..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "送信中..." : "予約する"}
                  </Button>
                </form>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
