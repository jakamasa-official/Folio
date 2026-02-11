import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Metadata } from "next";
import type { StampCard } from "@/lib/types";
import { StampCardPublicView } from "./stamp-card-public-view";

interface Props {
  params: Promise<{ cardId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cardId } = await params;

  const { data: card } = await supabaseAdmin
    .from("stamp_cards")
    .select("name")
    .eq("id", cardId)
    .eq("is_active", true)
    .maybeSingle();

  if (!card) return { title: "Not Found" };

  return {
    title: `${card.name} - スタンプカード`,
    description: `${card.name}のスタンプカードです。スタンプを集めて特典をゲットしよう！`,
  };
}

export default async function StampCardPage({ params }: Props) {
  const { cardId } = await params;

  const { data: card, error } = await supabaseAdmin
    .from("stamp_cards")
    .select("*")
    .eq("id", cardId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !card) notFound();

  const typedCard = card as StampCard;

  // Fetch profile display name for branding
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("display_name, username")
    .eq("id", typedCard.profile_id)
    .maybeSingle();

  return (
    <StampCardPublicView
      card={typedCard}
      profileName={profile?.display_name || ""}
      profileUsername={profile?.username || ""}
    />
  );
}
