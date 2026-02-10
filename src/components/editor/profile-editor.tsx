"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  ExternalLink,
  Upload,
  User,
} from "lucide-react";
import type { Profile, ProfileLink, SocialLinks } from "@/lib/types";
import { SOCIAL_PLATFORMS, TEMPLATES } from "@/lib/types";
import { APP_URL, ALLOWED_IMAGE_TYPES, MAX_AVATAR_SIZE, MAX_BIO_LENGTH, MAX_LINKS } from "@/lib/constants";

export function ProfileEditor({ profile: initialProfile }: { profile: Profile }) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(initialProfile.avatar_url || "");
  const router = useRouter();

  const updateField = useCallback(
    <K extends keyof Profile>(field: K, value: Profile[K]) => {
      setProfile((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  function addLink() {
    if (profile.links.length >= MAX_LINKS) return;
    const newLink: ProfileLink = {
      id: crypto.randomUUID(),
      label: "",
      url: "",
    };
    updateField("links", [...profile.links, newLink]);
  }

  function removeLink(id: string) {
    updateField(
      "links",
      profile.links.filter((l) => l.id !== id)
    );
  }

  function updateLink(id: string, field: keyof ProfileLink, value: string) {
    updateField(
      "links",
      profile.links.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  }

  function updateSocial(key: string, value: string) {
    updateField("social_links", { ...profile.social_links, [key]: value });
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("JPEG、PNG、WebP、GIF画像のみアップロードできます");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setError("ファイルサイズは5MB以下にしてください");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    try {
      let avatarUrl = profile.avatar_url;

      // Upload avatar if changed
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${profile.user_id}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });

        if (uploadError) throw new Error("画像のアップロードに失敗しました");

        const { data: { publicUrl } } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);

        avatarUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          display_name: profile.display_name,
          title: profile.title,
          bio: profile.bio,
          avatar_url: avatarUrl,
          template: profile.template,
          links: profile.links,
          social_links: profile.social_links,
          contact_email: profile.contact_email,
          contact_phone: profile.contact_phone,
          location: profile.location,
          business_hours: profile.business_hours,
          is_published: profile.is_published,
          settings: profile.settings,
        })
        .eq("id", profile.id);

      if (updateError) throw new Error(updateError.message);

      setMessage("保存しました");
      setAvatarFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={profile.is_published ? "default" : "secondary"}>
            {profile.is_published ? "公開中" : "非公開"}
          </Badge>
          {profile.is_published && (
            <a
              href={`${APP_URL}/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3 w-3" />
              {APP_URL.replace(/https?:\/\//, "")}/{profile.username}
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              updateField("is_published", !profile.is_published);
            }}
          >
            <Eye className="mr-1 h-4 w-4" />
            {profile.is_published ? "非公開にする" : "公開する"}
          </Button>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      {message && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{message}</div>
      )}

      {/* Template */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">テンプレート</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => updateField("template", t.id as Profile["template"])}
                className={`rounded-lg border-2 p-3 text-left transition-colors ${
                  profile.template === t.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <div className="font-medium">{t.label}</div>
                <div className="text-xs text-muted-foreground">{t.description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="space-y-2">
            <Label>プロフィール写真</Label>
            <div className="flex items-center gap-4">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <User className="h-8 w-8" />
                </div>
              )}
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                  <Upload className="h-4 w-4" />
                  画像を選択
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">表示名 *</Label>
            <Input
              id="displayName"
              value={profile.display_name}
              onChange={(e) => updateField("display_name", e.target.value)}
              placeholder="山田 太郎"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">肩書き・タイトル</Label>
            <Input
              id="title"
              value={profile.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="フリーランスデザイナー / カフェオーナー"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">
              自己紹介{" "}
              <span className="text-muted-foreground">
                ({(profile.bio || "").length}/{MAX_BIO_LENGTH})
              </span>
            </Label>
            <Textarea
              id="bio"
              value={profile.bio || ""}
              onChange={(e) => {
                if (e.target.value.length <= MAX_BIO_LENGTH) {
                  updateField("bio", e.target.value);
                }
              }}
              placeholder="あなたについて教えてください..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">場所</Label>
            <Input
              id="location"
              value={profile.location || ""}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="東京都渋谷区"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">連絡先</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contactEmail">メールアドレス（公開）</Label>
            <Input
              id="contactEmail"
              type="email"
              value={profile.contact_email || ""}
              onChange={(e) => updateField("contact_email", e.target.value)}
              placeholder="contact@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">電話番号（公開）</Label>
            <Input
              id="contactPhone"
              type="tel"
              value={profile.contact_phone || ""}
              onChange={(e) => updateField("contact_phone", e.target.value)}
              placeholder="090-1234-5678"
            />
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">リンク</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.links.map((link, index) => (
            <div key={link.id} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                value={link.label}
                onChange={(e) => updateLink(link.id, "label", e.target.value)}
                placeholder="ラベル"
                className="w-1/3"
              />
              <Input
                value={link.url}
                onChange={(e) => updateLink(link.id, "url", e.target.value)}
                placeholder="https://..."
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeLink(link.id)}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addLink}
            disabled={profile.links.length >= MAX_LINKS}
          >
            <Plus className="mr-1 h-4 w-4" />
            リンクを追加
          </Button>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SNS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {SOCIAL_PLATFORMS.map((platform) => (
            <div key={platform.key} className="space-y-1">
              <Label className="text-sm">{platform.label}</Label>
              <Input
                value={(profile.social_links as Record<string, string>)[platform.key] || ""}
                onChange={(e) => updateSocial(platform.key, e.target.value)}
                placeholder={platform.placeholder}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save button (sticky) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 md:left-64">
        <div className="mx-auto flex max-w-2xl items-center justify-end gap-3">
          <a
            href={`/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            プレビュー
          </a>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-1 h-4 w-4" />
            {saving ? "保存中..." : "保存する"}
          </Button>
        </div>
      </div>
    </div>
  );
}

