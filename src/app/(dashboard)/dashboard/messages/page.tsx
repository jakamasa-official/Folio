"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Profile, MessageTemplate, SentMessage, Customer } from "@/lib/types";
import { MESSAGE_PLACEHOLDERS } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Mail,
  Plus,
  Send,
  History,
  FileText,
  Zap,
  Eye,
  Trash2,
  Edit2,
  Copy,
  AlertCircle,
  CheckCircle2,
  Clock,
  MousePointerClick,
  XCircle,
  Users,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useProStatus } from "@/hooks/use-pro-status";
import { ProGate } from "@/components/dashboard/pro-gate";
import { useTranslation } from "@/lib/i18n/client";

// === Constants ===

const TEMPLATE_TYPE_COLORS: Record<string, string> = {
  follow_up: "bg-blue-100 text-blue-800",
  review_request: "bg-yellow-100 text-yellow-800",
  campaign: "bg-purple-100 text-purple-800",
  reminder: "bg-green-100 text-green-800",
  thank_you: "bg-pink-100 text-pink-800",
};

const TEMPLATE_TYPE_KEYS: Record<string, string> = {
  follow_up: "templateTypeFollowUp",
  review_request: "templateTypeReviewRequest",
  campaign: "templateTypeCampaign",
  reminder: "templateTypeReminder",
  thank_you: "templateTypeThankYou",
};

const TRIGGER_TYPE_KEYS: Record<string, string> = {
  manual: "triggerManual",
  after_booking: "triggerAfterBooking",
  after_days: "triggerAfterDays",
  after_contact: "triggerAfterContact",
};

const STATUS_MAP_CONFIG: Record<string, { labelKey: string; icon: React.ReactNode; color: string }> = {
  pending: { labelKey: "statusPending", icon: <Clock className="h-3.5 w-3.5" />, color: "bg-gray-100 text-gray-700" },
  sent: { labelKey: "statusSent", icon: <Send className="h-3.5 w-3.5" />, color: "bg-blue-100 text-blue-700" },
  delivered: { labelKey: "statusDelivered", icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "bg-green-100 text-green-700" },
  opened: { labelKey: "statusOpened", icon: <Eye className="h-3.5 w-3.5" />, color: "bg-emerald-100 text-emerald-700" },
  clicked: { labelKey: "statusClicked", icon: <MousePointerClick className="h-3.5 w-3.5" />, color: "bg-purple-100 text-purple-700" },
  failed: { labelKey: "statusFailed", icon: <XCircle className="h-3.5 w-3.5" />, color: "bg-red-100 text-red-700" },
};

const SAMPLE_DATA: Record<string, string> = {
  "{{customer_name}}": "山田太郎",
  "{{business_name}}": "サンプル店舗",
  "{{booking_date}}": "2025年1月15日",
  "{{booking_time}}": "14:00",
  "{{review_url}}": "https://g.page/review/...",
  "{{profile_url}}": "https://folio.page/sample",
  "{{coupon_code}}": "WELCOME2025",
  "{{stamp_count}}": "5",
  "{{referral_url}}": "https://folio.page/ref/ABC123",
  "{{unsubscribe_url}}": "https://folio.page/unsubscribe/...",
};

interface TemplateStarter {
  name: string;
  template_type: MessageTemplate["template_type"];
  trigger_type: MessageTemplate["trigger_type"];
  trigger_delay_hours: number;
  subject: string;
  body: string;
}

const TEMPLATE_STARTERS: TemplateStarter[] = [
  {
    name: "予約お礼テンプレート",
    template_type: "thank_you",
    trigger_type: "after_booking",
    trigger_delay_hours: 1,
    subject: "{{business_name}}をご予約いただきありがとうございます",
    body: `{{customer_name}}様

この度は{{business_name}}をご予約いただき、誠にありがとうございます。

ご予約日時: {{booking_date}} {{booking_time}}

ご来店を心よりお待ちしております。

ご不明な点がございましたら、お気軽にお問い合わせください。

---
もしよろしければ、ご利用後にGoogleレビューで感想をお聞かせください。
{{review_url}}

{{business_name}}`,
  },
  {
    name: "再来店リマインダー",
    template_type: "reminder",
    trigger_type: "after_days",
    trigger_delay_hours: 720, // 30 days
    subject: "{{business_name}}からのお知らせ - またのご来店お待ちしております",
    body: `{{customer_name}}様

前回のご来店から日が経ちましたが、いかがお過ごしでしょうか。

{{business_name}}では、お客様のまたのご来店を心よりお待ちしております。

次回のご予約はこちらから簡単にお取りいただけます：
{{profile_url}}

お得なクーポンもご用意しております。ぜひご利用ください。

{{business_name}}`,
  },
  {
    name: "Googleレビュー依頼",
    template_type: "review_request",
    trigger_type: "after_booking",
    trigger_delay_hours: 24,
    subject: "{{business_name}}のご感想をお聞かせください",
    body: `{{customer_name}}様

先日は{{business_name}}をご利用いただき、誠にありがとうございました。

お客様のご体験はいかがでしたでしょうか？

もしよろしければ、Googleレビューにてご感想をお聞かせいただけますと大変嬉しく思います。お客様のお声は、私たちのサービス向上の大きな力となります。

以下のリンクから簡単にレビューを投稿いただけます：
{{review_url}}

お忙しいところ恐れ入りますが、何卒よろしくお願いいたします。

{{business_name}}`,
  },
  {
    name: "キャンペーンお知らせ",
    template_type: "campaign",
    trigger_type: "manual",
    trigger_delay_hours: 0,
    subject: "【{{business_name}}】特別キャンペーンのお知らせ",
    body: `{{customer_name}}様

いつも{{business_name}}をご利用いただきありがとうございます。

この度、日頃のご愛顧に感謝して特別キャンペーンを開催いたします！

クーポンコード：{{coupon_code}}

ぜひこの機会にご利用ください。

詳しくはこちら：
{{profile_url}}

{{business_name}}`,
  },
];

// === Empty template ===
function emptyTemplate(): Omit<MessageTemplate, "id" | "profile_id" | "created_at" | "updated_at"> {
  return {
    name: "",
    subject: "",
    body: "",
    template_type: "follow_up",
    trigger_type: "manual",
    trigger_delay_hours: 0,
    is_active: true,
  };
}

// === Component ===

export default function MessagesPage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Templates tab
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [followUpEnabled, setFollowUpEnabled] = useState(false);
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  // Editor
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [editorForm, setEditorForm] = useState(emptyTemplate());
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showStarters, setShowStarters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MessageTemplate | null>(null);

  // Send tab
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [recipientMode, setRecipientMode] = useState<"all" | "tag" | "manual">("all");
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState("");
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

  // History tab
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [historyStats, setHistoryStats] = useState({ total: 0, pending: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 });
  const [statusFilter, setStatusFilter] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  const { isPro } = useProStatus();

  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  // === Load data ===
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
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

    if (!profileData) { setLoading(false); return; }
    const p = profileData as Profile;
    setProfile(p);
    setFollowUpEnabled(p.follow_up_enabled);

    // Load templates
    await loadTemplates();

    // Load customers
    const { data: customersData } = await supabase
      .from("customers")
      .select("*")
      .eq("profile_id", p.id)
      .order("name", { ascending: true });
    setCustomers((customersData as Customer[]) || []);

    setLoading(false);
  }

  async function loadTemplates() {
    try {
      const res = await apiFetch("/api/messages/templates");
      const data = await res.json();
      if (data.templates) {
        setTemplates(data.templates);
      }
    } catch (e) {
      console.error("Template load error:", e);
      toast.error(t("templateLoadError"));
    }
  }

  const loadHistory = useCallback(async (statusOverride?: string) => {
    setLoadingHistory(true);
    try {
      const params = new URLSearchParams();
      const s = statusOverride !== undefined ? statusOverride : statusFilter;
      if (s) params.set("status", s);

      const res = await apiFetch(`/api/messages/history?${params.toString()}`);
      const data = await res.json();
      if (data.messages) {
        setSentMessages(data.messages);
        setHistoryStats(data.stats);
      }
    } catch (e) {
      console.error("History load error:", e);
      toast.error(t("historyLoadError"));
    }
    setLoadingHistory(false);
  }, [statusFilter]);

  // === Follow-up toggle ===
  async function toggleFollowUp() {
    if (!profile) return;
    setSavingFollowUp(true);
    const newVal = !followUpEnabled;
    setFollowUpEnabled(newVal);

    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ follow_up_enabled: newVal })
      .eq("id", profile.id);

    setSavingFollowUp(false);
  }

  // === Template CRUD ===
  function openNewTemplate() {
    setEditingTemplate(null);
    setEditorForm(emptyTemplate());
    setShowPreview(false);
    setShowStarters(true);
    setEditorOpen(true);
  }

  function openEditTemplate(t: MessageTemplate) {
    setEditingTemplate(t);
    setEditorForm({
      name: t.name,
      subject: t.subject,
      body: t.body,
      template_type: t.template_type,
      trigger_type: t.trigger_type,
      trigger_delay_hours: t.trigger_delay_hours,
      is_active: t.is_active,
    });
    setShowPreview(false);
    setShowStarters(false);
    setEditorOpen(true);
  }

  function applyStarter(starter: TemplateStarter) {
    setEditorForm({
      name: starter.name,
      subject: starter.subject,
      body: starter.body,
      template_type: starter.template_type,
      trigger_type: starter.trigger_type,
      trigger_delay_hours: starter.trigger_delay_hours,
      is_active: true,
    });
    setShowStarters(false);
  }

  async function saveTemplate() {
    setSaving(true);
    try {
      if (editingTemplate) {
        // Update
        const res = await apiFetch("/api/messages/templates", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingTemplate.id,
            ...editorForm,
          }),
        });
        const data = await res.json();
        if (data.template) {
          setTemplates((prev) =>
            prev.map((item) => (item.id === editingTemplate.id ? data.template : item))
          );
          setEditorOpen(false);
        }
      } else {
        // Create
        const res = await apiFetch("/api/messages/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editorForm),
        });
        const data = await res.json();
        if (data.template) {
          setTemplates((prev) => [data.template, ...prev]);
          setEditorOpen(false);
        }
      }
    } catch (e) {
      console.error("Template save error:", e);
      toast.error(t("templateSaveError"));
    }
    setSaving(false);
  }

  async function deleteTemplate() {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/api/messages/templates?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      setTemplates((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      console.error("Template delete error:", e);
      toast.error(t("templateDeleteError"));
    }
  }

  async function toggleTemplateActive(tmpl: MessageTemplate) {
    try {
      const res = await apiFetch("/api/messages/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tmpl.id, is_active: !tmpl.is_active }),
      });
      const data = await res.json();
      if (data.template) {
        setTemplates((prev) =>
          prev.map((item) => (item.id === tmpl.id ? data.template : item))
        );
      }
    } catch (e) {
      console.error("Template update error:", e);
      toast.error(t("templateUpdateError"));
    }
  }

  // === Placeholder insertion ===
  function insertPlaceholder(placeholder: string) {
    const textarea = bodyTextareaRef.current;
    if (!textarea) {
      setEditorForm((prev) => ({ ...prev, body: prev.body + placeholder }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentBody = editorForm.body;
    const newBody =
      currentBody.substring(0, start) +
      placeholder +
      currentBody.substring(end);

    setEditorForm((prev) => ({ ...prev, body: newBody }));

    // Restore cursor position after the inserted placeholder
    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = start + placeholder.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  }

  // === Preview ===
  function getPreviewText(text: string): string {
    let result = text;
    for (const [key, value] of Object.entries(SAMPLE_DATA)) {
      result = result.replace(new RegExp(key.replace(/[{}]/g, "\\$&"), "g"), value);
    }
    return result;
  }

  // === Send ===
  function getRecipients(): Customer[] {
    if (recipientMode === "all") return customers;
    if (recipientMode === "tag") {
      if (!tagFilter.trim()) return customers;
      return customers.filter((c) =>
        c.tags.some((tag) =>
          tag.toLowerCase().includes(tagFilter.toLowerCase())
        )
      );
    }
    return customers.filter((c) => selectedCustomerIds.includes(c.id));
  }

  function toggleCustomerSelection(customerId: string) {
    setSelectedCustomerIds((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  }

  async function handleSend() {
    setSending(true);
    try {
      const recipients = getRecipients();
      const res = await apiFetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: selectedTemplateId || undefined,
          customer_ids: recipients.map((c) => c.id),
          channel: "email",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendConfirmOpen(false);
        setSelectedTemplateId("");
        setSelectedCustomerIds([]);
        if (data.failed > 0) {
          toast.success(
            t("sendPartialSuccess", { sent: String(data.sent), failed: String(data.failed) })
          );
        } else {
          toast.success(t("sendSuccess", { sent: String(data.sent || data.total) }));
        }
        // Reload history
        loadHistory();
      } else {
        toast.error(data.error || t("sendFailed"));
      }
    } catch (e) {
      console.error("Send error:", e);
      toast.error(t("messageSendFailed"));
    }
    setSending(false);
  }

  // Get all unique tags from customers
  const allTags = Array.from(
    new Set(customers.flatMap((c) => c.tags || []))
  ).sort();

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  // === Render ===

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold">{t("messageDelivery")}</h1>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">{t("messageDelivery")}</h1>

      <Tabs defaultValue="templates" onValueChange={(v) => {
        if (v === "history") loadHistory();
      }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" className="gap-1.5">
            <FileText className="h-4 w-4" />
            {t("templatesTab")}
          </TabsTrigger>
          <TabsTrigger value="send" className="gap-1.5">
            <Send className="h-4 w-4" />
            {t("sendTab")}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <History className="h-4 w-4" />
            {t("historyTab")}
          </TabsTrigger>
        </TabsList>

        {/* ==================== テンプレート Tab ==================== */}
        <TabsContent value="templates" className="mt-6 space-y-6">
          {/* Follow-up toggle */}
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{t("autoFollowUp")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("autoFollowUpDesc")}
                </p>
              </div>
              <Button
                variant={followUpEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleFollowUp}
                disabled={savingFollowUp}
              >
                {followUpEnabled ? t("enabled") : t("disabled")}
              </Button>
            </CardContent>
          </Card>

          {/* Templates list */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("templateList")}</h2>
            <Button onClick={openNewTemplate} size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              {t("newTemplate")}
            </Button>
          </div>

          {templates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="mb-4 h-12 w-12" />
                <p>{t("noTemplatesYet")}</p>
                <p className="mt-1 text-sm">{t("noTemplatesHint")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {templates.map((tmpl) => {
                const typeColor = TEMPLATE_TYPE_COLORS[tmpl.template_type] || "bg-gray-100 text-gray-800";
                const typeKey = TEMPLATE_TYPE_KEYS[tmpl.template_type];
                return (
                  <Card key={tmpl.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{tmpl.name}</span>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeColor}`}>
                              {typeKey ? t(typeKey) : tmpl.template_type}
                            </span>
                            {tmpl.is_active ? (
                              <Badge variant="default" className="text-xs">{t("enabled")}</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">{t("disabled")}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {TRIGGER_TYPE_KEYS[tmpl.trigger_type] ? t(TRIGGER_TYPE_KEYS[tmpl.trigger_type]) : tmpl.trigger_type}
                            {tmpl.trigger_type !== "manual" && tmpl.trigger_delay_hours > 0 && (
                              <span>
                                {" "}({tmpl.trigger_delay_hours >= 24
                                  ? t("daysLater", { days: String(Math.round(tmpl.trigger_delay_hours / 24)) })
                                  : t("hoursLater", { hours: String(tmpl.trigger_delay_hours) })})
                              </span>
                            )}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {t("subject")}: {tmpl.subject}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleTemplateActive(tmpl)}
                          >
                            <Zap className={`h-4 w-4 ${tmpl.is_active ? "text-yellow-500" : "text-muted-foreground"}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditTemplate(tmpl)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(tmpl)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ==================== 送信 Tab ==================== */}
        <TabsContent value="send" className="mt-6 space-y-6">
          <ProGate isPro={isPro} feature={t("emailDelivery")}>
          {/* Template selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("templateSelection")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("template")}</Label>
                <div className="grid gap-2">
                  <button
                    onClick={() => setSelectedTemplateId("")}
                    className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                      !selectedTemplateId ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-muted-foreground">{t("selectTemplate")}</span>
                  </button>
                  {templates.filter((tmpl) => tmpl.is_active).map((tmpl) => {
                    const typeColor = TEMPLATE_TYPE_COLORS[tmpl.template_type] || "";
                    const typeKey = TEMPLATE_TYPE_KEYS[tmpl.template_type];
                    return (
                      <button
                        key={tmpl.id}
                        onClick={() => setSelectedTemplateId(tmpl.id)}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          selectedTemplateId === tmpl.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{tmpl.name}</span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeColor}`}>
                            {typeKey ? t(typeKey) : tmpl.template_type}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {t("subject")}: {tmpl.subject}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview */}
              {selectedTemplate && (
                <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm font-medium">{t("previewLabel")}</p>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground">件名: </span>
                      {getPreviewText(selectedTemplate.subject)}
                    </p>
                    <Separator />
                    <p className="whitespace-pre-wrap text-sm">
                      {getPreviewText(selectedTemplate.body)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recipients */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("recipients")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={recipientMode === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRecipientMode("all")}
                >
                  <Users className="mr-1.5 h-4 w-4" />
                  {t("allCustomers")}
                </Button>
                <Button
                  variant={recipientMode === "tag" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRecipientMode("tag")}
                >
                  {t("filterByTag")}
                </Button>
                <Button
                  variant={recipientMode === "manual" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRecipientMode("manual")}
                >
                  {t("manualSelect")}
                </Button>
              </div>

              {recipientMode === "tag" && (
                <div className="space-y-2">
                  <Label>{t("filterByTagLabel")}</Label>
                  <Input
                    placeholder={t("tagPlaceholder")}
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                  />
                  {allTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setTagFilter(tag)}
                          className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                            tagFilter === tag
                              ? "border-primary bg-primary/10 text-primary"
                              : "hover:bg-muted"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {recipientMode === "manual" && (
                <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border p-2">
                  {customers.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      {t("noCustomers")}
                    </p>
                  ) : (
                    customers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => toggleCustomerSelection(c.id)}
                        className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          selectedCustomerIds.includes(c.id)
                            ? "bg-primary/10"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            selectedCustomerIds.includes(c.id)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/30"
                          }`}
                        >
                          {selectedCustomerIds.includes(c.id) && (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-medium">{c.name}</span>
                          {c.email && (
                            <span className="ml-2 text-muted-foreground">
                              {c.email}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2">
                <span className="text-sm text-muted-foreground">{t("recipients")}</span>
                <span className="font-medium">
                  {t("recipientCount", { count: String(getRecipients().length) })}
                </span>
              </div>

              <Button
                className="w-full"
                disabled={!selectedTemplateId || getRecipients().length === 0}
                onClick={() => setSendConfirmOpen(true)}
              >
                <Send className="mr-1.5 h-4 w-4" />
                {t("sendButton")}
              </Button>
            </CardContent>
          </Card>
          </ProGate>
        </TabsContent>

        {/* ==================== 送信履歴 Tab ==================== */}
        <TabsContent value="history" className="mt-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{historyStats.total}</p>
                <p className="text-xs text-muted-foreground">{t("totalSent")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{historyStats.opened}</p>
                <p className="text-xs text-muted-foreground">{t("opened")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{historyStats.clicked}</p>
                <p className="text-xs text-muted-foreground">{t("clicked")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{historyStats.failed}</p>
                <p className="text-xs text-muted-foreground">{t("failed")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">ステータス:</span>
            {[
              { value: "", labelKey: "statusFilterAll" },
              { value: "pending", labelKey: "statusPending" },
              { value: "sent", labelKey: "statusSent" },
              { value: "delivered", labelKey: "statusDelivered" },
              { value: "opened", labelKey: "statusOpened" },
              { value: "clicked", labelKey: "statusClicked" },
              { value: "failed", labelKey: "statusFailed" },
            ].map((opt) => (
              <Button
                key={opt.value}
                variant={statusFilter === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setStatusFilter(opt.value);
                  loadHistory(opt.value);
                }}
              >
                {t(opt.labelKey)}
              </Button>
            ))}
          </div>

          {/* Messages list */}
          {loadingHistory ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : sentMessages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Mail className="mb-4 h-12 w-12" />
                <p>{t("noHistory")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {sentMessages.map((msg) => {
                const statusInfo = STATUS_MAP_CONFIG[msg.status];
                const customerData = msg.customer as Customer | undefined;
                const templateData = msg.template as MessageTemplate | undefined;
                return (
                  <Card key={msg.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">
                              {customerData?.name || msg.recipient_email || t("unknown")}
                            </span>
                            {customerData?.email && (
                              <span className="text-xs text-muted-foreground">
                                {customerData.email}
                              </span>
                            )}
                          </div>
                          {templateData && (
                            <p className="text-xs text-muted-foreground">
                              {t("templateLabel", { name: templateData.name })}
                            </p>
                          )}
                          {msg.subject && (
                            <p className="truncate text-sm text-muted-foreground">
                              {t("subject")}: {msg.subject}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(msg.sent_at).toLocaleString("ja-JP")}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo?.color || ""}`}>
                            {statusInfo?.icon}
                            {statusInfo?.labelKey ? t(statusInfo.labelKey) : msg.status}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {msg.channel === "email" ? t("channelEmailBadge") : t("channelLineBadge")}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ==================== Template Editor Dialog ==================== */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? t("editTemplate") : t("newTemplateDialogTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("templateEditorDesc")}
            </DialogDescription>
          </DialogHeader>

          {/* Starter templates */}
          {showStarters && !editingTemplate && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                {t("startFromTemplate")}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {TEMPLATE_STARTERS.map((starter, i) => {
                  const typeColor = TEMPLATE_TYPE_COLORS[starter.template_type] || "";
                  const typeKey = TEMPLATE_TYPE_KEYS[starter.template_type];
                  return (
                    <button
                      key={i}
                      onClick={() => applyStarter(starter)}
                      className="rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <Copy className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{starter.name}</span>
                      </div>
                      <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeColor}`}>
                        {typeKey ? t(typeKey) : starter.template_type}
                      </span>
                    </button>
                  );
                })}
              </div>
              <Separator />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStarters(false)}
              >
                {t("startFromBlank")}
              </Button>
            </div>
          )}

          {/* Editor form */}
          {!showStarters && (
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label>{t("templateName")}</Label>
                <Input
                  placeholder={t("templateNamePlaceholder")}
                  value={editorForm.name}
                  onChange={(e) =>
                    setEditorForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label>{t("type")}</Label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { value: "follow_up", labelKey: "templateTypeFollowUp" },
                      { value: "review_request", labelKey: "templateTypeReviewRequest" },
                      { value: "campaign", labelKey: "templateTypeCampaign" },
                      { value: "reminder", labelKey: "templateTypeReminder" },
                      { value: "thank_you", labelKey: "templateTypeThankYou" },
                    ] as const
                  ).map((opt) => (
                    <Button
                      key={opt.value}
                      variant={
                        editorForm.template_type === opt.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setEditorForm((prev) => ({
                          ...prev,
                          template_type: opt.value,
                        }))
                      }
                    >
                      {t(opt.labelKey)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Review request notice */}
              {editorForm.template_type === "review_request" &&
                profile &&
                !profile.google_review_url && (
                  <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                    <AlertCircle className="h-5 w-5 shrink-0 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      {t("setGoogleReviewUrlFirst")}
                    </p>
                  </div>
                )}

              {/* Trigger */}
              <div className="space-y-2">
                <Label>{t("trigger")}</Label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { value: "manual", labelKey: "triggerManual" },
                      { value: "after_booking", labelKey: "triggerAfterBooking" },
                      { value: "after_days", labelKey: "triggerAfterDays" },
                      { value: "after_contact", labelKey: "triggerAfterContact" },
                    ] as const
                  ).map((opt) => (
                    <Button
                      key={opt.value}
                      variant={
                        editorForm.trigger_type === opt.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setEditorForm((prev) => ({
                          ...prev,
                          trigger_type: opt.value,
                        }))
                      }
                    >
                      {t(opt.labelKey)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Trigger delay */}
              {editorForm.trigger_type !== "manual" && (
                <div className="space-y-2">
                  <Label>{t("delayHours")}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editorForm.trigger_delay_hours}
                    onChange={(e) =>
                      setEditorForm((prev) => ({
                        ...prev,
                        trigger_delay_hours: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {editorForm.trigger_delay_hours >= 24
                      ? t("sendAfterDays", { days: String(Math.round(editorForm.trigger_delay_hours / 24)) })
                      : t("sendAfterHours", { hours: String(editorForm.trigger_delay_hours) })}
                  </p>
                </div>
              )}

              {/* Subject */}
              <div className="space-y-2">
                <Label>{t("subjectLabel")}</Label>
                <Input
                  placeholder={t("subjectPlaceholder")}
                  value={editorForm.subject}
                  onChange={(e) =>
                    setEditorForm((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Placeholder chips */}
              <div className="space-y-2">
                <Label>{t("placeholderChips")}</Label>
                <div className="flex flex-wrap gap-1.5 rounded-lg border bg-muted/30 p-2.5">
                  {MESSAGE_PLACEHOLDERS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => insertPlaceholder(p.key)}
                      className="inline-flex items-center gap-1 rounded-md border bg-background px-2.5 py-1 text-xs font-medium transition-colors hover:bg-primary/10 hover:border-primary/30 active:scale-95"
                      title={p.description}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t("bodyLabel")}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="mr-1.5 h-4 w-4" />
                    {showPreview ? t("backToEdit") : t("preview")}
                  </Button>
                </div>

                {showPreview ? (
                  <div className="min-h-[200px] rounded-lg border bg-muted/30 p-4">
                    <p className="mb-2 text-sm font-medium">
                      件名: {getPreviewText(editorForm.subject)}
                    </p>
                    <Separator className="mb-3" />
                    <p className="whitespace-pre-wrap text-sm">
                      {getPreviewText(editorForm.body)}
                    </p>
                  </div>
                ) : (
                  <Textarea
                    ref={bodyTextareaRef}
                    placeholder={t("bodyPlaceholder")}
                    value={editorForm.body}
                    onChange={(e) =>
                      setEditorForm((prev) => ({
                        ...prev,
                        body: e.target.value,
                      }))
                    }
                    rows={10}
                    className="font-mono text-sm"
                  />
                )}
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between">
                <Label>{t("enableTemplate")}</Label>
                <Button
                  variant={editorForm.is_active ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setEditorForm((prev) => ({
                      ...prev,
                      is_active: !prev.is_active,
                    }))
                  }
                >
                  {editorForm.is_active ? t("enabled") : t("disabled")}
                </Button>
              </div>
            </div>
          )}

          {/* Footer */}
          {!showStarters && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditorOpen(false)}>
                {t("cancel")}
              </Button>
              <Button
                onClick={saveTemplate}
                disabled={saving || !editorForm.name || !editorForm.subject || !editorForm.body}
              >
                {saving ? t("saving") : editingTemplate ? t("update") : t("save")}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== Delete Confirmation Dialog ==================== */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteTemplateTitle")}</DialogTitle>
            <DialogDescription>
              {t("deleteTemplateConfirm", { name: deleteTarget?.name || "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={deleteTemplate}>
              {t("deleteButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== Send Confirmation Dialog ==================== */}
      <Dialog open={sendConfirmOpen} onOpenChange={setSendConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("sendConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("sendConfirmDesc", { count: String(getRecipients().length) })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">{t("sendConfirmTemplate")}</span>
              {selectedTemplate?.name || "-"}
            </p>
            <p>
              <span className="text-muted-foreground">{t("sendConfirmRecipients")}</span>
              {t("sendConfirmRecipientsCount", { count: String(getRecipients().length) })}
            </p>
            <p>
              <span className="text-muted-foreground">{t("sendConfirmChannel")}</span>
              {t("channelEmail")}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendConfirmOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? t("sending") : t("sendAction")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
