import { ja } from "./dictionaries/ja";
import { en } from "./dictionaries/en";

export type Locale = "ja" | "en";
export const DEFAULT_LOCALE: Locale = "ja";
export const LOCALE_COOKIE = "folio-lang";

// Merge all namespace objects into a flat Record<string, string>
type NamespacedDict = Record<string, Record<string, string>>;

const dictionaries: Record<Locale, NamespacedDict> = { ja, en };

export function createTranslator(locale: Locale, ...namespaces: string[]) {
  const dict = dictionaries[locale] ?? dictionaries.ja;
  const merged: Record<string, string> = {};
  for (const ns of namespaces) {
    if (dict[ns]) Object.assign(merged, dict[ns]);
  }
  return function t(key: string, replacements?: Record<string, string>): string {
    let value = merged[key] ?? key;
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        value = value.replaceAll(`{{${k}}}`, v);
      }
    }
    return value;
  };
}

export function setLocaleCookie(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
}

export function getLocaleFromCookie(cookieString?: string | null): Locale {
  if (!cookieString) return DEFAULT_LOCALE;
  const match = cookieString.match(new RegExp(`${LOCALE_COOKIE}=(ja|en)`));
  return (match?.[1] as Locale) ?? DEFAULT_LOCALE;
}
