import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard/nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Auto-create profile if user confirmed email but profile doesn't exist yet
  if (!profile) {
    const metadata = user.user_metadata || {};
    const fallbackUsername = user.email?.split("@")[0]?.replace(/[^a-z0-9_-]/gi, "-")?.slice(0, 30) || `user-${user.id.slice(0, 8)}`;
    const username = (metadata.username || fallbackUsername).toLowerCase();
    const displayName = metadata.display_name || username;

    const { data: newProfile, error } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        username,
        display_name: displayName,
      })
      .select()
      .single();

    if (error) {
      // Username might be taken — try with a random suffix
      const uniqueUsername = `${username.slice(0, 22)}-${Math.random().toString(36).slice(2, 8)}`;
      const { data: retryProfile } = await supabase
        .from("profiles")
        .insert({
          user_id: user.id,
          username: uniqueUsername,
          display_name: displayName,
        })
        .select()
        .single();
      profile = retryProfile;
    } else {
      profile = newProfile;
    }
  }

  return (
    <div className="flex min-h-screen">
      <DashboardNav username={profile?.username} />
      <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64">
        {children}
      </main>
    </div>
  );
}
