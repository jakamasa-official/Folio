import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { ArrowRight } from "lucide-react";
import { getServerTranslator } from "@/lib/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Folioを作った理由。個人事業主やフリーランスのために、ひとつのツールですべてをまとめたかった。",
};

export default async function AboutPage() {
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
            <Link href="/">
              <Button variant="ghost" size="sm">
                {t("navHome")}
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">{t("navSignup")}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-2xl px-4 pt-20 pb-12 md:pt-28 md:pb-16">
        <p className="text-sm font-medium text-muted-foreground">
          {t("aboutHeroLabel", { appName: APP_NAME })}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {t("aboutHeroTitle1")}
          <br />
          {t("aboutHeroTitle2")}
        </h1>
      </section>

      {/* Japanese version */}
      <section className="mx-auto max-w-2xl px-4 pb-16">
        <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
          <p>{t("aboutP1")}</p>
          <p>{t("aboutP2")}</p>
          <p>{t("aboutP3", { appName: APP_NAME })}</p>
          <p>{t("aboutP4", { appName: APP_NAME })}</p>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-2xl px-4">
        <div className="border-t" />
      </div>

      {/* English version */}
      <section className="mx-auto max-w-2xl px-4 pt-16 pb-16">
        <p className="text-sm font-medium text-muted-foreground">{t("aboutEnglishLabel")}</p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          {t("aboutEnglishTitle")}
        </h2>
        <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground">
          <p>{t("aboutEnglishP1")}</p>
          <p>{t("aboutEnglishP2", { appName: APP_NAME })}</p>
          <p>{t("aboutEnglishP3")}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-xl font-bold sm:text-2xl">
            {t("aboutCtaTitle")}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("aboutCtaSubtitle")}
          </p>
          <Link href="/signup">
            <Button size="lg" className="mt-6 gap-2">
              {t("aboutCtaButton")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-4">
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
          <p className="mt-3">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
