"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/client";

interface PasswordGateProps {
  profileId: string;
  onSuccess: () => void;
}

export function PasswordGate({ profileId, onSuccess }: PasswordGateProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/profile/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: profileId,
          password,
        }),
      });

      if (!res.ok) {
        setError(t("passwordGateError"));
        return;
      }

      const data = await res.json().catch(() => ({}));
      const token = data.token || "verified";

      // Set cookie that expires in 24 hours
      const expires = new Date();
      expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);
      const isSecure = window.location.protocol === "https:";
      document.cookie = `folio_access_${profileId}=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;

      onSuccess();
    } catch {
      setError(t("passwordGateError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>

            <h2 className="text-center text-lg font-semibold">
              {t("passwordGateTitle")}
            </h2>

            {error && (
              <div className="w-full rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordGatePlaceholder")}
                required
                autoFocus
              />

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? t("passwordGateChecking") : t("passwordGateSubmit")}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
