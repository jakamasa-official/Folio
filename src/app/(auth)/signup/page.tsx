"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { USERNAME_REGEX } from "@/lib/constants";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!USERNAME_REGEX.test(username)) {
      setError("ユーザー名は3〜30文字の英数字、ハイフン、アンダースコアのみ使用できます");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Check if username is taken
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", username)
      .maybeSingle();

    if (existing) {
      setError("このユーザー名は既に使用されています");
      setLoading(false);
      return;
    }

    // Sign up — pass username/displayName as metadata so we can create the profile
    // after email confirmation via a database trigger or on first login
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          display_name: displayName || username,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Check if we got a session (email confirmation disabled) or just a user (confirmation required)
    if (authData.session) {
      // Session available — create profile immediately
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: authData.user!.id,
        username: username.toLowerCase(),
        display_name: displayName || username,
      });

      if (profileError) {
        setError("プロフィールの作成に失敗しました。もう一度お試しください。");
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } else {
      // No session — email confirmation is required
      setConfirmEmail(true);
      setLoading(false);
    }
  }

  if (confirmEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              {APP_NAME}
            </Link>
            <CardTitle className="mt-4 text-xl">メールを確認してください</CardTitle>
            <CardDescription>
              <span className="font-medium text-foreground">{email}</span> に確認メールを送信しました。
              メール内のリンクをクリックして、登録を完了してください。
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
          <CardTitle className="mt-4 text-xl">新規登録</CardTitle>
          <CardDescription>
            無料でプロフィールページを作成しましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">ユーザー名</Label>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>folio.jp/</span>
                <Input
                  id="username"
                  type="text"
                  placeholder="your-name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  required
                  minLength={3}
                  maxLength={30}
                  className="flex-1"
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">表示名</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="山田 太郎"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="6文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "登録中..." : "無料で始める"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            既にアカウントをお持ちですか？{" "}
            <Link href="/login" className="text-primary underline">
              ログイン
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
