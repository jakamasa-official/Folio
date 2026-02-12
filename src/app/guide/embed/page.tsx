import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_URL } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import {
  ArrowRight,
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  Star,
  Mail,
  BadgeCheck,
  Copy,
  Globe,
  Smartphone,
  Palette,
  Trash2,
  MonitorSmartphone,
  HelpCircle,
  ChevronRight,
  MousePointerClick,
} from "lucide-react";
import type { Metadata } from "next";

/* ------------------------------------------------------------------ */
/*  Metadata                                                          */
/* ------------------------------------------------------------------ */

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator("guide-embed");
  return {
    title: `${t("metaTitle")} - ${APP_NAME}`,
    description: t("metaDescription"),
  };
}

/* ------------------------------------------------------------------ */
/*  Helper: Code Block (static server component)                      */
/* ------------------------------------------------------------------ */

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="relative">
      {label && (
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          {label}
        </p>
      )}
      <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper: Step number badge                                         */
/* ------------------------------------------------------------------ */

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
      {n}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper: Platform section                                          */
/* ------------------------------------------------------------------ */

function PlatformSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <h4 className="mb-4 text-lg font-semibold">{title}</h4>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default async function GuideEmbedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;
  const { t } = await getServerTranslator("guide-embed");

  /* Sample script for code examples */
  const sampleScript = `<script
  src="${APP_URL}/folio.js"
  data-profile-id="your-profile-id"
  data-widgets="tracking,contact-float,review-float,badge"
  data-lang="ja"
  defer></script>`;

  const clickTrackingBefore = `<a href="tel:090-1234-5678">Call Us</a>`;

  const clickTrackingAfter = `<a href="tel:090-1234-5678" data-folio-track="Phone Call">Call Us</a>`;

  const clickTrackingRecipes = `<!-- Phone number -->
<a href="tel:090-1234-5678" data-folio-track="Phone Call">Call Us</a>

<!-- Email -->
<a href="mailto:info@example.com" data-folio-track="Email">Email Us</a>

<!-- Menu / Price list -->
<a href="/menu" data-folio-track="View Menu">View Menu</a>

<!-- Reservation / Booking -->
<a href="/reserve" data-folio-track="Book Now">Book Now</a>

<!-- Social media -->
<a href="https://instagram.com/you" data-folio-track="Instagram">Instagram</a>`;

  const clickTrackingHtmlExample = `<body>
  <h1>My Business</h1>

  <a href="/menu" data-folio-track="View Menu">
    View Our Menu
  </a>

  <a href="tel:090-1234-5678" data-folio-track="Phone">
    Call Now
  </a>

  <a href="/contact" data-folio-track="Contact Page">
    Contact Us
  </a>

  ${sampleScript}
</body>`;

  const htmlBefore = `<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to my website</h1>

</body>
</html>`;

  const htmlAfter = `<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to my website</h1>

  ${sampleScript}
</body>
</html>`;

  const inlineExample = `<body>
  <h1>Welcome to my website</h1>

  <!-- Subscribe form will appear here -->
  <div id="folio-subscribe"></div>

  ${sampleScript}
</body>`;

  const reactExample = `// app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="${APP_URL}/folio.js"
          data-profile-id="your-profile-id"
          data-widgets="tracking,contact-float,review-float,badge"
          data-lang="ja"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}`;

  return (
    <div className="min-h-screen">
      {/* ── Nav ─────────────────────────────────────────────── */}
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
                  <Button size="sm">{t("startFree")}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            {t("heroDescription")}
          </p>
        </div>
      </section>

      {/* ── What You Get ────────────────────────────────────── */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold">
            {t("whatYouGetTitle")}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BarChart3,
                title: t("widgetTrackingTitle"),
                desc: t("widgetTrackingDesc"),
              },
              {
                icon: MessageSquare,
                title: t("widgetContactTitle"),
                desc: t("widgetContactDesc"),
              },
              {
                icon: Star,
                title: t("widgetReviewTitle"),
                desc: t("widgetReviewDesc"),
              },
              {
                icon: Mail,
                title: t("widgetSubscribeTitle"),
                desc: t("widgetSubscribeDesc"),
              },
              {
                icon: BadgeCheck,
                title: t("widgetBadgeTitle"),
                desc: t("widgetBadgeDesc"),
              },
              {
                icon: MousePointerClick,
                title: t("widgetClickTitle"),
                desc: t("widgetClickDesc"),
              },
            ].map((widget) => (
              <div
                key={widget.title}
                className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <widget.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1 font-semibold">{widget.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {widget.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps Overview ──────────────────────────────────── */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-2 text-center text-2xl font-bold">
            {t("stepsTitle")}
          </h2>
          <p className="mb-12 text-center text-muted-foreground">
            {t("stepsSubtitle")}
          </p>

          <div className="space-y-12">
            {/* ── Step 1 ──────────────────────────────────── */}
            <div>
              <div className="mb-3 flex items-center gap-3">
                <StepBadge n={1} />
                <h3 className="text-xl font-bold">{t("step1Title")}</h3>
              </div>
              <div className="ml-11 space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  {t("step1Desc")}
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {t("step1Link")}
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <p className="text-sm text-muted-foreground">
                  {t("step1Detail")}
                </p>
              </div>
            </div>

            {/* ── Step 2 ──────────────────────────────────── */}
            <div>
              <div className="mb-3 flex items-center gap-3">
                <StepBadge n={2} />
                <h3 className="text-xl font-bold">{t("step2Title")}</h3>
              </div>
              <div className="ml-11 space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  {t("step2Desc")}
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {t("step2Link")}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* ── Step 3 ──────────────────────────────────── */}
            <div>
              <div className="mb-3 flex items-center gap-3">
                <StepBadge n={3} />
                <h3 className="text-xl font-bold">{t("step3Title")}</h3>
              </div>
              <div className="ml-11 space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  {t("step3Desc")}
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>{t("step3Item1")}</li>
                  <li>{t("step3Item2")}</li>
                  <li>{t("step3Item3")}</li>
                </ul>
                <Link
                  href="/dashboard/embed"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {t("step3Link")}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* ── Step 4 ──────────────────────────────────── */}
            <div>
              <div className="mb-3 flex items-center gap-3">
                <StepBadge n={4} />
                <h3 className="text-xl font-bold">{t("step4Title")}</h3>
              </div>
              <div className="ml-11 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {t("step4Desc")}
                </p>
                <CodeBlock code={sampleScript} />
                <p className="text-xs text-muted-foreground italic">
                  {t("step4Note")}
                </p>
              </div>
            </div>

            {/* ── Step 5 ──────────────────────────────────── */}
            <div>
              <div className="mb-3 flex items-center gap-3">
                <StepBadge n={5} />
                <h3 className="text-xl font-bold">{t("step5Title")}</h3>
              </div>
              <div className="ml-11 space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  {t("step5Desc")}
                </p>

                {/* --- HTML --- */}
                <PlatformSection title={t("platformHtmlTitle")}>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {t("platformHtmlDesc")}
                  </p>
                  <ol className="mb-4 list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>{t("platformHtmlStep1")}</li>
                    <li>{t("platformHtmlStep2")}</li>
                    <li>{t("platformHtmlStep3")}</li>
                    <li>{t("platformHtmlStep4")}</li>
                  </ol>
                  <div className="space-y-4">
                    <CodeBlock
                      code={htmlBefore}
                      label={t("platformHtmlBefore")}
                    />
                    <CodeBlock
                      code={htmlAfter}
                      label={t("platformHtmlAfter")}
                    />
                  </div>
                </PlatformSection>

                {/* --- WordPress --- */}
                <PlatformSection title={t("platformWpTitle")}>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {t("platformWpDesc")}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h5 className="mb-2 text-sm font-semibold">
                        {t("platformWpOption1Title")}
                      </h5>
                      <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                        <li>{t("platformWpOption1Step1")}</li>
                        <li>{t("platformWpOption1Step2")}</li>
                        <li>{t("platformWpOption1Step3")}</li>
                        <li>{t("platformWpOption1Step4")}</li>
                      </ol>
                    </div>

                    <div>
                      <h5 className="mb-2 text-sm font-semibold">
                        {t("platformWpOption2Title")}
                      </h5>
                      <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                        <li>{t("platformWpOption2Step1")}</li>
                        <li>{t("platformWpOption2Step2")}</li>
                        <li>{t("platformWpOption2Step3")}</li>
                        <li>{t("platformWpOption2Step4")}</li>
                      </ol>
                    </div>
                  </div>
                </PlatformSection>

                {/* --- Wix --- */}
                <PlatformSection title={t("platformWixTitle")}>
                  <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>{t("platformWixStep1")}</li>
                    <li>{t("platformWixStep2")}</li>
                    <li>{t("platformWixStep3")}</li>
                    <li>{t("platformWixStep4")}</li>
                  </ol>
                </PlatformSection>

                {/* --- Squarespace --- */}
                <PlatformSection title={t("platformSquarespaceTitle")}>
                  <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>{t("platformSquarespaceStep1")}</li>
                    <li>{t("platformSquarespaceStep2")}</li>
                    <li>{t("platformSquarespaceStep3")}</li>
                  </ol>
                </PlatformSection>

                {/* --- Shopify --- */}
                <PlatformSection title={t("platformShopifyTitle")}>
                  <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>{t("platformShopifyStep1")}</li>
                    <li>{t("platformShopifyStep2")}</li>
                    <li>{t("platformShopifyStep3")}</li>
                    <li>{t("platformShopifyStep4")}</li>
                    <li>{t("platformShopifyStep5")}</li>
                  </ol>
                </PlatformSection>

                {/* --- Next.js / React --- */}
                <PlatformSection title={t("platformReactTitle")}>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {t("platformReactDesc")}
                  </p>
                  <ol className="mb-4 list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>{t("platformReactStep1")}</li>
                    <li>{t("platformReactStep2")}</li>
                  </ol>
                  <CodeBlock code={reactExample} />
                  <p className="mt-3 text-xs text-muted-foreground italic">
                    {t("platformReactNote")}
                  </p>
                </PlatformSection>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Inline Widgets ──────────────────────────────────── */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-2 text-2xl font-bold">{t("inlineTitle")}</h2>
          <p className="mb-8 text-muted-foreground leading-relaxed">
            {t("inlineDesc")}
          </p>

          <ol className="mb-8 list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
            <li>{t("inlineStep1")}</li>
            <li>{t("inlineStep2")}</li>
            <li>{t("inlineStep3")}</li>
          </ol>

          <div className="space-y-4">
            <div>
              <p className="mb-1.5 text-sm font-medium">
                {t("inlineContactDiv")}
              </p>
              <CodeBlock code={'<div id="folio-contact"></div>'} />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium">
                {t("inlineReviewDiv")}
              </p>
              <CodeBlock code={'<div id="folio-review"></div>'} />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium">
                {t("inlineSubscribeDiv")}
              </p>
              <CodeBlock code={'<div id="folio-subscribe"></div>'} />
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-3 text-sm font-medium">{t("inlineExample")}</p>
            <CodeBlock code={inlineExample} />
          </div>
        </div>
      </section>

      {/* ── Click Tracking ─────────────────────────────────── */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <MousePointerClick className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">{t("clickTrackingTitle")}</h2>
          </div>
          <p className="mb-8 text-muted-foreground leading-relaxed">
            {t("clickTrackingDesc")}
          </p>

          {/* What is it — plain language */}
          <div className="mb-8 rounded-xl border bg-card p-6">
            <h3 className="mb-3 text-lg font-semibold">{t("clickWhatTitle")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("clickWhatDesc")}
            </p>
          </div>

          {/* The one thing you add */}
          <div className="mb-8 space-y-4">
            <h3 className="text-lg font-semibold">{t("clickHowTitle")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("clickHowDesc")}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-xs font-medium text-red-500">{t("clickBefore")}</p>
                <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
                  <code className="text-xs text-muted-foreground break-all">{clickTrackingBefore}</code>
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-green-600">{t("clickAfter")}</p>
                <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
                  <code className="text-xs text-muted-foreground break-all">{clickTrackingAfter}</code>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("clickLabelExplain")}
            </p>
          </div>

          {/* Copy-paste recipes */}
          <div className="mb-8 space-y-4">
            <h3 className="text-lg font-semibold">{t("clickRecipesTitle")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("clickRecipesDesc")}
            </p>
            <CodeBlock code={clickTrackingRecipes} />
          </div>

          {/* Platform instructions */}
          <div className="mb-8 space-y-6">
            <h3 className="text-lg font-semibold">{t("clickPlatformTitle")}</h3>

            {/* WordPress */}
            <PlatformSection title={t("clickPlatformWpTitle")}>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
                <li>{t("clickPlatformWpStep1")}</li>
                <li>{t("clickPlatformWpStep2")}</li>
                <li>{t("clickPlatformWpStep3")}</li>
                <li>{t("clickPlatformWpStep4")}</li>
              </ol>
            </PlatformSection>

            {/* Wix */}
            <PlatformSection title={t("clickPlatformWixTitle")}>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
                <li>{t("clickPlatformWixStep1")}</li>
                <li>{t("clickPlatformWixStep2")}</li>
                <li>{t("clickPlatformWixStep3")}</li>
              </ol>
            </PlatformSection>

            {/* Squarespace */}
            <PlatformSection title={t("clickPlatformSqTitle")}>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
                <li>{t("clickPlatformSqStep1")}</li>
                <li>{t("clickPlatformSqStep2")}</li>
                <li>{t("clickPlatformSqStep3")}</li>
              </ol>
            </PlatformSection>

            {/* HTML */}
            <PlatformSection title={t("clickPlatformHtmlTitle")}>
              <p className="mb-4 text-sm text-muted-foreground">
                {t("clickPlatformHtmlDesc")}
              </p>
              <CodeBlock code={clickTrackingHtmlExample} />
            </PlatformSection>
          </div>

          {/* Where to see results */}
          <div className="mb-8 rounded-xl border bg-card p-6">
            <h3 className="mb-3 text-lg font-semibold">{t("clickResultsTitle")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("clickResultsDesc")}
            </p>
          </div>

          {/* Tips */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h4 className="mb-1 text-sm font-semibold">{t("clickTrackingTipTitle")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("clickTrackingTipDesc")}
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">
            {t("faqTitle")}
          </h2>
          <div className="space-y-6">
            {[
              { q: t("faqSlowQ"), a: t("faqSlowA"), icon: BarChart3 },
              { q: t("faqColorsQ"), a: t("faqColorsA"), icon: Palette },
              { q: t("faqMobileQ"), a: t("faqMobileA"), icon: Smartphone },
              { q: t("faqRemoveQ"), a: t("faqRemoveA"), icon: Trash2 },
              { q: t("faqMultipleQ"), a: t("faqMultipleA"), icon: Globe },
              {
                q: t("faqNoCodingQ"),
                a: t("faqNoCodingA"),
                icon: HelpCircle,
              },
            ].map((faq) => (
              <div key={faq.q} className="flex gap-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <faq.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{faq.q}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="border-t bg-muted/30 py-16 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold">{t("ctaTitle")}</h2>
          <p className="mt-2 text-muted-foreground">{t("ctaDesc")}</p>
          <Link href={isLoggedIn ? "/dashboard/embed" : "/signup"}>
            <Button size="lg" className="mt-6 gap-2">
              {isLoggedIn ? t("ctaLoggedIn") : t("ctaSignup")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
