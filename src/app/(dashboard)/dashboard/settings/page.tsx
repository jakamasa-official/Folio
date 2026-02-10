"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("パスワードを変更しました");
      setNewPassword("");
    }
    setLoading(false);
  }

  async function handleDeleteAccount() {
    if (!confirm("本当にアカウントを削除しますか？この操作は取り消せません。")) return;
    if (!confirm("全てのデータが削除されます。よろしいですか？")) return;

    const supabase = createClient();
    // Delete profile (cascade will handle related data)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").delete().eq("user_id", user.id);
    }
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">設定</h1>

      <Card>
        <CardHeader>
          <CardTitle>パスワード変更</CardTitle>
          <CardDescription>アカウントのパスワードを変更します</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            {message && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{message}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPassword">新しいパスワード</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "変更中..." : "パスワードを変更"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">アカウント削除</CardTitle>
          <CardDescription>
            アカウントと全てのデータを完全に削除します。この操作は取り消せません。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDeleteAccount}>
            アカウントを削除する
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
