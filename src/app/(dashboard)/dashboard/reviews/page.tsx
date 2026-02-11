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
  const labels: Record<string, string> = {
    direct: "直接",
    request: "依頼",
    manual: "手動",
    qr_code: "QR",
  };
  return (
    <Badge variant="secondary" className="text-xs">
      {labels[source] || source}
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
      toast.error("レビューの取得に失敗しました");
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
        <h1 className="mb-6 text-2xl font-bold">レビュー</h1>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">レビュー</h1>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="manage">レビュー管理</TabsTrigger>
          <TabsTrigger value="request">レビュー依頼</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
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
          <ProGate isPro={isPro} feature="レビュー収集">
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
              平均評価
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <p className="text-4xl font-bold">{stats.approvedCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              公開レビュー
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <p className="text-4xl font-bold">{stats.totalCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              全レビュー
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">評価分布</CardTitle>
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
          <CardTitle className="text-base">最近のレビュー</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              まだレビューはありません
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
                        ? "承認済み"
                        : review.status === "pending"
                        ? "承認待ち"
                        : "非公開"}
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
        toast.success("レビューを更新しました");
      } else {
        const data = await res.json();
        toast.error(data.error || "更新に失敗しました");
      }
    } catch {
      toast.error("更新に失敗しました");
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
        toast.success("レビューを削除しました");
        setDeleteTarget(null);
      }
    } catch {
      toast.error("削除に失敗しました");
    } finally {
      setDeleting(false);
    }
  }

  const filterOptions = [
    { key: "all", label: "全て" },
    { key: "pending", label: "承認待ち" },
    { key: "approved", label: "承認済み" },
    { key: "rejected", label: "非公開" },
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
            <p>該当するレビューはありません</p>
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
                          確認済み
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
                          オーナーからの返信
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
                          placeholder="返信を入力..."
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReply(review.id)}
                            disabled={saving || !replyText.trim()}
                          >
                            {saving ? "送信中..." : "返信する"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                          >
                            キャンセル
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
                            承認
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
                            非公開
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
                          非公開にする
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
                          承認する
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
                          ? "注目解除"
                          : "注目に設定"}
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
                          返信する
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
            <DialogTitle>レビューを削除</DialogTitle>
            <DialogDescription>
              {deleteTarget?.reviewer_name}
              のレビューを削除しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "削除中..." : "削除する"}
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
      toast.error("この顧客にはメールアドレスが設定されていません");
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
        toast.success(data.message || "レビュー依頼を送信しました");
      } else {
        toast.error(data.error || "送信に失敗しました");
      }
    } catch {
      toast.error("送信に失敗しました");
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
          <CardTitle className="text-base">顧客にレビューを依頼</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="顧客名またはメールで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredCustomers.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              顧客が見つかりません
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
                    メールで依頼
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
              QRコードでレビュー収集
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              {qrSrc ? (
                <div className="overflow-hidden rounded-lg border bg-white p-2">
                  <img
                    src={qrSrc}
                    alt="レビューQRコード"
                    width={200}
                    height={200}
                  />
                </div>
              ) : (
                <div className="h-[200px] w-[200px] animate-pulse rounded bg-muted" />
              )}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  このQRコードを印刷して店頭に設置すると、お客様がスマートフォンで直接レビューを投稿できます。
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
                    ダウンロード
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
            <CardTitle className="text-base">送信済みリクエスト</CardTitle>
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
                    回答待ち
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
        toast.success("設定を保存しました");
      } else {
        const data = await res.json();
        toast.error(data.error || "保存に失敗しました");
      }
    } catch {
      toast.error("保存に失敗しました");
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
        label="レビュー機能を有効にする"
        description="オフにするとレビューセクションが非表示になります"
      />

      <Toggle
        checked={form.auto_approve}
        onChange={(v) => setForm({ ...form, auto_approve: v })}
        label="自動承認"
        description="新しいレビューを自動的に承認します"
      />

      <Toggle
        checked={form.show_aggregate_rating}
        onChange={(v) => setForm({ ...form, show_aggregate_rating: v })}
        label="平均評価を表示"
        description="公開ページに平均評価を表示します"
      />

      <Toggle
        checked={form.request_after_booking}
        onChange={(v) => setForm({ ...form, request_after_booking: v })}
        label="予約後に自動依頼"
        description="予約完了後にレビュー依頼を自動送信します"
      />

      <div className="rounded-lg border p-4">
        <Label className="text-sm font-medium">表示する最低評価</Label>
        <p className="mb-2 text-xs text-muted-foreground">
          この評価以上のレビューのみ公開ページに表示されます
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
        <Label className="text-sm font-medium">表示スタイル</Label>
        <p className="mb-2 text-xs text-muted-foreground">
          公開ページでのレビューの表示方法を選択します
        </p>
        <div className="flex gap-2">
          {[
            { value: "carousel", label: "カルーセル" },
            { value: "grid", label: "グリッド" },
            { value: "list", label: "リスト" },
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
        <Label className="text-sm font-medium">レビュー依頼メッセージ</Label>
        <p className="mb-2 text-xs text-muted-foreground">
          メール依頼時に使用されるメッセージです
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
        <Label className="text-sm font-medium">依頼までの待機時間（時間）</Label>
        <p className="mb-2 text-xs text-muted-foreground">
          予約完了後からレビュー依頼メールを送信するまでの時間
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
        {saving ? "保存中..." : "設定を保存"}
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
