"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import type { Customer } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Users,
  Search,
  Plus,
  Tag,
  Trash2,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  BookOpen,
  X,
  BarChart3,
} from "lucide-react";
import CustomerSegments from "@/components/dashboard/customer-segments";
import SegmentBadges from "@/components/dashboard/segment-badges";
import { apiFetch } from "@/lib/api-client";
import { useProStatus } from "@/hooks/use-pro-status";
import { LimitBanner } from "@/components/dashboard/pro-gate";
import { FREE_LIMITS } from "@/lib/pro-gate";

export default function CustomersPage() {
  const { isPro, customerCount } = useProStatus();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  // Detail dialog
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingTags, setEditingTags] = useState<string[]>([]);
  const [editingNotes, setEditingNotes] = useState("");
  const [editingPhone, setEditingPhone] = useState("");
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);

  // Create dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createNotes, setCreateNotes] = useState("");
  const [createTags, setCreateTags] = useState<string[]>([]);
  const [createNewTag, setCreateNewTag] = useState("");
  const [creating, setCreating] = useState(false);

  // Segment filter
  const [showSegments, setShowSegments] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [segmentCustomerIds, setSegmentCustomerIds] = useState<string[] | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = useCallback(async (search?: string) => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const res = await apiFetch(`/api/customers?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error("顧客取得エラー:", err);
      toast.error("顧客データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCustomers(searchQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, fetchCustomers]);

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await apiFetch("/api/customers/sync", {
        method: "POST",
      });

      if (res.ok) {
        await fetchCustomers(searchQuery);
      }
    } catch (err) {
      console.error("同期エラー:", err);
      toast.error("顧客データの同期に失敗しました");
    } finally {
      setSyncing(false);
    }
  }

  async function handleCreate() {
    if (!createName.trim()) return;
    setCreating(true);
    try {
      const res = await apiFetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: createName.trim(),
          email: createEmail.trim() || null,
          phone: createPhone.trim() || null,
          notes: createNotes.trim() || null,
          tags: createTags,
        }),
      });

      if (res.ok) {
        setShowCreateDialog(false);
        resetCreateForm();
        await fetchCustomers(searchQuery);
      }
    } catch (err) {
      console.error("顧客作成エラー:", err);
      toast.error("顧客の作成に失敗しました");
    } finally {
      setCreating(false);
    }
  }

  function resetCreateForm() {
    setCreateName("");
    setCreateEmail("");
    setCreatePhone("");
    setCreateNotes("");
    setCreateTags([]);
    setCreateNewTag("");
  }

  async function handleUpdate() {
    if (!selectedCustomer) return;
    setSaving(true);
    try {
      const res = await apiFetch("/api/customers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedCustomer.id,
          tags: editingTags,
          notes: editingNotes.trim() || null,
          phone: editingPhone.trim() || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCustomers((prev) =>
          prev.map((c) => (c.id === data.customer.id ? data.customer : c))
        );
        setSelectedCustomer(data.customer);
      }
    } catch (err) {
      console.error("顧客更新エラー:", err);
      toast.error("顧客の更新に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(customer: Customer) {
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/customers?id=${customer.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
        setDeleteTarget(null);
        if (selectedCustomer?.id === customer.id) {
          setSelectedCustomer(null);
        }
      }
    } catch (err) {
      console.error("顧客削除エラー:", err);
      toast.error("顧客の削除に失敗しました");
    } finally {
      setDeleting(false);
    }
  }

  function openDetail(customer: Customer) {
    setSelectedCustomer(customer);
    setEditingTags([...customer.tags]);
    setEditingNotes(customer.notes || "");
    setEditingPhone(customer.phone || "");
    setNewTag("");
  }

  function addTag(tag: string, setTag: (v: string) => void, tags: string[], setTags: (v: string[]) => void) {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTag("");
  }

  function removeTag(tagToRemove: string, tags: string[], setTags: (v: string[]) => void) {
    setTags(tags.filter((t) => t !== tagToRemove));
  }

  // Stats
  const totalCustomers = customers.length;
  const newThisMonth = customers.filter((c) => {
    const created = new Date(c.created_at);
    const now = new Date();
    return (
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  }).length;
  const totalBookings = customers.reduce((sum, c) => sum + c.total_bookings, 0);

  const filteredCustomers = customers.filter((c) => {
    if (sourceFilter !== "all" && !c.source.split(",").map((s) => s.trim()).includes(sourceFilter)) {
      return false;
    }
    if (segmentCustomerIds && !segmentCustomerIds.includes(c.id)) {
      return false;
    }
    return true;
  });

  function formatSource(source: string) {
    const map: Record<string, string> = {
      manual: "手動追加",
      booking: "予約",
      contact: "お問い合わせ",
      subscriber: "メール購読",
    };
    return source
      .split(",")
      .map((s) => map[s.trim()] || s.trim())
      .join(", ");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold">顧客管理</h1>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">顧客管理</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "同期中..." : "顧客を同期"}
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            disabled={!isPro && customerCount >= FREE_LIMITS.customers}
          >
            <Plus className="mr-2 h-4 w-4" />
            新規顧客
          </Button>
        </div>
      </div>

      {/* Pro limit banner */}
      <LimitBanner
        current={customerCount}
        max={FREE_LIMITS.customers}
        label="顧客"
        isPro={isPro}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">総顧客数</p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">今月の新規</p>
                <p className="text-2xl font-bold">{newThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">総予約数</p>
                <p className="text-2xl font-bold">{totalBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segment Panel Toggle + Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="名前またはメールで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {isPro && (
            <Button
              variant={showSegments ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowSegments(!showSegments);
                if (showSegments) {
                  setSegmentCustomerIds(null);
                }
              }}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              セグメント
            </Button>
          )}
        </div>

        {/* Segment Panel */}
        {showSegments && (
          <CustomerSegments
            selectedSegmentId={selectedSegmentId}
            onSegmentSelect={(segmentId, customerIds) => {
              setSelectedSegmentId(segmentId);
              setSegmentCustomerIds(segmentId ? (customerIds ?? null) : null);
            }}
          />
        )}

        {/* Source Filter */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "全て" },
            { key: "booking", label: "予約客" },
            { key: "contact", label: "お問い合わせ" },
            { key: "subscriber", label: "メール購読" },
            { key: "manual", label: "手動追加" },
          ].map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setSourceFilter(filter.key)}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                sourceFilter === filter.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer list */}
      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="mb-4 h-12 w-12" />
            <p>顧客データはまだありません</p>
            <p className="mt-2 text-sm">
              「顧客を同期」で既存データを取り込むか、「新規顧客」で手動追加できます
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <Card
              key={customer.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => openDetail(customer)}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">
                      {customer.name}
                    </span>
                    {customer.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {customer.email && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {customer.email}
                    </p>
                  )}
                  <div className="mt-1">
                    <SegmentBadges customer={customer} />
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatSource(customer.source)}</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      予約 {customer.total_bookings}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      メッセージ {customer.total_messages}
                    </span>
                    {customer.last_seen_at && (
                      <span>
                        最終: {new Date(customer.last_seen_at).toLocaleDateString("ja-JP")}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(customer);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog
        open={!!selectedCustomer}
        onOpenChange={(open) => {
          if (!open) setSelectedCustomer(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedCustomer?.name}</DialogTitle>
            <DialogDescription>
              {selectedCustomer?.source && formatSource(selectedCustomer.source)}
              {" / "}
              登録日:{" "}
              {selectedCustomer &&
                new Date(selectedCustomer.created_at).toLocaleDateString("ja-JP")}
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-4">
              {/* Contact info */}
              <div className="space-y-2">
                {selectedCustomer.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {selectedCustomer.email}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={editingPhone}
                    onChange={(e) => setEditingPhone(e.target.value)}
                    placeholder="電話番号を入力..."
                    className="h-8"
                  />
                </div>
              </div>

              {/* Interaction stats */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold">
                      {selectedCustomer.total_bookings}
                    </p>
                    <p className="text-xs text-muted-foreground">予約回数</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold">
                      {selectedCustomer.total_messages}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      メッセージ数
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline */}
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  初回:{" "}
                  {new Date(selectedCustomer.first_seen_at).toLocaleDateString(
                    "ja-JP"
                  )}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  最終:{" "}
                  {new Date(selectedCustomer.last_seen_at).toLocaleDateString(
                    "ja-JP"
                  )}
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  タグ
                </Label>
                <div className="flex flex-wrap gap-2">
                  {editingTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() =>
                          removeTag(tag, editingTags, setEditingTags)
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="新しいタグ..."
                    className="h-8"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag(newTag, setNewTag, editingTags, setEditingTags);
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addTag(newTag, setNewTag, editingTags, setEditingTags)
                    }
                  >
                    追加
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>メモ</Label>
                <Textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="メモを入力..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (selectedCustomer) {
                  setDeleteTarget(selectedCustomer);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              削除
            </Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            resetCreateForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>新規顧客</DialogTitle>
            <DialogDescription>
              新しい顧客情報を手動で追加します
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">名前 *</Label>
              <Input
                id="create-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="顧客名を入力..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">メールアドレス</Label>
              <Input
                id="create-email"
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-phone">電話番号</Label>
              <Input
                id="create-phone"
                type="tel"
                value={createPhone}
                onChange={(e) => setCreatePhone(e.target.value)}
                placeholder="090-1234-5678"
              />
            </div>
            <div className="space-y-2">
              <Label>タグ</Label>
              <div className="flex flex-wrap gap-2">
                {createTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() =>
                        removeTag(tag, createTags, setCreateTags)
                      }
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={createNewTag}
                  onChange={(e) => setCreateNewTag(e.target.value)}
                  placeholder="タグを入力..."
                  className="h-8"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(
                        createNewTag,
                        setCreateNewTag,
                        createTags,
                        setCreateTags
                      );
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    addTag(
                      createNewTag,
                      setCreateNewTag,
                      createTags,
                      setCreateTags
                    )
                  }
                >
                  追加
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-notes">メモ</Label>
              <Textarea
                id="create-notes"
                value={createNotes}
                onChange={(e) => setCreateNotes(e.target.value)}
                placeholder="メモを入力..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetCreateForm();
              }}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !createName.trim()}
            >
              {creating ? "作成中..." : "作成"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>顧客を削除</DialogTitle>
            <DialogDescription>
              {deleteTarget?.name}
              を削除しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
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
