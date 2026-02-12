import { cookies } from "next/headers";
import { createTranslator, LOCALE_COOKIE, type Locale } from ".";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : "ja";
}

export async function getServerTranslator(...namespaces: string[]) {
  const locale = await getServerLocale();
  return { t: createTranslator(locale, ...namespaces), locale };
}
