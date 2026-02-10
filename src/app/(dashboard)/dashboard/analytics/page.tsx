import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsDashboard } from "@/components/analytics/dashboard";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) redirect("/login");

  // Get page views for the last 30 days
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

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">アナリティクス</h1>
      <AnalyticsDashboard
        views={views || []}
        totalViews={totalViews || 0}
        username={profile.username}
      />
    </div>
  );
}
