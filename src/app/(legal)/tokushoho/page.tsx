import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator("legal");
  return { title: t("tokushohoTitle") };
}

export default async function TokushohoPage() {
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

        <h1 className="mt-8 text-3xl font-bold">{t("tokushohoTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("lastUpdated")}
        </p>

        <div className="mt-8 text-sm leading-relaxed text-foreground/90">
          <table className="w-full border-collapse">
            <tbody className="divide-y">
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  {t("tokushohoSellerLabel")}
                </th>
                <td className="border-b px-4 py-4">
                  {t("tokushohoSellerValue", { appName })}
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  {t("tokushohoManagerLabel")}
                </th>
                <td className="border-b px-4 py-4">
                  {t("tokushohoManagerValue", { appName })}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("tokushohoManagerNote")}
                  </p>
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  {t("tokushohoAddressLabel")}
                </th>
                <td className="border-b px-4 py-4">
                  {t("tokushohoAddressValue")}
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  {t("tokushohoContactLabel")}
                </th>
                <td className="border-b px-4 py-4">
                  {t("tokushohoContactValue")}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("tokushohoContactNote")}
                  </p>
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  {t("tokushohoPriceLabel")}
                </th>
                <td className="border-b px-4 py-4">
                  <ul className="list-disc space-y-1 pl-4">
                    <li>{t("tokushohoPriceFree")}</li>
                    <li>{t("tokushohoPricePro")}</li>
                    <li>{t("tokushohoPriceProPlus")}</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  {t("tokushohoAdditionalCostLabel")}
                </th>
                <td className="border-b px-4 py-4">
                  {t("tokushohoAdditionalCostValue")}
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  {t("tokushohoPaymentMethodLabel")}
                </th>
                <td className="border-b px-4 py-4">
                  {t("tokushohoPaymentMethodValue")}
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  {t("tokushohoPaymentTimingLabel")}
                </th>
                <td className="border-b px-4 py-4">
                  {t("tokushohoPaymentTimingValue")}
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  {t("tokushohoDeliveryLabel")}
                </th>
                <td className="border-b px-4 py-4">
                  {t("tokushohoDeliveryValue")}
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  {t("tokushohoCancellationLabel")}
                </th>
                <td className="border-b px-4 py-4">
                  <ul className="list-disc space-y-1 pl-4">
                    <li>{t("tokushohoCancellationItem1")}</li>
                    <li>{t("tokushohoCancellationItem2")}</li>
                    <li>{t("tokushohoCancellationItem3")}</li>
                    <li>{t("tokushohoCancellationItem4")}</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  {t("tokushohoEnvironmentLabel")}
                </th>
                <td className="border-b px-4 py-4">
                  {t("tokushohoEnvironmentValue")}
                </td>
              </tr>
              <tr>
                <th className="w-1/3 px-4 py-4 text-left align-top font-semibold">
                  {t("tokushohoNotesLabel")}
                </th>
                <td className="px-4 py-4">
                  {t("tokushohoNotesPrefix")}
                  <Link href="/terms" className="text-primary underline underline-offset-4">
                    {t("tokushohoNotesTermsLink")}
                  </Link>
                  {t("tokushohoNotesMid")}
                  <Link href="/privacy" className="text-primary underline underline-offset-4">
                    {t("tokushohoNotesPrivacyLink")}
                  </Link>
                  {t("tokushohoNotesSuffix")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
