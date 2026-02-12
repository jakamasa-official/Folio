import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { LanguageToggle } from "@/components/ui/language-toggle";
import {
  ArrowRight,
  Smartphone,
  BarChart3,
  Link2,
  Palette,
  Shield,
  User,
  ExternalLink,
  MapPin,
  Mail,
  QrCode,
  CheckCircle2,
  LayoutDashboard,
  Zap,
  Users,
  Star,
  MessageSquare,
  Ticket,
  CalendarCheck,
  Share2,
  TrendingUp,
  MousePointerClick,
  Globe,
  Send,
  Bot,
  Gift,
  Eye,
} from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;
  const { t } = await getServerTranslator("common", "landing");
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/wallpaper">
              <Button variant="ghost" size="sm">
                {t("navWallpaperCard")}
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" size="sm">
                {t("navPricing")}
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="sm">
                {t("navAbout")}
              </Button>
            </Link>
            <LanguageToggle />
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="sm" className="gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  {t("navDashboard")}
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    {t("navLogin")}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    {t("navSignup")}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              {t("heroBadge")}
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              {t("heroTitleLine1")}
              <br />
              <span className="text-primary">{t("heroTitleLine2")}</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              {t("heroDescription")}
              <strong className="text-foreground">{t("heroDescriptionStrong")}</strong>
              {t("heroDescriptionSuffix")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  {isLoggedIn ? t("heroCTALoggedIn") : t("heroCTALoggedOut")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  {t("heroCTAPricing")}
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {t("heroNoCreditCard")}
            </p>
          </div>

          {/* Mock profile card */}
          <div className="relative mx-auto w-full max-w-xs">
            <div className="rounded-2xl border-2 bg-white p-6 shadow-2xl">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-pink-400 text-xl font-bold text-white">
                  Y
                </div>
                <h3 className="mt-3 text-lg font-bold text-gray-900">{t("mockName")}</h3>
                <p className="text-xs text-gray-500">{t("mockTitle")}</p>
                <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                  {t("mockBio")}
                </p>
                <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-400">
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-2.5 w-2.5" />
                    {t("mockLocation")}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Mail className="h-2.5 w-2.5" />
                    hello@example.com
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-gray-900 px-4 py-2.5 text-xs font-medium text-white">
                  <span>{t("mockLinkPortfolio")}</span>
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-900 px-4 py-2.5 text-xs font-medium text-white">
                  <span>{t("mockLinkContact")}</span>
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-900 px-4 py-2.5 text-xs font-medium text-white">
                  <span>{t("mockLinkPricing")}</span>
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </div>
              </div>
              <div className="mt-3 flex justify-center gap-2">
                {["X", "IG", "LI"].map((s) => (
                  <div key={s} className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[9px] font-medium text-gray-500">
                    {s}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-[9px] text-gray-300">
                Powered by {APP_NAME}
              </p>
            </div>
            <div className="absolute -right-4 -top-4 rounded-lg border bg-white px-3 py-2 shadow-lg">
              <div className="flex items-center gap-1.5 text-xs">
                <QrCode className="h-4 w-4 text-primary" />
                <span className="font-medium">{t("mockQrBadge")}</span>
              </div>
            </div>
            <div className="absolute -bottom-3 -left-4 rounded-lg border bg-white px-3 py-2 shadow-lg">
              <div className="flex items-center gap-1.5 text-xs">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="font-medium">{t("mockViewsBadge")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capability overview — numbers strip */}
      <section className="border-y bg-primary/5 py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 sm:grid-cols-4">
          <NumberStat number="15+" label={t("statFeatures")} />
          <NumberStat number="50+" label={t("statTemplates")} />
          <NumberStat number="¥0" label={t("statBasicPlan")} />
          <NumberStat number={t("statPublishNumber")} label={t("statPublishTime")} />
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold">
            {t("howItWorksTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
            {t("howItWorksSubtitle")}
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <StepCard
              number="1"
              title={t("step1Title")}
              description={t("step1Desc")}
            />
            <StepCard
              number="2"
              title={t("step2Title")}
              description={t("step2Desc")}
            />
            <StepCard
              number="3"
              title={t("step3Title")}
              description={t("step3Desc", { example: "folio.jp/your-name" })}
            />
          </div>
        </div>
      </section>

      {/* Core features — Profile & Design */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <p className="text-sm font-medium text-primary">{t("profileSectionLabel")}</p>
            <h2 className="mt-2 text-2xl font-bold">
              {t("profileSectionTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              {t("profileSectionSubtitle")}
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Link2 className="h-5 w-5" />}
              title={t("featureProfilePageTitle")}
              description={t("featureProfilePageDesc")}
            />
            <FeatureCard
              icon={<Palette className="h-5 w-5" />}
              title={t("featureTemplatesTitle")}
              description={t("featureTemplatesDesc")}
            />
            <FeatureCard
              icon={<QrCode className="h-5 w-5" />}
              title={t("featureQrTitle")}
              description={t("featureQrDesc")}
            />
            <FeatureCard
              icon={<Smartphone className="h-5 w-5" />}
              title={t("featureWallpaperCardTitle")}
              description={t("featureWallpaperCardDesc")}
            />
            <FeatureCard
              icon={<User className="h-5 w-5" />}
              title={t("featureVcardTitle")}
              description={t("featureVcardDesc")}
            />
            <FeatureCard
              icon={<Share2 className="h-5 w-5" />}
              title={t("featureSnsShareTitle")}
              description={t("featureSnsShareDesc")}
            />
          </div>
        </div>
      </section>

      {/* Marketing & CRM features */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <p className="text-sm font-medium text-primary">{t("marketingSectionLabel")}</p>
            <h2 className="mt-2 text-2xl font-bold">
              {t("marketingSectionTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              {t("marketingSectionSubtitle")}
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Ticket className="h-5 w-5" />}
              title={t("featureStampTitle")}
              description={t("featureStampDesc")}
            />
            <FeatureCard
              icon={<Gift className="h-5 w-5" />}
              title={t("featureCouponTitle")}
              description={t("featureCouponDesc")}
            />
            <FeatureCard
              icon={<Star className="h-5 w-5" />}
              title={t("featureReviewTitle")}
              description={t("featureReviewDesc")}
            />
            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              title={t("featureReferralTitle")}
              description={t("featureReferralDesc")}
            />
            <FeatureCard
              icon={<CalendarCheck className="h-5 w-5" />}
              title={t("featureBookingTitle")}
              description={t("featureBookingDesc")}
            />
            <FeatureCard
              icon={<MessageSquare className="h-5 w-5" />}
              title={t("featureContactFormTitle")}
              description={t("featureContactFormDesc")}
            />
          </div>
        </div>
      </section>

      {/* CRM & Automation */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <p className="text-sm font-medium text-primary">{t("crmSectionLabel")}</p>
            <h2 className="mt-2 text-2xl font-bold">
              {t("crmSectionTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              {t("crmSectionSubtitle")}
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              title={t("featureCrmTitle")}
              description={t("featureCrmDesc")}
            />
            <FeatureCard
              icon={<Send className="h-5 w-5" />}
              title={t("featureEmailTitle")}
              description={t("featureEmailDesc")}
            />
            <FeatureCard
              icon={<Bot className="h-5 w-5" />}
              title={t("featureAutoFollowTitle")}
              description={t("featureAutoFollowDesc")}
            />
            <FeatureCard
              icon={<Mail className="h-5 w-5" />}
              title={t("featureNewsletterTitle")}
              description={t("featureNewsletterDesc")}
            />
            <FeatureCard
              icon={<Globe className="h-5 w-5" />}
              title={t("featureLineTitle")}
              description={t("featureLineDesc")}
            />
            <FeatureCard
              icon={<Shield className="h-5 w-5" />}
              title={t("featurePrivacyTitle")}
              description={t("featurePrivacyDesc")}
            />
          </div>
        </div>
      </section>

      {/* Analytics showcase */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Analytics mockup */}
            <div className="space-y-4">
              {/* Stat cards mock */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border bg-white p-3 text-center shadow-sm">
                  <p className="text-2xl font-bold text-gray-900">248</p>
                  <p className="text-[10px] text-gray-500">{t("analyticsToday")}</p>
                </div>
                <div className="rounded-lg border bg-white p-3 text-center shadow-sm">
                  <p className="text-2xl font-bold text-gray-900">1,432</p>
                  <p className="text-[10px] text-gray-500">{t("analytics7days")}</p>
                </div>
                <div className="rounded-lg border bg-white p-3 text-center shadow-sm">
                  <p className="text-2xl font-bold text-gray-900">4.2%</p>
                  <p className="text-[10px] text-gray-500">{t("analyticsConversion")}</p>
                </div>
              </div>
              {/* Chart mock */}
              <div className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-700">{t("analyticsChartTitle")}</p>
                  <div className="flex gap-1">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{t("analyticsDaily")}</span>
                    <span className="rounded px-2 py-0.5 text-[10px] text-gray-400">{t("analyticsWeekly")}</span>
                    <span className="rounded px-2 py-0.5 text-[10px] text-gray-400">{t("analyticsMonthly")}</span>
                  </div>
                </div>
                <div className="flex items-end gap-1" style={{ height: 80 }}>
                  {[40, 55, 35, 70, 60, 80, 65, 90, 75, 85, 95, 70, 60, 88].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-primary/70" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              {/* Breakdown mock */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-white p-3 shadow-sm">
                  <p className="mb-2 text-[10px] font-medium text-gray-700">{t("analyticsReferrers")}</p>
                  <div className="space-y-1.5">
                    {[
                      { label: "Instagram", pct: 42 },
                      { label: t("analyticsDirectAccess"), pct: 28 },
                      { label: "X (Twitter)", pct: 18 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-[9px] text-gray-600">
                          <span>{item.label}</span>
                          <span>{item.pct}%</span>
                        </div>
                        <div className="mt-0.5 h-1.5 rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-primary/60" style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border bg-white p-3 shadow-sm">
                  <p className="mb-2 text-[10px] font-medium text-gray-700">{t("analyticsLinkClicks")}</p>
                  <div className="space-y-1.5">
                    {[
                      { label: t("analyticsPortfolio"), count: 89 },
                      { label: t("analyticsBookNow"), count: 54 },
                      { label: "Instagram", count: 31 },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between text-[9px] text-gray-600">
                        <span>{item.label}</span>
                        <span className="font-medium">{item.count}{t("analyticsClickUnit")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Copy */}
            <div>
              <p className="text-sm font-medium text-primary">{t("analyticsSectionLabel")}</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                {t("analyticsSectionTitle")}
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {t("analyticsSectionDesc")}
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  { icon: <Eye className="h-4 w-4" />, text: t("analyticsRealtimeViews") },
                  { icon: <MousePointerClick className="h-4 w-4" />, text: t("analyticsLinkCtr") },
                  { icon: <TrendingUp className="h-4 w-4" />, text: t("analyticsTrend") },
                  { icon: <Globe className="h-4 w-4" />, text: t("analyticsDeviceGeo") },
                  { icon: <Share2 className="h-4 w-4" />, text: t("analyticsUtm") },
                  { icon: <TrendingUp className="h-4 w-4" />, text: t("analyticsConversionCalc") },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-2.5 text-sm">
                    <span className="shrink-0 text-primary">{item.icon}</span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Wallpaper card feature */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Mockup */}
            <div className="relative mx-auto w-48">
              <div className="aspect-[9/19.5] rounded-[2rem] border-4 border-gray-800 bg-gray-900 p-4 shadow-2xl">
                <div className="flex h-full flex-col items-center justify-end pb-8 text-center">
                  <div className="mb-4 h-16 w-16 rounded-lg border-2 border-white/20 bg-white/10" />
                  <p className="text-sm font-bold text-white">{t("wallpaperMockName")}</p>
                  <p className="text-[9px] text-gray-400">{t("wallpaperMockTitle")}</p>
                  <p className="mt-1 text-[8px] text-gray-500">hello@example.com</p>
                  <p className="mt-3 text-[7px] text-gray-600">{t("wallpaperMockScanQr")}</p>
                </div>
              </div>
              <div className="absolute -right-2 top-4 h-1 w-1 rounded-full bg-gray-600" />
            </div>
            {/* Copy */}
            <div>
              <p className="text-sm font-medium text-primary">{t("wallpaperSectionLabel")}</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                {t("wallpaperSectionTitle")}
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {t("wallpaperSectionDesc")}
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  t("wallpaperFeature1"),
                  t("wallpaperFeature2"),
                  t("wallpaperFeature3"),
                  t("wallpaperFeature4"),
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/wallpaper">
                <Button size="lg" variant="outline" className="mt-8 gap-2">
                  <Smartphone className="h-4 w-4" />
                  {t("wallpaperCTA")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold">
            {t("useCasesTitle")}
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <UseCaseCard
              emoji="💻"
              title={t("useCaseFreelanceTitle")}
              description={t("useCaseFreelanceDesc")}
              items={[
                t("useCaseFreelanceItem1"),
                t("useCaseFreelanceItem2"),
                t("useCaseFreelanceItem3"),
                t("useCaseFreelanceItem4"),
              ]}
            />
            <UseCaseCard
              emoji="🏪"
              title={t("useCaseShopTitle")}
              description={t("useCaseShopDesc")}
              items={[
                t("useCaseShopItem1"),
                t("useCaseShopItem2"),
                t("useCaseShopItem3"),
                t("useCaseShopItem4"),
              ]}
            />
            <UseCaseCard
              emoji="🎨"
              title={t("useCaseCreatorTitle")}
              description={t("useCaseCreatorDesc")}
              items={[
                t("useCaseCreatorItem1"),
                t("useCaseCreatorItem2"),
                t("useCaseCreatorItem3"),
                t("useCaseCreatorItem4"),
              ]}
            />
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-2xl font-bold">{t("pricingTeaserTitle")}</h2>
          <p className="mt-3 text-muted-foreground">{t("pricingTeaserSubtitle")}</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <PricingTeaser
              plan="Free"
              price="¥0"
              period=""
              features={[t("pricingFreeFeature1"), t("pricingFreeFeature2"), t("pricingFreeFeature3"), t("pricingFreeFeature4"), t("pricingFreeFeature5")]}
            />
            <PricingTeaser
              plan="Pro"
              price="¥480"
              period={t("pricingPerMonth")}
              highlight
              features={[t("pricingProFeature1"), t("pricingProFeature2"), t("pricingProFeature3"), t("pricingProFeature4"), t("pricingProFeature5")]}
            />
            <PricingTeaser
              plan="Pro+"
              price="¥1,480"
              period={t("pricingPerMonth")}
              features={[t("pricingProPlusFeature1"), t("pricingProPlusFeature2"), t("pricingProPlusFeature3"), t("pricingProPlusFeature4"), t("pricingProPlusFeature5")]}
            />
          </div>
          <Link href="/pricing">
            <Button variant="outline" className="mt-8 gap-2">
              {t("pricingMoreInfo")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            {t("ctaTitle")}
          </h2>
          <p className="mt-3 opacity-90">
            {t("ctaSubtitle")}
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              variant="secondary"
              className="mt-6 gap-2"
            >
              {t("ctaButton")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-3 text-sm opacity-70">
            {t("ctaNoCreditCard")}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-4">
            <Link href="/pricing" className="hover:text-foreground">
              {t("footerPricing")}
            </Link>
            <Link href="/about" className="hover:text-foreground">
              {t("footerAbout")}
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/privacy" className="hover:text-foreground">
              {t("footerPrivacy")}
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/terms" className="hover:text-foreground">
              {t("footerTerms")}
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/tokushoho" className="hover:text-foreground">
              {t("footerTokushoho")}
            </Link>
          </div>
          <p className="mt-3">&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-5">
      <div className="mb-3 text-primary">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
        {number}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function UseCaseCard({
  emoji,
  title,
  description,
  items,
}: {
  emoji: string;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border bg-background p-6">
      <div className="text-2xl">{emoji}</div>
      <h3 className="mt-2 font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function NumberStat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-primary">{number}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function PricingTeaser({
  plan,
  price,
  period,
  features,
  highlight,
}: {
  plan: string;
  price: string;
  period: string;
  features: string[];
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-6 text-left ${highlight ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-background"}`}>
      <p className="text-sm font-medium text-muted-foreground">{plan}</p>
      <p className="mt-1">
        <span className="text-3xl font-bold">{price}</span>
        <span className="text-sm text-muted-foreground">{period}</span>
      </p>
      <ul className="mt-4 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
