"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { USERNAME_REGEX } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n/client";
import { LanguageToggle } from "@/components/ui/language-toggle";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);
  const { t } = useTranslation();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!USERNAME_REGEX.test(username)) {
      setError(t("usernameValidationError"));
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Check if username is taken
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", username)
      .maybeSingle();

    if (existing) {
      setError(t("usernameTakenError"));
      setLoading(false);
      return;
    }

    // Sign up — pass username/displayName as metadata so we can create the profile
    // after email confirmation via a database trigger or on first login
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          display_name: displayName || username,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Check if we got a session (email confirmation disabled) or just a user (confirmation required)
    if (authData.session) {
      // Session available — create profile immediately
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: authData.user!.id,
        username: username.toLowerCase(),
        display_name: displayName || username,
      });

      if (profileError) {
        setError(t("profileCreateError"));
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } else {
      // No session — email confirmation is required
      setConfirmEmail(true);
      setLoading(false);
    }
  }

  if (confirmEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              {APP_NAME}
            </Link>
            <CardTitle className="mt-4 text-xl">{t("confirmEmailTitle")}</CardTitle>
            <CardDescription>
              {t("confirmEmailDescription", { email })}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              {t("confirmEmailSpamNote")}
            </p>
            <Link href="/login">
              <Button variant="outline" className="mt-6">
                {t("backToLogin")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-end">
            <LanguageToggle />
          </div>
          <Link href="/" className="text-2xl font-bold tracking-tight">
            {APP_NAME}
          </Link>
          <CardTitle className="mt-4 text-xl">{t("signupTitle")}</CardTitle>
          <CardDescription>
            {t("signupDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">{t("usernameLabel")}</Label>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>{t("usernamePrefix")}</span>
                <Input
                  id="username"
                  type="text"
                  placeholder={t("usernamePlaceholder")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  required
                  minLength={3}
                  maxLength={30}
                  className="flex-1"
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">{t("displayNameLabel")}</Label>
              <Input
                id="displayName"
                type="text"
                placeholder={t("displayNamePlaceholder")}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("passwordLabel")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("passwordMinLength")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("signupLoading") : t("signupButton")}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t("hasAccountPrompt")}{" "}
            <Link href="/login" className="text-primary underline">
              {t("loginLink")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
