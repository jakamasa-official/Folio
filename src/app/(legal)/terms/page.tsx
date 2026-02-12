import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator("legal");
  return { title: t("termsTitle") };
}

export default async function TermsOfServicePage() {
  const { t } = await getServerTranslator("legal");
  const appName = APP_NAME;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; {t("backToTop")}
        </Link>

        <h1 className="mt-8 text-3xl font-bold">{t("termsTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("lastUpdated")}
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-semibold">{t("termsArticle1Title")}</h2>
            <p className="mt-2">
              {t("termsArticle1Text", { appName })}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("termsArticle2Title")}</h2>
            <p className="mt-2">{t("termsArticle2Intro")}</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>{t("termsArticle2Item1")}</li>
              <li>{t("termsArticle2Item2")}</li>
              <li>{t("termsArticle2Item3")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("termsArticle3Title")}</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-6">
              <li>{t("termsArticle3Item1")}</li>
              <li>{t("termsArticle3Item2")}</li>
              <li>{t("termsArticle3Item3")}</li>
              <li>{t("termsArticle3Item4")}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("termsArticle4Title")}</h2>
            <p className="mt-2">
              {t("termsArticle4Intro")}
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-6">
              <li>{t("termsArticle4Item1")}</li>
              <li>{t("termsArticle4Item2")}</li>
              <li>{t("termsArticle4Item3")}</li>
              <li>{t("termsArticle4Item4")}</li>
              <li>{t("termsArticle4Item5")}</li>
              <li>{t("termsArticle4Item6")}</li>
              <li>{t("termsArticle4Item7")}</li>
              <li>{t("termsArticle4Item8")}</li>
              <li>{t("termsArticle4Item9")}</li>
              <li>{t("termsArticle4Item10")}</li>
              <li>{t("termsArticle4Item11")}</li>
              <li>{t("termsArticle4Item12")}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("termsArticle5Title")}</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-6">
              <li>{t("termsArticle5Item1")}</li>
              <li>{t("termsArticle5Item2")}</li>
              <li>{t("termsArticle5Item3")}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("termsArticle6Title")}</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-6">
              <li>{t("termsArticle6Item1")}</li>
              <li>{t("termsArticle6Item2")}</li>
              <li>{t("termsArticle6Item3")}</li>
              <li>{t("termsArticle6Item4")}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("termsArticle7Title")}</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-6">
              <li>{t("termsArticle7Item1")}</li>
              <li>{t("termsArticle7Item2")}</li>
              <li>{t("termsArticle7Item3")}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("termsArticle8Title")}</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-6">
              <li>{t("termsArticle8Item1")}</li>
              <li>{t("termsArticle8Item2")}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("termsArticle9Title")}</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-6">
              <li>{t("termsArticle9Item1")}</li>
              <li>{t("termsArticle9Item2")}</li>
              <li>{t("termsArticle9Item3")}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("termsArticle10Title")}</h2>
            <p className="mt-2">
              {t("termsArticle10Text")}
              <Link href="/privacy" className="text-primary underline underline-offset-4">
                {t("termsArticle10PrivacyLink")}
              </Link>
              {t("termsArticle10Suffix")}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("termsArticle11Title")}</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-6">
              <li>{t("termsArticle11Item1")}</li>
              <li>{t("termsArticle11Item2")}</li>
              <li>{t("termsArticle11Item3")}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("termsArticle12Title")}</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-6">
              <li>{t("termsArticle12Item1")}</li>
              <li>{t("termsArticle12Item2")}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("termsArticle13Title")}</h2>
            <p className="mt-2">
              {t("termsArticle13Text")}
            </p>
            <p className="mt-4">
              {t("operatorLabel", { appName })}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
