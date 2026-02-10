"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProfileEditor } from "@/components/editor/profile-editor";
import type { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, USERNAME_REGEX } from "@/lib/constants";
import { Sparkles } from "lucide-react";

function OnboardingForm({ userId, defaultUsername, defaultDisplayName, onComplete }: {
  userId: string;
  defaultUsername: string;
  defaultDisplayName: string;
  onComplete: (profile: Profile) => void;
}) {
  const [username, setUsername] = useState(defaultUsername);
  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!USERNAME_REGEX.test(username)) {
      setError("ユーザー名は3〜30文字の英数字、ハイフン、アンダースコアのみ使用できます");
      return;
    }

    if (!displayName.trim()) {
      setError("表示名を入力してください");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    // Check username availability
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", username)
      .maybeSingle();

    if (existing) {
      setError("このユーザー名は既に使用されています");
      setSaving(false);
      return;
    }

    // Create profile (published by default so public page works immediately)
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        user_id: userId,
        username: username.toLowerCase(),
        display_name: displayName.trim(),
        is_published: true,
      })
      .select("*")
      .single();

    if (insertError) {
      setError(`プロフィールの作成に失敗しました: ${insertError.message}`);
      setSaving(false);
      return;
    }

    onComplete(newProfile as Profile);
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">{APP_NAME}へようこそ！</CardTitle>
          <CardDescription>
            まずはプロフィールの基本情報を設定しましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="onboard-username">ユーザー名</Label>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span className="shrink-0">folio.jp/</span>
                <Input
                  id="onboard-username"
                  type="text"
                  placeholder="your-name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  required
                  minLength={3}
                  maxLength={30}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                公開ページのURLになります。英数字・ハイフン・アンダースコアが使えます。
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="onboard-displayName">表示名</Label>
              <Input
                id="onboard-displayName"
                type="text"
                placeholder="山田 太郎"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                プロフィールページに表示される名前です。後から変更できます。
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "作成中..." : "プロフィールを作成"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [userId, setUserId] = useState("");
  const [defaultUsername, setDefaultUsername] = useState("");
  const [defaultDisplayName, setDefaultDisplayName] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error: queryError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (queryError) {
        console.error("Profile load error:", queryError);
      }

      if (data) {
        setProfile(data as Profile);
      } else {
        // No profile — show onboarding
        // Pre-fill from auth metadata if available
        const meta = user.user_metadata || {};
        setDefaultUsername(meta.username || "");
        setDefaultDisplayName(meta.display_name || "");
        setNeedsOnboarding(true);
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">マイページ編集</h1>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (needsOnboarding) {
    return (
      <OnboardingForm
        userId={userId}
        defaultUsername={defaultUsername}
        defaultDisplayName={defaultDisplayName}
        onComplete={(newProfile) => {
          setProfile(newProfile);
          setNeedsOnboarding(false);
        }}
      />
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">マイページ編集</h1>
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          プロフィールの読み込みに失敗しました。ページを再読み込みしてください。
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">マイページ編集</h1>
      <ProfileEditor profile={profile} />
    </div>
  );
}
