"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Profile, StampCard, Coupon, CustomerStamp, StampMilestone } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Stamp,
  Plus,
  Trash2,
  QrCode,
  Download,
  Users,
  Gift,
  Tag,
  Ticket,
  ChevronLeft,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import QRCode from "qrcode";
import { APP_URL } from "@/lib/constants";
import { apiFetch } from "@/lib/api-client";
import { useProStatus } from "@/hooks/use-pro-status";
import { LimitBanner } from "@/components/dashboard/pro-gate";
import { FREE_LIMITS } from "@/lib/pro-gate";
import { useTranslation } from "@/lib/i18n/client";

// ─── Constants ───

const ICON_OPTIONS = [
  { value: "star", emoji: "\u2B50" },
  { value: "coffee", emoji: "\u2615" },
  { value: "haircut", emoji: "\uD83D\uDC87" },
  { value: "muscle", emoji: "\uD83D\uDCAA" },
  { value: "pizza", emoji: "\uD83C\uDF55" },
  { value: "music", emoji: "\uD83C\uDFB5" },
  { value: "book", emoji: "\uD83D\uDCDA" },
  { value: "flower", emoji: "\uD83C\uDF38" },
  { value: "gift", emoji: "\uD83C\uDF81" },
  { value: "diamond", emoji: "\uD83D\uDC8E" },
  { value: "trophy", emoji: "\uD83C\uDFC6" },
  { value: "heart", emoji: "\u2764\uFE0F" },
];

const COLOR_OPTIONS = [
  "#6366f1", // indigo
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
];

function getIconEmoji(value: string): string {
  return ICON_OPTIONS.find((i) => i.value === value)?.emoji || "\u2B50";
}

// ─── Types ───

interface StampCardWithCount extends StampCard {
  customer_count: number;
}

interface CustomerStampWithCustomer extends Omit<CustomerStamp, "customer"> {
  customer?: { id: string; name: string; email: string | null };
}

// ─── Main Page ───

export default function StampsPage() {
  const { t } = useTranslation();
  const { isPro, stampCardCount, couponCount } = useProStatus();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stamps");

  // Stamp cards
  const [stampCards, setStampCards] = useState<StampCardWithCount[]>([]);
  const [stampCardEnabled, setStampCardEnabled] = useState(false);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [selectedCard, setSelectedCard] = useState<StampCardWithCount | null>(null);

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponEnabled, setCouponEnabled] = useState(false);
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
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
    setStampCardEnabled(p.stamp_card_enabled);
    setCouponEnabled(p.coupon_enabled);

    // Load stamp cards
    await loadStampCards();
    // Load coupons
    await loadCoupons();

    setLoading(false);
  }

  async function loadStampCards() {
    try {
      const res = await apiFetch("/api/stamp-cards");
      if (res.ok) {
        const data = await res.json();
        setStampCards(data.cards || []);
      }
    } catch {
      // ignore
    }
  }

  async function loadCoupons() {
    try {
      const res = await apiFetch("/api/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch {
      // ignore
    }
  }

  async function toggleStampCardEnabled() {
    if (!profile) return;
    const newVal = !stampCardEnabled;
    setStampCardEnabled(newVal);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ stamp_card_enabled: newVal })
      .eq("id", profile.id);
  }

  async function toggleCouponEnabled() {
    if (!profile) return;
    const newVal = !couponEnabled;
    setCouponEnabled(newVal);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ coupon_enabled: newVal })
      .eq("id", profile.id);
  }

  async function deleteStampCard(id: string) {
    if (!confirm(t("confirmDeleteStampCard"))) return;
    const res = await apiFetch(`/api/stamp-cards?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setStampCards((prev) => prev.filter((c) => c.id !== id));
      if (selectedCard?.id === id) setSelectedCard(null);
    }
  }

  async function deleteCoupon(id: string) {
    if (!confirm(t("confirmDeleteCoupon"))) return;
    const res = await apiFetch(`/api/coupons?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    }
  }

  async function toggleCouponActive(coupon: Coupon) {
    const res = await apiFetch("/api/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: coupon.id, is_active: !coupon.is_active }),
    });
    if (res.ok) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === coupon.id ? { ...c, is_active: !c.is_active } : c
        )
      );
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">{t("stampsAndCoupons")}</h1>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  // ── Card Detail View ──

  if (selectedCard) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <button
          onClick={() => setSelectedCard(null)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("backToStampCardList")}
        </button>
        <StampCardDetail
          card={selectedCard}
          onStampAdded={() => loadStampCards()}
        />
      </div>
    );
  }

  // ── Main View ──

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{t("stampsAndCoupons")}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="stamps" className="gap-1.5">
            <Stamp className="h-4 w-4" />
            {t("stampCardTab")}
          </TabsTrigger>
          <TabsTrigger value="coupons" className="gap-1.5">
            <Ticket className="h-4 w-4" />
            {t("couponTab")}
          </TabsTrigger>
        </TabsList>

        {/* ═══ Stamp Card Tab ═══ */}
        <TabsContent value="stamps" className="mt-4 space-y-4">
          {/* Enable toggle */}
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{t("showStampCardOnPublicPage")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("showStampCardOnPublicPageDesc")}
                </p>
              </div>
              <Button
                variant={stampCardEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleStampCardEnabled}
                className="gap-1.5"
              >
                {stampCardEnabled ? (
                  <>
                    <ToggleRight className="h-4 w-4" />
                    {t("enabled")}
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-4 w-4" />
                    {t("disabled")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Create button */}
          <LimitBanner current={stampCardCount} max={FREE_LIMITS.stampCards} label={t("stampCardLabel")} isPro={isPro} />
          <Button
            onClick={() => setShowCreateCard(true)}
            className="gap-1.5"
            disabled={!isPro && stampCardCount >= FREE_LIMITS.stampCards}
          >
            <Plus className="h-4 w-4" />
            {t("newStampCard")}
          </Button>

          {/* Stamp card list */}
          {stampCards.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Stamp className="mb-4 h-12 w-12" />
                <p>{t("noStampCardsYet")}</p>
                <p className="mt-1 text-sm">{t("noStampCardsHint")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {stampCards.map((card) => (
                <Card
                  key={card.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => setSelectedCard(card)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                          style={{ backgroundColor: card.color + "20", color: card.color }}
                        >
                          {getIconEmoji(card.icon)}
                        </div>
                        <div>
                          <p className="font-medium">{card.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {t("stampsForReward", { count: String(card.total_stamps_required) })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={card.is_active ? "default" : "secondary"}>
                          {card.is_active ? t("enabled") : t("disabled")}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          {card.customer_count}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteStampCard(card.id);
                          }}
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

        {/* ═══ Coupon Tab ═══ */}
        <TabsContent value="coupons" className="mt-4 space-y-4">
          {/* Enable toggle */}
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{t("enableCouponFeature")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("enableCouponFeatureDesc")}
                </p>
              </div>
              <Button
                variant={couponEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleCouponEnabled}
                className="gap-1.5"
              >
                {couponEnabled ? (
                  <>
                    <ToggleRight className="h-4 w-4" />
                    {t("enabled")}
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-4 w-4" />
                    {t("disabled")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Create button */}
          <LimitBanner current={couponCount} max={FREE_LIMITS.coupons} label={t("couponLabel")} isPro={isPro} />
          <Button
            onClick={() => setShowCreateCoupon(true)}
            className="gap-1.5"
            disabled={!isPro && couponCount >= FREE_LIMITS.coupons}
          >
            <Plus className="h-4 w-4" />
            {t("newCoupon")}
          </Button>

          {/* Coupon list */}
          {coupons.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Ticket className="mb-4 h-12 w-12" />
                <p>{t("noCouponsYet")}</p>
                <p className="mt-1 text-sm">{t("noCouponsHint")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <Card key={coupon.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{coupon.title}</span>
                          <Badge variant={coupon.is_active ? "default" : "secondary"}>
                            {coupon.is_active ? t("enabled") : t("disabled")}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                            {coupon.code}
                          </span>
                          <span>{formatDiscount(coupon, t)}</span>
                          <span>
                            {t("usageCount", {
                              used: String(coupon.times_used),
                              limit: coupon.usage_limit != null ? `/${coupon.usage_limit}` : "",
                            })}
                          </span>
                          {coupon.expires_at && (
                            <span>
                              {t("expiresAt", { date: new Date(coupon.expires_at).toLocaleDateString("ja-JP") })}
                            </span>
                          )}
                        </div>
                        {coupon.description && (
                          <p className="text-sm text-muted-foreground">{coupon.description}</p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleCouponActive(coupon)}
                          title={coupon.is_active ? t("deactivate") : t("activate")}
                        >
                          {coupon.is_active ? (
                            <ToggleRight className="h-4 w-4 text-primary" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteCoupon(coupon.id)}
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
      </Tabs>

      {/* ═══ Create Stamp Card Dialog ═══ */}
      <CreateStampCardDialog
        open={showCreateCard}
        onOpenChange={setShowCreateCard}
        coupons={coupons}
        onCreated={(card) => {
          setStampCards((prev) => [{ ...card, customer_count: 0 }, ...prev]);
          setShowCreateCard(false);
        }}
      />

      {/* ═══ Create Coupon Dialog ═══ */}
      <CreateCouponDialog
        open={showCreateCoupon}
        onOpenChange={setShowCreateCoupon}
        onCreated={(coupon) => {
          setCoupons((prev) => [coupon, ...prev]);
          setShowCreateCoupon(false);
        }}
      />
    </div>
  );
}

// ─── Helpers ───

function formatDiscount(coupon: Coupon, t: (key: string, replacements?: Record<string, string>) => string): string {
  switch (coupon.discount_type) {
    case "percentage":
      return t("percentOff", { value: String(coupon.discount_value) });
    case "fixed":
      return t("fixedOff", { value: String(coupon.discount_value?.toLocaleString()) });
    case "free_service":
      return t("freeService");
    default:
      return "";
  }
}

// ─── Create Stamp Card Dialog ───

function CreateStampCardDialog({
  open,
  onOpenChange,
  coupons,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupons: Coupon[];
  onCreated: (card: StampCard) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [totalStamps, setTotalStamps] = useState(10);
  const [icon, setIcon] = useState("star");
  const [color, setColor] = useState("#6366f1");
  const [rewardType, setRewardType] = useState<"coupon" | "free_service" | "custom">("custom");
  const [rewardCouponId, setRewardCouponId] = useState("");
  const [rewardDescription, setRewardDescription] = useState("");
  const [milestones, setMilestones] = useState<StampMilestone[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setName("");
    setTotalStamps(10);
    setIcon("star");
    setColor("#6366f1");
    setRewardType("custom");
    setRewardCouponId("");
    setRewardDescription("");
    setMilestones([]);
    setError("");
  }

  function addMilestone() {
    setMilestones((prev) => [...prev, { at: 5, reward: "" }]);
  }

  function updateMilestone(index: number, field: keyof StampMilestone, value: string | number) {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  }

  function removeMilestone(index: number) {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!name.trim()) {
      setError(t("cardNameRequired"));
      return;
    }
    if (totalStamps < 2) {
      setError(t("minStampsRequired"));
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await apiFetch("/api/stamp-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          total_stamps_required: totalStamps,
          icon,
          color,
          reward_type: rewardType,
          reward_coupon_id: rewardType === "coupon" ? rewardCouponId || null : null,
          reward_description: rewardDescription || null,
          milestones,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t("createFailed"));
      }

      const data = await res.json();
      onCreated(data.card);
      reset();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("createFailed");
      setError(msg);
      toast.error(msg);
      return;
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("newStampCardDialogTitle")}</DialogTitle>
          <DialogDescription>{t("newStampCardDialogDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          {/* Card name */}
          <div className="space-y-2">
            <Label>{t("cardName")}</Label>
            <Input
              placeholder={t("cardNamePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Total stamps */}
          <div className="space-y-2">
            <Label>{t("requiredStamps")}</Label>
            <Input
              type="number"
              min={2}
              max={100}
              value={totalStamps}
              onChange={(e) => setTotalStamps(Number(e.target.value))}
            />
          </div>

          {/* Icon selector */}
          <div className="space-y-2">
            <Label>{t("icon")}</Label>
            <div className="grid grid-cols-6 gap-2">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setIcon(opt.value)}
                  className={`flex h-10 items-center justify-center rounded-lg border text-xl transition-colors ${
                    icon === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {opt.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label>{t("themeColor")}</Label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border-2 transition-transform ${
                    color === c ? "scale-110 border-foreground" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Reward type */}
          <div className="space-y-2">
            <Label>{t("rewardType")}</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "coupon" as const, label: t("rewardTypeCoupon") },
                { value: "free_service" as const, label: t("rewardTypeFreeService") },
                { value: "custom" as const, label: t("rewardTypeCustom") },
              ].map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={rewardType === opt.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRewardType(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Coupon selector */}
          {rewardType === "coupon" && (
            <div className="space-y-2">
              <Label>{t("linkedCoupon")}</Label>
              {coupons.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("createCouponFirst")}
                </p>
              ) : (
                <select
                  value={rewardCouponId}
                  onChange={(e) => setRewardCouponId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">{t("selectPlease")}</option>
                  {coupons.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.code})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Reward description */}
          <div className="space-y-2">
            <Label>{t("rewardDescription")}</Label>
            <Input
              placeholder={t("rewardDescriptionPlaceholder")}
              value={rewardDescription}
              onChange={(e) => setRewardDescription(e.target.value)}
            />
          </div>

          <Separator />

          {/* Milestones */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t("milestonesIntermediate")}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMilestone} className="gap-1">
                <Plus className="h-3.5 w-3.5" />
                {t("add")}
              </Button>
            </div>
            {milestones.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("milestonesHint")}
              </p>
            )}
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={totalStamps - 1}
                  value={m.at}
                  onChange={(e) => updateMilestone(i, "at", Number(e.target.value))}
                  className="w-20"
                  placeholder={t("milestonesStampCount")}
                />
                <span className="shrink-0 text-sm text-muted-foreground">{t("atStamps")}</span>
                <Input
                  value={m.reward}
                  onChange={(e) => updateMilestone(i, "reward", e.target.value)}
                  placeholder={t("milestoneRewardPlaceholder")}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeMilestone(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? t("creating") : t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Create Coupon Dialog ───

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function CreateCouponDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (coupon: Coupon) => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [code, setCode] = useState(() => generateCode());
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed" | "free_service">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [expiresAt, setExpiresAt] = useState("");
  const [usageLimit, setUsageLimit] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setTitle("");
    setCode(generateCode());
    setDescription("");
    setDiscountType("percentage");
    setDiscountValue(10);
    setExpiresAt("");
    setUsageLimit("");
    setError("");
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setError(t("couponTitleRequired"));
      return;
    }
    if (!code.trim()) {
      setError(t("couponCodeRequired"));
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await apiFetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          code: code.trim(),
          description: description.trim() || null,
          discount_type: discountType,
          discount_value: discountType === "free_service" ? null : discountValue,
          expires_at: expiresAt || null,
          usage_limit: usageLimit ? Number(usageLimit) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t("createFailed"));
      }

      const data = await res.json();
      onCreated(data.coupon);
      reset();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("createFailed");
      setError(msg);
      toast.error(msg);
      return;
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("newCouponDialogTitle")}</DialogTitle>
          <DialogDescription>{t("newCouponDialogDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label>{t("couponTitle")}</Label>
            <Input
              placeholder={t("couponTitlePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Code */}
          <div className="space-y-2">
            <Label>{t("couponCode")}</Label>
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCode(generateCode())}
                className="shrink-0"
              >
                {t("autoGenerate")}
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>{t("couponDescription")}</Label>
            <Input
              placeholder={t("couponDescriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Separator />

          {/* Discount type */}
          <div className="space-y-2">
            <Label>{t("discountType")}</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "percentage" as const, label: t("discountTypePercentage") },
                { value: "fixed" as const, label: t("discountTypeFixed") },
                { value: "free_service" as const, label: t("discountTypeFreeService") },
              ].map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={discountType === opt.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDiscountType(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Discount value */}
          {discountType !== "free_service" && (
            <div className="space-y-2">
              <Label>
                {discountType === "percentage" ? t("discountRate") : t("discountAmount")}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">
                  {discountType === "percentage" ? t("percentUnit") : t("yenUnit")}
                </span>
              </div>
            </div>
          )}

          {/* Expiry */}
          <div className="space-y-2">
            <Label>{t("expiryOptional")}</Label>
            <Input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          {/* Usage limit */}
          <div className="space-y-2">
            <Label>{t("usageLimitOptional")}</Label>
            <Input
              type="number"
              min={1}
              placeholder={t("unlimited")}
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              className="w-32"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? t("creating") : t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Stamp Card Detail View ───

function StampCardDetail({
  card,
  onStampAdded,
}: {
  card: StampCardWithCount;
  onStampAdded: () => void;
}) {
  const { t } = useTranslation();
  const [stamps, setStamps] = useState<CustomerStampWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrSrc, setQrSrc] = useState("");
  const [copied, setCopied] = useState(false);
  const [stampingCustomerId, setStampingCustomerId] = useState<string | null>(null);
  const [stampNote, setStampNote] = useState("");
  const [stampResult, setStampResult] = useState<string | null>(null);

  const stampUrl = `${APP_URL}/stamp/${card.id}`;

  useEffect(() => {
    loadStamps();
    generateQR();
  }, [card.id]);

  async function loadStamps() {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/stamp-cards/stamp?stamp_card_id=${card.id}`);
      if (res.ok) {
        const data = await res.json();
        setStamps(data.stamps || []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  async function generateQR() {
    try {
      const src = await QRCode.toDataURL(stampUrl, {
        width: 200,
        margin: 2,
        errorCorrectionLevel: "M",
      });
      setQrSrc(src);
    } catch {
      // ignore
    }
  }

  async function handleDownloadQR() {
    try {
      const src = await QRCode.toDataURL(stampUrl, {
        width: 400,
        margin: 2,
        errorCorrectionLevel: "M",
      });
      const a = document.createElement("a");
      a.href = src;
      a.download = `stamp-card-${card.name}.png`;
      a.click();
    } catch {
      // ignore
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(stampUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function addStamp(customerId: string) {
    setStampingCustomerId(customerId);
    setStampResult(null);

    try {
      const res = await apiFetch("/api/stamp-cards/stamp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stamp_card_id: card.id,
          customer_id: customerId,
          note: stampNote || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStampResult(data.error || t("addStampFailed"));
        return;
      }

      const data = await res.json();

      if (data.completed) {
        setStampResult(t("cardCompleted", { reward: data.reward_description || t("cardCompletedDefault") }));
      } else if (data.milestone) {
        setStampResult(t("milestoneReached", { reward: data.milestone.reward }));
      } else {
        setStampResult(t("stampAdded"));
      }

      // Refresh stamps
      await loadStamps();
      onStampAdded();
    } catch {
      setStampResult(t("addStampFailed"));
      toast.error(t("addStampFailed"));
    } finally {
      setStampingCustomerId(null);
      setStampNote("");
      // Clear result after a few seconds
      setTimeout(() => setStampResult(null), 3000);
    }
  }

  return (
    <div className="space-y-6">
      {/* Card Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
              style={{ backgroundColor: card.color + "20", color: card.color }}
            >
              {getIconEmoji(card.icon)}
            </div>
            <div>
              <CardTitle>{card.name}</CardTitle>
              <CardDescription>
                {t("stampsForReward", { count: String(card.total_stamps_required) })} |
                {card.reward_description && ` ${card.reward_description}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* QR Code & URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <QrCode className="h-4 w-4" />
            {t("qrCode")}
          </CardTitle>
          <CardDescription>{t("qrCodeDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-5">
            <div className="shrink-0 overflow-hidden rounded-lg border bg-white p-2">
              {qrSrc ? (
                <img src={qrSrc} alt="QR Code" width={150} height={150} className="block" />
              ) : (
                <div className="h-[150px] w-[150px] animate-pulse rounded bg-muted" />
              )}
            </div>
            <div className="flex flex-col gap-3">
              <div className="rounded-md bg-muted px-3 py-2 text-xs font-mono text-muted-foreground break-all">
                {stampUrl}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? t("copied") : t("copyUrl")}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadQR} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  {t("download")}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones info */}
      {card.milestones && card.milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gift className="h-4 w-4" />
              {t("milestones")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {card.milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{t("stampsCount", { count: String(m.at) })}</Badge>
                  <span>{m.reward}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-sm">
                <Badge style={{ backgroundColor: card.color, color: "white" }}>
                  {t("stampsCount", { count: String(card.total_stamps_required) })}
                </Badge>
                <span className="font-medium">{card.reward_description || t("rewardEarned")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stamp result toast */}
      {stampResult && (
        <div className="rounded-md bg-primary/10 p-3 text-sm text-primary font-medium">
          {stampResult}
        </div>
      )}

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            {t("customerList")}
          </CardTitle>
          <CardDescription>{t("customersCount", { count: String(stamps.length) })}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : stamps.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t("noCustomersWithStamps")}
            </div>
          ) : (
            <div className="space-y-3">
              {stamps.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {s.customer?.name || t("unknown")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.customer?.email || ""}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {/* Visual stamps mini */}
                      <div className="flex gap-0.5">
                        {Array.from({ length: card.total_stamps_required }).map(
                          (_, i) => (
                            <div
                              key={i}
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor:
                                  i < s.current_stamps ? card.color : "#e5e7eb",
                              }}
                            />
                          )
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {s.current_stamps}/{card.total_stamps_required}
                      </span>
                      {s.completed_count > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {t("timesCompleted", { count: String(s.completed_count) })}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addStamp(s.customer_id)}
                    disabled={stampingCustomerId === s.customer_id}
                    className="gap-1 shrink-0"
                  >
                    <Stamp className="h-3.5 w-3.5" />
                    {stampingCustomerId === s.customer_id ? "..." : t("stampButton")}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
