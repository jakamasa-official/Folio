import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import {
  Check,
  X,
  Crown,
  Zap,
  ArrowRight,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `料金プラン - ${APP_NAME}`,
  description: "Folioの料金プラン。無料から始めて、ビジネスの成長に合わせてアップグレード。",
};

const PLANS = [
  {
    name: "Free",
    nameJa: "フリー",
    price: "¥0",
    period: "",
    yearlyPrice: null,
    description: "まずは無料で始めましょう",
    cta: "無料で始める",
    ctaHref: "/signup",
    highlight: false,
    icon: null,
  },
  {
    name: "Pro",
    nameJa: "プロ",
    price: "¥480",
    period: "/月",
    yearlyPrice: "¥3,980/年（¥332/月）",
    description: "本格的なプロフィールページに",
    cta: "Proを始める",
    ctaHref: "/signup",
    highlight: true,
    icon: Crown,
  },
  {
    name: "Pro+",
    nameJa: "プロプラス",
    price: "¥1,480",
    period: "/月",
    yearlyPrice: "¥11,800/年（¥983/月）",
    description: "フルマーケティングスイート",
    cta: "Pro+を始める",
    ctaHref: "/signup",
    highlight: false,
    icon: Zap,
  },
];

type FeatureValue = boolean | string;

interface FeatureRow {
  label: string;
  free: FeatureValue;
  pro: FeatureValue;
  proPlus: FeatureValue;
}

const FEATURE_SECTIONS: { title: string; features: FeatureRow[] }[] = [
  {
    title: "プロフィール",
    features: [
      { label: "テンプレート", free: "4種類", pro: "56種類", proPlus: "56種類" },
      { label: "リンク数", free: "5個まで", pro: "無制限", proPlus: "無制限" },
      { label: "カスタムフォント", free: false, pro: true, proPlus: true },
      { label: "カスタムカラー", free: false, pro: true, proPlus: true },
      { label: "リッチテキスト", free: false, pro: true, proPlus: true },
      { label: "画像スライド", free: false, pro: true, proPlus: true },
      { label: "動画背景", free: false, pro: false, proPlus: true },
      { label: "カスタムOG画像", free: false, pro: true, proPlus: true },
      { label: "QRコード", free: true, pro: true, proPlus: true },
      { label: "vCard連絡先", free: true, pro: true, proPlus: true },
      { label: "ブランディング非表示", free: false, pro: true, proPlus: true },
    ],
  },
  {
    title: "集客・予約",
    features: [
      { label: "お問い合わせフォーム", free: true, pro: true, proPlus: true },
      { label: "予約カレンダー", free: false, pro: true, proPlus: true },
      { label: "レビュー収集", free: false, pro: true, proPlus: true },
      { label: "スタンプカード", free: false, pro: true, proPlus: true },
      { label: "メール購読フォーム", free: false, pro: true, proPlus: true },
    ],
  },
  {
    title: "マーケティング",
    features: [
      { label: "顧客管理（CRM）", free: false, pro: false, proPlus: true },
      { label: "メッセージ配信", free: false, pro: false, proPlus: true },
      { label: "自動フォローアップ", free: false, pro: false, proPlus: true },
      { label: "顧客セグメント", free: false, pro: false, proPlus: true },
      { label: "キャンペーン・紹介", free: false, pro: false, proPlus: true },
      { label: "LINE連携", free: false, pro: false, proPlus: true },
    ],
  },
  {
    title: "分析・その他",
    features: [
      { label: "アナリティクス", free: "基本", pro: "詳細", proPlus: "詳細" },
      { label: "カスタムドメイン", free: false, pro: false, proPlus: true },
      { label: "パスワード保護", free: true, pro: true, proPlus: true },
      { label: "優先サポート", free: false, pro: false, proPlus: true },
    ],
  },
];

function FeatureCell({ value }: { value: FeatureValue }) {
  if (typeof value === "string") {
    return <span className="text-sm">{value}</span>;
  }
  if (value) {
    return <Check className="mx-auto h-5 w-5 text-green-500" />;
  }
  return <X className="mx-auto h-5 w-5 text-muted-foreground/30" />;
}

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="sm" className="gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  ダッシュボード
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    ログイン
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    無料で始める
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            シンプルな料金、充実の機能
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            無料で始めて、ビジネスの成長に合わせてアップグレード。
            <br className="hidden sm:inline" />
            いつでもプラン変更・キャンセルできます。
          </p>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="pb-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border-2 p-6 ${
                plan.highlight
                  ? "border-primary shadow-lg shadow-primary/10"
                  : "border-border"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  おすすめ
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2">
                  {plan.icon && <plan.icon className="h-5 w-5 text-amber-500" />}
                  <h3 className="text-lg font-bold">{plan.nameJa}</h3>
                  <span className="text-sm text-muted-foreground">{plan.name}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-1">
                <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground">{plan.period}</span>
                )}
              </div>
              {plan.yearlyPrice && (
                <p className="mb-4 text-xs text-muted-foreground">
                  年払い: {plan.yearlyPrice}
                </p>
              )}
              {!plan.yearlyPrice && <div className="mb-4" />}

              <Link href={isLoggedIn ? "/dashboard/billing" : plan.ctaHref} className="mt-auto">
                <Button
                  className="w-full gap-1"
                  variant={plan.highlight ? "default" : "outline"}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">機能比較</h2>

          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-4 text-left text-sm font-medium text-muted-foreground w-2/5">機能</th>
                  <th className="pb-4 text-center text-sm font-bold w-1/5">Free</th>
                  <th className="pb-4 text-center text-sm font-bold w-1/5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                      <Crown className="h-3 w-3" />
                      Pro
                    </span>
                  </th>
                  <th className="pb-4 text-center text-sm font-bold w-1/5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-600">
                      <Zap className="h-3 w-3" />
                      Pro+
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_SECTIONS.map((section) => (
                  <>
                    <tr key={`section-${section.title}`}>
                      <td colSpan={4} className="pt-6 pb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {section.title}
                        </span>
                      </td>
                    </tr>
                    {section.features.map((feature) => (
                      <tr key={feature.label} className="border-b border-border/50">
                        <td className="py-3 text-sm">{feature.label}</td>
                        <td className="py-3 text-center"><FeatureCell value={feature.free} /></td>
                        <td className="py-3 text-center"><FeatureCell value={feature.pro} /></td>
                        <td className="py-3 text-center"><FeatureCell value={feature.proPlus} /></td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-8 md:hidden">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`rounded-xl border-2 p-4 ${plan.highlight ? "border-primary" : "border-border"}`}>
                <div className="mb-3 flex items-center gap-2">
                  {plan.icon && <plan.icon className="h-4 w-4 text-amber-500" />}
                  <h3 className="font-bold">{plan.nameJa}</h3>
                  <span className="text-2xl font-bold ml-auto">{plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                </div>
                {FEATURE_SECTIONS.map((section) => (
                  <div key={section.title} className="mb-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      {section.title}
                    </div>
                    {section.features.map((feature) => {
                      const value = plan.name === "Free" ? feature.free : plan.name === "Pro" ? feature.pro : feature.proPlus;
                      if (value === false) return null;
                      return (
                        <div key={feature.label} className="flex items-center gap-2 py-1 text-sm">
                          <Check className="h-4 w-4 shrink-0 text-green-500" />
                          <span>{feature.label}</span>
                          {typeof value === "string" && <span className="ml-auto text-xs text-muted-foreground">{value}</span>}
                        </div>
                      );
                    })}
                  </div>
                ))}
                <Link href={isLoggedIn ? "/dashboard/billing" : plan.ctaHref}>
                  <Button className="w-full mt-2" variant={plan.highlight ? "default" : "outline"} size="sm">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">よくある質問</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold">いつでもプラン変更できますか？</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                はい。いつでもアップグレード・ダウングレードが可能です。年払いの場合、差額は日割り計算されます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold">無料プランに制限はありますか？</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                無料プランでも基本的なプロフィールページを作成できます。テンプレートは4種類、リンクは5個までですが、お問い合わせフォームやQRコードなどの基本機能はお使いいただけます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold">解約はいつでもできますか？</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                はい。解約はダッシュボードからいつでも可能です。解約後も請求期間の終了まではProの機能をご利用いただけます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold">支払い方法は？</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                クレジットカード（Visa, Mastercard, JCB, AMEX）でお支払いいただけます。Stripeによる安全な決済を採用しています。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30 py-16 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold">まずは無料で始めましょう</h2>
          <p className="mt-2 text-muted-foreground">
            クレジットカード不要。30秒で登録完了。
          </p>
          <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
            <Button size="lg" className="mt-6 gap-2">
              {isLoggedIn ? "ダッシュボードへ" : "無料で始める"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
