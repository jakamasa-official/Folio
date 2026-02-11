import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import type { Profile, StampCard } from "@/lib/types";
import { APP_NAME, APP_URL } from "@/lib/constants";
import { ProfilePage } from "@/components/profile/profile-page";
import { PasswordGateWrapper } from "./password-gate-wrapper";
import { TrackPageView } from "./track-page-view";
import { verifyToken } from "@/app/api/profile/verify-password/route";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, title, bio, avatar_url, settings")
    .ilike("username", username)
    .eq("is_published", true)
    .maybeSingle();

  if (!profile) return { title: "Not Found" };

  const settings = (profile.settings || {}) as { og_title?: string; og_description?: string; og_image_url?: string };

  const title = settings.og_title
    ? settings.og_title
    : profile.title
      ? `${profile.display_name} - ${profile.title}`
      : profile.display_name;

  const description = settings.og_description || profile.bio || `${profile.display_name}のプロフィール`;

  const ogImage = settings.og_image_url || profile.avatar_url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${APP_URL}/${username}`,
      type: "profile",
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: settings.og_image_url ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  // Try custom domain resolution first
  const headersList = await headers();
  const host = headersList.get("host") || "";
  let profile = null;

  if (host && !host.includes("folio") && !host.includes("localhost") && !host.includes("vercel")) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("custom_domain", host)
      .eq("custom_domain_verified", true)
      .eq("is_published", true)
      .maybeSingle();
    profile = data;
  }

  // Fall back to username lookup
  if (!profile) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", username)
      .eq("is_published", true)
      .maybeSingle();
    profile = data;
  }

  if (!profile) notFound();

  const typedProfile = profile as Profile;

  // Check password protection
  if (typedProfile.page_password) {
    const { page_password: _hash, ...safeForGate } = typedProfile;
    const gateProfile = safeForGate as Profile;
    const cookieStore = await cookies();
    const accessCookie = cookieStore.get(`folio_access_${typedProfile.id}`);
    if (!accessCookie?.value) {
      return <PasswordGateWrapper profileId={typedProfile.id} profile={gateProfile} />;
    }
    // Validate HMAC-signed token
    if (!verifyToken(accessCookie.value, typedProfile.id)) {
      return <PasswordGateWrapper profileId={typedProfile.id} profile={gateProfile} />;
    }
  }

  // Strip page_password hash before passing to client components
  const { page_password: _pw, ...safeProfile } = typedProfile;
  const clientProfile = safeProfile as Profile;

  // Fetch total page view count
  const { count: viewCount } = await supabase
    .from("page_views")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", clientProfile.id);

  // Fetch active stamp cards if enabled
  let stampCards: StampCard[] = [];
  if (clientProfile.stamp_card_enabled) {
    const { data: cards } = await supabase
      .from("stamp_cards")
      .select("*")
      .eq("profile_id", clientProfile.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    stampCards = (cards as StampCard[]) || [];
  }

  // Pro users don't show branding
  const showBranding = !clientProfile.is_pro;

  return (
    <>
      <TrackPageView profileId={clientProfile.id} />
      <ProfilePage
        profile={clientProfile}
        showBranding={showBranding}
        viewCount={viewCount ?? undefined}
        stampCards={stampCards}
      />
    </>
  );
}
