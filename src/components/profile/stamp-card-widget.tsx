"use client";

import Link from "next/link";
import type { StampCard } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { APP_URL } from "@/lib/constants";
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

interface StampCardWidgetProps {
  cards: StampCard[];
}

export function StampCardWidget({ cards }: StampCardWidgetProps) {
  const { t } = useTranslation();

  if (cards.length === 0) return null;

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <Card key={card.id} className="overflow-hidden">
          <CardContent className="p-0">
            <Link
              href={`${APP_URL}/stamp/${card.id}`}
              className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/50"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl"
                style={{
                  backgroundColor: card.color + "20",
                }}
              >
                {getEmoji(card.icon)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{card.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t("stampCardReward", { count: String(card.total_stamps_required) })}
                  {card.reward_description ? ` - ${card.reward_description}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {t("stampCardView")}
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
