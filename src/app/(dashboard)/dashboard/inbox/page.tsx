"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, ContactSubmission } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Mail, Trash2, Inbox } from "lucide-react";

export default function InboxPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactSubmission | null>(null);

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
    setProfile(profileData as Profile);

    const { data: submissionsData } = await supabase
      .from("contact_submissions")
      .select("*")
      .eq("profile_id", profileData.id)
      .order("created_at", { ascending: false });

    setSubmissions((submissionsData as ContactSubmission[]) || []);
    setLoading(false);
  }

  async function markAsRead(submission: ContactSubmission) {
    if (submission.is_read) return;

    const supabase = createClient();
    await supabase
      .from("contact_submissions")
      .update({ is_read: true })
      .eq("id", submission.id);

    setSubmissions((prev) =>
      prev.map((s) => (s.id === submission.id ? { ...s, is_read: true } : s))
    );
  }

  async function handleDelete(submission: ContactSubmission) {
    const supabase = createClient();
    await supabase
      .from("contact_submissions")
      .delete()
      .eq("id", submission.id);

    setSubmissions((prev) => prev.filter((s) => s.id !== submission.id));
    setDeleteTarget(null);
  }

  function handleOpen(submission: ContactSubmission) {
    setSelectedSubmission(submission);
    markAsRead(submission);
  }

  const unreadCount = submissions.filter((s) => !s.is_read).length;

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">受信トレイ</h1>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">受信トレイ</h1>
        {unreadCount > 0 && (
          <Badge variant="destructive">{unreadCount} 件未読</Badge>
        )}
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Inbox className="mb-4 h-12 w-12" />
            <p>お問い合わせはまだありません</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => (
            <Card
              key={submission.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                !submission.is_read ? "border-primary/50 bg-primary/5" : ""
              }`}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <div
                  className="min-w-0 flex-1"
                  onClick={() => handleOpen(submission)}
                >
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium">
                      {submission.sender_name}
                    </span>
                    {!submission.is_read && (
                      <Badge variant="secondary" className="text-xs">
                        未読
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {submission.sender_email}
                  </p>
                  <p className="mt-1 truncate text-sm">
                    {submission.message}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(submission.created_at).toLocaleString("ja-JP")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(submission);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full message dialog */}
      <Dialog
        open={!!selectedSubmission}
        onOpenChange={(open) => {
          if (!open) setSelectedSubmission(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSubmission?.sender_name}</DialogTitle>
            <DialogDescription>
              {selectedSubmission?.sender_email} &middot;{" "}
              {selectedSubmission &&
                new Date(selectedSubmission.created_at).toLocaleString("ja-JP")}
            </DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm">
            {selectedSubmission?.message}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedSubmission(null)}
            >
              閉じる
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
            <DialogTitle>メッセージを削除</DialogTitle>
            <DialogDescription>
              {deleteTarget?.sender_name}
              からのメッセージを削除しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
