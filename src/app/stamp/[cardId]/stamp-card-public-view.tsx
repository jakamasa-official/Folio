"use client";

import { useState } from "react";
import Link from "next/link";
import type { StampCard, StampMilestone, CustomerStamp } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Gift, Mail, ArrowRight } from "lucide-react";
import { APP_NAME, APP_URL } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n/client";

const ICON_MAP: Record<string, string> = {
  star: "\u2B50",
  coffee: "\u2615",
  haircut: "\uD83D\uDC87",
  muscle: "\uD83D\uDCAA",
  pizza: "\uD83C\uDF55",
  music: "\uD83C\uDFB5",
  book: "\uD83D\uDCDA",
  flower: "\uD83C\uDF38",
  gift: "\uD83C\uDF81",
  diamond: "\uD83D\uDC8E",
  trophy: "\uD83C\uDFC6",
  heart: "\u2764\uFE0F",
};

function getEmoji(icon: string): string {
  return ICON_MAP[icon] || "\u2B50";
}

interface StampCardPublicViewProps {
  card: StampCard;
  profileName: string;
  profileUsername: string;
}

export function StampCardPublicView({
  card,
  profileName,
  profileUsername,
}: StampCardPublicViewProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [customerStamp, setCustomerStamp] = useState<CustomerStamp | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [looked, setLooked] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      // First find the customer by email in this profile
      const res = await fetch(
        `/api/customers/lookup?profile_id=${card.profile_id}&email=${encodeURIComponent(email.trim())}`
      );

      if (!res.ok) {
        setLooked(true);
        setCustomerStamp(null);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const customer = data.customer;

      if (!customer) {
        setLooked(true);
        setCustomerStamp(null);
        setLoading(false);
        return;
      }

      // Get stamp progress
      const stampRes = await fetch(
        `/api/stamp-cards/stamp?stamp_card_id=${card.id}&customer_id=${customer.id}`
      );

      if (stampRes.ok) {
        const stampData = await stampRes.json();
        setCustomerStamp(stampData.stamp || null);
      }

      setLooked(true);
    } catch {
      setError("情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  const currentStamps = customerStamp?.current_stamps || 0;
  const completedCount = customerStamp?.completed_count || 0;
  const milestones = (card.milestones || []) as StampMilestone[];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-md px-4 py-8">
        {/* Card Visual */}
        <Card className="overflow-hidden">
          <div
            className="px-6 py-8 text-center text-white"
            style={{ backgroundColor: card.color }}
          >
            <div className="mb-3 text-4xl">{getEmoji(card.icon)}</div>
            <h1 className="text-xl font-bold">{card.name}</h1>
            {profileName && (
              <p className="mt-1 text-sm text-white/80">{profileName}</p>
            )}
          </div>

          <CardContent className="p-6">
            {/* Stamp Grid */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">スタンプ進捗</span>
                <span className="font-medium">
                  {currentStamps} / {card.total_stamps_required}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: card.total_stamps_required }).map(
                  (_, i) => {
                    const isFilled = i < currentStamps;
                    const isMilestone = milestones.some((m) => m.at === i + 1);

                    return (
                      <div
                        key={i}
                        className="relative flex aspect-square items-center justify-center rounded-lg border-2 transition-all"
                        style={{
                          borderColor: isFilled ? card.color : "#e5e7eb",
                          backgroundColor: isFilled ? card.color + "15" : "white",
                        }}
                      >
                        {isFilled ? (
                          <span className="text-lg">{getEmoji(card.icon)}</span>
                        ) : (
                          <span className="text-sm text-gray-300">{i + 1}</span>
                        )}
                        {isMilestone && (
                          <div
                            className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] text-white"
                            style={{ backgroundColor: card.color }}
                          >
                            <Gift className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Milestones List */}
            {milestones.length > 0 && (
              <div className="mb-6 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  マイルストーン
                </p>
                {milestones.map((m, i) => {
                  const reached = currentStamps >= m.at;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                        reached
                          ? "bg-green-50 text-green-800"
                          : "bg-gray-50 text-muted-foreground"
                      }`}
                    >
                      <Badge
                        variant={reached ? "default" : "outline"}
                        className="shrink-0"
                        style={reached ? { backgroundColor: card.color } : {}}
                      >
                        {m.at}
                      </Badge>
                      <span>{m.reward}</span>
                      {reached && (
                        <span className="ml-auto text-xs font-medium text-green-600">
                          達成！
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reward */}
            <div
              className="mb-6 rounded-lg p-4 text-center"
              style={{ backgroundColor: card.color + "10" }}
            >
              <div className="mb-1 flex items-center justify-center gap-1.5">
                <Gift className="h-4 w-4" style={{ color: card.color }} />
                <span className="text-sm font-medium" style={{ color: card.color }}>
                  {card.total_stamps_required}スタンプで特典
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {card.reward_description || "素敵な特典をゲット！"}
              </p>
            </div>

            {/* Completed count */}
            {completedCount > 0 && (
              <div className="mb-6 rounded-md bg-amber-50 p-3 text-center text-sm text-amber-800">
                これまでに{completedCount}回特典を獲得しました！
              </div>
            )}

            {/* Email lookup */}
            {!looked ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  メールアドレスを入力してスタンプを確認
                </div>
                <form onSubmit={handleLookup} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading} className="shrink-0">
                    {loading ? "..." : t("confirm")}
                  </Button>
                </form>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
            ) : !customerStamp ? (
              <div className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
                <p>スタンプの記録がまだありません</p>
                <p className="mt-1 text-xs">
                  お店でスタンプをもらってください
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setLooked(false);
                    setEmail("");
                  }}
                >
                  別のメールアドレスで確認
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLooked(false);
                    setEmail("");
                    setCustomerStamp(null);
                  }}
                >
                  別のメールアドレスで確認
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile link */}
        {profileUsername && (
          <div className="mt-6 text-center">
            <Link
              href={`${APP_URL}/${profileUsername}`}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {profileName}のプロフィールを見る
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Branding */}
        <div className="mt-4 text-center">
          <Link
            href={APP_URL}
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            Powered by {APP_NAME}
          </Link>
        </div>
      </div>
    </div>
  );
}
