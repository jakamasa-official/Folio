"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Globe, AlertTriangle, CheckCircle, Clock, Trash2 } from "lucide-react";

export default function DomainPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profileData) return;
    const p = profileData as Profile;
    setProfile(p);
    setDomain(p.custom_domain || "");
    setLoading(false);
  }

  async function saveDomain() {
    if (!profile) return;
    setSaving(true);

    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({
        custom_domain: domain.trim() || null,
        custom_domain_verified: false,
      })
      .eq("id", profile.id);

    setProfile((prev) =>
      prev
        ? { ...prev, custom_domain: domain.trim() || null, custom_domain_verified: false }
        : null
    );
    setSaving(false);
  }

  async function removeDomain() {
    if (!profile) return;
    if (!confirm("カスタムドメインを削除しますか？")) return;
    setRemoving(true);

    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({
        custom_domain: null,
        custom_domain_verified: false,
      })
      .eq("id", profile.id);

    setProfile((prev) =>
      prev
        ? { ...prev, custom_domain: null, custom_domain_verified: false }
        : null
    );
    setDomain("");
    setRemoving(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">カスタムドメイン</h1>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // Pro-only gate
  if (!profile.is_pro) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">カスタムドメイン</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="mb-4 h-12 w-12 text-yellow-500" />
            <h2 className="mb-2 text-lg font-semibold">Proプランが必要です</h2>
            <p className="mb-4 text-muted-foreground">
              カスタムドメインの設定はProプランの機能です。アップグレードすることでご利用いただけます。
            </p>
            <Button asChild>
              <a href="/dashboard/settings">プランをアップグレード</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">カスタムドメイン</h1>

      <Card>
        <CardHeader>
          <CardTitle>ドメイン設定</CardTitle>
          <CardDescription>
            独自ドメインを設定してページをカスタマイズします
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">ドメイン名</Label>
            <div className="flex gap-2">
              <Input
                id="domain"
                type="text"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
              <Button onClick={saveDomain} disabled={saving}>
                {saving ? "保存中..." : "保存"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DNS Instructions - shown when domain is set */}
      {profile.custom_domain && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle>DNS設定</CardTitle>
                {profile.custom_domain_verified ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    確認済み
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                    <Clock className="mr-1 h-3 w-3" />
                    確認待ち
                  </Badge>
                )}
              </div>
              <CardDescription>
                以下のDNSレコードを設定してください：
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left font-medium">タイプ</th>
                      <th className="px-4 py-2 text-left font-medium">名前</th>
                      <th className="px-4 py-2 text-left font-medium">値</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-2">
                        <Badge variant="outline">CNAME</Badge>
                      </td>
                      <td className="px-4 py-2 font-mono text-xs">@</td>
                      <td className="px-4 py-2 font-mono text-xs">
                        cname.vercel-dns.com
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">
                        <Badge variant="outline">CNAME</Badge>
                      </td>
                      <td className="px-4 py-2 font-mono text-xs">www</td>
                      <td className="px-4 py-2 font-mono text-xs">
                        cname.vercel-dns.com
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                <p>
                  DNSの反映には最大48時間かかることがあります。設定後、しばらくお待ちください。
                </p>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">ドメインを削除</CardTitle>
              <CardDescription>
                カスタムドメインの設定を削除します。削除後はデフォルトのURLに戻ります。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={removeDomain}
                disabled={removing}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {removing ? "削除中..." : "ドメインを削除"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
