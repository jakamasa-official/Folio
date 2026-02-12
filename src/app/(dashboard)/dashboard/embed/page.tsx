"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/client";
import type { Profile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ProGate } from "@/components/dashboard/pro-gate";
import { APP_URL } from "@/lib/constants";
import { Copy, Check, Code2, Info } from "lucide-react";

// ─── Types ──────────────────────────────────────────────

type ContactMode = "float" | "inline" | "off";
type ReviewMode = "float" | "inline" | "off";
type SubscribeMode = "inline" | "off";
type BadgeMode = "on" | "off";

// ─── Component ──────────────────────────────────────────

export default function EmbedPage() {
  const { t, locale } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Widget toggles
  const [contactMode, setContactMode] = useState<ContactMode>("float");
  const [reviewMode, setReviewMode] = useState<ReviewMode>("float");
  const [subscribeMode, setSubscribeMode] = useState<SubscribeMode>("off");
  const [badgeMode, setBadgeMode] = useState<BadgeMode>("on");

  // Settings
  const [widgetLang, setWidgetLang] = useState<"ja" | "en">(locale === "ja" ? "ja" : "en");
  const [badgePosition, setBadgePosition] = useState<"bottom-left" | "bottom-right">("bottom-right");

  // Copy state
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedDivs, setCopiedDivs] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData as Profile);
    }
    setLoading(false);
  }

  // ─── Build data-widgets value ───────────────────────────

  function buildWidgetList(): string[] {
    const widgets: string[] = ["tracking"];

    if (contactMode === "float") widgets.push("contact-float");
    else if (contactMode === "inline") widgets.push("contact-inline");

    if (reviewMode === "float") widgets.push("review-float");
    else if (reviewMode === "inline") widgets.push("review-inline");

    if (subscribeMode === "inline") widgets.push("subscribe-inline");

    if (badgeMode === "on") widgets.push("badge");

    return widgets;
  }

  // ─── Check if any inline widgets ────────────────────────

  function hasInlineWidgets(): boolean {
    return contactMode === "inline" || reviewMode === "inline" || subscribeMode === "inline";
  }

  // ─── Generate script code ──────────────────────────────

  function generateScript(): string {
    if (!profile) return "";
    const widgets = buildWidgetList();
    const attrs = [
      `src="${APP_URL}/folio.js"`,
      `data-profile-id="${profile.id}"`,
      `data-widgets="${widgets.join(",")}"`,
      `data-lang="${widgetLang}"`,
    ];
    if (badgeMode === "on") {
      attrs.push(`data-badge-position="${badgePosition}"`);
    }
    attrs.push("defer");
    return `<script ${attrs.join("\n  ")}></script>`;
  }

  // ─── Generate inline div code ──────────────────────────

  function generateDivs(): string {
    const lines: string[] = [];
    if (contactMode === "inline") lines.push('<div id="folio-contact"></div>');
    if (reviewMode === "inline") lines.push('<div id="folio-review"></div>');
    if (subscribeMode === "inline") lines.push('<div id="folio-subscribe"></div>');
    return lines.join("\n");
  }

  // ─── Copy handlers ────────────────────────────────────

  function handleCopyScript() {
    navigator.clipboard.writeText(generateScript());
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  }

  function handleCopyDivs() {
    navigator.clipboard.writeText(generateDivs());
    setCopiedDivs(true);
    setTimeout(() => setCopiedDivs(false), 2000);
  }

  // ─── Loading state ────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">{t("embed.pageTitle")}</h1>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // ─── Radio option button component ────────────────────

  function RadioOption<T extends string>({
    value,
    current,
    onChange,
    label,
  }: {
    value: T;
    current: T;
    onChange: (v: T) => void;
    label: string;
  }) {
    const isSelected = value === current;
    return (
      <button
        type="button"
        onClick={() => onChange(value)}
        className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
          isSelected
            ? "border-primary bg-primary/5 ring-1 ring-primary font-medium"
            : "border-border bg-background hover:bg-muted/50"
        }`}
      >
        {label}
      </button>
    );
  }

  // ─── Main content (inside ProGate) ─────────────────────

  const content = (
    <div className="space-y-6">
      {/* Widget toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Code2 className="h-4 w-4" />
            {t("embed.pageTitle")}
          </CardTitle>
          <CardDescription>{t("embed.pageDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Page view tracking */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label className="text-sm font-medium">{t("embed.trackingLabel")}</Label>
              <p className="text-sm text-muted-foreground">{t("embed.trackingDesc")}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              {t("embed.trackingAlwaysOn")}
            </div>
          </div>

          {/* Contact form */}
          <div className="space-y-2">
            <div>
              <Label className="text-sm font-medium">{t("embed.contactLabel")}</Label>
              <p className="text-sm text-muted-foreground">{t("embed.contactDesc")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <RadioOption value="float" current={contactMode} onChange={setContactMode} label={t("embed.optionFloat")} />
              <RadioOption value="inline" current={contactMode} onChange={setContactMode} label={t("embed.optionInline")} />
              <RadioOption value="off" current={contactMode} onChange={setContactMode} label={t("embed.optionOff")} />
            </div>
          </div>

          {/* Review collection */}
          <div className="space-y-2">
            <div>
              <Label className="text-sm font-medium">{t("embed.reviewLabel")}</Label>
              <p className="text-sm text-muted-foreground">{t("embed.reviewDesc")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <RadioOption value="float" current={reviewMode} onChange={setReviewMode} label={t("embed.optionFloat")} />
              <RadioOption value="inline" current={reviewMode} onChange={setReviewMode} label={t("embed.optionInline")} />
              <RadioOption value="off" current={reviewMode} onChange={setReviewMode} label={t("embed.optionOff")} />
            </div>
          </div>

          {/* Email subscribe */}
          <div className="space-y-2">
            <div>
              <Label className="text-sm font-medium">{t("embed.subscribeLabel")}</Label>
              <p className="text-sm text-muted-foreground">{t("embed.subscribeDesc")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <RadioOption value="inline" current={subscribeMode} onChange={setSubscribeMode} label={t("embed.optionInline")} />
              <RadioOption value="off" current={subscribeMode} onChange={setSubscribeMode} label={t("embed.optionOff")} />
            </div>
          </div>

          {/* Social proof badge */}
          <div className="space-y-2">
            <div>
              <Label className="text-sm font-medium">{t("embed.badgeLabel2")}</Label>
              <p className="text-sm text-muted-foreground">{t("embed.badgeDesc2")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <RadioOption value="on" current={badgeMode} onChange={setBadgeMode} label={t("embed.optionOn")} />
              <RadioOption value="off" current={badgeMode} onChange={setBadgeMode} label={t("embed.optionOff")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("embed.settingsTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("embed.languageLabel")}</Label>
            <div className="flex flex-wrap gap-2">
              <RadioOption value="ja" current={widgetLang} onChange={setWidgetLang} label="Japanese" />
              <RadioOption value="en" current={widgetLang} onChange={setWidgetLang} label="English" />
            </div>
          </div>

          {/* Badge position (only if badge is on) */}
          {badgeMode === "on" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("embed.badgePositionLabel")}</Label>
              <div className="flex flex-wrap gap-2">
                <RadioOption value="bottom-left" current={badgePosition} onChange={setBadgePosition} label={t("embed.positionBottomLeft")} />
                <RadioOption value="bottom-right" current={badgePosition} onChange={setBadgePosition} label={t("embed.positionBottomRight")} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("embed.codeTitle")}</CardTitle>
          <CardDescription>{t("embed.codeDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Script tag */}
          <div className="space-y-2">
            <div className="relative">
              <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-3 pr-24 text-xs text-muted-foreground">
                <code>{generateScript()}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyScript}
                className="absolute right-2 top-2 gap-1.5"
              >
                {copiedScript ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copiedScript ? t("embed.codeCopied") : t("embed.codeCopy")}
              </Button>
            </div>
          </div>

          {/* Inline div containers */}
          {hasInlineWidgets() && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("embed.inlineDivsTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("embed.inlineDivsDesc")}</p>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-3 pr-24 text-xs text-muted-foreground">
                  <code>{generateDivs()}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyDivs}
                  className="absolute right-2 top-2 gap-1.5"
                >
                  {copiedDivs ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedDivs ? t("embed.codeCopied") : t("embed.codeCopy")}
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="rounded-md bg-muted/50 p-4 text-sm text-muted-foreground space-y-2">
            <p className="font-medium">{t("embed.settingsTitle")}</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>{t("embed.step1")}</li>
              <li>{t("embed.step2")}</li>
              {hasInlineWidgets() && <li>{t("embed.step3")}</li>}
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{t("embed.pageTitle")}</h1>
      <p className="text-muted-foreground">{t("embed.pageDescription")}</p>

      <ProGate isPro={profile.is_pro} feature={t("embed.proFeature")}>
        {content}
      </ProGate>
    </div>
  );
}
