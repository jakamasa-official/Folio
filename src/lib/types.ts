export type TemplateId =
  // Free
  | "professional" | "minimal" | "business" | "creative"
  // Premium (original)
  | "elegant" | "neon" | "japanese" | "photo-grid"
  // Nature
  | "ocean" | "sunset" | "aurora" | "forest" | "sakura" | "desert"
  // Pastel
  | "pastel-pink" | "pastel-blue" | "pastel-mint" | "pastel-lavender" | "pastel-peach"
  // Dark
  | "midnight" | "charcoal" | "dark-purple" | "dark-green" | "dark-red" | "slate-dark"
  // Gradient
  | "gradient-sunset" | "gradient-ocean" | "gradient-berry" | "gradient-fire" | "gradient-mint" | "gradient-twilight"
  // Retro/Pop
  | "retro" | "synthwave" | "vaporwave" | "pop-art" | "pixel"
  // Monochrome
  | "mono-black" | "mono-white" | "mono-gray" | "mono-sepia"
  // Material
  | "material-blue" | "material-green" | "material-red" | "material-amber"
  // Seasonal
  | "spring" | "summer" | "autumn" | "winter"
  // Special
  | "glassmorphism" | "brutalist";

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
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
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
  // Marketing suite
  stamp_card_enabled: boolean;
  coupon_enabled: boolean;
  referral_enabled: boolean;
  follow_up_enabled: boolean;
  line_channel_id: string | null;
  line_channel_secret: string | null;
  line_channel_access_token: string | null;
  rich_content: string | null;
  slides: ProfileSlide[] | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileSlide {
  id: string;
  type: "image" | "content";
  image_url?: string;
  title?: string;
  body?: string;
  order: number;
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
  video_url?: string;
  font_family?: string;
  og_image_url?: string;
  og_title?: string;
  og_description?: string;
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

// === Marketing Suite Types ===

export interface Customer {
  id: string;
  profile_id: string;
  email: string | null;
  name: string;
  phone: string | null;
  line_user_id: string | null;
  tags: string[];
  notes: string | null;
  source: string;
  first_seen_at: string;
  last_seen_at: string;
  total_bookings: number;
  total_messages: number;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  profile_id: string;
  code: string;
  title: string;
  description: string | null;
  discount_type: "percentage" | "fixed" | "free_service";
  discount_value: number | null;
  expires_at: string | null;
  usage_limit: number | null;
  times_used: number;
  is_active: boolean;
  created_at: string;
}

export interface StampCard {
  id: string;
  profile_id: string;
  name: string;
  total_stamps_required: number;
  reward_type: "coupon" | "free_service" | "custom";
  reward_coupon_id: string | null;
  reward_description: string | null;
  is_active: boolean;
  icon: string;
  color: string;
  milestones: StampMilestone[];
  created_at: string;
}

export interface StampMilestone {
  at: number;
  reward: string;
  coupon_id?: string;
}

export interface CustomerStamp {
  id: string;
  stamp_card_id: string;
  customer_id: string;
  current_stamps: number;
  completed_count: number;
  last_stamped_at: string | null;
  created_at: string;
  // Joined fields
  customer?: Customer;
}

export interface StampEvent {
  id: string;
  customer_stamp_id: string;
  stamped_by: string;
  note: string | null;
  stamped_at: string;
}

export interface MessageTemplate {
  id: string;
  profile_id: string;
  name: string;
  subject: string;
  body: string;
  template_type: "follow_up" | "review_request" | "campaign" | "reminder" | "thank_you";
  trigger_type: "manual" | "after_booking" | "after_days" | "after_contact";
  trigger_delay_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SentMessage {
  id: string;
  profile_id: string;
  template_id: string | null;
  customer_id: string | null;
  channel: "email" | "line";
  recipient_email: string | null;
  subject: string | null;
  body: string | null;
  status: "pending" | "sent" | "delivered" | "opened" | "clicked" | "failed";
  sent_at: string;
  opened_at: string | null;
  clicked_at: string | null;
  // Joined fields
  customer?: Customer;
  template?: MessageTemplate;
}

export interface ReferralCode {
  id: string;
  profile_id: string;
  customer_id: string;
  code: string;
  reward_coupon_id: string | null;
  referral_count: number;
  created_at: string;
  // Joined
  customer?: Customer;
  reward_coupon?: Coupon;
}

export interface Referral {
  id: string;
  referral_code_id: string;
  referred_customer_id: string | null;
  status: "signed_up" | "booked" | "rewarded";
  created_at: string;
  // Joined
  referred_customer?: Customer;
}

export interface CampaignPage {
  id: string;
  profile_id: string;
  slug: string;
  title: string;
  description: string | null;
  hero_image_url: string | null;
  cta_text: string;
  cta_url: string | null;
  coupon_id: string | null;
  expires_at: string | null;
  is_published: boolean;
  template: string;
  created_at: string;
  // Joined
  coupon?: Coupon;
}

export interface LineContact {
  id: string;
  profile_id: string;
  customer_id: string | null;
  line_user_id: string;
  display_name: string | null;
  picture_url: string | null;
  is_friend: boolean;
  created_at: string;
}

// Placeholder variables for message templates
export const MESSAGE_PLACEHOLDERS = [
  { key: "{{customer_name}}", label: "顧客名", description: "お客様の名前" },
  { key: "{{business_name}}", label: "店舗名", description: "あなたの表示名" },
  { key: "{{booking_date}}", label: "予約日", description: "予約の日付" },
  { key: "{{booking_time}}", label: "予約時間", description: "予約の時間" },
  { key: "{{review_url}}", label: "レビューURL", description: "Googleレビューのリンク" },
  { key: "{{profile_url}}", label: "プロフィールURL", description: "あなたのFolioページ" },
  { key: "{{coupon_code}}", label: "クーポンコード", description: "クーポンのコード" },
  { key: "{{stamp_count}}", label: "スタンプ数", description: "現在のスタンプ数" },
  { key: "{{referral_url}}", label: "紹介URL", description: "紹介用リンク" },
  { key: "{{unsubscribe_url}}", label: "配信停止URL", description: "配信停止リンク" },
] as const;

export interface WallpaperConfig {
  name: string;
  title: string;
  company?: string;
  email?: string;
  phone?: string;
  style:
    | "dark" | "light" | "gradient" | "minimal" | "bold"
    // Nature
    | "ocean" | "sunset" | "aurora" | "sakura" | "forest" | "lavender" | "desert" | "arctic"
    // Urban
    | "midnight" | "concrete" | "neon-city" | "chrome" | "industrial"
    // Retro/Gaming
    | "pixel" | "retro-game" | "synthwave" | "vaporwave" | "arcade" | "8bit" | "gameboy" | "commodore"
    // Elegant
    | "marble" | "gold" | "rose-gold" | "platinum" | "ivory"
    // Japanese
    | "washi" | "indigo" | "matcha" | "zen" | "ukiyo"
    // Tech
    | "matrix" | "circuit" | "cyber" | "hologram" | "terminal"
    // Gradients
    | "fire" | "ice" | "peach" | "berry" | "twilight"
    // Bold/Pop
    | "monochrome" | "crimson" | "electric-blue" | "neon-green";
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
  // Original premium
  { id: "elegant" as const, label: "エレガント", description: "セリフ体でクラシックな雰囲気", category: "オリジナル" },
  { id: "neon" as const, label: "ネオン", description: "ダークテーマにネオンの光", category: "オリジナル" },
  { id: "japanese" as const, label: "和風", description: "日本の伝統的な美しさ", category: "オリジナル" },
  { id: "photo-grid" as const, label: "フォトグリッド", description: "写真を際立たせるデザイン", category: "オリジナル" },
  // Nature
  { id: "ocean" as const, label: "オーシャン", description: "深い海のブルーグラデーション", category: "自然" },
  { id: "sunset" as const, label: "サンセット", description: "夕焼けのオレンジとピンク", category: "自然" },
  { id: "aurora" as const, label: "オーロラ", description: "北極光の幻想的な色彩", category: "自然" },
  { id: "forest" as const, label: "フォレスト", description: "深い森の緑と大地の色", category: "自然" },
  { id: "sakura" as const, label: "桜", description: "春の桜をイメージしたピンク", category: "自然" },
  { id: "desert" as const, label: "デザート", description: "砂漠の暖かいサンドカラー", category: "自然" },
  // Pastel
  { id: "pastel-pink" as const, label: "パステルピンク", description: "やさしいピンクの世界", category: "パステル" },
  { id: "pastel-blue" as const, label: "パステルブルー", description: "空のような淡いブルー", category: "パステル" },
  { id: "pastel-mint" as const, label: "パステルミント", description: "爽やかなミントグリーン", category: "パステル" },
  { id: "pastel-lavender" as const, label: "パステルラベンダー", description: "癒しのラベンダーカラー", category: "パステル" },
  { id: "pastel-peach" as const, label: "パステルピーチ", description: "温かみのあるピーチカラー", category: "パステル" },
  // Dark
  { id: "midnight" as const, label: "ミッドナイト", description: "深夜の静けさを感じるダーク", category: "ダーク" },
  { id: "charcoal" as const, label: "チャコール", description: "洗練されたチャコールグレー", category: "ダーク" },
  { id: "dark-purple" as const, label: "ダークパープル", description: "神秘的な深紫のテーマ", category: "ダーク" },
  { id: "dark-green" as const, label: "ダークグリーン", description: "深い森のようなダークグリーン", category: "ダーク" },
  { id: "dark-red" as const, label: "ダークレッド", description: "情熱的なダークレッド", category: "ダーク" },
  { id: "slate-dark" as const, label: "スレートダーク", description: "モダンなスレートカラー", category: "ダーク" },
  // Gradient
  { id: "gradient-sunset" as const, label: "グラデーション・サンセット", description: "オレンジからピンクへの移り変わり", category: "グラデーション" },
  { id: "gradient-ocean" as const, label: "グラデーション・オーシャン", description: "ティールからブルーへの海色", category: "グラデーション" },
  { id: "gradient-berry" as const, label: "グラデーション・ベリー", description: "パープルからマゼンタの華やかさ", category: "グラデーション" },
  { id: "gradient-fire" as const, label: "グラデーション・ファイア", description: "レッドからイエローの炎", category: "グラデーション" },
  { id: "gradient-mint" as const, label: "グラデーション・ミント", description: "エメラルドからティールの清涼感", category: "グラデーション" },
  { id: "gradient-twilight" as const, label: "グラデーション・トワイライト", description: "インディゴからパープルの黄昏", category: "グラデーション" },
  // Retro/Pop
  { id: "retro" as const, label: "レトロ", description: "70年代風のレトロカラー", category: "レトロ・ポップ" },
  { id: "synthwave" as const, label: "シンセウェーブ", description: "80年代ネオンのレトロフューチャー", category: "レトロ・ポップ" },
  { id: "vaporwave" as const, label: "ヴェイパーウェーブ", description: "ピンクとシアンの幻想世界", category: "レトロ・ポップ" },
  { id: "pop-art" as const, label: "ポップアート", description: "大胆でカラフルなポップスタイル", category: "レトロ・ポップ" },
  { id: "pixel" as const, label: "ピクセル", description: "レトロゲーム風のドット調", category: "レトロ・ポップ" },
  // Monochrome
  { id: "mono-black" as const, label: "モノブラック", description: "ピュアブラックのミニマルデザイン", category: "モノクローム" },
  { id: "mono-white" as const, label: "モノホワイト", description: "真っ白でクリーンなデザイン", category: "モノクローム" },
  { id: "mono-gray" as const, label: "モノグレー", description: "グレースケールの落ち着いた印象", category: "モノクローム" },
  { id: "mono-sepia" as const, label: "モノセピア", description: "セピア調のノスタルジック", category: "モノクローム" },
  // Material
  { id: "material-blue" as const, label: "マテリアルブルー", description: "マテリアルデザインのブルー", category: "マテリアル" },
  { id: "material-green" as const, label: "マテリアルグリーン", description: "マテリアルデザインのグリーン", category: "マテリアル" },
  { id: "material-red" as const, label: "マテリアルレッド", description: "マテリアルデザインのレッド", category: "マテリアル" },
  { id: "material-amber" as const, label: "マテリアルアンバー", description: "マテリアルデザインのアンバー", category: "マテリアル" },
  // Seasonal
  { id: "spring" as const, label: "スプリング", description: "春の花々のような明るさ", category: "季節" },
  { id: "summer" as const, label: "サマー", description: "夏の青空と海を感じるデザイン", category: "季節" },
  { id: "autumn" as const, label: "オータム", description: "秋の紅葉のような温かみ", category: "季節" },
  { id: "winter" as const, label: "ウィンター", description: "冬の雪景色のようなクールさ", category: "季節" },
  // Special
  { id: "glassmorphism" as const, label: "グラスモーフィズム", description: "すりガラス風の透明感", category: "スペシャル" },
  { id: "brutalist" as const, label: "ブルータリスト", description: "大胆で荒削りなデザイン", category: "スペシャル" },
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
