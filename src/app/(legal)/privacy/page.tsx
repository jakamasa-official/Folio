import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator("legal");
  return { title: t("privacyTitle") };
}

export default async function PrivacyPolicyPage() {
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

        <h1 className="mt-8 text-3xl font-bold">{t("privacyTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("lastUpdated")}
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-semibold">{t("privacySection1Title")}</h2>
            <p className="mt-2">
              {t("privacySection1Text", { appName })}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("privacySection2Title")}</h2>
            <p className="mt-2">
              {t("privacySection2Intro")}
            </p>
            <h3 className="mt-4 font-semibold">{t("privacySection2_1Title")}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>{t("privacySection2_1Item1")}</li>
              <li>{t("privacySection2_1Item2")}</li>
              <li>{t("privacySection2_1Item3")}</li>
              <li>{t("privacySection2_1Item4")}</li>
              <li>{t("privacySection2_1Item5")}</li>
            </ul>
            <h3 className="mt-4 font-semibold">{t("privacySection2_2Title")}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>{t("privacySection2_2Item1")}</li>
              <li>{t("privacySection2_2Item2")}</li>
              <li>{t("privacySection2_2Item3")}</li>
            </ul>
            <p className="mt-2">
              {t("privacySection2NoCookie")}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("privacySection3Title")}</h2>
            <p className="mt-2">
              {t("privacySection3Intro")}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>{t("privacySection3Item1")}</li>
              <li>{t("privacySection3Item2")}</li>
              <li>{t("privacySection3Item3")}</li>
              <li>{t("privacySection3Item4")}</li>
              <li>{t("privacySection3Item5")}</li>
              <li>{t("privacySection3Item6")}</li>
              <li>{t("privacySection3Item7")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("privacySection4Title")}</h2>
            <p className="mt-2">
              {t("privacySection4Text1")}
            </p>
            <p className="mt-2">
              {t("privacySection4Text2")}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("privacySection5Title")}</h2>
            <p className="mt-2">
              {t("privacySection5Intro")}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>{t("privacySection5Item1")}</li>
              <li>{t("privacySection5Item2")}</li>
              <li>{t("privacySection5Item3")}</li>
              <li>{t("privacySection5Item4")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("privacySection6Title")}</h2>
            <p className="mt-2">
              {t("privacySection6Intro")}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>{t("privacySection6Item1")}</li>
              <li>{t("privacySection6Item2")}</li>
              <li>{t("privacySection6Item3")}</li>
              <li>{t("privacySection6Item4")}</li>
            </ul>
            <p className="mt-2">
              {t("privacySection6Contact")}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("privacySection7Title")}</h2>
            <p className="mt-2">
              {t("privacySection7Intro")}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>{t("privacySection7Item1")}</li>
              <li>{t("privacySection7Item2")}</li>
              <li>{t("privacySection7Item3")}</li>
              <li>{t("privacySection7Item4")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("privacySection8Title")}</h2>
            <p className="mt-2">
              {t("privacySection8Text")}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("privacySection9Title")}</h2>
            <p className="mt-2">
              {t("privacySection9Text")}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t("privacySection10Title")}</h2>
            <p className="mt-2">
              {t("privacySection10Text")}
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
