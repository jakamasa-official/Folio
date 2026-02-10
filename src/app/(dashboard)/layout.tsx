"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DashboardNav } from "@/components/dashboard/nav";
import type { User } from "@supabase/supabase-js";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setUser(user);

      // Fetch or create profile
      let { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) {
        const metadata = user.user_metadata || {};
        const fallbackUsername = user.email?.split("@")[0]?.replace(/[^a-z0-9_-]/gi, "-")?.slice(0, 30) || `user-${user.id.slice(0, 8)}`;
        const uname = (metadata.username || fallbackUsername).toLowerCase();
        const displayName = metadata.display_name || uname;

        const { data: newProfile, error } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            username: uname,
            display_name: displayName,
          })
          .select()
          .single();

        if (error) {
          const uniqueUsername = `${uname.slice(0, 22)}-${Math.random().toString(36).slice(2, 8)}`;
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

      setUsername(profile?.username);
      setLoading(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <DashboardNav username={username} />
      <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64">
        {children}
      </main>
    </div>
  );
}
