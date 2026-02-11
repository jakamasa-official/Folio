"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { APP_URL } from "@/lib/constants";
import type { Profile, LineContact, Customer } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Users,
  UserCheck,
  Copy,
  ExternalLink,
  Send,
  BookOpen,
  Check,
} from "lucide-react";
import { SiLine } from "react-icons/si";
import { useProStatus } from "@/hooks/use-pro-status";
import { ProGate } from "@/components/dashboard/pro-gate";
import { LineSetupGuide } from "@/components/dashboard/line-setup-guide";

interface LineContactWithCustomer extends LineContact {
  customer: Customer | null;
}

export default function LinePage() {
  const { isPro } = useProStatus();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Settings fields
  const [channelId, setChannelId] = useState("");
  const [channelSecret, setChannelSecret] = useState("");
  const [channelAccessToken, setChannelAccessToken] = useState("");

  // Setup guide visibility
  const [showGuide, setShowGuide] = useState(false);

  // Contacts
  const [contacts, setContacts] = useState<LineContactWithCustomer[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Send message dialog
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendTarget, setSendTarget] = useState<LineContactWithCustomer | null>(
    null
  );
  const [sendMessage, setSendMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState(false);

  // Webhook URL copy state
  const [webhookCopied, setWebhookCopied] = useState(false);

  const isConnected = !!(channelId && channelSecret && channelAccessToken);
  const webhookUrl = `${APP_URL}/api/line/webhook`;

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (isConnected && profile) {
      loadContacts();
    }
  }, [isConnected, profile]);

  async function loadProfile() {
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
    setChannelId(p.line_channel_id || "");
    setChannelSecret(p.line_channel_secret || "");
    setChannelAccessToken(p.line_channel_access_token || "");

    // If not yet configured, show the guide automatically
    if (
      !p.line_channel_id &&
      !p.line_channel_secret &&
      !p.line_channel_access_token
    ) {
      setShowGuide(true);
    }

    setLoading(false);
  }

  async function loadContacts() {
    setLoadingContacts(true);
    try {
      const res = await fetch("/api/line/contacts");
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      }
    } catch {
      console.error("Failed to load LINE contacts");
      toast.error("LINE友だちの読み込みに失敗しました");
    }
    setLoadingContacts(false);
  }

  async function saveSettings() {
    if (!profile) return;
    setSaving(true);
    setSaveMessage("");

    try {
      const res = await fetch("/api/line/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line_channel_id: channelId || null,
          line_channel_secret: channelSecret || null,
          line_channel_access_token: channelAccessToken || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSaveMessage(data.error || "保存に失敗しました");
      } else {
        setSaveMessage("設定を保存しました");
        toast.success("LINE設定を保存しました");
      }
    } catch {
      setSaveMessage("保存に失敗しました");
    }
    setSaving(false);
  }

  function openSendDialog(contact: LineContactWithCustomer) {
    setSendTarget(contact);
    setSendMessage("");
    setSendError("");
    setSendSuccess(false);
    setSendDialogOpen(true);
  }

  async function handleSendMessage() {
    if (!sendTarget || !sendMessage.trim()) return;
    setSending(true);
    setSendError("");
    setSendSuccess(false);

    try {
      const res = await fetch("/api/line/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line_user_id: sendTarget.line_user_id,
          message: sendMessage.trim(),
        }),
      });

      if (res.ok) {
        setSendSuccess(true);
        setSendMessage("");
      } else {
        const data = await res.json();
        setSendError(data.error || "送信に失敗しました");
      }
    } catch {
      setSendError("送信に失敗しました");
      toast.error("メッセージの送信に失敗しました");
    }
    setSending(false);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  function copyWebhookUrl() {
    navigator.clipboard.writeText(webhookUrl);
    setWebhookCopied(true);
    setTimeout(() => setWebhookCopied(false), 2000);
  }

  const totalFriends = contacts.length;
  const activeFriends = contacts.filter((c) => c.is_friend).length;

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">LINE連携</h1>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SiLine className="h-7 w-7 text-[#06C755]" />
          <h1 className="text-2xl font-bold">LINE連携</h1>
          {!isPro && (
            <Badge variant="secondary" className="text-xs">
              Pro
            </Badge>
          )}
          {isConnected ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              <Check className="mr-1 h-3 w-3" />
              接続済み
            </Badge>
          ) : (
            <Badge variant="secondary">未接続</Badge>
          )}
        </div>
        {!showGuide && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGuide(true)}
            className="gap-1.5"
          >
            <BookOpen className="h-4 w-4" />
            セットアップガイド
          </Button>
        )}
      </div>

      <ProGate isPro={isPro} feature="LINE連携">
        {/* Setup Guide -- shown if not configured or manually opened */}
        {showGuide && (
          <LineSetupGuide
            channelId={channelId}
            channelSecret={channelSecret}
            channelAccessToken={channelAccessToken}
            onChannelIdChange={setChannelId}
            onChannelSecretChange={setChannelSecret}
            onChannelAccessTokenChange={setChannelAccessToken}
            onSave={saveSettings}
            saving={saving}
            onClose={() => setShowGuide(false)}
          />
        )}

        {/* Settings Section -- shown when guide is closed */}
        {!showGuide && (
        <Card>
        <CardHeader>
          <CardTitle>設定</CardTitle>
          <CardDescription>
            LINE Messaging APIの設定を行います
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
              {/* Webhook URL -- always visible for easy copying */}
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md border bg-muted px-3 py-2 text-xs break-all">
                    {webhookUrl}
                  </code>
                  <Button variant="outline" size="sm" onClick={copyWebhookUrl}>
                    {webhookCopied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {webhookCopied ? "コピー済み" : "コピー"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  LINE DevelopersのMessaging
                  API設定でこのURLを設定してください
                </p>
              </div>

              <Separator />

          {/* Channel ID */}
          <div className="space-y-2">
            <Label htmlFor="channelId">チャネルID</Label>
            <Input
              id="channelId"
              type="text"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="1234567890"
            />
          </div>

          {/* Channel Secret */}
          <div className="space-y-2">
            <Label htmlFor="channelSecret">チャネルシークレット</Label>
            <Input
              id="channelSecret"
              type="password"
              value={channelSecret}
              onChange={(e) => setChannelSecret(e.target.value)}
              placeholder="チャネルシークレットを入力"
            />
          </div>

          {/* Channel Access Token */}
          <div className="space-y-2">
            <Label htmlFor="channelAccessToken">チャネルアクセストークン</Label>
            <Input
              id="channelAccessToken"
              type="password"
              value={channelAccessToken}
              onChange={(e) => setChannelAccessToken(e.target.value)}
              placeholder="チャネルアクセストークンを入力"
            />
          </div>

          {/* Friend URL display */}
          {profile?.line_friend_url && (
            <div className="space-y-2">
              <Label>友だち追加リンク</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={profile.line_friend_url}
                  readOnly
                  className="bg-muted"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(profile.line_friend_url!)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <a
                  href={profile.line_friend_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            </div>
          )}

          {/* Save button */}
          {saveMessage && (
            <div
              className={`rounded-md p-3 text-sm ${
                saveMessage.includes("失敗")
                  ? "bg-destructive/10 text-destructive"
                  : "bg-green-50 text-green-800"
              }`}
            >
              {saveMessage}
            </div>
          )}
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? "保存中..." : "設定を保存"}
          </Button>
        </CardContent>
      </Card>
        )}

      {/* Friends List Section -- only when connected and guide is closed */}
      {isConnected && !showGuide && (
        <>
          <Separator />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Users className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{totalFriends}</p>
                  <p className="text-xs text-muted-foreground">
                    トータル友だち
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <UserCheck className="h-8 w-8 text-[#06C755]" />
                <div>
                  <p className="text-2xl font-bold">{activeFriends}</p>
                  <p className="text-xs text-muted-foreground">
                    アクティブ友だち
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>友だちリスト</CardTitle>
              <CardDescription>
                LINE公式アカウントの友だち一覧
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingContacts ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : contacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <MessageSquare className="mb-4 h-12 w-12" />
                  <p className="text-center">
                    LINE友だちがまだいません。
                    <br />
                    友だち追加リンクをプロフィールに設定しましょう。
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      {/* Avatar */}
                      {contact.picture_url ? (
                        <img
                          src={contact.picture_url}
                          alt={contact.display_name || ""}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                          {(contact.display_name || "?").charAt(0)}
                        </div>
                      )}

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">
                            {contact.display_name || "不明"}
                          </span>
                          {contact.is_friend ? (
                            <Badge
                              variant="outline"
                              className="border-green-300 text-green-700"
                            >
                              友だち
                            </Badge>
                          ) : (
                            <Badge variant="secondary">ブロック</Badge>
                          )}
                          {!contact.customer_id && (
                            <Badge variant="outline" className="text-xs">
                              顧客未リンク
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {contact.customer?.name && (
                            <span>顧客: {contact.customer.name}</span>
                          )}
                          <span>
                            {new Date(contact.created_at).toLocaleDateString(
                              "ja-JP"
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Send message button */}
                      {contact.is_friend && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSendDialog(contact)}
                        >
                          <Send className="mr-1 h-3.5 w-3.5" />
                          送信
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      </ProGate>

      {/* Send Message Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              メッセージ送信
              {sendTarget?.display_name && ` - ${sendTarget.display_name}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {sendError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {sendError}
              </div>
            )}
            {sendSuccess && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                メッセージを送信しました
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="messageText">メッセージ</Label>
              <Textarea
                id="messageText"
                value={sendMessage}
                onChange={(e) => setSendMessage(e.target.value)}
                placeholder="メッセージを入力..."
                rows={4}
                maxLength={5000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSendDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={sending || !sendMessage.trim()}
            >
              {sending ? "送信中..." : "送信"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
