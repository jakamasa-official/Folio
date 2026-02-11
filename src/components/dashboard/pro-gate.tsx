"use client";

import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProGateProps {
  isPro: boolean;
  feature: string; // Japanese feature name for the upgrade message
  children: React.ReactNode;
}

/**
 * Wraps content that is Pro-only.
 *
 * When the user is on the free plan, the children are hidden behind a
 * visually appealing upgrade prompt. Pro users see the children as-is.
 */
export function ProGate({ isPro, feature, children }: ProGateProps) {
  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred preview of the content behind the gate */}
      <div className="pointer-events-none select-none blur-[6px] opacity-40" aria-hidden>
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="mx-4 max-w-sm rounded-xl border bg-background/95 p-6 text-center shadow-lg backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Crown className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold">
            {feature}はプロプランでご利用いただけます
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            プロプランにアップグレードして、すべての機能をご利用ください。
          </p>
          <Button asChild className="mt-4 w-full gap-1.5">
            <Link href="/dashboard/settings">
              <Crown className="h-4 w-4" />
              アップグレード
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * A smaller inline banner to show when a limit is reached.
 * Used next to "create" buttons for resources with free-tier caps.
 */
interface LimitBannerProps {
  current: number;
  max: number;
  label: string; // e.g. "顧客", "スタンプカード", "クーポン"
  isPro: boolean;
}

export function LimitBanner({ current, max, label, isPro }: LimitBannerProps) {
  if (isPro) return null;

  const atLimit = current >= max;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
        atLimit
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-border bg-muted/50 text-muted-foreground"
      }`}
    >
      <span>
        {current} / {max} {label}
      </span>
      {atLimit && (
        <Link
          href="/dashboard/settings"
          className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-amber-700 underline hover:no-underline"
        >
          <Crown className="h-3 w-3" />
          アップグレード
        </Link>
      )}
    </div>
  );
}
