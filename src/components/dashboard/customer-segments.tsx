"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  RefreshCw,
  Plus,
  ChevronRight,
  X,
  Trash2,
  Settings,
  Users,
} from "lucide-react";
import {
  SEGMENT_FIELDS,
  SEGMENT_COLORS,
  formatRuleDisplay,
  type SegmentCriteria,
  type SegmentRule,
  type SegmentOperator,
  type AutoAction,
} from "@/lib/segmentation";

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface Segment {
  id: string;
  profile_id: string;
  name: string;
  description: string | null;
  type: "system" | "custom";
  criteria: SegmentCriteria;
  color: string;
  icon: string;
  auto_actions: AutoAction[];
  customer_count: number;
  customer_ids?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CustomerSegmentsProps {
  selectedSegmentId: string | null;
  onSegmentSelect: (segmentId: string | null, customerIds?: string[]) => void;
}

// ──────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────

export default function CustomerSegments({
  selectedSegmentId,
  onSegmentSelect,
}: CustomerSegmentsProps) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [detailSegment, setDetailSegment] = useState<Segment | null>(null);

  // ──── Fetch segments ────
  const fetchSegments = useCallback(async () => {
    try {
      const res = await apiFetch("/api/segments");
      const data = await res.json();
      if (res.ok) {
        setSegments(data.segments || []);
      }
    } catch (err) {
      console.error("セグメント取得エラー:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ──── Initialize system segments on first load ────
  const initSegments = useCallback(async () => {
    try {
      const res = await apiFetch("/api/segments/init", { method: "POST" });
      if (res.ok) {
        await fetchSegments();
      }
    } catch (err) {
      console.error("セグメント初期化エラー:", err);
    }
  }, [fetchSegments]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await apiFetch("/api/segments");
      const data = await res.json();
      if (res.ok && data.segments && data.segments.length > 0) {
        setSegments(data.segments);
        setLoading(false);
      } else {
        // No segments yet — initialize
        await initSegments();
        setLoading(false);
      }
    }
    load();
  }, [initSegments]);

  // ──── Refresh all segments ────
  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await apiFetch("/api/segments/refresh", { method: "POST" });
      if (res.ok) {
        toast.success("セグメントを更新しました");
        await fetchSegments();
      } else {
        toast.error("セグメントの更新に失敗しました");
      }
    } catch {
      toast.error("セグメントの更新に失敗しました");
    } finally {
      setRefreshing(false);
    }
  }

  // ──── Delete custom segment ────
  async function handleDelete(segmentId: string) {
    try {
      const res = await apiFetch(`/api/segments?id=${segmentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSegments((prev) => prev.filter((s) => s.id !== segmentId));
        if (selectedSegmentId === segmentId) {
          onSegmentSelect(null);
        }
        setShowDetailDialog(false);
        toast.success("セグメントを削除しました");
      } else {
        const data = await res.json();
        toast.error(data.error || "削除に失敗しました");
      }
    } catch {
      toast.error("削除に失敗しました");
    }
  }

  // ──── Segment click ────
  function handleSegmentClick(segment: Segment) {
    if (selectedSegmentId === segment.id) {
      onSegmentSelect(null);
    } else {
      onSegmentSelect(segment.id, segment.customer_ids);
    }
  }

  // ──── Total customers across segments ────
  const totalCustomers = new Set(
    segments.flatMap((s) => s.customer_ids || [])
  ).size;

  // ──── Distribution bars ────
  const maxCount = Math.max(...segments.map((s) => s.customer_count), 1);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              顧客セグメント
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleRefresh}
                disabled={refreshing}
                title="セグメント更新"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowCreateDialog(true)}
                title="新規セグメント作成"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5 pt-0">
          {/* All customers button */}
          <button
            type="button"
            onClick={() => onSegmentSelect(null)}
            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
              selectedSegmentId === null
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span className="font-medium">全顧客</span>
            <span className="text-xs">{totalCustomers}</span>
          </button>

          {/* Segment list */}
          {segments.map((segment) => (
            <div key={segment.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSegmentClick(segment)}
                className={`flex flex-1 items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                  selectedSegmentId === segment.id
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="truncate">{segment.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {segment.customer_count}
                  </span>
                  {/* Mini bar */}
                  <div className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-muted sm:block">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: segment.color,
                        width: `${(segment.customer_count / maxCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailSegment(segment);
                  setShowDetailDialog(true);
                }}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Segment Detail Dialog */}
      {detailSegment && (
        <SegmentDetailDialog
          segment={detailSegment}
          open={showDetailDialog}
          onOpenChange={(open) => {
            setShowDetailDialog(open);
            if (!open) setDetailSegment(null);
          }}
          onDelete={handleDelete}
          onUpdate={(updated) => {
            setSegments((prev) =>
              prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
            );
            setDetailSegment({ ...detailSegment, ...updated });
          }}
        />
      )}

      {/* Create Segment Dialog */}
      <CreateSegmentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={(newSegment) => {
          setSegments((prev) => [...prev, newSegment]);
          setShowCreateDialog(false);
        }}
      />
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// Segment Detail Dialog
// ──────────────────────────────────────────────────────────────

function SegmentDetailDialog({
  segment,
  open,
  onOpenChange,
  onDelete,
  onUpdate,
}: {
  segment: Segment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (updated: Partial<Segment> & { id: string }) => void;
}) {
  const [editingActions, setEditingActions] = useState(false);
  const [autoActions, setAutoActions] = useState<AutoAction[]>(
    segment.auto_actions || []
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAutoActions(segment.auto_actions || []);
  }, [segment]);

  async function saveAutoActions() {
    setSaving(true);
    try {
      const res = await apiFetch("/api/segments", {
        method: "PATCH",
        body: JSON.stringify({
          id: segment.id,
          auto_actions: autoActions,
        }),
      });

      if (res.ok) {
        onUpdate({ id: segment.id, auto_actions: autoActions });
        setEditingActions(false);
        toast.success("自動アクションを保存しました");
      } else {
        toast.error("保存に失敗しました");
      }
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  function addAction() {
    setAutoActions((prev) => [
      ...prev,
      { type: "send_email", delay_hours: 0 },
    ]);
  }

  function removeAction(index: number) {
    setAutoActions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAction(index: number, updates: Partial<AutoAction>) {
    setAutoActions((prev) =>
      prev.map((a, i) => (i === index ? { ...a, ...updates } : a))
    );
  }

  const actionTypeLabels: Record<string, string> = {
    send_email: "メール送信",
    send_coupon: "クーポン付与",
    add_tag: "タグ追加",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            {segment.name}
          </DialogTitle>
          <DialogDescription>
            {segment.description || ""}
            {segment.type === "system" ? " (システム)" : " (カスタム)"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-muted px-4 py-2 text-center">
              <p className="text-2xl font-bold">{segment.customer_count}</p>
              <p className="text-xs text-muted-foreground">顧客数</p>
            </div>
          </div>

          {/* Criteria display */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              条件（{segment.criteria.match === "all" ? "全て一致" : "いずれか一致"}）
            </Label>
            <div className="space-y-1">
              {segment.criteria.rules?.map((rule, i) => (
                <div
                  key={i}
                  className="rounded bg-muted px-3 py-1.5 text-sm"
                >
                  {formatRuleDisplay(rule)}
                </div>
              ))}
            </div>
          </div>

          {/* Auto Actions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">
                セグメント参加時の自動アクション
              </Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setEditingActions(!editingActions)}
              >
                <Settings className="mr-1 h-3 w-3" />
                {editingActions ? "閉じる" : "編集"}
              </Button>
            </div>

            {!editingActions && autoActions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                自動アクションは設定されていません
              </p>
            )}

            {!editingActions &&
              autoActions.map((action, i) => (
                <div
                  key={i}
                  className="rounded bg-muted px-3 py-1.5 text-sm"
                >
                  {actionTypeLabels[action.type] || action.type}
                  {action.delay_hours
                    ? ` （${action.delay_hours}時間後）`
                    : " （即時）"}
                  {action.tag && ` — タグ: ${action.tag}`}
                </div>
              ))}

            {editingActions && (
              <div className="space-y-3">
                {autoActions.map((action, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg border p-3"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={action.type}
                          onChange={(e) =>
                            updateAction(i, {
                              type: e.target.value as AutoAction["type"],
                            })
                          }
                          className="h-8 rounded-md border bg-background px-2 text-sm"
                        >
                          <option value="send_email">メール送信</option>
                          <option value="send_coupon">クーポン付与</option>
                          <option value="add_tag">タグ追加</option>
                        </select>
                        <Input
                          type="number"
                          min={0}
                          value={action.delay_hours || 0}
                          onChange={(e) =>
                            updateAction(i, {
                              delay_hours: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="遅延(時間)"
                          className="h-8 w-24"
                        />
                        <span className="text-xs text-muted-foreground">
                          時間後
                        </span>
                      </div>
                      {action.type === "add_tag" && (
                        <Input
                          value={action.tag || ""}
                          onChange={(e) =>
                            updateAction(i, { tag: e.target.value })
                          }
                          placeholder="タグ名"
                          className="h-8"
                        />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => removeAction(i)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={addAction}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    アクション追加
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={saveAutoActions}
                    disabled={saving}
                  >
                    {saving ? "保存中..." : "保存"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {segment.type === "custom" && (
          <DialogFooter>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(segment.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              セグメントを削除
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────────────────────────────────────────────────
// Create Segment Dialog
// ──────────────────────────────────────────────────────────────

function CreateSegmentDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (segment: Segment) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(SEGMENT_COLORS[0] as string);
  const [matchType, setMatchType] = useState<"all" | "any">("all");
  const [rules, setRules] = useState<SegmentRule[]>([
    { field: "total_bookings", operator: "gte", value: 1 },
  ]);
  const [creating, setCreating] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewing, setPreviewing] = useState(false);

  function resetForm() {
    setName("");
    setDescription("");
    setColor(SEGMENT_COLORS[0]);
    setMatchType("all");
    setRules([{ field: "total_bookings", operator: "gte", value: 1 }]);
    setPreviewCount(null);
  }

  function addRule() {
    setRules((prev) => [
      ...prev,
      { field: "total_bookings", operator: "gte", value: 1 },
    ]);
    setPreviewCount(null);
  }

  function removeRule(index: number) {
    setRules((prev) => prev.filter((_, i) => i !== index));
    setPreviewCount(null);
  }

  function updateRule(index: number, updates: Partial<SegmentRule>) {
    setRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...updates } : r))
    );
    setPreviewCount(null);
  }

  // Get operators based on field type
  function getOperators(fieldValue: string) {
    const fieldDef = SEGMENT_FIELDS.find((f) => f.value === fieldValue);
    if (!fieldDef) return [];

    switch (fieldDef.type) {
      case "number":
        return [
          { value: "eq", label: "＝" },
          { value: "neq", label: "≠" },
          { value: "gt", label: "＞" },
          { value: "lt", label: "＜" },
          { value: "gte", label: "≧" },
          { value: "lte", label: "≦" },
          { value: "between", label: "範囲内" },
        ] as const;
      case "string":
        return [
          { value: "eq", label: "一致" },
          { value: "neq", label: "不一致" },
          { value: "contains", label: "含む" },
          { value: "not_contains", label: "含まない" },
        ] as const;
      case "boolean":
        return [{ value: "eq", label: "＝" }] as const;
      default:
        return [];
    }
  }

  async function handlePreview() {
    setPreviewing(true);
    try {
      // Create temporarily to get count, then delete — or just compute via the create preview
      const criteria: SegmentCriteria = { match: matchType, rules };
      // Use the segments GET with criteria evaluation by temporarily creating
      const res = await apiFetch("/api/segments", {
        method: "POST",
        body: JSON.stringify({
          name: "__preview__",
          criteria,
          color: "#6B7280",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPreviewCount(data.segment?.customer_count ?? 0);
        // Delete the preview segment
        if (data.segment?.id) {
          await apiFetch(`/api/segments?id=${data.segment.id}`, {
            method: "DELETE",
          });
        }
      }
    } catch {
      toast.error("プレビューに失敗しました");
    } finally {
      setPreviewing(false);
    }
  }

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const criteria: SegmentCriteria = { match: matchType, rules };

      const res = await apiFetch("/api/segments", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          criteria,
          color,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onCreated(data.segment);
        resetForm();
        toast.success("セグメントを作成しました");
      } else {
        const data = await res.json();
        toast.error(data.error || "作成に失敗しました");
      }
    } catch {
      toast.error("作成に失敗しました");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>新規セグメント作成</DialogTitle>
          <DialogDescription>
            条件を設定して顧客をグループ化します
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="seg-name">セグメント名 *</Label>
            <Input
              id="seg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 高エンゲージメント顧客"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="seg-desc">説明</Label>
            <Input
              id="seg-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="セグメントの説明..."
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>カラー</Label>
            <div className="flex flex-wrap gap-2">
              {SEGMENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    color === c
                      ? "scale-110 border-foreground"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Match type */}
          <div className="space-y-2">
            <Label>条件の一致方法</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMatchType("all");
                  setPreviewCount(null);
                }}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  matchType === "all"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                全て一致 (AND)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMatchType("any");
                  setPreviewCount(null);
                }}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  matchType === "any"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                いずれか一致 (OR)
              </button>
            </div>
          </div>

          {/* Rules */}
          <div className="space-y-3">
            <Label>ルール</Label>
            {rules.map((rule, i) => {
              const fieldDef = SEGMENT_FIELDS.find(
                (f) => f.value === rule.field
              );
              const operators = getOperators(rule.field);

              return (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border p-3"
                >
                  <div className="flex flex-1 flex-wrap gap-2">
                    {/* Field selector */}
                    <select
                      value={rule.field}
                      onChange={(e) => {
                        const newField = e.target.value;
                        const newFieldDef = SEGMENT_FIELDS.find(
                          (f) => f.value === newField
                        );
                        const defaultOp =
                          newFieldDef?.type === "boolean" ? "eq" : "gte";
                        const defaultVal =
                          newFieldDef?.type === "boolean"
                            ? true
                            : newFieldDef?.type === "number"
                            ? 1
                            : "";
                        updateRule(i, {
                          field: newField,
                          operator: defaultOp as SegmentOperator,
                          value: defaultVal,
                        });
                      }}
                      className="h-8 rounded-md border bg-background px-2 text-sm"
                    >
                      {SEGMENT_FIELDS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>

                    {/* Operator selector */}
                    {fieldDef?.type !== "boolean" && (
                      <select
                        value={rule.operator}
                        onChange={(e) =>
                          updateRule(i, {
                            operator: e.target.value as SegmentOperator,
                            value:
                              e.target.value === "between"
                                ? [0, 100]
                                : rule.value,
                          })
                        }
                        className="h-8 rounded-md border bg-background px-2 text-sm"
                      >
                        {operators.map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Value input */}
                    {fieldDef?.type === "boolean" ? (
                      <select
                        value={rule.value === true ? "true" : "false"}
                        onChange={(e) =>
                          updateRule(i, {
                            value: e.target.value === "true",
                          })
                        }
                        className="h-8 rounded-md border bg-background px-2 text-sm"
                      >
                        <option value="true">はい</option>
                        <option value="false">いいえ</option>
                      </select>
                    ) : rule.operator === "between" ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={
                            Array.isArray(rule.value)
                              ? (rule.value as number[])[0]
                              : 0
                          }
                          onChange={(e) =>
                            updateRule(i, {
                              value: [
                                parseInt(e.target.value) || 0,
                                Array.isArray(rule.value)
                                  ? (rule.value as number[])[1]
                                  : 100,
                              ],
                            })
                          }
                          className="h-8 w-20"
                        />
                        <span className="text-xs">〜</span>
                        <Input
                          type="number"
                          value={
                            Array.isArray(rule.value)
                              ? (rule.value as number[])[1]
                              : 100
                          }
                          onChange={(e) =>
                            updateRule(i, {
                              value: [
                                Array.isArray(rule.value)
                                  ? (rule.value as number[])[0]
                                  : 0,
                                parseInt(e.target.value) || 100,
                              ],
                            })
                          }
                          className="h-8 w-20"
                        />
                      </div>
                    ) : fieldDef?.type === "number" ? (
                      <Input
                        type="number"
                        value={
                          typeof rule.value === "number" ? rule.value : ""
                        }
                        onChange={(e) =>
                          updateRule(i, {
                            value: parseInt(e.target.value) || 0,
                          })
                        }
                        className="h-8 w-24"
                      />
                    ) : (
                      <Input
                        value={
                          typeof rule.value === "string" ? rule.value : ""
                        }
                        onChange={(e) =>
                          updateRule(i, { value: e.target.value })
                        }
                        placeholder="値を入力..."
                        className="h-8 w-32"
                      />
                    )}
                  </div>

                  {rules.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => removeRule(i)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={addRule}
            >
              <Plus className="mr-1 h-3 w-3" />
              ルール追加
            </Button>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handlePreview}
              disabled={previewing}
            >
              {previewing ? "計算中..." : "プレビュー"}
            </Button>
            {previewCount !== null && (
              <span className="text-sm">
                <strong>{previewCount}</strong> 人が該当
              </span>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleCreate}
            disabled={creating || !name.trim() || rules.length === 0}
          >
            {creating ? "作成中..." : "作成"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
