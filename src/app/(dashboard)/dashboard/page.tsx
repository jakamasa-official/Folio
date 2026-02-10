"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProfileEditor } from "@/components/editor/profile-editor";
import type { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, USERNAME_REGEX, APP_URL } from "@/lib/constants";
import { Sparkles, Copy, Check, ExternalLink, QrCode, Download } from "lucide-react";
import { SeoPreview } from "@/components/dashboard/seo-preview";
import QRCode from "qrcode";

function ShareBar({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mb-6 flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
      <div className="min-w-0 flex-1 truncate rounded-md bg-background px-3 py-2 text-sm font-mono text-muted-foreground">
        {url}
      </div>
      <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0 gap-1.5">
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        {copied ? "コピー済み" : "コピー"}
      </Button>
      <Button variant="outline" size="sm" asChild className="shrink-0 gap-1.5">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4" />
          プレビュー
        </a>
      </Button>
    </div>
  );
}

type QrColorOption = "black" | "brand" | "white";

const QR_COLOR_CONFIGS: Record<QrColorOption, { dark: string; light: string; label: string }> = {
  black: { dark: "#000000", light: "#ffffff", label: "黒" },
  brand: { dark: "#6366f1", light: "#ffffff", label: "ブランド" },
  white: { dark: "#ffffff", light: "#1e1e1e", label: "白（暗い背景用）" },
};

function QRCodeCard({ url }: { url: string }) {
  const [colorOption, setColorOption] = useState<QrColorOption>("black");
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  const generateQR = useCallback(
    async (size: number, option: QrColorOption): Promise<string> => {
      const colors = QR_COLOR_CONFIGS[option];
      return QRCode.toDataURL(url, {
        width: size,
        margin: 2,
        color: { dark: colors.dark, light: colors.light },
        errorCorrectionLevel: "M",
      });
    },
    [url]
  );

  useEffect(() => {
    generateQR(150, colorOption).then(setPreviewSrc);
  }, [colorOption, generateQR]);

  async function handleDownload() {
    const dataUrl = await generateQR(400, colorOption);
    const link = downloadLinkRef.current;
    if (!link) return;
    link.href = dataUrl;
    link.download = "qrcode.png";
    link.click();
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <QrCode className="h-4 w-4" />
          QRコード
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-5">
          {/* QR preview */}
          <div className="shrink-0 overflow-hidden rounded-lg border bg-white p-2">
            {previewSrc ? (
              <img src={previewSrc} alt="QR Code" width={150} height={150} className="block" />
            ) : (
              <div className="h-[150px] w-[150px] animate-pulse rounded bg-muted" />
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-3">
            {/* Color picker */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">カラー</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(QR_COLOR_CONFIGS) as QrColorOption[]).map((key) => {
                  const cfg = QR_COLOR_CONFIGS[key];
                  const isActive = key === colorOption;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setColorOption(key)}
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors ${
                        isActive
                          ? "border-primary bg-primary/10 font-medium text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span
                        className="inline-block h-3 w-3 rounded-full border"
                        style={{ backgroundColor: cfg.dark, borderColor: cfg.dark === "#ffffff" ? "#999" : cfg.dark }}
                      />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Download button */}
            <Button variant="outline" size="sm" className="w-fit gap-1.5" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              ダウンロード
            </Button>
            {/* Hidden download anchor */}
            <a ref={downloadLinkRef} className="hidden" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

    // Check if user already has a profile (prevent duplicates)
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingProfile) {
      onComplete(existingProfile as Profile);
      return;
    }

    // Check username availability
    const { data: existingUsername } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", username)
      .maybeSingle();

    if (existingUsername) {
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

  const profileUrl = `${APP_URL}/${profile.username}`;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">マイページ編集</h1>
      <ShareBar url={profileUrl} />
      <QRCodeCard url={profileUrl} />
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">SNSシェアプレビュー</CardTitle>
          <CardDescription>SNSでシェアした時の表示イメージ</CardDescription>
        </CardHeader>
        <CardContent>
          <SeoPreview profile={profile} appUrl={APP_URL} />
        </CardContent>
      </Card>
      <ProfileEditor profile={profile} />
    </div>
  );
}
