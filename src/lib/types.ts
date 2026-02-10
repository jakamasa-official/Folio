export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
  template: "professional" | "minimal" | "business" | "creative";
  links: ProfileLink[];
  social_links: SocialLinks;
  contact_email: string | null;
  contact_phone: string | null;
  location: string | null;
  business_hours: BusinessHours | null;
  is_published: boolean;
  settings: ProfileSettings;
  created_at: string;
  updated_at: string;
}

export interface ProfileLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
}

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  line?: string;
  youtube?: string;
  tiktok?: string;
  github?: string;
  linkedin?: string;
  facebook?: string;
  website?: string;
}

export interface BusinessHours {
  [key: string]: { open: string; close: string; closed?: boolean };
}

export interface ProfileSettings {
  accent_color?: string;
  background_color?: string;
  text_color?: string;
}

export interface PageView {
  id: number;
  profile_id: string;
  viewed_at: string;
  referrer: string | null;
  country: string | null;
  device_type: string | null;
}

export interface WallpaperConfig {
  name: string;
  title: string;
  company?: string;
  email?: string;
  phone?: string;
  style: "dark" | "light" | "gradient" | "minimal" | "bold";
  phone_model: string;
  qr_url: string;
}

export const PHONE_DIMENSIONS: Record<string, { width: number; height: number; label: string }> = {
  "iphone-15": { width: 1179, height: 2556, label: "iPhone 15 / 16" },
  "iphone-se": { width: 750, height: 1334, label: "iPhone SE" },
  "android-fhd": { width: 1080, height: 2400, label: "Android (FHD+)" },
  "android-qhd": { width: 1440, height: 3200, label: "Android (QHD+)" },
};

export const SOCIAL_PLATFORMS = [
  { key: "twitter", label: "X (Twitter)", placeholder: "https://x.com/username" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/username" },
  { key: "line", label: "LINE", placeholder: "https://line.me/ti/p/~username" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@channel" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@username" },
  { key: "github", label: "GitHub", placeholder: "https://github.com/username" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/username" },
  { key: "website", label: "Website", placeholder: "https://example.com" },
] as const;

export const TEMPLATES = [
  { id: "professional", label: "プロフェッショナル", description: "クリーンでビジネス向き" },
  { id: "minimal", label: "ミニマル", description: "シンプルでエレガント" },
  { id: "business", label: "ビジネス", description: "店舗・サービス向け" },
  { id: "creative", label: "クリエイティブ", description: "大胆で印象的" },
] as const;
