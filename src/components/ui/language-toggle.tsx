"use client";

import { useLocale } from "@/lib/i18n/client";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LanguageToggle({ variant = "ghost", size = "sm" }: {
  variant?: "ghost" | "outline";
  size?: "sm" | "icon";
}) {
  const { locale, setLocale } = useLocale();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => setLocale(locale === "ja" ? "en" : "ja")}
      className="gap-1.5"
      aria-label={locale === "ja" ? "Switch to English" : "日本語に切り替え"}
    >
      <Globe className="h-4 w-4" />
      {locale === "ja" ? "EN" : "日本語"}
    </Button>
  );
}
