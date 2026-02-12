import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getServerTranslator("common", "landing");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <h2 className="mt-4 text-xl font-semibold">{t("notFoundTitle")}</h2>
      <p className="mt-2 text-muted-foreground">
        {t("notFoundDescription")}
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/">
          <Button variant="outline">
            {t("notFoundHomeButton", { appName: APP_NAME })}
          </Button>
        </Link>
        <Link href="/signup">
          <Button>
            {t("notFoundSignupButton")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
