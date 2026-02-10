"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AnalyticsDashboard } from "@/components/analytics/dashboard";

export default function AnalyticsPage() {
  const [data, setData] = useState<{
    views: { viewed_at: string }[];
    totalViews: number;
    username: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) return;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: views } = await supabase
        .from("page_views")
        .select("viewed_at")
        .eq("profile_id", profile.id)
        .gte("viewed_at", thirtyDaysAgo.toISOString())
        .order("viewed_at", { ascending: true });

      const { count: totalViews } = await supabase
        .from("page_views")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profile.id);

      setData({
        views: views || [],
        totalViews: totalViews || 0,
        username: profile.username,
      });
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">アナリティクス</h1>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">アナリティクス</h1>
      <AnalyticsDashboard
        views={data.views}
        totalViews={data.totalViews}
        username={data.username}
      />
    </div>
  );
}
