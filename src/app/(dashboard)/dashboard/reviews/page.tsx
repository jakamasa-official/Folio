"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Star,
  MessageSquare,
  Send,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Mail,
  QrCode,
  Download,
  ShieldCheck,
} from "lucide-react";
import QRCode from "qrcode";
import { APP_URL } from "@/lib/constants";
import { SocialProofEmbed } from "@/components/dashboard/social-proof-embed";
import { apiFetch } from "@/lib/api-client";
import { useProStatus } from "@/hooks/use-pro-status";
import { ProGate } from "@/components/dashboard/pro-gate";
import { useTranslation } from "@/lib/i18n/client";

// ─── Types ─────────────────────────────────────────────

interface Review {
  id: string;
  profile_id: string;
  customer_id: string | null;
  reviewer_name: string;
  reviewer_email: string | null;
  rating: number;
  title: string | null;
  body: string;
  source: string;
  status: string;
  is_featured: boolean;
  service_tags: string[];
  response: string | null;
  response_at: string | null;
  verified: boolean;
  token: string | null;
  created_at: string;
  updated_at: string;
}

interface ReviewStats {
  totalCount: number;
  approvedCount: number;
  averageRating: number;
  distribution: Record<number, number>;
}

interface ReviewSettings {
  profile_id: string;
  reviews_enabled: boolean;
  auto_approve: boolean;
  min_rating_to_show: number;
  review_prompt_text: string;
  display_style: string;
  show_aggregate_rating: boolean;
  request_after_booking: boolean;
  request_delay_hours: number;
}

interface Customer {
  id: string;
  name: string;
  email: string | null;
}

// ─── Helpers ───────────────────────────────────────────

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "h-6 w-6" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function SourceBadge({ source }: { source: string }) {
  const { t } = useTranslation();
  const labelKeys: Record<string, string> = {
    direct: "reviews.sourceDirect",
    request: "reviews.sourceRequest",
    manual: "reviews.sourceManual",
    qr_code: "reviews.sourceQr",
  };
  return (
    <Badge variant="secondary" className="text-xs">
      {labelKeys[source] ? t(labelKeys[source]) : source}
    </Badge>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Main Page ─────────────────────────────────────────

export default function ReviewsPage() {
  const { t } = useTranslation();
  const { isPro } = useProStatus();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalCount: 0,
    approvedCount: 0,
    averageRating: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [settings, setSettings] = useState<ReviewSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string>("");

  const fetchReviews = useCallback(async () => {
    try {
      const res = await apiFetch("/api/reviews");
      const data = await res.json();
      if (res.ok) {
        // Filter out placeholder request reviews (body === "pending_request")
        const realReviews = (data.reviews || []).filter(
          (r: Review) => r.body !== "pending_request"
        );
        setReviews(realReviews);
        setStats(data.stats || stats);
        if (realReviews.length > 0) {
          setProfileId(realReviews[0].profile_id);
        }
      }
    } catch {
      toast.error(t("reviews.fetchError"));
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSettings = useCallback(async () => {
    try {
      const res = await apiFetch("/api/reviews/settings");
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        if (data.settings?.profile_id) {
          setProfileId(data.settings.profile_id);
        }
      }
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    fetchReviews();
    fetchSettings();
  }, [fetchReviews, fetchSettings]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold">{t("reviews.title")}</h1>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">{t("reviews.title")}</h1>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t("reviews.tabOverview")}</TabsTrigger>
          <TabsTrigger value="manage">{t("reviews.tabManage")}</TabsTrigger>
          <TabsTrigger value="request">{t("reviews.tabRequest")}</TabsTrigger>
          <TabsTrigger value="settings">{t("reviews.tabSettings")}</TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Overview ─── */}
        <TabsContent value="overview">
          <OverviewTab reviews={reviews} stats={stats} />
        </TabsContent>

        {/* ─── Tab 2: Manage ─── */}
        <TabsContent value="manage">
          <ManageTab
            reviews={reviews}
            onUpdate={fetchReviews}
          />
        </TabsContent>

        {/* ─── Tab 3: Request ─── */}
        <TabsContent value="request">
          <ProGate isPro={isPro} feature={t("reviews.proFeature")}>
            <RequestTab profileId={profileId} reviews={reviews} />
          </ProGate>
        </TabsContent>

        {/* ─── Tab 4: Settings ─── */}
        <TabsContent value="settings">
          <SettingsTab settings={settings} onUpdate={fetchSettings} profileId={profileId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Overview Tab ──────────────────────────────────────

function OverviewTab({
  reviews,
  stats,
}: {
  reviews: Review[];
  stats: ReviewStats;
}) {
  const { t } = useTranslation();
  const maxDistribution = Math.max(...Object.values(stats.distribution), 1);

  return (
    <div className="space-y-6">
      {/* Aggregate rating */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <p className="text-4xl font-bold">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "-"}
            </p>
            <StarRating rating={Math.round(stats.averageRating)} size="md" />
            <p className="mt-1 text-sm text-muted-foreground">
              {t("reviews.averageRating")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <p className="text-4xl font-bold">{stats.approvedCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("reviews.publicReviews")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <p className="text-4xl font-bold">{stats.totalCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("reviews.totalReviews")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("reviews.ratingDistribution")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution[star] || 0;
              const pct = maxDistribution > 0 ? (count / maxDistribution) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-6 text-right text-sm font-medium">
                    {star}
                  </span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-yellow-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm text-muted-foreground">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("reviews.recentReviews")}</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t("reviews.noReviews")}
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review) => (
                <div
                  key={review.id}
                  className="border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} />
                    <span className="text-sm font-medium">
                      {review.reviewer_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.created_at)}
                    </span>
                    <Badge
                      variant={
                        review.status === "approved"
                          ? "default"
                          : review.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {review.status === "approved"
                        ? t("reviews.statusApproved")
                        : review.status === "pending"
                        ? t("reviews.statusPending")
                        : t("reviews.statusRejected")}
                    </Badge>
                  </div>
                  {review.title && (
                    <p className="mt-1 text-sm font-medium">{review.title}</p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {review.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Manage Tab ────────────────────────────────────────

function ManageTab({
  reviews,
  onUpdate,
}: {
  reviews: Review[];
  onUpdate: () => void;
}) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("all");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredReviews = reviews.filter((r) => {
    if (filter === "all") return true;
    if (filter === "pending") return r.status === "pending";
    if (filter === "approved") return r.status === "approved";
    if (filter === "rejected") return r.status === "rejected";
    return true;
  });

  async function updateReview(id: string, updates: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await apiFetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) {
        onUpdate();
        toast.success(t("reviews.updateSuccess"));
      } else {
        const data = await res.json();
        toast.error(data.error || t("reviews.updateError"));
      }
    } catch {
      toast.error(t("reviews.updateError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleReply(id: string) {
    if (!replyText.trim()) return;
    await updateReview(id, { response: replyText.trim() });
    setReplyingTo(null);
    setReplyText("");
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/reviews?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onUpdate();
        toast.success(t("reviews.deleteSuccess"));
        setDeleteTarget(null);
      }
    } catch {
      toast.error(t("reviews.deleteError"));
    } finally {
      setDeleting(false);
    }
  }

  const filterOptions = [
    { key: "all", label: t("reviews.filterAll") },
    { key: "pending", label: t("reviews.filterPending") },
    { key: "approved", label: t("reviews.filterApproved") },
    { key: "rejected", label: t("reviews.filterRejected") },
  ];

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filter === f.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {f.label}
            {f.key === "pending" && (
              <span className="ml-1">
                ({reviews.filter((r) => r.status === "pending").length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Review list */}
      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <MessageSquare className="mb-4 h-12 w-12" />
            <p>{t("reviews.emptyState")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-2">
                      <StarRating rating={review.rating} />
                      <span className="text-sm font-medium">
                        {review.reviewer_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.created_at)}
                      </span>
                      <SourceBadge source={review.source} />
                      {review.verified && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <ShieldCheck className="h-3 w-3" />
                          {t("reviews.verified")}
                        </Badge>
                      )}
                    </div>

                    {/* Title & body */}
                    {review.title && (
                      <p className="mt-2 text-sm font-medium">{review.title}</p>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {review.body}
                    </p>

                    {/* Service tags */}
                    {review.service_tags && review.service_tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {review.service_tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Owner response */}
                    {review.response && (
                      <div className="mt-3 rounded-md bg-muted/50 p-3">
                        <p className="text-xs font-medium text-muted-foreground">
                          {t("reviews.ownerReply")}
                        </p>
                        <p className="mt-1 text-sm">{review.response}</p>
                        {review.response_at && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatDate(review.response_at)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Reply textarea */}
                    {replyingTo === review.id && (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={t("reviews.replyPlaceholder")}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReply(review.id)}
                            disabled={saving || !replyText.trim()}
                          >
                            {saving ? t("reviews.replySending") : t("reviews.replyButton")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                          >
                            {t("reviews.cancelButton")}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {review.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            disabled={saving}
                            onClick={() =>
                              updateReview(review.id, {
                                status: "approved",
                              })
                            }
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            {t("reviews.approve")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={saving}
                            onClick={() =>
                              updateReview(review.id, {
                                status: "rejected",
                              })
                            }
                          >
                            <XCircle className="mr-1 h-3 w-3" />
                            {t("reviews.reject")}
                          </Button>
                        </>
                      )}
                      {review.status === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={saving}
                          onClick={() =>
                            updateReview(review.id, {
                              status: "rejected",
                            })
                          }
                        >
                          <XCircle className="mr-1 h-3 w-3" />
                          {t("reviews.makePrivate")}
                        </Button>
                      )}
                      {review.status === "rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={saving}
                          onClick={() =>
                            updateReview(review.id, {
                              status: "approved",
                            })
                          }
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          {t("reviews.makePublic")}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={review.is_featured ? "default" : "outline"}
                        disabled={saving}
                        onClick={() =>
                          updateReview(review.id, {
                            is_featured: !review.is_featured,
                          })
                        }
                      >
                        <Star
                          className={`mr-1 h-3 w-3 ${
                            review.is_featured
                              ? "fill-yellow-400 text-yellow-400"
                              : ""
                          }`}
                        />
                        {review.is_featured
                          ? t("reviews.unfeature")
                          : t("reviews.feature")}
                      </Button>
                      {replyingTo !== review.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReplyingTo(review.id);
                            setReplyText(review.response || "");
                          }}
                        >
                          <MessageSquare className="mr-1 h-3 w-3" />
                          {t("reviews.reply")}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteTarget(review)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("reviews.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {deleteTarget?.reviewer_name}
              {t("reviews.deleteConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t("reviews.cancelButton")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? t("reviews.deleting") : t("reviews.deleteButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Request Tab ───────────────────────────────────────

function RequestTab({
  profileId,
  reviews,
}: {
  profileId: string;
  reviews: Review[];
}) {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState<string | null>(null);
  const [qrSrc, setQrSrc] = useState("");

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await apiFetch("/api/customers");
        const data = await res.json();
        if (res.ok) {
          setCustomers(data.customers || []);
        }
      } catch {
        // Non-critical
      }
    }
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!profileId) return;
    const url = `${APP_URL}/review/${profileId}`;
    QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      errorCorrectionLevel: "M",
    }).then(setQrSrc);
  }, [profileId]);

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  async function handleSendRequest(customer: Customer) {
    if (!customer.email) {
      toast.error(t("reviews.noEmailError"));
      return;
    }
    setSending(customer.id);
    try {
      const res = await apiFetch("/api/reviews/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: customer.id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || t("reviews.requestSent"));
      } else {
        toast.error(data.error || t("reviews.sendError"));
      }
    } catch {
      toast.error(t("reviews.sendError"));
    } finally {
      setSending(null);
    }
  }

  // Sent requests (reviews with source='request' and token set)
  const sentRequests = reviews.filter(
    (r) => r.source === "request" && r.token
  );

  return (
    <div className="space-y-6">
      {/* Send request */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("reviews.requestTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("reviews.searchCustomerPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredCustomers.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t("reviews.noCustomersFound")}
            </p>
          ) : (
            <div className="max-h-[300px] space-y-2 overflow-y-auto">
              {filteredCustomers.slice(0, 20).map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{customer.name}</p>
                    {customer.email && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!customer.email || sending === customer.id}
                    onClick={() => handleSendRequest(customer)}
                  >
                    {sending === customer.id ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="mr-1 h-3 w-3" />
                    )}
                    {t("reviews.sendEmail")}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code */}
      {profileId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="h-4 w-4" />
              {t("reviews.qrTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              {qrSrc ? (
                <div className="overflow-hidden rounded-lg border bg-white p-2">
                  <img
                    src={qrSrc}
                    alt={t("reviews.qrAlt")}
                    width={200}
                    height={200}
                  />
                </div>
              ) : (
                <div className="h-[200px] w-[200px] animate-pulse rounded bg-muted" />
              )}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t("reviews.qrDescription")}
                </p>
                <p className="break-all text-xs text-muted-foreground">
                  {APP_URL}/review/{profileId}
                </p>
                {qrSrc && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = qrSrc;
                      link.download = "review-qr.png";
                      link.click();
                    }}
                  >
                    <Download className="h-4 w-4" />
                    {t("reviews.download")}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sent requests history */}
      {sentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("reviews.sentRequests")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sentRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {req.reviewer_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(req.created_at)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {t("reviews.awaitingResponse")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Settings Tab ──────────────────────────────────────

function SettingsTab({
  settings,
  onUpdate,
  profileId,
}: {
  settings: ReviewSettings | null;
  onUpdate: () => void;
  profileId: string;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<ReviewSettings>({
    profile_id: "",
    reviews_enabled: true,
    auto_approve: false,
    min_rating_to_show: 1,
    review_prompt_text:
      "サービスのご利用ありがとうございます。ぜひレビューをお寄せください。",
    display_style: "carousel",
    show_aggregate_rating: true,
    request_after_booking: false,
    request_delay_hours: 48,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await apiFetch("/api/reviews/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        onUpdate();
        toast.success(t("reviews.settingsSaved"));
      } else {
        const data = await res.json();
        toast.error(data.error || t("reviews.settingsSaveError"));
      }
    } catch {
      toast.error(t("reviews.settingsSaveError"));
    } finally {
      setSaving(false);
    }
  }

  function Toggle({
    checked,
    onChange,
    label,
    description,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    description?: string;
  }) {
    return (
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="text-sm font-medium">{label}</p>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
            checked ? "bg-primary" : "bg-gray-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Toggle
        checked={form.reviews_enabled}
        onChange={(v) => setForm({ ...form, reviews_enabled: v })}
        label={t("reviews.enableReviews")}
        description={t("reviews.enableReviewsDesc")}
      />

      <Toggle
        checked={form.auto_approve}
        onChange={(v) => setForm({ ...form, auto_approve: v })}
        label={t("reviews.autoApprove")}
        description={t("reviews.autoApproveDesc")}
      />

      <Toggle
        checked={form.show_aggregate_rating}
        onChange={(v) => setForm({ ...form, show_aggregate_rating: v })}
        label={t("reviews.showAggregateRating")}
        description={t("reviews.showAggregateRatingDesc")}
      />

      <Toggle
        checked={form.request_after_booking}
        onChange={(v) => setForm({ ...form, request_after_booking: v })}
        label={t("reviews.autoRequestAfterBooking")}
        description={t("reviews.autoRequestAfterBookingDesc")}
      />

      <div className="rounded-lg border p-4">
        <Label className="text-sm font-medium">{t("reviews.minRatingToShow")}</Label>
        <p className="mb-2 text-xs text-muted-foreground">
          {t("reviews.minRatingToShowDesc")}
        </p>
        <Input
          type="number"
          min={1}
          max={5}
          value={form.min_rating_to_show}
          onChange={(e) =>
            setForm({
              ...form,
              min_rating_to_show: Math.max(1, Math.min(5, Number(e.target.value))),
            })
          }
          className="w-20"
        />
      </div>

      <div className="rounded-lg border p-4">
        <Label className="text-sm font-medium">{t("reviews.displayStyle")}</Label>
        <p className="mb-2 text-xs text-muted-foreground">
          {t("reviews.displayStyleDesc")}
        </p>
        <div className="flex gap-2">
          {[
            { value: "carousel", label: t("reviews.styleCarousel") },
            { value: "grid", label: t("reviews.styleGrid") },
            { value: "list", label: t("reviews.styleList") },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setForm({ ...form, display_style: option.value })
              }
              className={`inline-flex items-center rounded-md border px-3 py-1.5 text-sm transition-colors ${
                form.display_style === option.value
                  ? "border-primary bg-primary/10 font-medium text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <Label className="text-sm font-medium">{t("reviews.promptMessage")}</Label>
        <p className="mb-2 text-xs text-muted-foreground">
          {t("reviews.promptMessageDesc")}
        </p>
        <Textarea
          value={form.review_prompt_text}
          onChange={(e) =>
            setForm({ ...form, review_prompt_text: e.target.value })
          }
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="rounded-lg border p-4">
        <Label className="text-sm font-medium">{t("reviews.delayHours")}</Label>
        <p className="mb-2 text-xs text-muted-foreground">
          {t("reviews.delayHoursDesc")}
        </p>
        <Input
          type="number"
          min={1}
          max={720}
          value={form.request_delay_hours}
          onChange={(e) =>
            setForm({
              ...form,
              request_delay_hours: Math.max(
                1,
                Math.min(720, Number(e.target.value))
              ),
            })
          }
          className="w-24"
        />
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? t("customers.saving") : t("reviews.saveSettings")}
      </Button>

      {/* Embed widget section */}
      {profileId && (
        <div className="pt-4">
          <SocialProofEmbed profileId={profileId} />
        </div>
      )}
    </div>
  );
}
