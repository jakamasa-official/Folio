import Link from "next/link";
import type { Profile, SocialLinks } from "@/lib/types";
import { APP_NAME, APP_URL } from "@/lib/constants";
import {
  Twitter,
  Instagram,
  Youtube,
  Github,
  Linkedin,
  Facebook,
  Globe,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  github: Github,
  linkedin: Linkedin,
  facebook: Facebook,
  website: Globe,
  line: MessageCircle,
  tiktok: Globe,
};

function SocialIcon({ platform }: { platform: string }) {
  const Icon = socialIcons[platform];
  if (!Icon) return null;
  return <Icon className="h-5 w-5" />;
}

export function ProfilePage({ profile }: { profile: Profile }) {
  const templateStyles = getTemplateStyles(profile.template);
  const socialEntries = Object.entries(profile.social_links || {}).filter(
    ([, url]) => url && url.trim() !== ""
  );

  return (
    <div className={`min-h-screen ${templateStyles.bg}`}>
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

          <h1 className={`mt-4 text-2xl font-bold ${templateStyles.text}`}>
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

        {/* Links */}
        {profile.links.length > 0 && (
          <div className="mt-8 space-y-3">
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

        {/* Business hours */}
        {profile.business_hours && Object.keys(profile.business_hours).length > 0 && (
          <div className={`mt-8 rounded-lg p-4 ${templateStyles.card}`}>
            <h3 className={`mb-2 text-sm font-semibold ${templateStyles.text}`}>
              営業時間
            </h3>
            <div className="space-y-1">
              {Object.entries(profile.business_hours).map(([day, hours]) => (
                <div key={day} className={`flex justify-between text-xs ${templateStyles.subtext}`}>
                  <span>{day}</span>
                  <span>
                    {hours.closed ? "定休日" : `${hours.open} - ${hours.close}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Powered by */}
        <div className="mt-12 text-center">
          <Link
            href={APP_URL}
            className={`inline-flex items-center gap-1 text-xs ${templateStyles.subtext} opacity-60 hover:opacity-100 transition-opacity`}
          >
            Powered by {APP_NAME}
          </Link>
        </div>
      </div>
    </div>
  );
}

function getTemplateStyles(template: string) {
  switch (template) {
    case "professional":
      return {
        bg: "bg-white",
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
        text: "text-gray-900",
        subtext: "text-gray-600",
        ring: "ring-violet-200",
        avatarFallback: "bg-gradient-to-br from-violet-400 to-pink-400 text-white",
        linkBtn: "bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:from-violet-600 hover:to-pink-600",
        socialBtn: "bg-violet-100 text-violet-600 hover:bg-violet-200",
        card: "bg-white/70 backdrop-blur-sm",
      };
    default:
      return getTemplateStyles("professional");
  }
}
