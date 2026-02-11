import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export const PLANS = {
  free: {
    name: "フリー",
    price: 0,
    features: [
      "基本プロフィール（4テンプレート）",
      "お問い合わせフォーム・予約",
      "顧客管理（50件まで）",
      "基本アナリティクス",
      "スタンプカード1枚・クーポン3枚",
    ],
  },
  pro: {
    name: "プロ",
    priceMonthly: 1980,
    priceYearly: 19800,
    features: [
      "全50+プレミアムテンプレート",
      "カスタムドメイン",
      "顧客管理・セグメント無制限",
      "スタンプカード・クーポン無制限",
      "メール配信（3,000通/月）",
      "レビュー収集・表示",
      "紹介プログラム・キャンペーン",
      "LINE連携",
      "メッセージテンプレート",
      "詳細アナリティクス",
      "優先サポート",
    ],
  },
} as const;
