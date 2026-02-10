import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import type { Profile, SocialLinks } from "@/lib/types";
import { APP_NAME, APP_URL } from "@/lib/constants";
import { ProfilePage } from "@/components/profile/profile-page";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, title, bio, avatar_url")
    .ilike("username", username)
    .eq("is_published", true)
    .maybeSingle();

  if (!profile) return { title: "Not Found" };

  const title = profile.title
    ? `${profile.display_name} - ${profile.title}`
    : profile.display_name;

  return {
    title,
    description: profile.bio || `${profile.display_name}のプロフィール`,
    openGraph: {
      title,
      description: profile.bio || `${profile.display_name}のプロフィール`,
      url: `${APP_URL}/${username}`,
      type: "profile",
      ...(profile.avatar_url && { images: [{ url: profile.avatar_url }] }),
    },
    twitter: {
      card: "summary",
      title,
      description: profile.bio || `${profile.display_name}のプロフィール`,
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", username)
    .eq("is_published", true)
    .maybeSingle();

  if (!profile) notFound();

  // Record page view (fire and forget)
  supabase
    .from("page_views")
    .insert({ profile_id: profile.id })
    .then(() => {});

  return <ProfilePage profile={profile as Profile} />;
}
