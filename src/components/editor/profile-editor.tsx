"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { apiFetch } from "@/lib/api-client";
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
  ChevronDown,
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
import { toast } from "sonner";
import type { Profile, ProfileLink, ProfileSlide, TemplateId } from "@/lib/types";
import { SOCIAL_PLATFORMS, FREE_TEMPLATES, PREMIUM_TEMPLATES, TEMPLATES } from "@/lib/types";
import { APP_URL, ALLOWED_IMAGE_TYPES, MAX_AVATAR_SIZE, MAX_BIO_LENGTH, MAX_LINKS } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n/client";
import { RichTextEditor } from "./rich-text-editor";
import { SlidesEditor } from "./slides-editor";
import { Video, Image, Type } from "lucide-react";

// Color preview swatches for template selector
const TEMPLATE_PREVIEWS: Record<string, { bg: string; btn: string; text: string }> = {
  // Free
  professional: { bg: "bg-white", btn: "bg-gray-900", text: "bg-gray-400" },
  minimal: { bg: "bg-stone-50", btn: "bg-stone-300", text: "bg-stone-200" },
  business: { bg: "bg-slate-50", btn: "bg-blue-600", text: "bg-slate-300" },
  creative: { bg: "bg-gradient-to-br from-violet-50 to-pink-50", btn: "bg-gradient-to-r from-violet-500 to-pink-500", text: "bg-violet-200" },
  // Premium original
  elegant: { bg: "bg-amber-50", btn: "bg-amber-300", text: "bg-amber-200" },
  neon: { bg: "bg-gray-950", btn: "bg-cyan-500", text: "bg-gray-700" },
  japanese: { bg: "bg-[#f5f0e8]", btn: "bg-[#c4a882]", text: "bg-[#d4c4ad]" },
  "photo-grid": { bg: "bg-neutral-900", btn: "bg-neutral-600", text: "bg-neutral-700" },
  // Nature
  ocean: { bg: "bg-gradient-to-br from-blue-900 to-cyan-800", btn: "bg-cyan-400", text: "bg-blue-700" },
  sunset: { bg: "bg-gradient-to-br from-orange-400 to-rose-500", btn: "bg-white", text: "bg-orange-300" },
  aurora: { bg: "bg-gradient-to-br from-green-900 to-purple-900", btn: "bg-green-400", text: "bg-purple-700" },
  forest: { bg: "bg-gradient-to-br from-green-900 to-emerald-800", btn: "bg-emerald-400", text: "bg-green-700" },
  sakura: { bg: "bg-pink-50", btn: "bg-pink-400", text: "bg-pink-200" },
  desert: { bg: "bg-gradient-to-br from-amber-100 to-orange-200", btn: "bg-amber-700", text: "bg-amber-300" },
  // Pastel
  "pastel-pink": { bg: "bg-pink-50", btn: "bg-pink-400", text: "bg-pink-100" },
  "pastel-blue": { bg: "bg-sky-50", btn: "bg-sky-400", text: "bg-sky-100" },
  "pastel-mint": { bg: "bg-emerald-50", btn: "bg-emerald-400", text: "bg-emerald-100" },
  "pastel-lavender": { bg: "bg-violet-50", btn: "bg-violet-400", text: "bg-violet-100" },
  "pastel-peach": { bg: "bg-orange-50", btn: "bg-orange-400", text: "bg-orange-100" },
  // Dark
  midnight: { bg: "bg-indigo-950", btn: "bg-indigo-400", text: "bg-indigo-800" },
  charcoal: { bg: "bg-neutral-900", btn: "bg-neutral-400", text: "bg-neutral-700" },
  "dark-purple": { bg: "bg-purple-950", btn: "bg-purple-400", text: "bg-purple-800" },
  "dark-green": { bg: "bg-green-950", btn: "bg-green-400", text: "bg-green-800" },
  "dark-red": { bg: "bg-red-950", btn: "bg-red-400", text: "bg-red-800" },
  "slate-dark": { bg: "bg-slate-900", btn: "bg-slate-400", text: "bg-slate-700" },
  // Gradient
  "gradient-sunset": { bg: "bg-gradient-to-br from-orange-500 to-pink-600", btn: "bg-white/30", text: "bg-orange-300" },
  "gradient-ocean": { bg: "bg-gradient-to-br from-blue-500 to-teal-400", btn: "bg-white/30", text: "bg-blue-300" },
  "gradient-berry": { bg: "bg-gradient-to-br from-purple-600 to-pink-500", btn: "bg-white/30", text: "bg-purple-300" },
  "gradient-fire": { bg: "bg-gradient-to-br from-red-600 to-amber-500", btn: "bg-white/30", text: "bg-red-300" },
  "gradient-mint": { bg: "bg-gradient-to-br from-emerald-400 to-cyan-400", btn: "bg-white/30", text: "bg-emerald-200" },
  "gradient-twilight": { bg: "bg-gradient-to-br from-indigo-600 to-purple-700", btn: "bg-white/30", text: "bg-indigo-300" },
  // Retro/Pop
  retro: { bg: "bg-amber-100", btn: "bg-orange-600", text: "bg-amber-300" },
  synthwave: { bg: "bg-[#1a0533]", btn: "bg-fuchsia-500", text: "bg-purple-800" },
  vaporwave: { bg: "bg-gradient-to-br from-pink-200 to-cyan-200", btn: "bg-purple-400", text: "bg-pink-100" },
  "pop-art": { bg: "bg-yellow-400", btn: "bg-red-600", text: "bg-yellow-300" },
  pixel: { bg: "bg-black", btn: "bg-green-500", text: "bg-gray-800" },
  // Monochrome
  "mono-black": { bg: "bg-black", btn: "bg-white", text: "bg-gray-800" },
  "mono-white": { bg: "bg-white", btn: "bg-black", text: "bg-gray-200" },
  "mono-gray": { bg: "bg-gray-200", btn: "bg-gray-600", text: "bg-gray-300" },
  "mono-sepia": { bg: "bg-[#f5f0e0]", btn: "bg-[#8b7355]", text: "bg-[#d4c4a8]" },
  // Material
  "material-blue": { bg: "bg-gray-50", btn: "bg-blue-500", text: "bg-gray-200" },
  "material-green": { bg: "bg-gray-50", btn: "bg-green-500", text: "bg-gray-200" },
  "material-red": { bg: "bg-gray-50", btn: "bg-red-500", text: "bg-gray-200" },
  "material-amber": { bg: "bg-gray-50", btn: "bg-amber-500", text: "bg-gray-200" },
  // Seasonal
  spring: { bg: "bg-gradient-to-br from-green-100 to-pink-100", btn: "bg-green-500", text: "bg-green-200" },
  summer: { bg: "bg-gradient-to-br from-sky-400 to-cyan-300", btn: "bg-white", text: "bg-sky-200" },
  autumn: { bg: "bg-gradient-to-br from-orange-100 to-red-100", btn: "bg-orange-600", text: "bg-orange-200" },
  winter: { bg: "bg-gradient-to-br from-slate-200 to-blue-100", btn: "bg-slate-600", text: "bg-slate-300" },
  // Special
  glassmorphism: { bg: "bg-gradient-to-br from-violet-500 to-pink-500", btn: "bg-white/30", text: "bg-white/20" },
  brutalist: { bg: "bg-white", btn: "bg-black", text: "bg-gray-300" },
};

const FONT_OPTIONS = [
  { value: "", labelKey: "fontDefault", family: "inherit" },
  { value: "Noto Sans JP", label: "Noto Sans JP", family: "'Noto Sans JP', sans-serif" },
  { value: "Noto Serif JP", label: "Noto Serif JP", family: "'Noto Serif JP', serif" },
  { value: "M PLUS Rounded 1c", label: "M PLUS Rounded 1c", family: "'M PLUS Rounded 1c', sans-serif" },
  { value: "Sawarabi Gothic", label: "Sawarabi Gothic", family: "'Sawarabi Gothic', sans-serif" },
  { value: "Kosugi Maru", label: "Kosugi Maru", family: "'Kosugi Maru', sans-serif" },
  { value: "Zen Maru Gothic", label: "Zen Maru Gothic", family: "'Zen Maru Gothic', sans-serif" },
];

const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB

const TEMPLATE_IMAGES: Record<string, string> = {
  professional: "/images/template-professional.png",
  minimal: "/images/template-minimal.png",
  business: "/images/template-business.png",
  creative: "/images/template-creative.png",
  elegant: "/images/template-elegant.png",
  neon: "/images/template-neon.png",
  japanese: "/images/template-japanese.png",
  "photo-grid": "/images/template-photo-grid.png",
};

function TemplateSwatch({ templateId }: { templateId: string }) {
  const imageSrc = TEMPLATE_IMAGES[templateId];
  const preview = TEMPLATE_PREVIEWS[templateId];

  if (imageSrc) {
    return (
      <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md border shadow-sm">
        <img src={imageSrc} alt={templateId} className="h-full w-full object-cover object-top" />
      </div>
    );
  }

  if (!preview) return null;
  return (
    <div className={`h-16 w-12 shrink-0 overflow-hidden rounded-md ${preview.bg} flex flex-col items-center justify-center gap-[3px] p-1.5 border shadow-sm`}>
      <div className={`h-3 w-3 rounded-full ${preview.btn} opacity-80`} />
      <div className={`h-[3px] w-7 rounded-full ${preview.text}`} />
      <div className={`h-[2px] w-5 rounded-full ${preview.text} opacity-60`} />
      <div className={`h-[4px] w-8 rounded-sm ${preview.btn}`} />
      <div className={`h-[4px] w-8 rounded-sm ${preview.btn} opacity-60`} />
      <div className={`h-[4px] w-8 rounded-sm ${preview.btn} opacity-40`} />
    </div>
  );
}

// --- Collapsible template category ---
function TemplateCategorySection({
  title,
  icon,
  templates,
  profile,
  onSelect,
  defaultOpen = false,
}: {
  title: string;
  icon?: React.ReactNode;
  templates: { id: string; label: string; description: string }[];
  profile: Profile;
  onSelect: (id: TemplateId) => void;
  defaultOpen?: boolean;
}) {
  const hasSelected = templates.some((t) => t.id === profile.template);
  const [open, setOpen] = useState(defaultOpen || hasSelected);

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
      >
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${!open ? "-rotate-90" : ""}`}
        />
        {icon}
        {title}
        <span className="ml-auto text-[10px] font-normal opacity-60">{templates.length}</span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="grid grid-cols-2 gap-2 px-1 pt-1.5 pb-1">
          {templates.map((t) => {
            const isPremium = PREMIUM_TEMPLATES.some((p) => p.id === t.id);
            const locked = isPremium && !profile.is_pro;
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t.id as TemplateId)}
                className={`relative flex items-center gap-2.5 rounded-lg border-2 p-2 text-left transition-colors ${
                  profile.template === t.id
                    ? "border-primary bg-primary/5"
                    : locked
                    ? "border-border opacity-60"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                {locked && (
                  <Lock className="absolute right-1.5 top-1.5 h-3 w-3 text-muted-foreground" />
                )}
                <TemplateSwatch templateId={t.id} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium leading-tight">{t.label}</div>
                  <div className="text-[11px] leading-tight text-muted-foreground">{t.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Full template selector with collapsible groups ---
function TemplateCategories({
  profile,
  onSelect,
  t,
}: {
  profile: Profile;
  onSelect: (id: TemplateId) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}) {
  const premiumCategories = PREMIUM_TEMPLATES.reduce<
    Record<string, typeof PREMIUM_TEMPLATES>
  >((acc, t) => {
    const cat = (t as { category?: string }).category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  return (
    <div>
      {/* Free templates - open by default */}
      <TemplateCategorySection
        title={t("freeTemplates")}
        templates={FREE_TEMPLATES}
        profile={profile}
        onSelect={onSelect}
        defaultOpen
      />

      {/* Premium header */}
      <div className="mb-1 mt-3 flex items-center gap-1.5 px-2 text-xs text-muted-foreground">
        <Crown className="h-3 w-3 text-amber-500" />
        <span className="font-semibold">{t("premiumLabel")}</span>
        {!profile.is_pro && <span className="text-amber-600">{t("premiumProPlan")}</span>}
      </div>

      {/* Premium categories - collapsed by default (unless selected template is in them) */}
      {Object.entries(premiumCategories).map(([category, templates]) => (
        <TemplateCategorySection
          key={category}
          title={category}
          templates={templates}
          profile={profile}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function SortableLinkItem({
  link,
  onUpdate,
  onRemove,
  t,
}: {
  link: ProfileLink;
  onUpdate: (id: string, field: keyof ProfileLink, value: string) => void;
  onRemove: (id: string) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
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
        placeholder={t("linkLabelPlaceholder")}
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
  const { t } = useTranslation();
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
      setError(t("imageTypeError"));
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setError(t("imageSizeError"));
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  }

  function handleTemplateSelect(templateId: string) {
    const isPremium = PREMIUM_TEMPLATES.some((t) => t.id === templateId);
    if (isPremium && !profile.is_pro) {
      setError(t("premiumTemplateError"));
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
        if (uploadError) throw new Error(t("imageUploadError"));
        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
        avatarUrl = publicUrl;
      }

      // Hash password server-side if set
      let pagePassword = profile.page_password;
      if (pagePasswordInput) {
        const hashRes = await apiFetch("/api/profile/hash-password", {
          method: "POST",
          body: JSON.stringify({ password: pagePasswordInput }),
        });
        if (!hashRes.ok) throw new Error(t("passwordSetError"));
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
          rich_content: profile.rich_content,
          slides: profile.slides,
        })
        .eq("id", profile.id);

      if (updateError) throw new Error(updateError.message);

      toast.success(t("saveSuccess"));
      setAvatarFile(null);
      setPagePasswordInput("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("saveError"));
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
            {profile.is_published ? t("statusPublished") : t("statusDraft")}
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
          {profile.is_published ? t("unpublishButton") : t("publishButton")}
        </Button>
      </div>

      {/* Feedback */}
      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      {message && <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{message}</div>}

      {/* Template */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("templateTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TemplateCategories
            profile={profile}
            onSelect={handleTemplateSelect}
            t={t}
          />
        </CardContent>
      </Card>

      {/* Color Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("customColorTitle")}</CardTitle>
          <CardDescription>{t("customColorDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">{t("accentColor")}</Label>
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
                    {t("colorReset")}
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t("backgroundColor")}</Label>
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
                    {t("colorReset")}
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t("textColor")}</Label>
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
                    {t("colorReset")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Font Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Type className="h-4 w-4" />
            {t("fontTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            {FONT_OPTIONS.map((font) => (
              <button
                key={font.value}
                onClick={() =>
                  updateField("settings", { ...profile.settings, font_family: font.value || undefined })
                }
                className={`rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                  (profile.settings?.font_family || "") === font.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground"
                }`}
                style={{ fontFamily: font.family }}
              >
                <div className="text-sm font-medium">{"labelKey" in font ? t(font.labelKey as string) : font.label}</div>
                <div className="text-xs text-muted-foreground" style={{ fontFamily: font.family }}>
                  {t("fontPreviewText")}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Background */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Video className="h-4 w-4" />
            {t("videoBgTitle")}
            {!profile.is_pro && <Badge variant="outline" className="text-xs text-amber-600">Pro</Badge>}
          </CardTitle>
          <CardDescription>{t("videoBgDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.settings?.video_url ? (
            <div className="space-y-2">
              <video
                src={profile.settings.video_url}
                className="h-32 w-full rounded-lg object-cover"
                muted
                autoPlay
                loop
                playsInline
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateField("settings", { ...profile.settings, video_url: undefined })
                }
              >
                <Trash2 className="mr-1 h-3 w-3" />
                {t("videoDelete")}
              </Button>
            </div>
          ) : (
            <label className={`cursor-pointer ${!profile.is_pro ? "opacity-50 pointer-events-none" : ""}`}>
              <div className="flex items-center gap-2 rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground hover:bg-muted justify-center">
                <Upload className="h-4 w-4" />
                {t("videoUploadLabel")}
              </div>
              <input
                type="file"
                accept="video/mp4,video/webm"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > MAX_VIDEO_SIZE) {
                    setError(t("videoSizeError"));
                    return;
                  }
                  const supabase = createClient();
                  const ext = file.name.split(".").pop() || "mp4";
                  const path = `${profile.user_id}/${Date.now()}.${ext}`;
                  const { error: uploadErr } = await supabase.storage
                    .from("videos")
                    .upload(path, file, { upsert: true });
                  if (uploadErr) {
                    setError(t("videoUploadError"));
                    return;
                  }
                  const { data: { publicUrl } } = supabase.storage.from("videos").getPublicUrl(path);
                  updateField("settings", { ...profile.settings, video_url: publicUrl });
                }}
              />
            </label>
          )}
        </CardContent>
      </Card>

      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("basicInfoTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("profilePhotoLabel")}</Label>
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
                  {t("selectImage")}
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
            <Label htmlFor="displayName">{t("displayNameLabel")}</Label>
            <Input
              id="displayName"
              value={profile.display_name}
              onChange={(e) => updateField("display_name", e.target.value)}
              placeholder={t("displayNamePlaceholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">{t("titleLabel")}</Label>
            <Input
              id="title"
              value={profile.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder={t("titlePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">
              {t("bioLabel")} <span className="text-muted-foreground">({(profile.bio || "").length}/{MAX_BIO_LENGTH})</span>
            </Label>
            <Textarea
              id="bio"
              value={profile.bio || ""}
              onChange={(e) => { if (e.target.value.length <= MAX_BIO_LENGTH) updateField("bio", e.target.value); }}
              placeholder={t("bioPlaceholder")}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">{t("locationLabel")}</Label>
            <Input
              id="location"
              value={profile.location || ""}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder={t("locationPlaceholder")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Free Text (Rich Text) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("richTextTitle")}</CardTitle>
          <CardDescription>{t("richTextDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            value={profile.rich_content || ""}
            onChange={(html) => updateField("rich_content", html)}
          />
        </CardContent>
      </Card>

      {/* Slides */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Image className="h-4 w-4" />
            {t("slidesTitle")}
          </CardTitle>
          <CardDescription>{t("slidesDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <SlidesEditor
            slides={profile.slides}
            onChange={(slides) => updateField("slides", slides)}
            userId={profile.user_id}
          />
        </CardContent>
      </Card>

      {/* OG Share Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("ogTitle")}</CardTitle>
          <CardDescription>{t("ogDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("ogShareImageLabel")}</Label>
            {profile.settings?.og_image_url ? (
              <div className="space-y-2">
                <img
                  src={profile.settings.og_image_url}
                  alt="OG Image"
                  className="h-32 w-full rounded-lg object-cover border"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateField("settings", { ...profile.settings, og_image_url: undefined })
                  }
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  {t("ogDeleteImage")}
                </Button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground hover:bg-muted justify-center">
                  <Upload className="h-4 w-4" />
                  {t("ogSelectImage")}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > MAX_AVATAR_SIZE) {
                      setError(t("ogImageSizeError"));
                      return;
                    }
                    const supabase = createClient();
                    const ext = file.name.split(".").pop() || "jpg";
                    const path = `${profile.user_id}/og_${Date.now()}.${ext}`;
                    const { error: uploadErr } = await supabase.storage
                      .from("og-images")
                      .upload(path, file, { upsert: true });
                    if (uploadErr) {
                      setError(t("ogImageUploadError"));
                      return;
                    }
                    const { data: { publicUrl } } = supabase.storage.from("og-images").getPublicUrl(path);
                    updateField("settings", { ...profile.settings, og_image_url: publicUrl });
                  }}
                />
              </label>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ogTitle">{t("ogCustomTitle")}</Label>
            <Input
              id="ogTitle"
              value={profile.settings?.og_title || ""}
              onChange={(e) =>
                updateField("settings", { ...profile.settings, og_title: e.target.value || undefined })
              }
              placeholder={profile.display_name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ogDescription">{t("ogCustomDescription")}</Label>
            <Textarea
              id="ogDescription"
              value={profile.settings?.og_description || ""}
              onChange={(e) =>
                updateField("settings", { ...profile.settings, og_description: e.target.value || undefined })
              }
              placeholder={profile.bio || t("ogDefaultDescription")}
              rows={2}
            />
          </div>
          {/* Preview */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground mb-2">{t("ogPreview")}</div>
            <div className="flex gap-3 rounded-md border bg-background p-2">
              <div className="h-16 w-24 shrink-0 rounded bg-muted flex items-center justify-center overflow-hidden">
                {(profile.settings?.og_image_url || profile.avatar_url) ? (
                  <img
                    src={profile.settings?.og_image_url || profile.avatar_url || ""}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">
                  {profile.settings?.og_title || profile.display_name}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {profile.settings?.og_description || profile.bio || t("ogFallbackDescription", { name: profile.display_name })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("contactTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contactEmail">{t("contactEmailLabel")}</Label>
            <Input
              id="contactEmail"
              type="email"
              value={profile.contact_email || ""}
              onChange={(e) => updateField("contact_email", e.target.value)}
              placeholder="contact@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">{t("contactPhoneLabel")}</Label>
            <Input
              id="contactPhone"
              type="tel"
              value={profile.contact_phone || ""}
              onChange={(e) => updateField("contact_phone", e.target.value)}
              placeholder="090-1234-5678"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lineFriend">{t("lineFriendLabel")}</Label>
            <Input
              id="lineFriend"
              value={profile.line_friend_url || ""}
              onChange={(e) => updateField("line_friend_url", e.target.value)}
              placeholder="https://lin.ee/xxxxx"
            />
            <p className="text-xs text-muted-foreground">
              {t("lineFriendHint")}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="googleReview">{t("googleReviewLabel")}</Label>
            <Input
              id="googleReview"
              value={profile.google_review_url || ""}
              onChange={(e) => updateField("google_review_url", e.target.value)}
              placeholder="https://search.google.com/local/writereview?placeid=..."
            />
            <p className="text-xs text-muted-foreground">
              {t("googleReviewHint")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Links (with drag-to-reorder) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("linksTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={profile.links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              {profile.links.map((link) => (
                <SortableLinkItem key={link.id} link={link} onUpdate={updateLink} onRemove={removeLink} t={t} />
              ))}
            </SortableContext>
          </DndContext>
          <Button variant="outline" size="sm" onClick={addLink} disabled={profile.links.length >= MAX_LINKS}>
            <Plus className="mr-1 h-4 w-4" />
            {t("addLink")}
          </Button>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("socialTitle")}</CardTitle>
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

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("featureTitle")}</CardTitle>
          <CardDescription>{t("featureDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{t("featureContactForm")}</div>
              <div className="text-xs text-muted-foreground">{t("featureContactFormDesc")}</div>
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
              <div className="text-sm font-medium">{t("featureEmailSubscribe")}</div>
              <div className="text-xs text-muted-foreground">{t("featureEmailSubscribeDesc")}</div>
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
              <div className="text-sm font-medium">{t("featureBookingCalendar")}</div>
              <div className="text-xs text-muted-foreground">{t("featureBookingCalendarDesc")}</div>
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
          <CardTitle className="text-lg">{t("passwordTitle")}</CardTitle>
          <CardDescription>{t("passwordDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.page_password && (
            <div className="flex items-center gap-2 text-sm">
              <Lock className="h-4 w-4 text-amber-500" />
              <span className="text-muted-foreground">{t("passwordCurrentSet")}</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => {
                  updateField("page_password", null);
                  setPagePasswordInput("");
                }}
              >
                {t("passwordRemove")}
              </Button>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="pagePassword">
              {profile.page_password ? t("passwordNewLabel") : t("passwordLabel")}
            </Label>
            <Input
              id="pagePassword"
              type="password"
              value={pagePasswordInput}
              onChange={(e) => setPagePasswordInput(e.target.value)}
              placeholder={profile.page_password ? t("passwordChangePlaceholder") : t("passwordSetPlaceholder")}
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
            {t("previewLink")}
          </a>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-1 h-4 w-4" />
            {saving ? t("savingButton") : t("saveButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}
