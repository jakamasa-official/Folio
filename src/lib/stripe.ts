import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export const PLANS = {
  free: {
    name: "フリー",
    nameEn: "Free",
    price: 0,
    features: [
      "4種類のテンプレート",
      "リンク5個まで",
      "お問い合わせフォーム",
      "QRコード・vCard",
      "基本ページビュー",
    ],
  },
  pro: {
    name: "プロ",
    nameEn: "Pro",
    priceMonthly: 480,
    priceYearly: 3980,
    features: [
      "全56テンプレート",
      "リンク無制限",
      "カスタムフォント・カラー",
      "リッチテキスト・画像スライド",
      "カスタムOG画像",
      "予約カレンダー",
      "レビュー収集",
      "スタンプカード・クーポン",
      "メール購読フォーム",
      "詳細アナリティクス",
      "ブランディング非表示",
    ],
  },
  pro_plus: {
    name: "プロプラス",
    nameEn: "Pro+",
    priceMonthly: 1480,
    priceYearly: 11800,
    features: [
      "Proの全機能",
      "動画背景",
      "顧客管理（CRM）",
      "メッセージ配信",
      "自動フォローアップ",
      "顧客セグメント",
      "キャンペーン・紹介",
      "LINE連携",
      "カスタムドメイン",
      "優先サポート",
    ],
  },
} as const;

// Map Stripe Price IDs to plan tiers
export function getTierFromPriceId(priceId: string): "pro" | "pro_plus" {
  const proPriceIds = [
    process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
    process.env.STRIPE_PRICE_ID_PRO_YEARLY,
  ];
  const proPlusPriceIds = [
    process.env.STRIPE_PRICE_ID_PRO_PLUS_MONTHLY,
    process.env.STRIPE_PRICE_ID_PRO_PLUS_YEARLY,
  ];

  if (proPlusPriceIds.includes(priceId)) return "pro_plus";
  if (proPriceIds.includes(priceId)) return "pro";

  // Default to pro if unknown
  return "pro";
}
