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
    default:
      return getTemplateStyles("professional");
  }
}
