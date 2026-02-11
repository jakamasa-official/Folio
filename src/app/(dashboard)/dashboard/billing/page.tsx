"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PLANS } from "@/lib/stripe";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Crown,
  CreditCard,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "@/lib/types";

// Toggle switch component
function BillingToggle({
  isYearly,
  onToggle,
}: {
  isYearly: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span
        className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}
      >
        月額
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isYearly}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          isYearly ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
            isYearly ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <span
        className={`text-sm font-medium ${isYearly ? "text-foreground" : "text-muted-foreground"}`}
      >
        年額
        <Badge variant="secondary" className="ml-1.5 text-[10px]">
          2ヶ月分お得
        </Badge>
      </span>
    </div>
  );
}

// Feature list item
function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
      <span>{children}</span>
    </li>
  );
}

// FAQ item
function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium hover:text-foreground/80"
      >
        {question}
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-muted-foreground">{answer}</p>
      )}
    </div>
  );
}

// --- Upgrade View (not Pro) ---
function UpgradeView({
  profile,
  loading,
  onUpgrade,
}: {
  profile: Profile;
  loading: boolean;
  onUpgrade: (plan: "monthly" | "yearly") => void;
}) {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">プランをアップグレード</h1>
        <p className="mt-2 text-muted-foreground">
          プロプランで全ての機能をお使いいただけます
        </p>
      </div>

      {/* Billing toggle */}
      <BillingToggle isYearly={isYearly} onToggle={() => setIsYearly(!isYearly)} />

      {/* Plan cards */}
      <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
        {/* Free Plan */}
        <Card className="relative">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>{PLANS.free.name}</CardTitle>
              <Badge variant="secondary">現在のプラン</Badge>
            </div>
            <CardDescription>
              <span className="text-2xl font-bold text-foreground">¥0</span>
              <span className="text-muted-foreground">/月</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {PLANS.free.features.map((feature) => (
                <FeatureItem key={feature}>{feature}</FeatureItem>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="relative border-primary shadow-lg">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary px-3 py-1 text-xs">
              <Sparkles className="mr-1 h-3 w-3" />
              おすすめ
            </Badge>
          </div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>{PLANS.pro.name}</CardTitle>
              <Crown className="h-5 w-5 text-yellow-500" />
            </div>
            <CardDescription>
              {isYearly ? (
                <>
                  <span className="text-2xl font-bold text-foreground">
                    ¥{PLANS.pro.priceYearly.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">/年</span>
                  <span className="ml-2 text-xs text-muted-foreground line-through">
                    ¥{(PLANS.pro.priceMonthly * 12).toLocaleString()}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold text-foreground">
                    ¥{PLANS.pro.priceMonthly.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">/月</span>
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {PLANS.pro.features.map((feature) => (
                <FeatureItem key={feature}>{feature}</FeatureItem>
              ))}
            </ul>
            <Button
              className="w-full"
              size="lg"
              onClick={() => onUpgrade(isYearly ? "yearly" : "monthly")}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  処理中...
                </span>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  アップグレード
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-4 text-lg font-semibold">よくある質問</h2>
        <div className="rounded-lg border">
          <div className="px-4">
            <FAQItem
              question="いつでもキャンセルできますか？"
              answer="はい、いつでもキャンセル可能です。キャンセル後も現在の請求期間が終了するまでプロプランをご利用いただけます。"
            />
            <FAQItem
              question="支払い方法は何に対応していますか？"
              answer="クレジットカード（Visa、Mastercard、JCB、American Express）に対応しています。決済はStripeを通じて安全に処理されます。"
            />
            <FAQItem
              question="年額プランから月額プランに変更できますか？"
              answer="はい、カスタマーポータルからいつでもプランの変更が可能です。差額は自動的に調整されます。"
            />
            <FAQItem
              question="無料プランに制限はありますか？"
              answer="無料プランでは基本的なプロフィール機能、4つのテンプレート、50件までの顧客管理、基本アナリティクスをご利用いただけます。"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Pro Management View ---
function ProView({ loading, onManage }: { loading: boolean; onManage: () => void }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">プランと請求</h1>

      {/* Current plan card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              プロプラン
            </CardTitle>
            <Badge className="bg-green-100 text-green-800">有効</Badge>
          </div>
          <CardDescription>
            全てのプレミアム機能をご利用いただけます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Feature list */}
          <div>
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              ご利用中の機能
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {PLANS.pro.features.map((feature) => (
                <FeatureItem key={feature}>{feature}</FeatureItem>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={onManage} disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  読み込み中...
                </span>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  プランを管理
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onManage} disabled={loading}>
              プランをキャンセル
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            プランの変更・キャンセルはStripeカスタマーポータルから行えます。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Stripe Not Configured View ---
function StripeNotConfiguredView() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">プランと請求</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-yellow-500" />
          <h2 className="mb-2 text-lg font-semibold">設定が必要です</h2>
          <p className="text-muted-foreground">
            Stripe の設定が完了していません。管理者に連絡してください。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main Billing Page ---
export default function BillingPage() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stripeConfigured, setStripeConfigured] = useState(true);

  // Show toasts for success/canceled
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      toast.success("プロプランへのアップグレードが完了しました！", {
        description: "全てのプレミアム機能をお使いいただけます。",
        duration: 5000,
      });
      // Remove query params from URL without reload
      window.history.replaceState({}, "", "/dashboard/billing");
    } else if (canceled === "true") {
      toast.info("アップグレードがキャンセルされました。", {
        description: "いつでも再度お試しいただけます。",
        duration: 5000,
      });
      window.history.replaceState({}, "", "/dashboard/billing");
    }
  }, [searchParams]);

  // Load profile
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) setProfile(data as Profile);
      setLoading(false);
    }

    load();
  }, []);

  // Refresh profile after success redirect (may have just upgraded)
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      const timer = setTimeout(async () => {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data) setProfile(data as Profile);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  async function handleUpgrade(plan: "monthly" | "yearly") {
    setActionLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (res.status === 503) {
        setStripeConfigured(false);
        setActionLoading(false);
        return;
      }

      if (!res.ok) {
        toast.error(data.error || "エラーが発生しました");
        setActionLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("ネットワークエラーが発生しました");
      setActionLoading(false);
    }
  }

  async function handleManage() {
    setActionLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.status === 503) {
        setStripeConfigured(false);
        setActionLoading(false);
        return;
      }

      if (!res.ok) {
        toast.error(data.error || "エラーが発生しました");
        setActionLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("ネットワークエラーが発生しました");
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!stripeConfigured) {
    return <StripeNotConfiguredView />;
  }

  if (!profile) return null;

  if (profile.is_pro) {
    return <ProView loading={actionLoading} onManage={handleManage} />;
  }

  return (
    <UpgradeView
      profile={profile}
      loading={actionLoading}
      onUpgrade={handleUpgrade}
    />
  );
}
