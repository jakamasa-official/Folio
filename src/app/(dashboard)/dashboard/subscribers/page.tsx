"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { apiFetch } from "@/lib/api-client";
import type { Profile, EmailSubscriber } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Users, Trash2, Download } from "lucide-react";

export default function SubscribersPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailCollectionEnabled, setEmailCollectionEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

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
    setEmailCollectionEnabled(p.email_collection_enabled);

    const { data: subscribersData } = await supabase
      .from("email_subscribers")
      .select("*")
      .eq("profile_id", p.id)
      .order("subscribed_at", { ascending: false });

    setSubscribers((subscribersData as EmailSubscriber[]) || []);
    setLoading(false);
  }

  async function toggleEmailCollection() {
    if (!profile) return;
    setSaving(true);
    const newValue = !emailCollectionEnabled;

    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ email_collection_enabled: newValue })
      .eq("id", profile.id);

    setEmailCollectionEnabled(newValue);
    setSaving(false);
  }

  async function deleteSubscriber(subscriberId: string) {
    const supabase = createClient();
    await supabase
      .from("email_subscribers")
      .delete()
      .eq("id", subscriberId);

    setSubscribers((prev) => prev.filter((s) => s.id !== subscriberId));
  }

  async function exportCsv() {
    const response = await apiFetch("/api/subscribers/export");
    if (!response.ok) return;

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">購読者管理</h1>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">購読者管理</h1>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>メール収集設定</CardTitle>
          <CardDescription>
            ページ訪問者からメールアドレスを収集する機能を管理します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>メール収集を有効にする</Label>
            <Button
              variant={emailCollectionEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleEmailCollection}
              disabled={saving}
            >
              {emailCollectionEnabled ? "有効" : "無効"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Subscriber list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">購読者一覧</h2>
            <Badge variant="secondary">{subscribers.length} 件</Badge>
          </div>
          {subscribers.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="mr-2 h-4 w-4" />
              CSVエクスポート
            </Button>
          )}
        </div>

        {subscribers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="mb-4 h-12 w-12" />
              <p>購読者はまだいません</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {subscribers.map((subscriber) => (
              <Card key={subscriber.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{subscriber.email}</p>
                    <p className="text-sm text-muted-foreground">
                      登録日:{" "}
                      {new Date(subscriber.subscribed_at).toLocaleDateString(
                        "ja-JP"
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteSubscriber(subscriber.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
