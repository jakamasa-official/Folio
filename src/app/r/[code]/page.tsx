import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getServerLocale } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";
import type { Metadata } from "next";
import { APP_NAME, APP_URL } from "@/lib/constants";
import { ReferralForm } from "./referral-form";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;

  const { data: referralCode } = await supabaseAdmin
    .from("referral_codes")
    .select("id, code, profile_id")
    .eq("code", code)
    .single();

  if (!referralCode) return { title: "Not Found" };

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("display_name")
    .eq("id", referralCode.profile_id)
    .single();

  const displayName = profile?.display_name || APP_NAME;

  return {
    title: `${displayName}からの紹介 | ${APP_NAME}`,
    description: `${displayName}から紹介されました。登録して特典を受け取りましょう。`,
    openGraph: {
      title: `${displayName}からの紹介`,
      description: `${displayName}から紹介されました。登録して特典を受け取りましょう。`,
      url: `${APP_URL}/r/${code}`,
    },
  };
}

export default async function ReferralPage({ params }: Props) {
  const { code } = await params;

  // Look up the referral code
  const { data: referralCode, error } = await supabaseAdmin
    .from("referral_codes")
    .select("id, code, profile_id, reward_coupon_id")
    .eq("code", code)
    .single();

  if (error || !referralCode) {
    notFound();
  }

  // Look up the profile
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, display_name, avatar_url, referral_enabled")
    .eq("id", referralCode.profile_id)
    .single();

  if (!profile || !profile.referral_enabled) {
    notFound();
  }

  // Look up the reward coupon if set
  let coupon: {
    id: string;
    title: string;
    description: string | null;
    discount_type: string;
    discount_value: number | null;
  } | null = null;

  if (referralCode.reward_coupon_id) {
    const { data: couponData } = await supabaseAdmin
      .from("coupons")
      .select("id, title, description, discount_type, discount_value")
      .eq("id", referralCode.reward_coupon_id)
      .single();

    coupon = couponData;
  }

  const locale = await getServerLocale();

  return (
    <I18nProvider initialLocale={locale} namespaces={["common", "marketing"]}>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            {profile.avatar_url && (
              <div className="flex justify-center">
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md"
                />
              </div>
            )}
            <h1 className="text-2xl font-bold text-slate-900">
              紹介されました！
            </h1>
            <p className="text-slate-600">
              <span className="font-medium">{profile.display_name}</span>
              さんからの紹介です
            </p>
          </div>

          {/* Coupon reward */}
          {coupon && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
              <p className="text-sm font-medium text-amber-800 mb-1">
                ご紹介特典
              </p>
              <p className="text-lg font-bold text-amber-900">
                {coupon.title}
              </p>
              {coupon.description && (
                <p className="text-sm text-amber-700 mt-1">
                  {coupon.description}
                </p>
              )}
              {coupon.discount_type === "percentage" && coupon.discount_value && (
                <p className="text-sm font-medium text-amber-800 mt-1">
                  {coupon.discount_value}% OFF
                </p>
              )}
              {coupon.discount_type === "fixed" && coupon.discount_value && (
                <p className="text-sm font-medium text-amber-800 mt-1">
                  {coupon.discount_value}円 OFF
                </p>
              )}
              {coupon.discount_type === "free_service" && (
                <p className="text-sm font-medium text-amber-800 mt-1">
                  無料サービス
                </p>
              )}
            </div>
          )}

          {/* Referral Form */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <ReferralForm code={code} />
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400">
            Powered by{" "}
            <a href={APP_URL} className="underline hover:text-slate-600">
              {APP_NAME}
            </a>
          </p>
        </div>
      </div>
    </I18nProvider>
  );
}
