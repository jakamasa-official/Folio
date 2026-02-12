import { Fragment } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
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

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator("pricing");
  return {
    title: `${t("metaTitle")} - ${APP_NAME}`,
    description: t("metaDescription"),
  };
}

type FeatureValue = boolean | string;

interface FeatureRow {
  label: string;
  free: FeatureValue;
  pro: FeatureValue;
  proPlus: FeatureValue;
}

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
  const { t } = await getServerTranslator("pricing");

  const PLANS = [
    {
      name: "Free",
      nameJa: t("freeNameJa"),
      price: "¥0",
      period: "",
      yearlyPrice: null,
      description: t("freeDescription"),
      cta: t("freeCta"),
      ctaHref: "/signup",
      highlight: false,
      icon: null,
    },
    {
      name: "Pro",
      nameJa: t("proNameJa"),
      price: "¥480",
      period: t("perMonth"),
      yearlyPrice: "¥3,980/年（¥332/月）",
      description: t("proDescription"),
      cta: t("proCta"),
      ctaHref: "/signup",
      highlight: true,
      icon: Crown,
    },
    {
      name: "Pro+",
      nameJa: t("proPlusNameJa"),
      price: "¥1,480",
      period: t("perMonth"),
      yearlyPrice: "¥11,800/年（¥983/月）",
      description: t("proPlusDescription"),
      cta: t("proPlusCta"),
      ctaHref: "/signup",
      highlight: false,
      icon: Zap,
    },
  ];

  const FEATURE_SECTIONS: { title: string; features: FeatureRow[] }[] = [
    {
      title: t("sectionProfile"),
      features: [
        { label: t("featureTemplates"), free: t("templates4"), pro: t("templates56"), proPlus: t("templates56") },
        { label: t("featureLinks"), free: t("links5"), pro: t("linksUnlimited"), proPlus: t("linksUnlimited") },
        { label: t("featureCustomFont"), free: false, pro: true, proPlus: true },
        { label: t("featureCustomColor"), free: false, pro: true, proPlus: true },
        { label: t("featureRichText"), free: false, pro: true, proPlus: true },
        { label: t("featureImageSlide"), free: false, pro: true, proPlus: true },
        { label: t("featureVideoBackground"), free: false, pro: false, proPlus: true },
        { label: t("featureCustomOg"), free: false, pro: true, proPlus: true },
        { label: t("featureQrCode"), free: true, pro: true, proPlus: true },
        { label: t("featureVcard"), free: true, pro: true, proPlus: true },
        { label: t("featureBrandingHide"), free: false, pro: true, proPlus: true },
      ],
    },
    {
      title: t("sectionAcquisition"),
      features: [
        { label: t("featureContactForm"), free: true, pro: true, proPlus: true },
        { label: t("featureBookingCalendar"), free: false, pro: true, proPlus: true },
        { label: t("featureReviewCollection"), free: false, pro: true, proPlus: true },
        { label: t("featureStampCard"), free: false, pro: true, proPlus: true },
        { label: t("featureEmailSubscribe"), free: false, pro: true, proPlus: true },
      ],
    },
    {
      title: t("sectionMarketing"),
      features: [
        { label: t("featureCrm"), free: false, pro: false, proPlus: true },
        { label: t("featureMessaging"), free: false, pro: false, proPlus: true },
        { label: t("featureAutoFollowUp"), free: false, pro: false, proPlus: true },
        { label: t("featureSegments"), free: false, pro: false, proPlus: true },
        { label: t("featureCampaignReferral"), free: false, pro: false, proPlus: true },
        { label: t("featureLineIntegration"), free: false, pro: false, proPlus: true },
      ],
    },
    {
      title: t("sectionAnalyticsOther"),
      features: [
        { label: t("featureAnalytics"), free: t("analyticsBasic"), pro: t("analyticsDetailed"), proPlus: t("analyticsDetailed") },
        { label: t("featureCustomDomain"), free: false, pro: false, proPlus: true },
        { label: t("featurePasswordProtect"), free: true, pro: true, proPlus: true },
        { label: t("featurePrioritySupport"), free: false, pro: false, proPlus: true },
      ],
    },
  ];

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
                  {t("dashboard")}
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    {t("login")}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    {t("startFree")}
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
            {t("heroTitle")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("heroDescription")}
            <br className="hidden sm:inline" />
            {t("heroDescription2")}
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
                  {t("recommended")}
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
                  {t("yearlyPrefix")}{plan.yearlyPrice}
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
          <h2 className="mb-8 text-center text-2xl font-bold">{t("featureComparison")}</h2>

          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-4 text-left text-sm font-medium text-muted-foreground w-2/5">{t("featureLabel")}</th>
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
                  <Fragment key={`section-${section.title}`}>
                    <tr>
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
                  </Fragment>
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
          <h2 className="mb-8 text-center text-2xl font-bold">{t("faqTitle")}</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold">{t("faqChangePlanQ")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("faqChangePlanA")}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">{t("faqFreeLimitsQ")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("faqFreeLimitsA")}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">{t("faqCancelQ")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("faqCancelA")}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">{t("faqPaymentQ")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("faqPaymentA")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30 py-16 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold">{t("ctaTitle")}</h2>
          <p className="mt-2 text-muted-foreground">
            {t("ctaDescription")}
          </p>
          <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
            <Button size="lg" className="mt-6 gap-2">
              {isLoggedIn ? t("ctaLoggedIn") : t("startFree")}
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
