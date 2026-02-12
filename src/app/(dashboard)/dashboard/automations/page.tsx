"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Coupon, MessageTemplate } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Zap,
  Plus,
  Pencil,
  Trash2,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n/client";

// === Constants ===

const TRIGGER_TYPE_KEYS: Record<string, string> = {
  after_booking: "autoTriggerAfterBooking",
  after_contact: "autoTriggerAfterContact",
  after_subscribe: "autoTriggerAfterSubscribe",
  after_stamp_complete: "autoTriggerAfterStampComplete",
  no_visit_30d: "autoTriggerNoVisit30d",
  no_visit_60d: "autoTriggerNoVisit60d",
  no_visit_90d: "autoTriggerNoVisit90d",
  birthday: "autoTriggerBirthday",
};

const ACTION_TYPE_KEYS: Record<string, string> = {
  send_email: "autoActionSendEmail",
  send_review_request: "autoActionSendReviewRequest",
  send_coupon: "autoActionSendCoupon",
};

const STATUS_CONFIG: Record<string, { labelKey: string; color: string; icon: React.ReactNode }> = {
  pending: { labelKey: "autoStatusScheduled", icon: <Clock className="h-3.5 w-3.5" />, color: "bg-gray-100 text-gray-700" },
  sent: { labelKey: "autoStatusSent", icon: <Send className="h-3.5 w-3.5" />, color: "bg-green-100 text-green-700" },
  failed: { labelKey: "autoStatusFailed", icon: <XCircle className="h-3.5 w-3.5" />, color: "bg-red-100 text-red-700" },
  skipped: { labelKey: "autoStatusSkipped", icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "bg-yellow-100 text-yellow-700" },
};

// === Pre-built templates ===
interface QuickTemplate {
  name: string;
  description: string;
  trigger_type: string;
  action_type: string;
  delay_hours: number;
  subject: string;
  body: string;
}

const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    name: "予約後のお礼",
    description: "予約の2時間後にお礼メールを自動送信",
    trigger_type: "after_booking",
    action_type: "send_email",
    delay_hours: 2,
    subject: "ご予約ありがとうございます",
    body: "{{customer_name}}様\n\nこの度はご予約いただき、誠にありがとうございます。\nご来店を心よりお待ちしております。\n\n{{business_name}}",
  },
  {
    name: "レビュー依頼",
    description: "予約の48時間後にレビュー依頼を自動送信",
    trigger_type: "after_booking",
    action_type: "send_review_request",
    delay_hours: 48,
    subject: "",
    body: "",
  },
  {
    name: "再来店促進",
    description: "30日間来店がないお客様にクーポン付きメールを送信",
    trigger_type: "no_visit_30d",
    action_type: "send_email",
    delay_hours: 0,
    subject: "お久しぶりです！またお待ちしております",
    body: "{{customer_name}}様\n\nいつも{{business_name}}をご利用いただきありがとうございます。\n最近お会いできず寂しく思っております。\n\nまたのご来店を心よりお待ちしております。\n\n{{business_name}}",
  },
];

// === Types ===

interface AutomationRule {
  id: string;
  profile_id: string;
  name: string;
  trigger_type: string;
  action_type: string;
  delay_hours: number;
  template_id: string | null;
  coupon_id: string | null;
  subject: string | null;
  body: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  template?: { id: string; name: string } | null;
  coupon?: { id: string; title: string; code: string } | null;
  sent_count: number;
  pending_count: number;
}

interface AutomationLog {
  id: string;
  rule_id: string;
  customer_id: string;
  profile_id: string;
  status: string;
  scheduled_at: string;
  sent_at: string | null;
  error: string | null;
  created_at: string;
  rule?: { name: string } | null;
  customer?: { name: string; email: string | null } | null;
}

interface FormState {
  id?: string;
  name: string;
  trigger_type: string;
  action_type: string;
  delay_hours: number;
  template_id: string;
  coupon_id: string;
  subject: string;
  body: string;
}

const defaultForm: FormState = {
  name: "",
  trigger_type: "after_booking",
  action_type: "send_email",
  delay_hours: 0,
  template_id: "",
  coupon_id: "",
  subject: "",
  body: "",
};

export default function AutomationsPage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [logFilter, setLogFilter] = useState<string>("all");

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profileData) {
      setLoading(false);
      return;
    }
    const p = profileData as Profile;
    setProfile(p);

    // Fetch rules via API
    const rulesRes = await apiFetch("/api/automations");
    if (rulesRes.ok) {
      const rulesData = await rulesRes.json();
      setRules(rulesData.rules || []);
    }

    // Fetch logs
    const { data: logsData } = await supabase
      .from("automation_logs")
      .select(`
        *,
        rule:automation_rules(name),
        customer:customers(name, email)
      `)
      .eq("profile_id", p.id)
      .order("created_at", { ascending: false })
      .limit(100);
    setLogs((logsData as AutomationLog[]) || []);

    // Fetch coupons for dropdown
    const { data: couponsData } = await supabase
      .from("coupons")
      .select("*")
      .eq("profile_id", p.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    setCoupons((couponsData as Coupon[]) || []);

    // Fetch message templates for dropdown
    const { data: templatesData } = await supabase
      .from("message_templates")
      .select("*")
      .eq("profile_id", p.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    setTemplates((templatesData as MessageTemplate[]) || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Dialog actions ---

  function openCreateDialog(preset?: QuickTemplate) {
    if (preset) {
      setForm({
        name: preset.name,
        trigger_type: preset.trigger_type,
        action_type: preset.action_type,
        delay_hours: preset.delay_hours,
        template_id: "",
        coupon_id: "",
        subject: preset.subject,
        body: preset.body,
      });
    } else {
      setForm(defaultForm);
    }
    setIsEditing(false);
    setFormError("");
    setShowDialog(true);
  }

  function openEditDialog(rule: AutomationRule) {
    setForm({
      id: rule.id,
      name: rule.name,
      trigger_type: rule.trigger_type,
      action_type: rule.action_type,
      delay_hours: rule.delay_hours,
      template_id: rule.template_id || "",
      coupon_id: rule.coupon_id || "",
      subject: rule.subject || "",
      body: rule.body || "",
    });
    setIsEditing(true);
    setFormError("");
    setShowDialog(true);
  }

  async function handleSave() {
    setFormError("");

    if (!form.name.trim()) {
      setFormError(t("ruleNameRequired"));
      return;
    }

    setSaving(true);

    const payload = {
      ...form,
      template_id: form.template_id || null,
      coupon_id: form.coupon_id || null,
      subject: form.subject || null,
      body: form.body || null,
    };

    try {
      if (isEditing && form.id) {
        const res = await apiFetch("/api/automations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: form.id, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || t("updateFailed"));
          setSaving(false);
          return;
        }
        // Refresh rules
        await loadData();
        toast.success(t("ruleUpdated"));
      } else {
        const res = await apiFetch("/api/automations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || t("ruleCreateFailed"));
          setSaving(false);
          return;
        }
        // Refresh rules
        await loadData();
        toast.success(t("ruleCreated"));
      }
      setShowDialog(false);
    } catch {
      setFormError(t("networkError"));
    }

    setSaving(false);
  }

  async function deleteRule(id: string) {
    try {
      const res = await apiFetch(`/api/automations?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setRules((prev) => prev.filter((r) => r.id !== id));
        toast.success(t("ruleDeleteSuccess"));
      } else {
        toast.error(t("ruleDeleteFailed"));
      }
    } catch {
      toast.error(t("ruleDeleteFailed"));
    }
  }

  async function toggleActive(rule: AutomationRule) {
    try {
      const res = await apiFetch("/api/automations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rule.id, is_active: !rule.is_active }),
      });
      if (res.ok) {
        setRules((prev) =>
          prev.map((r) =>
            r.id === rule.id ? { ...r, is_active: !r.is_active } : r
          )
        );
        toast.success(rule.is_active ? t("ruleDeactivated") : t("ruleActivated"));
      } else {
        toast.error(t("changeFailed"));
      }
    } catch {
      toast.error(t("changeFailed"));
    }
  }

  async function enableQuickTemplate(template: QuickTemplate) {
    setSaving(true);
    try {
      const res = await apiFetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.name,
          trigger_type: template.trigger_type,
          action_type: template.action_type,
          delay_hours: template.delay_hours,
          subject: template.subject || null,
          body: template.body || null,
        }),
      });
      if (res.ok) {
        await loadData();
        toast.success(t("enabledTemplate", { name: template.name }));
      } else {
        toast.error(t("ruleCreateFailed"));
      }
    } catch {
      toast.error(t("networkError"));
    }
    setSaving(false);
  }

  // --- Filtered logs ---
  const filteredLogs = logFilter === "all"
    ? logs
    : logs.filter((l) => l.status === logFilter);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold">{t("automationsTitle")}</h1>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("automationsTitle")}</h1>
        <Button onClick={() => openCreateDialog()} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          {t("newRule")}
        </Button>
      </div>

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">{t("rulesTab")}</TabsTrigger>
          <TabsTrigger value="logs">{t("logsTab")}</TabsTrigger>
        </TabsList>

        {/* === Rules Tab === */}
        <TabsContent value="rules" className="space-y-6">
          {/* Quick Templates Section */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t("recommendedTemplates")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {QUICK_TEMPLATES.map((tmpl) => {
                const alreadyExists = rules.some(
                  (r) =>
                    r.name === tmpl.name &&
                    r.trigger_type === tmpl.trigger_type
                );
                return (
                  <Card key={tmpl.name} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <Sparkles className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{tmpl.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {tmpl.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {alreadyExists ? (
                          <Badge variant="secondary" className="text-xs">
                            {t("configured")}
                          </Badge>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              onClick={() => enableQuickTemplate(tmpl)}
                              disabled={saving}
                            >
                              {t("enableOneClick")}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs h-7"
                              onClick={() => openCreateDialog(tmpl)}
                            >
                              {t("customize")}
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Rule List */}
          {rules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Zap className="mb-4 h-12 w-12" />
                <p>{t("noAutomationRules")}</p>
                <p className="text-sm mt-1">
                  {t("noAutomationRulesHint")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium">{rule.name}</h3>
                          {rule.is_active ? (
                            <Badge variant="default">{t("enabled")}</Badge>
                          ) : (
                            <Badge variant="secondary">{t("disabled")}</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs">
                            {TRIGGER_TYPE_KEYS[rule.trigger_type] ? t(TRIGGER_TYPE_KEYS[rule.trigger_type]) : rule.trigger_type}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs">
                            {ACTION_TYPE_KEYS[rule.action_type] ? t(ACTION_TYPE_KEYS[rule.action_type]) : rule.action_type}
                          </span>
                          {rule.delay_hours > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs">
                              <Clock className="h-3 w-3" />
                              {t("hoursAfter", { hours: String(rule.delay_hours) })}
                            </span>
                          )}
                        </div>
                        {(rule.coupon || rule.template) && (
                          <div className="text-xs text-muted-foreground">
                            {rule.template && (
                              <span>{t("autoTemplateLabel", { name: rule.template.name })}</span>
                            )}
                            {rule.coupon && (
                              <span>
                                {rule.template ? " / " : ""}
                                {t("autoCouponLabel", { title: rule.coupon.title, code: rule.coupon.code })}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {t("autoSentCount", { count: String(rule.sent_count) })} / {t("autoScheduledCount", { count: String(rule.pending_count) })}
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(rule)}
                          className="h-8 px-2 text-xs"
                        >
                          {rule.is_active ? t("disabled") : t("enabled")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(rule)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRule(rule.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* === Logs Tab === */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "sent", "failed", "skipped"].map((status) => (
              <Button
                key={status}
                variant={logFilter === status ? "default" : "outline"}
                size="sm"
                className="text-xs h-7"
                onClick={() => setLogFilter(status)}
              >
                {status === "all"
                  ? t("all")
                  : STATUS_CONFIG[status]?.labelKey ? t(STATUS_CONFIG[status].labelKey) : status}
              </Button>
            ))}
          </div>

          {filteredLogs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p>{t("noLogs")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => {
                const statusCfg = STATUS_CONFIG[log.status] || STATUS_CONFIG.pending;
                return (
                  <Card key={log.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium truncate">
                              {log.customer?.name || t("unknown")}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {log.customer?.email || ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{log.rule?.name || t("ruleDeleted")}</span>
                            <span>
                              {new Date(log.scheduled_at).toLocaleString("ja-JP", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {log.error && (
                            <p className="mt-1 text-xs text-red-500 truncate">
                              {log.error}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`shrink-0 text-xs gap-1 ${statusCfg.color}`}
                        >
                          {statusCfg.icon}
                          {t(statusCfg.labelKey)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* === Create/Edit Dialog === */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t("editRule") : t("newRuleDialogTitle")}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? t("editRuleDesc")
                : t("newRuleDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="rule-name">{t("ruleName")}</Label>
              <Input
                id="rule-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={t("ruleNamePlaceholder")}
                maxLength={200}
              />
            </div>

            {/* Trigger Type */}
            <div className="space-y-2">
              <Label htmlFor="trigger-type">{t("triggerLabel")}</Label>
              <select
                id="trigger-type"
                value={form.trigger_type}
                onChange={(e) => setForm((prev) => ({ ...prev, trigger_type: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {Object.entries(TRIGGER_TYPE_KEYS).map(([key, labelKey]) => (
                  <option key={key} value={key}>
                    {t(labelKey)}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Type */}
            <div className="space-y-2">
              <Label htmlFor="action-type">{t("actionLabel")}</Label>
              <select
                id="action-type"
                value={form.action_type}
                onChange={(e) => setForm((prev) => ({ ...prev, action_type: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {Object.entries(ACTION_TYPE_KEYS).map(([key, labelKey]) => (
                  <option key={key} value={key}>
                    {t(labelKey)}
                  </option>
                ))}
              </select>
            </div>

            {/* Delay Hours */}
            <div className="space-y-2">
              <Label htmlFor="delay-hours">{t("delayLabel")}</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("afterEvent")}</span>
                <Input
                  id="delay-hours"
                  type="number"
                  min={0}
                  value={form.delay_hours}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      delay_hours: Math.max(0, parseInt(e.target.value) || 0),
                    }))
                  }
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">{t("executeAfterHours")}</span>
              </div>
            </div>

            {/* Conditional: Email fields */}
            {form.action_type === "send_email" && (
              <>
                {/* Template dropdown */}
                {templates.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="template-id">{t("messageTemplate")}</Label>
                    <select
                      id="template-id"
                      value={form.template_id}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, template_id: e.target.value }))
                      }
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">{t("customInput")}</option>
                      {templates.map((tmpl) => (
                        <option key={tmpl.id} value={tmpl.id}>
                          {tmpl.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">{t("subjectAutoLabel")}</Label>
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    placeholder={t("subjectAutoPlaceholder")}
                    maxLength={500}
                  />
                </div>

                {/* Body */}
                <div className="space-y-2">
                  <Label htmlFor="body">{t("bodyAutoLabel")}</Label>
                  <Textarea
                    id="body"
                    value={form.body}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, body: e.target.value }))
                    }
                    placeholder={t("bodyAutoPlaceholder")}
                    rows={6}
                    maxLength={5000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("placeholderHint")}
                  </p>
                </div>
              </>
            )}

            {/* Conditional: Coupon fields */}
            {form.action_type === "send_coupon" && coupons.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="coupon-id">{t("couponSelectLabel")}</Label>
                <select
                  id="coupon-id"
                  value={form.coupon_id}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, coupon_id: e.target.value }))
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">{t("selectPlease")}</option>
                  {coupons.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving
                ? t("saving")
                : isEditing
                  ? t("updateAction")
                  : t("createAction")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
