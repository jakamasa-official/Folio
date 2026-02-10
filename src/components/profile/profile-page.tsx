import Link from "next/link";
import type { Profile, SocialLinks, TemplateId } from "@/lib/types";
import { APP_NAME, APP_URL } from "@/lib/constants";
import { ContactForm } from "./contact-form";
import { BookingWidget } from "./booking-widget";
import { EmailSubscribe } from "./email-subscribe";
import {
  Globe,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Star,
} from "lucide-react";
import {
  SiX,
  SiInstagram,
  SiYoutube,
  SiGithub,
  SiLinkedin,
  SiFacebook,
  SiLine,
  SiTiktok,
} from "react-icons/si";
import { DAYS_OF_WEEK } from "@/lib/types";

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  twitter: SiX,
  instagram: SiInstagram,
  youtube: SiYoutube,
  github: SiGithub,
  linkedin: SiLinkedin,
  facebook: SiFacebook,
  website: Globe,
  line: SiLine,
  tiktok: SiTiktok,
};

function SocialIcon({ platform }: { platform: string }) {
  const Icon = socialIcons[platform];
  if (!Icon) return null;
  return <Icon className="h-5 w-5" />;
}

interface ProfilePageProps {
  profile: Profile;
  showBranding?: boolean;
}

export function ProfilePage({ profile, showBranding = true }: ProfilePageProps) {
  const templateStyles = getTemplateStyles(profile.template);
  const socialEntries = Object.entries(profile.social_links || {}).filter(
    ([, url]) => url && url.trim() !== ""
  );

  // Apply custom colors from settings if set
  const customBg = profile.settings?.background_color
    ? { backgroundColor: profile.settings.background_color }
    : undefined;
  const customText = profile.settings?.text_color
    ? { color: profile.settings.text_color }
    : undefined;

  const bgStyle: React.CSSProperties = customBg
    ? customBg
    : templateStyles.bgImage
      ? {
          backgroundImage: `url(${templateStyles.bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }
      : {};

  return (
    <div
      className={`min-h-screen ${!customBg && !templateStyles.bgImage ? templateStyles.bg : ""}`}
      style={bgStyle}
    >
      <div className="mx-auto max-w-lg px-4 py-12">
        {/* Avatar */}
        <div className="flex flex-col items-center text-center">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className={`h-24 w-24 rounded-full object-cover ring-2 ${templateStyles.ring}`}
            />
          ) : (
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold ${templateStyles.avatarFallback}`}
            >
              {profile.display_name.charAt(0).toUpperCase()}
            </div>
          )}

          <h1
            className={`mt-4 text-2xl font-bold ${!customText ? templateStyles.text : ""}`}
            style={customText}
          >
            {profile.display_name}
          </h1>

          {profile.title && (
            <p className={`mt-1 text-sm ${templateStyles.subtext}`}>
              {profile.title}
            </p>
          )}

          {profile.bio && (
            <p className={`mt-3 text-sm leading-relaxed ${templateStyles.subtext}`}>
              {profile.bio}
            </p>
          )}

          {/* Contact & Location */}
          <div className={`mt-3 flex flex-wrap items-center justify-center gap-3 text-xs ${templateStyles.subtext}`}>
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {profile.location}
              </span>
            )}
            {profile.contact_email && (
              <a href={`mailto:${profile.contact_email}`} className="flex items-center gap-1 hover:underline">
                <Mail className="h-3 w-3" />
                {profile.contact_email}
              </a>
            )}
            {profile.contact_phone && (
              <a href={`tel:${profile.contact_phone}`} className="flex items-center gap-1 hover:underline">
                <Phone className="h-3 w-3" />
                {profile.contact_phone}
              </a>
            )}
          </div>

          {/* Social icons */}
          {socialEntries.length > 0 && (
            <div className="mt-4 flex gap-3">
              {socialEntries.map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-full p-2 transition-colors ${templateStyles.socialBtn}`}
                  aria-label={platform}
                >
                  <SocialIcon platform={platform} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* LINE Friend Button */}
        {profile.line_friend_url && (
          <div className="mt-6">
            <a
              href={profile.line_friend_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#06C755] px-5 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <SiLine className="h-5 w-5" />
              LINEで友だち追加
            </a>
          </div>
        )}

        {/* Links */}
        {profile.links.length > 0 && (
          <div className="mt-6 space-y-3">
            {profile.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between rounded-lg px-5 py-3.5 text-sm font-medium transition-all hover:scale-[1.02] ${templateStyles.linkBtn}`}
              >
                <span>{link.label}</span>
                <ExternalLink className="h-4 w-4 opacity-50" />
              </a>
            ))}
          </div>
        )}

        {/* Google Review Button */}
        {profile.google_review_url && (
          <div className="mt-6">
            <a
              href={profile.google_review_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex w-full items-center justify-center gap-2 rounded-lg border px-5 py-3.5 text-sm font-medium transition-all hover:scale-[1.02] ${templateStyles.card} ${templateStyles.text}`}
            >
              <Star className="h-4 w-4 text-yellow-500" />
              Google口コミを書く
            </a>
          </div>
        )}

        {/* Business hours */}
        {profile.business_hours && Object.keys(profile.business_hours).length > 0 && (
          <div className={`mt-8 rounded-lg p-4 ${templateStyles.card}`}>
            <h3 className={`mb-2 text-sm font-semibold ${templateStyles.text}`}>
              営業時間
            </h3>
            <div className="space-y-1">
              {DAYS_OF_WEEK.map(({ key, label }) => {
                const hours = profile.business_hours?.[key];
                if (!hours) return null;
                return (
                  <div key={key} className={`flex justify-between text-xs ${templateStyles.subtext}`}>
                    <span>{label}</span>
                    <span>
                      {hours.closed ? "定休日" : `${hours.open} - ${hours.close}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Booking Widget */}
        {profile.booking_enabled && profile.booking_slots && (
          <div className="mt-8">
            <BookingWidget profileId={profile.id} slots={profile.booking_slots} />
          </div>
        )}

        {/* Contact Form */}
        {profile.contact_form_enabled && (
          <div className="mt-8">
            <ContactForm profileId={profile.id} />
          </div>
        )}

        {/* Email Subscribe */}
        {profile.email_collection_enabled && (
          <div className="mt-8">
            <EmailSubscribe profileId={profile.id} />
          </div>
        )}

        {/* Powered by */}
        {showBranding && (
          <div className="mt-12 text-center">
            <Link
              href={APP_URL}
              className={`inline-flex items-center gap-1 text-xs ${templateStyles.subtext} opacity-60 hover:opacity-100 transition-opacity`}
            >
              Powered by {APP_NAME}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function getTemplateStyles(template: TemplateId | string) {
  switch (template) {
    case "professional":
      return {
        bg: "bg-white",
        bgImage: undefined as string | undefined,
        text: "text-gray-900",
        subtext: "text-gray-600",
        ring: "ring-gray-200",
        avatarFallback: "bg-gray-100 text-gray-600",
        linkBtn: "bg-gray-900 text-white hover:bg-gray-800",
        socialBtn: "bg-gray-100 text-gray-700 hover:bg-gray-200",
        card: "bg-gray-50",
      };
    case "minimal":
      return {
        bg: "bg-stone-50",
        bgImage: undefined as string | undefined,
        text: "text-stone-900",
        subtext: "text-stone-500",
        ring: "ring-stone-200",
        avatarFallback: "bg-stone-200 text-stone-600",
        linkBtn: "border border-stone-300 text-stone-800 hover:bg-stone-100",
        socialBtn: "text-stone-500 hover:text-stone-800",
        card: "bg-white border border-stone-200",
      };
    case "business":
      return {
        bg: "bg-slate-50",
        bgImage: undefined as string | undefined,
        text: "text-slate-900",
        subtext: "text-slate-600",
        ring: "ring-blue-200",
        avatarFallback: "bg-blue-100 text-blue-700",
        linkBtn: "bg-blue-600 text-white hover:bg-blue-700",
        socialBtn: "bg-blue-50 text-blue-600 hover:bg-blue-100",
        card: "bg-white shadow-sm",
      };
    case "creative":
      return {
        bg: "bg-gradient-to-br from-violet-50 to-pink-50",
        bgImage: undefined as string | undefined,
        text: "text-gray-900",
        subtext: "text-gray-600",
        ring: "ring-violet-200",
        avatarFallback: "bg-gradient-to-br from-violet-400 to-pink-400 text-white",
        linkBtn: "bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:from-violet-600 hover:to-pink-600",
        socialBtn: "bg-violet-100 text-violet-600 hover:bg-violet-200",
        card: "bg-white/70 backdrop-blur-sm",
      };
    // Premium templates
    case "elegant":
      return {
        bg: "bg-amber-50",
        bgImage: "/images/bg-elegant.png",
        text: "text-amber-950",
        subtext: "text-amber-800/70",
        ring: "ring-amber-300",
        avatarFallback: "bg-amber-200 text-amber-800",
        linkBtn: "border border-amber-300 bg-white/80 backdrop-blur-sm text-amber-900 hover:bg-white",
        socialBtn: "text-amber-700 hover:text-amber-900",
        card: "bg-white/70 backdrop-blur-sm border border-amber-200",
      };
    case "neon":
      return {
        bg: "bg-gray-950",
        bgImage: "/images/bg-dark-bokeh.png",
        text: "text-white",
        subtext: "text-gray-400",
        ring: "ring-cyan-500",
        avatarFallback: "bg-gray-800 text-cyan-400",
        linkBtn: "border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] backdrop-blur-sm",
        socialBtn: "text-cyan-400 hover:text-cyan-300",
        card: "bg-gray-900/80 backdrop-blur-sm border border-gray-800",
      };
    case "japanese":
      return {
        bg: "bg-[#f5f0e8]",
        bgImage: "/images/bg-japanese.png",
        text: "text-[#3d3229]",
        subtext: "text-[#7d7067]",
        ring: "ring-[#c4a882]",
        avatarFallback: "bg-[#e8ddd0] text-[#7d6b56]",
        linkBtn: "border border-[#c4a882] text-[#3d3229] hover:bg-[#ebe3d6] bg-white/50 backdrop-blur-sm",
        socialBtn: "text-[#7d6b56] hover:text-[#3d3229]",
        card: "bg-white/50 backdrop-blur-sm border border-[#d4c4ad]",
      };
    case "photo-grid":
      return {
        bg: "bg-neutral-900",
        bgImage: undefined as string | undefined,
        text: "text-white",
        subtext: "text-neutral-400",
        ring: "ring-white/30",
        avatarFallback: "bg-neutral-800 text-neutral-300",
        linkBtn: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm",
        socialBtn: "text-neutral-400 hover:text-white",
        card: "bg-white/5 border border-white/10",
      };

    // === Nature ===
    case "ocean":
      return {
        bg: "bg-gradient-to-b from-sky-900 via-blue-800 to-cyan-900",
        bgImage: undefined as string | undefined,
        text: "text-white",
        subtext: "text-sky-200",
        ring: "ring-cyan-400",
        avatarFallback: "bg-sky-800 text-cyan-300",
        linkBtn: "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20",
        socialBtn: "text-cyan-300 hover:text-white",
        card: "bg-white/10 backdrop-blur-sm border border-white/15",
      };
    case "sunset":
      return {
        bg: "bg-gradient-to-b from-orange-400 via-rose-400 to-purple-500",
        bgImage: undefined as string | undefined,
        text: "text-white",
        subtext: "text-orange-100",
        ring: "ring-orange-300",
        avatarFallback: "bg-orange-500 text-white",
        linkBtn: "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25",
        socialBtn: "text-orange-100 hover:text-white",
        card: "bg-white/15 backdrop-blur-sm border border-white/20",
      };
    case "aurora":
      return {
        bg: "bg-gradient-to-br from-indigo-950 via-emerald-900 to-purple-900",
        bgImage: undefined as string | undefined,
        text: "text-white",
        subtext: "text-emerald-200",
        ring: "ring-emerald-400",
        avatarFallback: "bg-emerald-800 text-emerald-200",
        linkBtn: "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 backdrop-blur-sm border border-emerald-400/30",
        socialBtn: "text-emerald-300 hover:text-emerald-100",
        card: "bg-emerald-900/30 backdrop-blur-sm border border-emerald-500/20",
      };
    case "forest":
      return {
        bg: "bg-gradient-to-b from-green-900 via-emerald-900 to-green-950",
        bgImage: undefined as string | undefined,
        text: "text-green-50",
        subtext: "text-green-300",
        ring: "ring-green-500",
        avatarFallback: "bg-green-800 text-green-200",
        linkBtn: "bg-green-700/50 text-green-100 hover:bg-green-700/70 border border-green-600/40",
        socialBtn: "text-green-400 hover:text-green-200",
        card: "bg-green-800/40 border border-green-700/30",
      };
    case "sakura":
      return {
        bg: "bg-gradient-to-b from-pink-100 via-pink-50 to-rose-100",
        bgImage: undefined as string | undefined,
        text: "text-pink-900",
        subtext: "text-pink-600",
        ring: "ring-pink-300",
        avatarFallback: "bg-pink-200 text-pink-700",
        linkBtn: "bg-pink-500 text-white hover:bg-pink-600",
        socialBtn: "bg-pink-100 text-pink-600 hover:bg-pink-200",
        card: "bg-white/70 backdrop-blur-sm border border-pink-200",
      };
    case "desert":
      return {
        bg: "bg-gradient-to-b from-amber-100 via-orange-100 to-yellow-50",
        bgImage: undefined as string | undefined,
        text: "text-amber-950",
        subtext: "text-amber-700",
        ring: "ring-amber-400",
        avatarFallback: "bg-amber-200 text-amber-800",
        linkBtn: "bg-amber-600 text-white hover:bg-amber-700",
        socialBtn: "bg-amber-100 text-amber-700 hover:bg-amber-200",
        card: "bg-white/60 border border-amber-200",
      };

    // === Pastel ===
    case "pastel-pink":
      return {
        bg: "bg-pink-50",
        bgImage: undefined as string | undefined,
        text: "text-pink-900",
        subtext: "text-pink-500",
        ring: "ring-pink-300",
        avatarFallback: "bg-pink-200 text-pink-700",
        linkBtn: "bg-pink-400 text-white hover:bg-pink-500",
        socialBtn: "bg-pink-100 text-pink-500 hover:bg-pink-200",
        card: "bg-white border border-pink-200",
      };
    case "pastel-blue":
      return {
        bg: "bg-sky-50",
        bgImage: undefined as string | undefined,
        text: "text-sky-900",
        subtext: "text-sky-500",
        ring: "ring-sky-300",
        avatarFallback: "bg-sky-200 text-sky-700",
        linkBtn: "bg-sky-400 text-white hover:bg-sky-500",
        socialBtn: "bg-sky-100 text-sky-500 hover:bg-sky-200",
        card: "bg-white border border-sky-200",
      };
    case "pastel-mint":
      return {
        bg: "bg-emerald-50",
        bgImage: undefined as string | undefined,
        text: "text-emerald-900",
        subtext: "text-emerald-500",
        ring: "ring-emerald-300",
        avatarFallback: "bg-emerald-200 text-emerald-700",
        linkBtn: "bg-emerald-400 text-white hover:bg-emerald-500",
        socialBtn: "bg-emerald-100 text-emerald-500 hover:bg-emerald-200",
        card: "bg-white border border-emerald-200",
      };
    case "pastel-lavender":
      return {
        bg: "bg-violet-50",
        bgImage: undefined as string | undefined,
        text: "text-violet-900",
        subtext: "text-violet-500",
        ring: "ring-violet-300",
        avatarFallback: "bg-violet-200 text-violet-700",
        linkBtn: "bg-violet-400 text-white hover:bg-violet-500",
        socialBtn: "bg-violet-100 text-violet-500 hover:bg-violet-200",
        card: "bg-white border border-violet-200",
      };
    case "pastel-peach":
      return {
        bg: "bg-orange-50",
        bgImage: undefined as string | undefined,
        text: "text-orange-900",
        subtext: "text-orange-500",
        ring: "ring-orange-300",
        avatarFallback: "bg-orange-200 text-orange-700",
        linkBtn: "bg-orange-400 text-white hover:bg-orange-500",
        socialBtn: "bg-orange-100 text-orange-500 hover:bg-orange-200",
        card: "bg-white border border-orange-200",
      };

    // === Dark ===
    case "midnight":
      return {
        bg: "bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950",
        bgImage: undefined as string | undefined,
        text: "text-white",
        subtext: "text-indigo-300",
        ring: "ring-indigo-500",
        avatarFallback: "bg-indigo-900 text-indigo-300",
        linkBtn: "bg-indigo-600/30 text-indigo-200 hover:bg-indigo-600/50 border border-indigo-500/30",
        socialBtn: "text-indigo-400 hover:text-indigo-200",
        card: "bg-indigo-900/30 border border-indigo-800/40",
      };
    case "charcoal":
      return {
        bg: "bg-neutral-900",
        bgImage: undefined as string | undefined,
        text: "text-neutral-100",
        subtext: "text-neutral-400",
        ring: "ring-neutral-600",
        avatarFallback: "bg-neutral-800 text-neutral-300",
        linkBtn: "bg-neutral-700 text-neutral-100 hover:bg-neutral-600",
        socialBtn: "text-neutral-400 hover:text-neutral-200",
        card: "bg-neutral-800 border border-neutral-700",
      };
    case "dark-purple":
      return {
        bg: "bg-gradient-to-b from-purple-950 to-fuchsia-950",
        bgImage: undefined as string | undefined,
        text: "text-purple-50",
        subtext: "text-purple-300",
        ring: "ring-purple-500",
        avatarFallback: "bg-purple-800 text-purple-200",
        linkBtn: "bg-purple-700/50 text-purple-100 hover:bg-purple-700/70 border border-purple-500/30",
        socialBtn: "text-purple-400 hover:text-purple-200",
        card: "bg-purple-900/40 border border-purple-700/30",
      };
    case "dark-green":
      return {
        bg: "bg-gradient-to-b from-gray-950 via-green-950 to-gray-950",
        bgImage: undefined as string | undefined,
        text: "text-green-50",
        subtext: "text-green-400",
        ring: "ring-green-600",
        avatarFallback: "bg-green-900 text-green-300",
        linkBtn: "bg-green-800/50 text-green-200 hover:bg-green-800/70 border border-green-600/30",
        socialBtn: "text-green-500 hover:text-green-300",
        card: "bg-green-900/30 border border-green-800/40",
      };
    case "dark-red":
      return {
        bg: "bg-gradient-to-b from-gray-950 via-red-950 to-gray-950",
        bgImage: undefined as string | undefined,
        text: "text-red-50",
        subtext: "text-red-300",
        ring: "ring-red-600",
        avatarFallback: "bg-red-900 text-red-300",
        linkBtn: "bg-red-800/50 text-red-200 hover:bg-red-800/70 border border-red-600/30",
        socialBtn: "text-red-400 hover:text-red-200",
        card: "bg-red-900/30 border border-red-800/40",
      };
    case "slate-dark":
      return {
        bg: "bg-slate-900",
        bgImage: undefined as string | undefined,
        text: "text-slate-100",
        subtext: "text-slate-400",
        ring: "ring-slate-500",
        avatarFallback: "bg-slate-800 text-slate-300",
        linkBtn: "bg-slate-700 text-slate-100 hover:bg-slate-600 border border-slate-600",
        socialBtn: "text-slate-400 hover:text-slate-200",
        card: "bg-slate-800 border border-slate-700",
      };

    // === Gradient ===
    case "gradient-sunset":
      return {
        bg: "bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300",
        bgImage: undefined as string | undefined,
        text: "text-white",
        subtext: "text-white/80",
        ring: "ring-white/50",
        avatarFallback: "bg-white/20 text-white backdrop-blur-sm",
        linkBtn: "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30",
        socialBtn: "text-white/80 hover:text-white",
        card: "bg-white/15 backdrop-blur-sm border border-white/20",
      };
    case "gradient-ocean":
      return {
        bg: "bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600",
        bgImage: undefined as string | undefined,
        text: "text-white",
        subtext: "text-white/80",
        ring: "ring-white/50",
        avatarFallback: "bg-white/20 text-white backdrop-blur-sm",
        linkBtn: "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30",
        socialBtn: "text-white/80 hover:text-white",
        card: "bg-white/15 backdrop-blur-sm border border-white/20",
      };
    case "gradient-berry":
      return {
        bg: "bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500",
        bgImage: undefined as string | undefined,
        text: "text-white",
        subtext: "text-white/80",
        ring: "ring-white/50",
        avatarFallback: "bg-white/20 text-white backdrop-blur-sm",
        linkBtn: "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30",
        socialBtn: "text-white/80 hover:text-white",
        card: "bg-white/15 backdrop-blur-sm border border-white/20",
      };
    case "gradient-fire":
      return {
        bg: "bg-gradient-to-br from-red-600 via-orange-500 to-yellow-400",
        bgImage: undefined as string | undefined,
        text: "text-white",
        subtext: "text-white/80",
        ring: "ring-yellow-300/50",
        avatarFallback: "bg-white/20 text-white backdrop-blur-sm",
        linkBtn: "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30",
        socialBtn: "text-white/80 hover:text-white",
        card: "bg-white/15 backdrop-blur-sm border border-white/20",
      };
    case "gradient-mint":
      return {
        bg: "bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500",
        bgImage: undefined as string | undefined,
        text: "text-white",
        subtext: "text-white/80",
        ring: "ring-white/50",
        avatarFallback: "bg-white/20 text-white backdrop-blur-sm",
        linkBtn: "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30",
        socialBtn: "text-white/80 hover:text-white",
        card: "bg-white/15 backdrop-blur-sm border border-white/20",
      };
    case "gradient-twilight":
      return {
        bg: "bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700",
        bgImage: undefined as string | undefined,
        text: "text-white",
        subtext: "text-indigo-200",
        ring: "ring-indigo-300/50",
        avatarFallback: "bg-white/20 text-white backdrop-blur-sm",
        linkBtn: "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/25",
        socialBtn: "text-indigo-200 hover:text-white",
        card: "bg-white/10 backdrop-blur-sm border border-white/15",
      };

    // === Retro/Pop ===
    case "retro":
      return {
        bg: "bg-amber-50",
        bgImage: undefined as string | undefined,
        text: "text-amber-900",
        subtext: "text-amber-700",
        ring: "ring-orange-400",
        avatarFallback: "bg-orange-300 text-orange-900",
        linkBtn: "bg-orange-600 text-white hover:bg-orange-700 rounded-none",
        socialBtn: "bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-none",
        card: "bg-orange-50 border-2 border-orange-300 rounded-none",
      };
    case "synthwave":
      return {
        bg: "bg-gradient-to-b from-violet-950 via-fuchsia-950 to-slate-950",
        bgImage: undefined as string | undefined,
        text: "text-fuchsia-200",
        subtext: "text-fuchsia-400",
        ring: "ring-fuchsia-500",
        avatarFallback: "bg-fuchsia-900 text-fuchsia-300",
        linkBtn: "bg-fuchsia-600/30 text-fuchsia-300 hover:bg-fuchsia-600/50 border border-fuchsia-500/50 hover:shadow-[0_0_15px_rgba(217,70,239,0.3)]",
        socialBtn: "text-fuchsia-400 hover:text-fuchsia-200",
        card: "bg-fuchsia-900/20 border border-fuchsia-700/30",
      };
    case "vaporwave":
      return {
        bg: "bg-gradient-to-br from-pink-300 via-purple-300 to-cyan-300",
        bgImage: undefined as string | undefined,
        text: "text-purple-900",
        subtext: "text-purple-700",
        ring: "ring-pink-400",
        avatarFallback: "bg-pink-400 text-white",
        linkBtn: "bg-white/40 text-purple-900 hover:bg-white/60 backdrop-blur-sm border border-white/50",
        socialBtn: "text-purple-700 hover:text-purple-900 bg-white/30",
        card: "bg-white/30 backdrop-blur-sm border border-white/40",
      };
    case "pop-art":
      return {
        bg: "bg-yellow-300",
        bgImage: undefined as string | undefined,
        text: "text-black",
        subtext: "text-gray-800",
        ring: "ring-red-500",
        avatarFallback: "bg-red-500 text-white",
        linkBtn: "bg-black text-yellow-300 hover:bg-gray-900 border-2 border-black font-bold",
        socialBtn: "bg-red-500 text-white hover:bg-red-600",
        card: "bg-white border-2 border-black",
      };
    case "pixel":
      return {
        bg: "bg-gray-900",
        bgImage: undefined as string | undefined,
        text: "text-green-400",
        subtext: "text-green-600",
        ring: "ring-green-500",
        avatarFallback: "bg-black text-green-400 border-2 border-green-500",
        linkBtn: "bg-green-500 text-black hover:bg-green-400 rounded-none border-2 border-green-400 font-mono",
        socialBtn: "text-green-500 hover:text-green-400 rounded-none",
        card: "bg-black border-2 border-green-500 rounded-none",
      };

    // === Monochrome ===
    case "mono-black":
      return {
        bg: "bg-black",
        bgImage: undefined as string | undefined,
        text: "text-white",
        subtext: "text-gray-400",
        ring: "ring-white",
        avatarFallback: "bg-white text-black",
        linkBtn: "bg-white text-black hover:bg-gray-200",
        socialBtn: "text-gray-400 hover:text-white",
        card: "bg-white/5 border border-white/10",
      };
    case "mono-white":
      return {
        bg: "bg-white",
        bgImage: undefined as string | undefined,
        text: "text-black",
        subtext: "text-gray-500",
        ring: "ring-black",
        avatarFallback: "bg-black text-white",
        linkBtn: "bg-black text-white hover:bg-gray-800",
        socialBtn: "text-gray-500 hover:text-black",
        card: "bg-gray-50 border border-gray-200",
      };
    case "mono-gray":
      return {
        bg: "bg-gray-200",
        bgImage: undefined as string | undefined,
        text: "text-gray-900",
        subtext: "text-gray-600",
        ring: "ring-gray-500",
        avatarFallback: "bg-gray-500 text-white",
        linkBtn: "bg-gray-700 text-gray-100 hover:bg-gray-600",
        socialBtn: "bg-gray-300 text-gray-600 hover:bg-gray-400",
        card: "bg-white/80 border border-gray-300",
      };
    case "mono-sepia":
      return {
        bg: "bg-amber-50",
        bgImage: undefined as string | undefined,
        text: "text-yellow-950",
        subtext: "text-yellow-800/70",
        ring: "ring-yellow-700/50",
        avatarFallback: "bg-yellow-800/20 text-yellow-900",
        linkBtn: "bg-yellow-900 text-amber-50 hover:bg-yellow-800",
        socialBtn: "text-yellow-800 hover:text-yellow-950",
        card: "bg-yellow-100/50 border border-yellow-800/20",
      };

    // === Material ===
    case "material-blue":
      return {
        bg: "bg-blue-50",
        bgImage: undefined as string | undefined,
        text: "text-blue-900",
        subtext: "text-blue-600",
        ring: "ring-blue-400",
        avatarFallback: "bg-blue-500 text-white",
        linkBtn: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg",
        socialBtn: "bg-blue-100 text-blue-600 hover:bg-blue-200",
        card: "bg-white shadow-md",
      };
    case "material-green":
      return {
        bg: "bg-green-50",
        bgImage: undefined as string | undefined,
        text: "text-green-900",
        subtext: "text-green-600",
        ring: "ring-green-400",
        avatarFallback: "bg-green-500 text-white",
        linkBtn: "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg",
        socialBtn: "bg-green-100 text-green-600 hover:bg-green-200",
        card: "bg-white shadow-md",
      };
    case "material-red":
      return {
        bg: "bg-red-50",
        bgImage: undefined as string | undefined,
        text: "text-red-900",
        subtext: "text-red-600",
        ring: "ring-red-400",
        avatarFallback: "bg-red-500 text-white",
        linkBtn: "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg",
        socialBtn: "bg-red-100 text-red-600 hover:bg-red-200",
        card: "bg-white shadow-md",
      };
    case "material-amber":
      return {
        bg: "bg-amber-50",
        bgImage: undefined as string | undefined,
        text: "text-amber-900",
        subtext: "text-amber-600",
        ring: "ring-amber-400",
        avatarFallback: "bg-amber-500 text-white",
        linkBtn: "bg-amber-600 text-white hover:bg-amber-700 shadow-md hover:shadow-lg",
        socialBtn: "bg-amber-100 text-amber-700 hover:bg-amber-200",
        card: "bg-white shadow-md",
      };

    // === Seasonal ===
    case "spring":
      return {
        bg: "bg-gradient-to-b from-green-50 via-pink-50 to-yellow-50",
        bgImage: undefined as string | undefined,
        text: "text-green-900",
        subtext: "text-green-600",
        ring: "ring-pink-300",
        avatarFallback: "bg-pink-200 text-pink-700",
        linkBtn: "bg-green-500 text-white hover:bg-green-600",
        socialBtn: "bg-pink-100 text-pink-600 hover:bg-pink-200",
        card: "bg-white/70 backdrop-blur-sm border border-green-200",
      };
    case "summer":
      return {
        bg: "bg-gradient-to-b from-sky-400 via-cyan-300 to-blue-200",
        bgImage: undefined as string | undefined,
        text: "text-sky-950",
        subtext: "text-sky-800",
        ring: "ring-yellow-400",
        avatarFallback: "bg-yellow-400 text-sky-900",
        linkBtn: "bg-sky-600 text-white hover:bg-sky-700 shadow-md",
        socialBtn: "bg-white/40 text-sky-800 hover:bg-white/60",
        card: "bg-white/50 backdrop-blur-sm border border-sky-200",
      };
    case "autumn":
      return {
        bg: "bg-gradient-to-b from-orange-100 via-amber-50 to-red-100",
        bgImage: undefined as string | undefined,
        text: "text-orange-950",
        subtext: "text-orange-700",
        ring: "ring-orange-400",
        avatarFallback: "bg-orange-400 text-white",
        linkBtn: "bg-orange-700 text-white hover:bg-orange-800",
        socialBtn: "bg-orange-100 text-orange-700 hover:bg-orange-200",
        card: "bg-white/60 border border-orange-200",
      };
    case "winter":
      return {
        bg: "bg-gradient-to-b from-slate-200 via-blue-100 to-gray-200",
        bgImage: undefined as string | undefined,
        text: "text-slate-900",
        subtext: "text-slate-500",
        ring: "ring-blue-300",
        avatarFallback: "bg-blue-200 text-blue-800",
        linkBtn: "bg-slate-700 text-white hover:bg-slate-600",
        socialBtn: "bg-blue-100 text-blue-600 hover:bg-blue-200",
        card: "bg-white/70 backdrop-blur-sm border border-blue-200",
      };

    // === Special ===
    case "glassmorphism":
      return {
        bg: "bg-gradient-to-br from-violet-400 via-fuchsia-300 to-pink-400",
        bgImage: undefined as string | undefined,
        text: "text-white",
        subtext: "text-white/70",
        ring: "ring-white/50",
        avatarFallback: "bg-white/20 text-white backdrop-blur-md",
        linkBtn: "bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/30 shadow-lg",
        socialBtn: "bg-white/20 text-white hover:bg-white/30 backdrop-blur-md",
        card: "bg-white/15 backdrop-blur-md border border-white/25 shadow-lg",
      };
    case "brutalist":
      return {
        bg: "bg-white",
        bgImage: undefined as string | undefined,
        text: "text-black",
        subtext: "text-gray-700",
        ring: "ring-black ring-4",
        avatarFallback: "bg-black text-white border-4 border-black",
        linkBtn: "bg-white text-black border-4 border-black hover:bg-black hover:text-white font-bold uppercase shadow-[4px_4px_0_0_black]",
        socialBtn: "text-black border-2 border-black hover:bg-black hover:text-white",
        card: "bg-white border-4 border-black shadow-[4px_4px_0_0_black]",
      };

    default:
      return getTemplateStyles("professional");
  }
}
