"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Crown,
  Lock,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Profile, ProfileLink, TemplateId } from "@/lib/types";
import { SOCIAL_PLATFORMS, FREE_TEMPLATES, PREMIUM_TEMPLATES, TEMPLATES } from "@/lib/types";
import { APP_URL, ALLOWED_IMAGE_TYPES, MAX_AVATAR_SIZE, MAX_BIO_LENGTH, MAX_LINKS } from "@/lib/constants";
import { BusinessHoursEditor } from "./business-hours-editor";

function SortableLinkItem({
  link,
  onUpdate,
  onRemove,
}: {
  link: ProfileLink;
  onUpdate: (id: string, field: keyof ProfileLink, value: string) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: link.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <button {...attributes} {...listeners} className="cursor-grab touch-none">
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
      <Input
        value={link.label}
        onChange={(e) => onUpdate(link.id, "label", e.target.value)}
        placeholder="ラベル"
        className="w-1/3"
      />
      <Input
        value={link.url}
        onChange={(e) => onUpdate(link.id, "url", e.target.value)}
        placeholder="https://..."
        className="flex-1"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(link.id)}
        className="shrink-0 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ProfileEditor({ profile: initialProfile }: { profile: Profile }) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(initialProfile.avatar_url || "");
  const [pagePasswordInput, setPagePasswordInput] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
    updateField("links", profile.links.filter((l) => l.id !== id));
  }

  function updateLink(id: string, field: keyof ProfileLink, value: string) {
    updateField("links", profile.links.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }

  function updateSocial(key: string, value: string) {
    updateField("social_links", { ...profile.social_links, [key]: value });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = profile.links.findIndex((l) => l.id === active.id);
    const newIndex = profile.links.findIndex((l) => l.id === over.id);
    updateField("links", arrayMove(profile.links, oldIndex, newIndex));
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

  function handleTemplateSelect(templateId: string) {
    const isPremium = PREMIUM_TEMPLATES.some((t) => t.id === templateId);
    if (isPremium && !profile.is_pro) {
      setError("プレミアムテンプレートはProプランで利用できます");
      return;
    }
    updateField("template", templateId as TemplateId);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    try {
      let avatarUrl = profile.avatar_url;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${profile.user_id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        if (uploadError) throw new Error("画像のアップロードに失敗しました");
        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
        avatarUrl = publicUrl;
      }

      // Hash password server-side if set
      let pagePassword = profile.page_password;
      if (pagePasswordInput) {
        const hashRes = await fetch("/api/profile/hash-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: pagePasswordInput }),
        });
        if (!hashRes.ok) throw new Error("パスワードの設定に失敗しました");
        const hashData = await hashRes.json();
        pagePassword = hashData.hash;
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
          contact_form_enabled: profile.contact_form_enabled,
          booking_enabled: profile.booking_enabled,
          email_collection_enabled: profile.email_collection_enabled,
          booking_slots: profile.booking_slots,
          page_password: pagePasswordInput ? pagePassword : profile.page_password,
          google_review_url: profile.google_review_url,
          line_friend_url: profile.line_friend_url,
        })
        .eq("id", profile.id);

      if (updateError) throw new Error(updateError.message);

      setMessage("保存しました");
      setAvatarFile(null);
      setPagePasswordInput("");
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
          {profile.is_pro && (
            <Badge variant="outline" className="gap-1 border-amber-300 text-amber-700">
              <Crown className="h-3 w-3" /> Pro
            </Badge>
          )}
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateField("is_published", !profile.is_published)}
        >
          <Eye className="mr-1 h-4 w-4" />
          {profile.is_published ? "非公開にする" : "公開する"}
        </Button>
      </div>

      {/* Feedback */}
      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      {message && <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{message}</div>}

      {/* Template */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">テンプレート</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 text-xs text-muted-foreground">無料テンプレート</div>
          <div className="grid grid-cols-2 gap-3">
            {FREE_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTemplateSelect(t.id)}
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
          <div className="mb-2 mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Crown className="h-3 w-3 text-amber-500" />
            プレミアムテンプレート
            {!profile.is_pro && <span className="text-amber-600">（Proプラン）</span>}
          </div>
          {(() => {
            const categories = PREMIUM_TEMPLATES.reduce<Record<string, typeof PREMIUM_TEMPLATES>>((acc, t) => {
              const cat = (t as { category?: string }).category || "その他";
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(t);
              return acc;
            }, {});
            return Object.entries(categories).map(([category, templates]) => (
              <div key={category} className="mb-4">
                <div className="mb-2 text-xs font-semibold text-muted-foreground">{category}</div>
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleTemplateSelect(t.id)}
                      className={`relative rounded-lg border-2 p-3 text-left transition-colors ${
                        profile.template === t.id
                          ? "border-primary bg-primary/5"
                          : !profile.is_pro
                          ? "border-border opacity-60"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      {!profile.is_pro && <Lock className="absolute right-2 top-2 h-3 w-3 text-muted-foreground" />}
                      <div className="font-medium">{t.label}</div>
                      <div className="text-xs text-muted-foreground">{t.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            ));
          })()}
        </CardContent>
      </Card>

      {/* Color Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">カスタムカラー</CardTitle>
          <CardDescription>テンプレートの色をカスタマイズできます</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">アクセント</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={profile.settings?.accent_color || "#000000"}
                  onChange={(e) =>
                    updateField("settings", { ...profile.settings, accent_color: e.target.value })
                  }
                  className="h-8 w-8 cursor-pointer rounded border"
                />
                {profile.settings?.accent_color && (
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      updateField("settings", { ...profile.settings, accent_color: undefined })
                    }
                  >
                    リセット
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">背景色</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={profile.settings?.background_color || "#ffffff"}
                  onChange={(e) =>
                    updateField("settings", { ...profile.settings, background_color: e.target.value })
                  }
                  className="h-8 w-8 cursor-pointer rounded border"
                />
                {profile.settings?.background_color && (
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      updateField("settings", { ...profile.settings, background_color: undefined })
                    }
                  >
                    リセット
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">文字色</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={profile.settings?.text_color || "#000000"}
                  onChange={(e) =>
                    updateField("settings", { ...profile.settings, text_color: e.target.value })
                  }
                  className="h-8 w-8 cursor-pointer rounded border"
                />
                {profile.settings?.text_color && (
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      updateField("settings", { ...profile.settings, text_color: undefined })
                    }
                  >
                    リセット
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>プロフィール写真</Label>
            <div className="flex items-center gap-4">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
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
              自己紹介 <span className="text-muted-foreground">({(profile.bio || "").length}/{MAX_BIO_LENGTH})</span>
            </Label>
            <Textarea
              id="bio"
              value={profile.bio || ""}
              onChange={(e) => { if (e.target.value.length <= MAX_BIO_LENGTH) updateField("bio", e.target.value); }}
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
          <div className="space-y-2">
            <Label htmlFor="lineFriend">LINE友だち追加URL</Label>
            <Input
              id="lineFriend"
              value={profile.line_friend_url || ""}
              onChange={(e) => updateField("line_friend_url", e.target.value)}
              placeholder="https://lin.ee/xxxxx"
            />
            <p className="text-xs text-muted-foreground">
              プロフィールに「LINEで友だち追加」ボタンが表示されます
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="googleReview">Google口コミURL</Label>
            <Input
              id="googleReview"
              value={profile.google_review_url || ""}
              onChange={(e) => updateField("google_review_url", e.target.value)}
              placeholder="https://search.google.com/local/writereview?placeid=..."
            />
            <p className="text-xs text-muted-foreground">
              プロフィールに「Google口コミを書く」ボタンが表示されます
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Links (with drag-to-reorder) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">リンク</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={profile.links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              {profile.links.map((link) => (
                <SortableLinkItem key={link.id} link={link} onUpdate={updateLink} onRemove={removeLink} />
              ))}
            </SortableContext>
          </DndContext>
          <Button variant="outline" size="sm" onClick={addLink} disabled={profile.links.length >= MAX_LINKS}>
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

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">営業時間</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessHoursEditor
            value={profile.business_hours}
            onChange={(hours) => updateField("business_hours", hours)}
          />
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">機能設定</CardTitle>
          <CardDescription>プロフィールページに表示する機能を選択します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">お問い合わせフォーム</div>
              <div className="text-xs text-muted-foreground">訪問者からのメッセージを受け取ります</div>
            </div>
            <input
              type="checkbox"
              checked={profile.contact_form_enabled}
              onChange={(e) => updateField("contact_form_enabled", e.target.checked)}
              className="h-4 w-4"
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">メール購読フォーム</div>
              <div className="text-xs text-muted-foreground">訪問者のメールアドレスを収集します</div>
            </div>
            <input
              type="checkbox"
              checked={profile.email_collection_enabled}
              onChange={(e) => updateField("email_collection_enabled", e.target.checked)}
              className="h-4 w-4"
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">予約カレンダー</div>
              <div className="text-xs text-muted-foreground">訪問者がオンラインで予約できます</div>
            </div>
            <input
              type="checkbox"
              checked={profile.booking_enabled}
              onChange={(e) => updateField("booking_enabled", e.target.checked)}
              className="h-4 w-4"
            />
          </label>
        </CardContent>
      </Card>

      {/* Password Protection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">パスワード保護</CardTitle>
          <CardDescription>ページにパスワードを設定して閲覧を制限します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.page_password && (
            <div className="flex items-center gap-2 text-sm">
              <Lock className="h-4 w-4 text-amber-500" />
              <span className="text-muted-foreground">パスワードが設定されています</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => {
                  updateField("page_password", null);
                  setPagePasswordInput("");
                }}
              >
                解除
              </Button>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="pagePassword">
              {profile.page_password ? "新しいパスワード" : "パスワード"}
            </Label>
            <Input
              id="pagePassword"
              type="password"
              value={pagePasswordInput}
              onChange={(e) => setPagePasswordInput(e.target.value)}
              placeholder={profile.page_password ? "変更する場合のみ入力" : "パスワードを設定"}
              minLength={4}
            />
          </div>
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
