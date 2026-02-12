import { cookies } from "next/headers";
import { I18nProvider } from "@/lib/i18n/client";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get(LOCALE_COOKIE)?.value === "en" ? "en" : "ja") as Locale;

  return (
    <I18nProvider initialLocale={locale} namespaces={["auth", "common"]}>
      {children}
    </I18nProvider>
  );
}
