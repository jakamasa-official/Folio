import { getServerLocale } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";
import ReviewClient from "./review-client";

export default async function ReviewPage() {
  const locale = await getServerLocale();
  return (
    <I18nProvider initialLocale={locale} namespaces={["common", "customers"]}>
      <ReviewClient />
    </I18nProvider>
  );
}
