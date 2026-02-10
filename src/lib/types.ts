export type TemplateId = "professional" | "minimal" | "business" | "creative" | "elegant" | "neon" | "japanese" | "photo-grid";

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
  template: TemplateId;
  links: ProfileLink[];
  social_links: SocialLinks;
  contact_email: string | null;
  contact_phone: string | null;
  location: string | null;
  business_hours: BusinessHours | null;
  is_published: boolean;
  is_pro: boolean;
  settings: ProfileSettings;
  contact_form_enabled: boolean;
  booking_enabled: boolean;
  email_collection_enabled: boolean;
  booking_slots: BookingSlots | null;
  page_password: string | null;
  google_review_url: string | null;
  line_friend_url: string | null;
  custom_domain: string | null;
  custom_domain_verified: boolean;
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

export interface BookingSlots {
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  start: string;  // "09:00"
  end: string;    // "17:00"
  duration: number; // minutes, e.g. 60
}

export interface Booking {
  id: string;
  profile_id: string;
  booker_name: string;
  booker_email: string;
  booking_date: string;
  time_slot: string;
  note: string | null;
  status: "pending" | "confirmed" | "canceled";
  created_at: string;
}

export interface ContactSubmission {
  id: string;
  profile_id: string;
  sender_name: string;
  sender_email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface EmailSubscriber {
  id: string;
  profile_id: string;
  email: string;
  subscribed_at: string;
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

export const FREE_TEMPLATES = [
  { id: "professional" as const, label: "プロフェッショナル", description: "クリーンでビジネス向き" },
  { id: "minimal" as const, label: "ミニマル", description: "シンプルでエレガント" },
  { id: "business" as const, label: "ビジネス", description: "店舗・サービス向け" },
  { id: "creative" as const, label: "クリエイティブ", description: "大胆で印象的" },
];

export const PREMIUM_TEMPLATES = [
  { id: "elegant" as const, label: "エレガント", description: "セリフ体でクラシックな雰囲気" },
  { id: "neon" as const, label: "ネオン", description: "ダークテーマにネオンの光" },
  { id: "japanese" as const, label: "和風", description: "日本の伝統的な美しさ" },
  { id: "photo-grid" as const, label: "フォトグリッド", description: "写真を際立たせるデザイン" },
];

export const TEMPLATES = [...FREE_TEMPLATES, ...PREMIUM_TEMPLATES];

export const DAYS_OF_WEEK = [
  { key: "mon", label: "月曜日", short: "月" },
  { key: "tue", label: "火曜日", short: "火" },
  { key: "wed", label: "水曜日", short: "水" },
  { key: "thu", label: "木曜日", short: "木" },
  { key: "fri", label: "金曜日", short: "金" },
  { key: "sat", label: "土曜日", short: "土" },
  { key: "sun", label: "日曜日", short: "日" },
] as const;
