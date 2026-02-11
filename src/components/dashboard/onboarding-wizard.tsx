"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Upload,
  Link as LinkIcon,
  Palette,
  Eye,
  PartyPopper,
  ChevronRight,
  Check,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import type { Profile, ProfileLink, TemplateId } from "@/lib/types";
import { FREE_TEMPLATES } from "@/lib/types";
import { APP_URL, ALLOWED_IMAGE_TYPES, MAX_AVATAR_SIZE, APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const WIZARD_PROGRESS_KEY = "folio-onboarding-step";

// Template color previews (subset)
const TEMPLATE_PREVIEWS: Record<string, { bg: string; btn: string; text: string }> = {
  professional: { bg: "bg-white", btn: "bg-gray-900", text: "bg-gray-400" },
  minimal: { bg: "bg-stone-50", btn: "bg-stone-300", text: "bg-stone-200" },
  business: { bg: "bg-slate-50", btn: "bg-blue-600", text: "bg-slate-300" },
  creative: {
    bg: "bg-gradient-to-br from-violet-50 to-pink-50",
    btn: "bg-gradient-to-r from-violet-500 to-pink-500",
    text: "bg-violet-200",
  },
};

// Check if user should see the onboarding wizard
export function shouldShowOnboarding(profile: Profile | null): boolean {
  if (!profile) return false;
  let completedCriteria = 0;
  if (profile.avatar_url) completedCriteria++;
  if (profile.links && profile.links.length > 0) completedCriteria++;
  if (profile.is_published) completedCriteria++;
  return completedCriteria < 2;
}

// --- Progress indicator ---
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            i === currentStep
              ? "w-8 bg-primary"
              : i < currentStep
                ? "w-2 bg-primary/60"
                : "w-2 bg-muted-foreground/20"
          )}
        />
      ))}
    </div>
  );
}

// --- Step 1: Welcome ---
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">{APP_NAME}へようこそ！</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        あなたのプロフィールページを数分で作成しましょう。
        基本情報の設定、リンクの追加、テンプレートの選択を行います。
      </p>
      <Button size="lg" onClick={onNext} className="gap-2">
        始めましょう
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// --- Step 2: Avatar & Basic Info ---
function AvatarInfoStep({
  profile,
  onUpdate,
  onNext,
}: {
  profile: Profile;
  onUpdate: (p: Partial<Profile>) => void;
  onNext: () => void;
}) {
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [title, setTitle] = useState(profile.title || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert("JPEG、PNG、WebP、GIF形式の画像を選択してください");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      alert("ファイルサイズは5MB以下にしてください");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `avatars/${profile.user_id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarPreview(publicUrl);

      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", profile.id);
      onUpdate({ avatar_url: publicUrl });
    } catch (err) {
      console.error("Avatar upload error:", err);
      alert("アバターのアップロードに失敗しました");
    }
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        title: title.trim() || null,
        bio: bio.trim() || null,
      })
      .eq("id", profile.id);

    onUpdate({
      display_name: displayName.trim(),
      title: title.trim() || null,
      bio: bio.trim() || null,
    });
    setSaving(false);
    onNext();
  }

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="flex flex-col items-center mb-6">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-1">プロフィール情報</h2>
        <p className="text-sm text-muted-foreground">アバターと基本情報を設定しましょう</p>
      </div>

      <div className="space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-20 w-20 rounded-full bg-muted overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground text-2xl font-bold">
                {displayName?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <label className="cursor-pointer">
            <span className="text-sm text-primary hover:underline">
              {uploading ? "アップロード中..." : "画像を選択"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Display name */}
        <div className="space-y-2">
          <Label htmlFor="wiz-name">表示名</Label>
          <Input
            id="wiz-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="山田 太郎"
          />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="wiz-title">肩書き（任意）</Label>
          <Input
            id="wiz-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="デザイナー / カフェオーナー"
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="wiz-bio">自己紹介（任意）</Label>
          <textarea
            id="wiz-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="簡単な自己紹介を書きましょう"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            maxLength={500}
          />
        </div>

        {/* Preview */}
        <Card className="bg-muted/30">
          <CardContent className="flex items-center gap-3 p-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-muted overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground">
                  {displayName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{displayName || "表示名"}</p>
              {title && <p className="text-xs text-muted-foreground truncate">{title}</p>}
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" onClick={handleSave} disabled={saving || !displayName.trim()}>
          {saving ? "保存中..." : "次へ"}
        </Button>
      </div>
    </div>
  );
}

// --- Step 3: Add First Link ---
function AddLinkStep({
  profile,
  onUpdate,
  onNext,
}: {
  profile: Profile;
  onUpdate: (p: Partial<Profile>) => void;
  onNext: () => void;
}) {
  const [links, setLinks] = useState<{ label: string; url: string }[]>(
    profile.links?.length
      ? profile.links.map((l) => ({ label: l.label, url: l.url }))
      : [{ label: "", url: "" }]
  );
  const [saving, setSaving] = useState(false);

  function addLink() {
    setLinks((prev) => [...prev, { label: "", url: "" }]);
  }

  function removeLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLink(index: number, field: "label" | "url", value: string) {
    setLinks((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    );
  }

  async function handleSave() {
    const validLinks: ProfileLink[] = links
      .filter((l) => l.url.trim())
      .map((l, i) => ({
        id: `link-${Date.now()}-${i}`,
        label: l.label.trim() || l.url.trim(),
        url: l.url.trim(),
      }));

    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ links: validLinks })
      .eq("id", profile.id);

    onUpdate({ links: validLinks });
    setSaving(false);
    onNext();
  }

  const hasValidLink = links.some((l) => l.url.trim());

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="flex flex-col items-center mb-6">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <LinkIcon className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-1">リンクを追加</h2>
        <p className="text-sm text-muted-foreground">
          訪問者に見せたいリンクを追加しましょう。SNS、ウェブサイト、ポートフォリオなど。
        </p>
      </div>

      <div className="space-y-3 mb-4">
        {links.map((link, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">リンク {i + 1}</span>
              {links.length > 1 && (
                <button
                  onClick={() => removeLink(i)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Input
              placeholder="タイトル（例：Instagram）"
              value={link.label}
              onChange={(e) => updateLink(i, "label", e.target.value)}
            />
            <Input
              placeholder="https://..."
              value={link.url}
              onChange={(e) => updateLink(i, "url", e.target.value)}
              type="url"
            />
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={addLink} className="mb-4 gap-1.5 w-full">
        <Plus className="h-4 w-4" />
        リンクを追加
      </Button>

      <Button className="w-full" onClick={handleSave} disabled={saving || !hasValidLink}>
        {saving ? "保存中..." : "次へ"}
      </Button>
    </div>
  );
}

// --- Step 4: Choose Template ---
function TemplateStep({
  profile,
  onUpdate,
  onNext,
}: {
  profile: Profile;
  onUpdate: (p: Partial<Profile>) => void;
  onNext: () => void;
}) {
  const [selected, setSelected] = useState<TemplateId>(profile.template || "professional");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ template: selected }).eq("id", profile.id);
    onUpdate({ template: selected });
    setSaving(false);
    onNext();
  }

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="flex flex-col items-center mb-6">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Palette className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-1">テンプレートを選択</h2>
        <p className="text-sm text-muted-foreground">プロフィールページのデザインを選びましょう</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {FREE_TEMPLATES.map((t) => {
          const preview = TEMPLATE_PREVIEWS[t.id];
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={cn(
                "relative rounded-lg border-2 p-3 text-left transition-all",
                isSelected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              {/* Mini preview */}
              {preview && (
                <div
                  className={cn(
                    "mb-2 flex flex-col items-center gap-1.5 rounded-md p-3",
                    preview.bg
                  )}
                >
                  <div className="h-6 w-6 rounded-full bg-muted-foreground/20" />
                  <div className={cn("h-1.5 w-12 rounded-full", preview.text)} />
                  <div className={cn("h-5 w-full rounded", preview.btn)} />
                  <div className={cn("h-5 w-full rounded", preview.btn, "opacity-60")} />
                </div>
              )}
              <p className="text-xs font-medium">{t.label}</p>
              <p className="text-[10px] text-muted-foreground">{t.description}</p>
            </button>
          );
        })}
      </div>

      <Button className="w-full" onClick={handleSave} disabled={saving}>
        {saving ? "保存中..." : "次へ"}
      </Button>
    </div>
  );
}

// --- Step 5: Preview & Publish ---
function PreviewStep({
  profile,
  onUpdate,
  onNext,
}: {
  profile: Profile;
  onUpdate: (p: Partial<Profile>) => void;
  onNext: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const profileUrl = `${APP_URL}/${profile.username}`;

  async function handlePublish() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ is_published: true }).eq("id", profile.id);
    onUpdate({ is_published: true });
    setSaving(false);
    onNext();
  }

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="flex flex-col items-center mb-6">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Eye className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-1">プレビュー＆公開</h2>
        <p className="text-sm text-muted-foreground">内容を確認して公開しましょう</p>
      </div>

      {/* Mini profile preview */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-16 w-16 rounded-full bg-muted overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                  {profile.display_name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold">{profile.display_name}</p>
              {profile.title && (
                <p className="text-sm text-muted-foreground">{profile.title}</p>
              )}
              {profile.bio && (
                <p className="text-xs text-muted-foreground mt-1">{profile.bio}</p>
              )}
            </div>
            {profile.links && profile.links.length > 0 && (
              <div className="w-full space-y-2">
                {profile.links.slice(0, 3).map((link, i) => (
                  <div
                    key={i}
                    className="rounded-lg border px-3 py-2 text-sm text-center"
                  >
                    {link.label}
                  </div>
                ))}
                {profile.links.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{profile.links.length - 3} 件のリンク
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center mb-4">
        公開URL: <span className="font-mono">{profileUrl}</span>
      </p>

      <Button className="w-full" size="lg" onClick={handlePublish} disabled={saving}>
        {saving ? "公開中..." : "公開する"}
      </Button>
    </div>
  );
}

// --- Step 6: Done ---
function DoneStep({
  profile,
  onDashboard,
  onTutorial,
}: {
  profile: Profile;
  onDashboard: () => void;
  onTutorial: () => void;
}) {
  const profileUrl = `${APP_URL}/${profile.username}`;
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center text-center px-4">
      {/* Celebration */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <PartyPopper className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold mb-2">プロフィールが公開されました！</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        おめでとうございます！あなたのプロフィールページが公開されました。
        リンクをシェアしましょう。
      </p>

      {/* Share URL */}
      <div className="w-full max-w-sm mb-6">
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2">
          <span className="flex-1 truncate text-sm font-mono text-muted-foreground px-2">
            {profileUrl}
          </span>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? "コピー済み" : "コピー"}
          </Button>
        </div>
      </div>

      {/* Confetti dots animation */}
      <div className="relative w-full h-8 mb-4 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute h-2 w-2 rounded-full animate-bounce"
            style={{
              left: `${(i / 12) * 100}%`,
              backgroundColor: ["#f43f5e", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"][i % 6],
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${0.6 + (i % 3) * 0.2}s`,
            }}
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Button className="flex-1" onClick={onDashboard}>
          ダッシュボードへ
        </Button>
        <Button variant="outline" className="flex-1" onClick={onTutorial}>
          チュートリアルを見る
        </Button>
      </div>
    </div>
  );
}

// --- Main Wizard ---
export function OnboardingWizard({
  profile: initialProfile,
  onComplete,
  onStartTour,
}: {
  profile: Profile;
  onComplete: () => void;
  onStartTour: () => void;
}) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [step, setStep] = useState(0);

  // Restore saved step
  useEffect(() => {
    const savedStep = localStorage.getItem(WIZARD_PROGRESS_KEY);
    if (savedStep) {
      const n = parseInt(savedStep, 10);
      if (!isNaN(n) && n >= 0 && n <= 5) setStep(n);
    }
  }, []);

  // Save step progress
  useEffect(() => {
    localStorage.setItem(WIZARD_PROGRESS_KEY, String(step));
  }, [step]);

  const updateProfile = useCallback((partial: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  }, []);

  const goNext = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  function handleSkip() {
    if (confirm("セットアップをスキップしますか？後からダッシュボードで設定できます。")) {
      handleDone();
    }
  }

  function handleDone() {
    localStorage.removeItem(WIZARD_PROGRESS_KEY);
    onComplete();
  }

  function handleTutorial() {
    localStorage.removeItem(WIZARD_PROGRESS_KEY);
    onComplete();
    // Small delay so the wizard closes first
    setTimeout(() => onStartTour(), 100);
  }

  const totalSteps = 6;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="relative flex w-full max-w-lg flex-col items-center py-8 px-4 max-h-[90vh] overflow-y-auto">
        {/* Skip button */}
        {step < 5 && (
          <button
            onClick={handleSkip}
            className="absolute top-2 right-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            後でやる
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Progress indicator */}
        <div className="mb-8">
          <StepIndicator currentStep={step} totalSteps={totalSteps} />
        </div>

        {/* Steps */}
        {step === 0 && <WelcomeStep onNext={goNext} />}
        {step === 1 && (
          <AvatarInfoStep profile={profile} onUpdate={updateProfile} onNext={goNext} />
        )}
        {step === 2 && (
          <AddLinkStep profile={profile} onUpdate={updateProfile} onNext={goNext} />
        )}
        {step === 3 && (
          <TemplateStep profile={profile} onUpdate={updateProfile} onNext={goNext} />
        )}
        {step === 4 && (
          <PreviewStep profile={profile} onUpdate={updateProfile} onNext={goNext} />
        )}
        {step === 5 && (
          <DoneStep
            profile={profile}
            onDashboard={handleDone}
            onTutorial={handleTutorial}
          />
        )}
      </div>
    </div>
  );
}
