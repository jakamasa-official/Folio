"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProfileEditor } from "@/components/editor/profile-editor";
import type { Profile } from "@/lib/types";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("ログインが必要です");
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (queryError) {
        console.error("Profile load error:", queryError);
        setError(`プロフィールの読み込みに失敗しました: ${queryError.message}`);
      } else if (data) {
        setProfile(data as Profile);
      } else {
        setError("プロフィールが見つかりません。設定ページからユーザー名を設定してください。");
      }
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">マイページ編集</h1>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">マイページ編集</h1>
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error || "プロフィールが見つかりません"}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">マイページ編集</h1>
      <ProfileEditor profile={profile} />
    </div>
  );
}
