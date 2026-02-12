import { getServerLocale } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";
import WallpaperClient from "./wallpaper-client";

export default async function WallpaperPage() {
  const locale = await getServerLocale();
  return (
    <I18nProvider initialLocale={locale} namespaces={["common", "landing"]}>
      <WallpaperClient />
    </I18nProvider>
  );
}
