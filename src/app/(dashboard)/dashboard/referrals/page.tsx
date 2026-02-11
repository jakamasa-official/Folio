"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Profile, ReferralCode, Referral, Customer, Coupon, CampaignPage } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
  Users,
  Copy,
  Check,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Gift,
  Link as LinkIcon,
  Megaphone,
  Pencil,
  ExternalLink,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react";
import { useProStatus } from "@/hooks/use-pro-status";
import { ProGate } from "@/components/dashboard/pro-gate";

// ============================================================
// Shared constants
// ============================================================

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  signed_up: { label: "登録済み", variant: "secondary" },
  booked: { label: "予約済み", variant: "default" },
  rewarded: { label: "特典付与", variant: "outline" },
};

const TEMPLATE_OPTIONS = [
  { value: "default", label: "デフォルト", desc: "白背景、クリーンなレイアウト" },
  { value: "minimal", label: "ミニマル", desc: "薄グレー、シンプルなスタイル" },
  { value: "bold", label: "ボールド", desc: "グラデーション背景、大きなCTA" },
  { value: "festive", label: "フェスティブ", desc: "お祝いムード、暖色系" },
];

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

  if (!slug) {
    return `campaign-${Date.now()}`;
  }
  return slug;
}

// ============================================================
// Campaign form state
// ============================================================

interface CampaignFormState {
  id?: string;
  slug: string;
  title: string;
  description: string;
  hero_image_url: string;
  cta_text: string;
  cta_url: string;
  coupon_id: string;
  expires_at: string;
  template: string;
  is_published: boolean;
}

const defaultCampaignForm: CampaignFormState = {
  slug: "",
  title: "",
  description: "",
  hero_image_url: "",
  cta_text: "予約する",
  cta_url: "",
  coupon_id: "",
  expires_at: "",
  template: "default",
  is_published: false,
};

// ============================================================
// Referrals Tab
// ============================================================

function ReferralsTab({
  referralCodes,
  setReferralCodes,
  customers,
  coupons,
  referralEnabled,
  setReferralEnabled,
}: {
  referralCodes: ReferralCode[];
  setReferralCodes: React.Dispatch<React.SetStateAction<ReferralCode[]>>;
  customers: Customer[];
  coupons: Coupon[];
  referralEnabled: boolean;
  setReferralEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [togglingEnabled, setTogglingEnabled] = useState(false);

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedCouponId, setSelectedCouponId] = useState("");
  const [creating, setCreating] = useState(false);

  // Expanded code -> referrals
  const [expandedCodeId, setExpandedCodeId] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Record<string, Referral[]>>({});
  const [loadingReferrals, setLoadingReferrals] = useState<string | null>(null);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function toggleReferralEnabled() {
    setTogglingEnabled(true);
    const newValue = !referralEnabled;
    setReferralEnabled(newValue);

    try {
      const res = await fetch("/api/referrals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referral_enabled: newValue }),
      });
      if (!res.ok) {
        setReferralEnabled(!newValue);
      }
    } catch {
      setReferralEnabled(!newValue);
    }

    setTogglingEnabled(false);
  }

  async function createReferralCode() {
    if (!selectedCustomerId) return;
    setCreating(true);

    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: selectedCustomerId,
          reward_coupon_id: selectedCouponId || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReferralCodes((prev) => [data.referral_code, ...prev]);
        setShowCreateDialog(false);
        setSelectedCustomerId("");
        setSelectedCouponId("");
      } else {
        toast.error("紹介コードの作成に失敗しました");
      }
    } catch {
      toast.error("紹介コードの作成に失敗しました");
    }

    setCreating(false);
  }

  async function deleteReferralCode(id: string) {
    try {
      const res = await fetch(`/api/referrals?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setReferralCodes((prev) => prev.filter((c) => c.id !== id));
        if (expandedCodeId === id) setExpandedCodeId(null);
      } else {
        toast.error("紹介コードの削除に失敗しました");
      }
    } catch {
      toast.error("紹介コードの削除に失敗しました");
    }
  }

  async function loadReferrals(codeId: string) {
    if (expandedCodeId === codeId) {
      setExpandedCodeId(null);
      return;
    }

    setLoadingReferrals(codeId);
    setExpandedCodeId(codeId);

    try {
      const res = await fetch(`/api/referrals?code_id=${codeId}`);
      if (res.ok) {
        const data = await res.json();
        setReferrals((prev) => ({ ...prev, [codeId]: (data.referrals as Referral[]) || [] }));
      }
    } catch {
      console.error("紹介データの取得に失敗しました");
    }

    setLoadingReferrals(null);
  }

  async function copyCode(code: string, id: string) {
    const url = `${window.location.origin}/r/${code}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Stats
  const totalCodes = referralCodes.length;
  const totalReferrals = referralCodes.reduce((sum, c) => sum + c.referral_count, 0);
  const conversionRate = totalCodes > 0 ? Math.round((totalReferrals / totalCodes) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>紹介設定</CardTitle>
          <CardDescription>紹介プログラムの有効/無効を切り替えます</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>紹介プログラムを有効にする</Label>
            <Button
              variant={referralEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleReferralEnabled}
              disabled={togglingEnabled}
            >
              {referralEnabled ? "有効" : "無効"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalCodes}</p>
            <p className="text-sm text-muted-foreground">紹介コード数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalReferrals}</p>
            <p className="text-sm text-muted-foreground">紹介数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{conversionRate}%</p>
            <p className="text-sm text-muted-foreground">コード利用率</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Referral Codes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">紹介コード一覧</h2>
          <Button onClick={() => setShowCreateDialog(true)} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            紹介コード発行
          </Button>
        </div>

        {referralCodes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="mb-4 h-12 w-12" />
              <p>紹介プログラムのコードがまだありません</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {referralCodes.map((rc) => (
              <Card key={rc.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {rc.customer?.name || "不明"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-0.5 text-sm font-mono">
                          {rc.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCode(rc.code, rc.id)}
                          className="h-7 w-7 p-0"
                        >
                          {copiedId === rc.id ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Badge variant="secondary">
                          紹介 {rc.referral_count}件
                        </Badge>
                      </div>

                      {rc.reward_coupon && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Gift className="h-3 w-3" />
                          特典: {rc.reward_coupon.title}
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadReferrals(rc.id)}
                        className="h-8 w-8 p-0"
                      >
                        {expandedCodeId === rc.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteReferralCode(rc.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded referral list */}
                  {expandedCodeId === rc.id && (
                    <div className="mt-4 border-t pt-4">
                      {loadingReferrals === rc.id ? (
                        <div className="flex justify-center py-4">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                      ) : (referrals[rc.id] || []).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          紹介はまだありません
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {(referrals[rc.id] || []).map((ref) => {
                            const statusInfo = STATUS_MAP[ref.status] || STATUS_MAP.signed_up;
                            return (
                              <div
                                key={ref.id}
                                className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm"
                              >
                                <div>
                                  <span className="font-medium">
                                    {ref.referred_customer?.name || "不明"}
                                  </span>
                                  {ref.referred_customer?.email && (
                                    <span className="ml-2 text-muted-foreground">
                                      {ref.referred_customer.email}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">
                                    {new Date(ref.created_at).toLocaleDateString("ja-JP")}
                                  </span>
                                  <Badge variant={statusInfo.variant}>
                                    {statusInfo.label}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>紹介コード発行</DialogTitle>
            <DialogDescription>
              顧客に紹介コードを発行します。紹介された方が登録するとカウントされます。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer">顧客を選択 *</Label>
              <select
                id="customer"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">選択してください</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.email ? `(${c.email})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ref-coupon">紹介特典クーポン（任意）</Label>
              <select
                id="ref-coupon"
                value={selectedCouponId}
                onChange={(e) => setSelectedCouponId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">なし</option>
                {coupons.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-md bg-muted p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LinkIcon className="h-4 w-4" />
                コードは自動生成されます（例: REF-A3K7P2）
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={createReferralCode}
              disabled={!selectedCustomerId || creating}
            >
              {creating ? "作成中..." : "コードを発行"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// Campaigns Tab
// ============================================================

function CampaignsTab({
  campaigns,
  setCampaigns,
  campaignCoupons,
  username,
}: {
  campaigns: CampaignPage[];
  setCampaigns: React.Dispatch<React.SetStateAction<CampaignPage[]>>;
  campaignCoupons: Coupon[];
  username: string;
}) {
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<CampaignFormState>(defaultCampaignForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  function openCreateDialog() {
    setForm(defaultCampaignForm);
    setIsEditing(false);
    setFormError("");
    setShowDialog(true);
  }

  function openEditDialog(campaign: CampaignPage) {
    setForm({
      id: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      description: campaign.description || "",
      hero_image_url: campaign.hero_image_url || "",
      cta_text: campaign.cta_text,
      cta_url: campaign.cta_url || "",
      coupon_id: campaign.coupon_id || "",
      expires_at: campaign.expires_at ? campaign.expires_at.split("T")[0] : "",
      template: campaign.template,
      is_published: campaign.is_published,
    });
    setIsEditing(true);
    setFormError("");
    setShowDialog(true);
  }

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      ...(!isEditing && prev.slug === slugify(prev.title)
        ? { slug: slugify(title) }
        : {}),
    }));
  }

  async function handleSave() {
    setFormError("");

    if (!form.title.trim()) {
      setFormError("タイトルを入力してください");
      return;
    }
    if (!form.slug.trim()) {
      setFormError("スラッグを入力してください");
      return;
    }

    setSaving(true);

    const payload = {
      ...form,
      coupon_id: form.coupon_id || null,
      expires_at: form.expires_at || null,
      hero_image_url: form.hero_image_url || null,
      cta_url: form.cta_url || null,
    };

    try {
      if (isEditing && form.id) {
        const res = await fetch("/api/campaigns", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: form.id, ...payload }),
        });

        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || "更新に失敗しました");
          setSaving(false);
          return;
        }

        setCampaigns((prev) =>
          prev.map((c) => (c.id === form.id ? data.campaign : c))
        );
      } else {
        const res = await fetch("/api/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || "作成に失敗しました");
          setSaving(false);
          return;
        }

        setCampaigns((prev) => [data.campaign, ...prev]);
      }

      setShowDialog(false);
    } catch {
      setFormError("ネットワークエラーが発生しました");
      toast.error("ネットワークエラーが発生しました");
    }

    setSaving(false);
  }

  async function deleteCampaign(id: string) {
    try {
      const res = await fetch(`/api/campaigns?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
      } else {
        toast.error("キャンペーンの削除に失敗しました");
      }
    } catch {
      toast.error("キャンペーンの削除に失敗しました");
    }
  }

  async function togglePublished(campaign: CampaignPage) {
    try {
      const res = await fetch("/api/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: campaign.id,
          is_published: !campaign.is_published,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaign.id ? data.campaign : c))
        );
      } else {
        toast.error("公開状態の変更に失敗しました");
      }
    } catch {
      toast.error("公開状態の変更に失敗しました");
    }
  }

  function isExpired(expiresAt: string | null): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">キャンペーン一覧</h2>
        <Button onClick={openCreateDialog} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          新規キャンペーン
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Megaphone className="mb-4 h-12 w-12" />
            <p>キャンペーンページがまだありません</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => {
            const expired = isExpired(campaign.expires_at);
            const publicUrl = `/c/${username}/${campaign.slug}`;

            return (
              <Card key={campaign.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">{campaign.title}</h3>
                        {campaign.is_published ? (
                          <Badge variant="default">公開中</Badge>
                        ) : (
                          <Badge variant="secondary">下書き</Badge>
                        )}
                        {expired && (
                          <Badge variant="destructive">期限切れ</Badge>
                        )}
                        <Badge variant="outline">
                          {TEMPLATE_OPTIONS.find((t) => t.value === campaign.template)?.label || campaign.template}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          /{campaign.slug}
                        </code>
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" />
                          プレビュー
                        </a>
                      </div>

                      {campaign.expires_at && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          期限: {new Date(campaign.expires_at).toLocaleDateString("ja-JP")}
                        </div>
                      )}

                      {campaign.coupon && (
                        <div className="text-sm text-muted-foreground">
                          クーポン: {campaign.coupon.title}
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePublished(campaign)}
                        className="h-8 w-8 p-0"
                        title={campaign.is_published ? "非公開にする" : "公開する"}
                      >
                        {campaign.is_published ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(campaign)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCampaign(campaign.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "キャンペーン編集" : "新規キャンペーン"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "キャンペーンページの内容を編集します"
                : "新しいキャンペーンランディングページを作成します"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="cam-title">タイトル *</Label>
              <Input
                id="cam-title"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="春の特別キャンペーン"
                maxLength={200}
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="cam-slug">スラッグ（URL） *</Label>
              <Input
                id="cam-slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))
                }
                placeholder="spring-campaign"
                maxLength={100}
              />
              {form.slug && username && (
                <p className="text-xs text-muted-foreground">
                  URL: /c/{username}/{form.slug}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="cam-description">説明</Label>
              <Textarea
                id="cam-description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="キャンペーンの詳細を入力..."
                rows={4}
                maxLength={5000}
              />
            </div>

            {/* Hero Image URL */}
            <div className="space-y-2">
              <Label htmlFor="cam-hero-image">ヒーロー画像URL</Label>
              <Input
                id="cam-hero-image"
                value={form.hero_image_url}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, hero_image_url: e.target.value }))
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* CTA Text */}
            <div className="space-y-2">
              <Label htmlFor="cam-cta-text">CTAボタンのテキスト</Label>
              <Input
                id="cam-cta-text"
                value={form.cta_text}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, cta_text: e.target.value }))
                }
                placeholder="予約する"
                maxLength={100}
              />
            </div>

            {/* CTA URL */}
            <div className="space-y-2">
              <Label htmlFor="cam-cta-url">CTAリンク先URL（空欄でプロフィールページ）</Label>
              <Input
                id="cam-cta-url"
                value={form.cta_url}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, cta_url: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>

            {/* Coupon */}
            <div className="space-y-2">
              <Label htmlFor="cam-coupon">クーポン（任意）</Label>
              <select
                id="cam-coupon"
                value={form.coupon_id}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, coupon_id: e.target.value }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">なし</option>
                {campaignCoupons.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Expiry */}
            <div className="space-y-2">
              <Label htmlFor="cam-expires">期限日（任意）</Label>
              <Input
                id="cam-expires"
                type="date"
                value={form.expires_at}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, expires_at: e.target.value }))
                }
              />
            </div>

            {/* Template */}
            <div className="space-y-2">
              <Label>テンプレート</Label>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATE_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, template: t.value }))
                    }
                    className={`rounded-md border p-3 text-left text-sm transition-colors ${
                      form.template === t.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Published toggle */}
            <div className="flex items-center justify-between">
              <Label>公開する</Label>
              <Button
                type="button"
                variant={form.is_published ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setForm((prev) => ({ ...prev, is_published: !prev.is_published }))
                }
              >
                {form.is_published ? "公開" : "下書き"}
              </Button>
            </div>

            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving
                ? "保存中..."
                : isEditing
                  ? "更新する"
                  : "作成する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function ReferralsAndCampaignsPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const defaultTab = tabParam === "campaigns" ? "campaigns" : "referrals";

  const { isPro } = useProStatus();

  // Shared loading state
  const [loading, setLoading] = useState(true);

  // Referrals state
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [referralCoupons, setReferralCoupons] = useState<Coupon[]>([]);
  const [referralEnabled, setReferralEnabled] = useState(false);

  // Campaigns state
  const [campaigns, setCampaigns] = useState<CampaignPage[]>([]);
  const [campaignCoupons, setCampaignCoupons] = useState<Coupon[]>([]);
  const [username, setUsername] = useState("");

  const loadData = useCallback(async () => {
    // --- Referrals data ---
    const codesRes = await fetch("/api/referrals");
    if (codesRes.ok) {
      const codesData = await codesRes.json();
      setReferralCodes(codesData.referral_codes || []);
      setReferralEnabled(codesData.referral_enabled ?? false);
    }

    const custRes = await fetch("/api/customers");
    if (custRes.ok) {
      const custData = await custRes.json();
      setCustomers(custData.customers || []);
    }

    const couponsRes = await fetch("/api/coupons");
    if (couponsRes.ok) {
      const couponsData = await couponsRes.json();
      setReferralCoupons((couponsData.coupons as Coupon[]) || []);
    }

    // --- Campaigns data ---
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileData) {
        const p = profileData as Profile;

        const camRes = await fetch("/api/campaigns");
        if (camRes.ok) {
          const camData = await camRes.json();
          setCampaigns(camData.campaigns || []);
          setUsername(camData.username || p.username);
        }

        const { data: couponsData } = await supabase
          .from("coupons")
          .select("*")
          .eq("profile_id", p.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        setCampaignCoupons((couponsData as Coupon[]) || []);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">紹介・キャンペーン</h1>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">紹介・キャンペーン</h1>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="w-full">
          <TabsTrigger value="referrals" className="flex-1">
            紹介プログラム
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex-1">
            キャンペーン
          </TabsTrigger>
        </TabsList>

        <TabsContent value="referrals">
          <ProGate isPro={isPro} feature="紹介プログラム">
            <ReferralsTab
              referralCodes={referralCodes}
              setReferralCodes={setReferralCodes}
              customers={customers}
              coupons={referralCoupons}
              referralEnabled={referralEnabled}
              setReferralEnabled={setReferralEnabled}
            />
          </ProGate>
        </TabsContent>

        <TabsContent value="campaigns">
          <ProGate isPro={isPro} feature="キャンペーンページ">
            <CampaignsTab
              campaigns={campaigns}
              setCampaigns={setCampaigns}
              campaignCoupons={campaignCoupons}
              username={username}
            />
          </ProGate>
        </TabsContent>
      </Tabs>
    </div>
  );
}
