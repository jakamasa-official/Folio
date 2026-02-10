"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?redirect=/dashboard/settings`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              {APP_NAME}
            </Link>
            <CardTitle className="mt-4 text-xl">メールを送信しました</CardTitle>
            <CardDescription>
              <span className="font-medium text-foreground">{email}</span> にパスワードリセットのリンクを送信しました。
              メール内のリンクをクリックして、パスワードを再設定してください。
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              メールが届かない場合は、迷惑メールフォルダをご確認ください。
            </p>
            <Link href="/login">
              <Button variant="outline" className="mt-6">
                ログインページに戻る
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            {APP_NAME}
          </Link>
          <CardTitle className="mt-4 text-xl">パスワードをお忘れですか？</CardTitle>
          <CardDescription>
            登録済みのメールアドレスを入力してください。パスワードリセットのリンクをお送りします。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "送信中..." : "リセットリンクを送信"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary underline">
              ログインに戻る
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
