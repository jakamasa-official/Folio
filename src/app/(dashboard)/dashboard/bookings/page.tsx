"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Booking, BookingSlots } from "@/lib/types";
import { DAYS_OF_WEEK } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarDays, Check, X, Clock } from "lucide-react";

const DAY_NUMBERS: number[] = [1, 2, 3, 4, 5, 6, 0]; // Mon=1 ... Sun=0

const DURATION_OPTIONS = [
  { value: 30, label: "30分" },
  { value: 60, label: "60分" },
  { value: 90, label: "90分" },
  { value: 120, label: "120分" },
];

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "保留中", variant: "secondary" },
  confirmed: { label: "確定済み", variant: "default" },
  canceled: { label: "キャンセル", variant: "destructive" },
};

export default function BookingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bookingEnabled, setBookingEnabled] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [duration, setDuration] = useState(60);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profileData) { setLoading(false); return; }
    const p = profileData as Profile;
    setProfile(p);
    setBookingEnabled(p.booking_enabled);

    if (p.booking_slots) {
      setSelectedDays(p.booking_slots.days);
      setStartTime(p.booking_slots.start);
      setEndTime(p.booking_slots.end);
      setDuration(p.booking_slots.duration);
    }

    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("*")
      .eq("profile_id", p.id)
      .order("booking_date", { ascending: true });

    setBookings((bookingsData as Booking[]) || []);
    setLoading(false);
  }

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function saveSettings() {
    if (!profile) return;
    setSaving(true);

    const supabase = createClient();
    const slots: BookingSlots = {
      days: selectedDays,
      start: startTime,
      end: endTime,
      duration,
    };

    await supabase
      .from("profiles")
      .update({
        booking_enabled: bookingEnabled,
        booking_slots: slots,
      })
      .eq("id", profile.id);

    setSaving(false);
  }

  async function updateBookingStatus(bookingId: string, status: "confirmed" | "canceled") {
    const supabase = createClient();
    await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
  }

  function filteredBookings() {
    if (activeTab === "all") return bookings;
    if (activeTab === "pending") return bookings.filter((b) => b.status === "pending");
    if (activeTab === "confirmed") return bookings.filter((b) => b.status === "confirmed");
    if (activeTab === "canceled") return bookings.filter((b) => b.status === "canceled");
    return bookings;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">予約管理</h1>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">予約管理</h1>

      {/* Booking Settings */}
      <Card>
        <CardHeader>
          <CardTitle>予約設定</CardTitle>
          <CardDescription>予約可能な曜日と時間帯を設定します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable toggle */}
          <div className="flex items-center justify-between">
            <Label>予約機能を有効にする</Label>
            <Button
              variant={bookingEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setBookingEnabled(!bookingEnabled)}
            >
              {bookingEnabled ? "有効" : "無効"}
            </Button>
          </div>

          {/* Day checkboxes */}
          <div className="space-y-2">
            <Label>受付曜日</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day, index) => {
                const dayNum = DAY_NUMBERS[index];
                const isSelected = selectedDays.includes(dayNum);
                return (
                  <Button
                    key={day.key}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDay(dayNum)}
                  >
                    {day.short}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">開始時間</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">終了時間</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>予約時間の長さ</Label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={duration === opt.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDuration(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={saveSettings} disabled={saving}>
            {saving ? "保存中..." : "設定を保存"}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Bookings List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">予約一覧</h2>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="pending">保留中</TabsTrigger>
            <TabsTrigger value="confirmed">確定済み</TabsTrigger>
            <TabsTrigger value="canceled">キャンセル</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredBookings().length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CalendarDays className="mb-4 h-12 w-12" />
                  <p>予約はまだありません</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredBookings().map((booking) => {
                  const statusInfo = STATUS_MAP[booking.status];
                  return (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {new Date(booking.booking_date).toLocaleDateString("ja-JP")}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {booking.time_slot}
                              </span>
                              <Badge variant={statusInfo.variant}>
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium">
                              {booking.booker_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {booking.booker_email}
                            </p>
                            {booking.note && (
                              <p className="text-sm text-muted-foreground">
                                {booking.note}
                              </p>
                            )}
                          </div>
                          {booking.status === "pending" && (
                            <div className="flex shrink-0 gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateBookingStatus(booking.id, "confirmed")
                                }
                              >
                                <Check className="mr-1 h-4 w-4" />
                                確定
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateBookingStatus(booking.id, "canceled")
                                }
                              >
                                <X className="mr-1 h-4 w-4" />
                                キャンセル
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
