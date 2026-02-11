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
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "@/lib/types";

function BillingToggle({
  isYearly,
  onToggle,
}: {
  isYearly: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
        月額
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isYearly}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
          isYearly ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
            isYearly ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <span className={`text-sm font-medium ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
        年額
        <Badge variant="secondary" className="ml-1.5 text-[10px]">お得</Badge>
      </span>
    </div>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
      <span>{children}</span>
    </li>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium hover:text-foreground/80"
      >
        {question}
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="pb-4 text-sm text-muted-foreground">{answer}</p>}
    </div>
  );
}

// --- Upgrade View ---
function UpgradeView({
  profile,
  loading,
  onUpgrade,
}: {
  profile: Profile;
  loading: boolean;
  onUpgrade: (tier: "pro" | "pro_plus", period: "monthly" | "yearly") => void;
}) {
  const [isYearly, setIsYearly] = useState(false);
  const currentTier = profile.plan_tier || "free";

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">プランをアップグレード</h1>
        <p className="mt-2 text-muted-foreground">
          ビジネスに合ったプランをお選びください
        </p>
      </div>

      <BillingToggle isYearly={isYearly} onToggle={() => setIsYearly(!isYearly)} />

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
        {/* Free */}
        <Card className="relative">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>{PLANS.free.name}</CardTitle>
              {currentTier === "free" && <Badge variant="secondary">現在</Badge>}
            </div>
            <CardDescription>
              <span className="text-2xl font-bold text-foreground">¥0</span>
              <span className="text-muted-foreground">/月</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {PLANS.free.features.map((f) => <FeatureItem key={f}>{f}</FeatureItem>)}
            </ul>
          </CardContent>
        </Card>

        {/* Pro */}
        <Card className={`relative ${currentTier === "free" ? "border-primary shadow-lg" : ""}`}>
          {currentTier === "free" && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary px-3 py-1 text-xs">
                <Sparkles className="mr-1 h-3 w-3" />おすすめ
              </Badge>
            </div>
          )}
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>{PLANS.pro.name}</CardTitle>
              <Crown className="h-5 w-5 text-yellow-500" />
              {currentTier === "pro" && <Badge variant="secondary">現在</Badge>}
            </div>
            <CardDescription>
              {isYearly ? (
                <>
                  <span className="text-2xl font-bold text-foreground">¥{PLANS.pro.priceYearly.toLocaleString()}</span>
                  <span className="text-muted-foreground">/年</span>
                  <span className="ml-2 text-xs text-muted-foreground line-through">¥{(PLANS.pro.priceMonthly * 12).toLocaleString()}</span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold text-foreground">¥{PLANS.pro.priceMonthly.toLocaleString()}</span>
                  <span className="text-muted-foreground">/月</span>
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {PLANS.pro.features.map((f) => <FeatureItem key={f}>{f}</FeatureItem>)}
            </ul>
            {currentTier === "free" && (
              <Button
                className="w-full"
                onClick={() => onUpgrade("pro", isYearly ? "yearly" : "monthly")}
                disabled={loading}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {loading ? "処理中..." : "Proにアップグレード"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pro+ */}
        <Card className={`relative ${currentTier === "pro" ? "border-primary shadow-lg" : ""}`}>
          {currentTier === "pro" && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-amber-500 px-3 py-1 text-xs text-white">
                <Zap className="mr-1 h-3 w-3" />アップグレード
              </Badge>
            </div>
          )}
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>{PLANS.pro_plus.name}</CardTitle>
              <Zap className="h-5 w-5 text-amber-500" />
              {currentTier === "pro_plus" && <Badge variant="secondary">現在</Badge>}
            </div>
            <CardDescription>
              {isYearly ? (
                <>
                  <span className="text-2xl font-bold text-foreground">¥{PLANS.pro_plus.priceYearly.toLocaleString()}</span>
                  <span className="text-muted-foreground">/年</span>
                  <span className="ml-2 text-xs text-muted-foreground line-through">¥{(PLANS.pro_plus.priceMonthly * 12).toLocaleString()}</span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold text-foreground">¥{PLANS.pro_plus.priceMonthly.toLocaleString()}</span>
                  <span className="text-muted-foreground">/月</span>
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {PLANS.pro_plus.features.map((f) => <FeatureItem key={f}>{f}</FeatureItem>)}
            </ul>
            {(currentTier === "free" || currentTier === "pro") && (
              <Button
                className="w-full"
                variant={currentTier === "pro" ? "default" : "outline"}
                onClick={() => onUpgrade("pro_plus", isYearly ? "yearly" : "monthly")}
                disabled={loading}
              >
                <Zap className="mr-2 h-4 w-4" />
                {loading ? "処理中..." : "Pro+にアップグレード"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-4 text-lg font-semibold">よくある質問</h2>
        <div className="rounded-lg border px-4">
          <FAQItem
            question="いつでもキャンセルできますか？"
            answer="はい、いつでもキャンセル可能です。キャンセル後も現在の請求期間が終了するまでご利用いただけます。"
          />
          <FAQItem
            question="プランのアップグレード・ダウングレードはできますか？"
            answer="はい、カスタマーポータルからいつでもプランの変更が可能です。差額は自動的に日割り調整されます。"
          />
          <FAQItem
            question="支払い方法は？"
            answer="クレジットカード（Visa、Mastercard、JCB、AMEX）に対応。決済はStripeで安全に処理されます。"
          />
        </div>
      </div>
    </div>
  );
}

// --- Active Subscription View ---
function ActivePlanView({
  profile,
  loading,
  onManage,
}: {
  profile: Profile;
  loading: boolean;
  onManage: () => void;
}) {
  const tier = profile.plan_tier || "pro";
  const planInfo = tier === "pro_plus" ? PLANS.pro_plus : PLANS.pro;
  const Icon = tier === "pro_plus" ? Zap : Crown;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">プランと請求</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-yellow-500" />
              {planInfo.name}プラン
            </CardTitle>
            <Badge className="bg-green-100 text-green-800">有効</Badge>
          </div>
          <CardDescription>全てのプレミアム機能をご利用いただけます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-3 text-sm font-medium text-muted-foreground">ご利用中の機能</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {planInfo.features.map((f) => <FeatureItem key={f}>{f}</FeatureItem>)}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={onManage} disabled={loading}>
              {loading ? "読み込み中..." : (
                <><ExternalLink className="mr-2 h-4 w-4" />プランを管理</>
              )}
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

function StripeNotConfiguredView() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">プランと請求</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-yellow-500" />
          <h2 className="mb-2 text-lg font-semibold">設定が必要です</h2>
          <p className="text-muted-foreground">Stripe の設定が完了していません。管理者に連絡してください。</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stripeConfigured, setStripeConfigured] = useState(true);

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      toast.success("アップグレードが完了しました！", {
        description: "プレミアム機能をお使いいただけます。",
        duration: 5000,
      });
      window.history.replaceState({}, "", "/dashboard/billing");
    } else if (canceled === "true") {
      toast.info("アップグレードがキャンセルされました。");
      window.history.replaceState({}, "", "/dashboard/billing");
    }
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

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

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      const timer = setTimeout(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
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

  async function handleUpgrade(tier: "pro" | "pro_plus", period: "monthly" | "yearly") {
    setActionLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, period }),
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

      if (data.url) window.location.href = data.url;
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

      if (data.url) window.location.href = data.url;
    } catch {
      toast.error("ネットワークエラーが発生しました");
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!stripeConfigured) return <StripeNotConfiguredView />;
  if (!profile) return null;

  if (profile.is_pro) {
    return <ActivePlanView profile={profile} loading={actionLoading} onManage={handleManage} />;
  }

  return <UpgradeView profile={profile} loading={actionLoading} onUpgrade={handleUpgrade} />;
}
