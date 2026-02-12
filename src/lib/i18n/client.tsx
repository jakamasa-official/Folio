"use client";

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import { createTranslator, setLocaleCookie, type Locale } from ".";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  initialLocale,
  namespaces,
  children,
}: {
  initialLocale: Locale;
  namespaces: string[];
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setLocaleCookie(newLocale);
    window.location.reload();
  }, []);

  const namespacesKey = namespaces.join(",");
  const t = useMemo(
    () => createTranslator(locale, ...namespaces),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, namespacesKey]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}

export function useLocale(): { locale: Locale; setLocale: (l: Locale) => void } {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useLocale must be used within I18nProvider");
  return { locale: ctx.locale, setLocale: ctx.setLocale };
}
