import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getServerTranslator } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { APP_NAME, APP_URL } from "@/lib/constants";
import Link from "next/link";

interface Props {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, display_name")
    .ilike("username", username)
    .eq("is_published", true)
    .maybeSingle();

  if (!profile) return { title: "Not Found" };

  const { data: campaign } = await supabaseAdmin
    .from("campaign_pages")
    .select("title, description, hero_image_url")
    .eq("profile_id", profile.id)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!campaign) return { title: "Not Found" };

  return {
    title: `${campaign.title} | ${profile.display_name}`,
    description: campaign.description || `${profile.display_name}のキャンペーン`,
    openGraph: {
      title: campaign.title,
      description: campaign.description || `${profile.display_name}のキャンペーン`,
      url: `${APP_URL}/c/${username}/${slug}`,
      ...(campaign.hero_image_url && {
        images: [{ url: campaign.hero_image_url }],
      }),
    },
  };
}

export default async function CampaignPublicPage({ params }: Props) {
  const { username, slug } = await params;

  // Look up profile
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .ilike("username", username)
    .eq("is_published", true)
    .maybeSingle();

  if (!profile) notFound();

  // Look up campaign
  const { data: campaign } = await supabaseAdmin
    .from("campaign_pages")
    .select(`
      *,
      coupon:coupons!campaign_pages_coupon_id_fkey(id, title, description, code, discount_type, discount_value)
    `)
    .eq("profile_id", profile.id)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!campaign) notFound();

  const isExpired = campaign.expires_at && new Date(campaign.expires_at) < new Date();

  // Determine CTA URL
  const ctaUrl = campaign.cta_url || `${APP_URL}/${profile.username}`;
  const template = campaign.template || "default";

  const { t } = await getServerTranslator("common", "marketing");

  return (
    <div className="min-h-screen relative">
      {/* Expired overlay */}
      {isExpired && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-2xl bg-white p-8 text-center shadow-2xl max-w-sm mx-4">
            <div className="text-4xl mb-4">&#x23F0;</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              このキャンペーンは終了しました
            </h2>
            <p className="text-slate-600 text-sm mb-4">
              ご興味をお持ちいただきありがとうございます。
            </p>
            <Link
              href={`/${profile.username}`}
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              プロフィールを見る
            </Link>
          </div>
        </div>
      )}

      {/* Template rendering */}
      {template === "default" && (
        <DefaultTemplate
          campaign={campaign}
          profile={profile}
          ctaUrl={ctaUrl}
          t={t}
        />
      )}
      {template === "minimal" && (
        <MinimalTemplate
          campaign={campaign}
          profile={profile}
          ctaUrl={ctaUrl}
          t={t}
        />
      )}
      {template === "bold" && (
        <BoldTemplate
          campaign={campaign}
          profile={profile}
          ctaUrl={ctaUrl}
          t={t}
        />
      )}
      {template === "festive" && (
        <FestiveTemplate
          campaign={campaign}
          profile={profile}
          ctaUrl={ctaUrl}
          t={t}
        />
      )}

      {/* Powered by footer */}
      <div className={`py-6 text-center text-xs ${
        template === "bold" ? "text-white/60" : "text-slate-400"
      }`}>
        <a
          href={APP_URL}
          className="hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by {APP_NAME}
        </a>
      </div>
    </div>
  );
}

/* ========================================
   Template Components
   ======================================== */

type TFunc = (key: string, replacements?: Record<string, string>) => string;

interface TemplateProps {
  campaign: {
    title: string;
    description: string | null;
    hero_image_url: string | null;
    cta_text: string;
    coupon?: {
      id: string;
      title: string;
      description: string | null;
      code: string;
      discount_type: string;
      discount_value: number | null;
    } | null;
  };
  profile: {
    display_name: string;
    avatar_url: string | null;
    username: string;
  };
  ctaUrl: string;
  t: TFunc;
}

function CouponBadge({ coupon, t }: { coupon: NonNullable<TemplateProps["campaign"]["coupon"]>; t: TFunc }) {
  let discountText = "";
  if (coupon.discount_type === "percentage" && coupon.discount_value) {
    discountText = t("percentOff", { value: String(coupon.discount_value) });
  } else if (coupon.discount_type === "fixed" && coupon.discount_value) {
    discountText = t("fixedOff", { value: coupon.discount_value.toLocaleString() });
  } else if (coupon.discount_type === "free_service") {
    discountText = t("freeService");
  }

  return (
    <div className="inline-flex flex-col items-center rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 px-6 py-4">
      {discountText && (
        <span className="text-2xl font-bold text-amber-700">{discountText}</span>
      )}
      <span className="text-sm font-medium text-amber-800 mt-1">{coupon.title}</span>
      {coupon.description && (
        <span className="text-xs text-amber-600 mt-1">{coupon.description}</span>
      )}
    </div>
  );
}

/* ---------- DEFAULT TEMPLATE ---------- */
function DefaultTemplate({ campaign, profile, ctaUrl, t }: TemplateProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      {campaign.hero_image_url && (
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img
            src={campaign.hero_image_url}
            alt={campaign.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80" />
        </div>
      )}

      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Profile badge */}
        <div className="mb-8 flex items-center gap-3">
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="h-10 w-10 rounded-full object-cover"
            />
          )}
          <span className="text-sm text-slate-600">{profile.display_name}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
          {campaign.title}
        </h1>

        {/* Description */}
        {campaign.description && (
          <div className="prose prose-slate max-w-none mb-8">
            {campaign.description.split("\n").map((line, i) => (
              <p key={i} className="text-slate-700 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Coupon */}
        {campaign.coupon && (
          <div className="mb-8 flex justify-center">
            <CouponBadge coupon={campaign.coupon} t={t} />
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <a
            href={ctaUrl}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-8 py-3 text-base font-medium text-white shadow-lg hover:bg-slate-800 transition-all hover:shadow-xl"
          >
            {campaign.cta_text}
          </a>
        </div>
      </div>
    </div>
  );
}

/* ---------- MINIMAL TEMPLATE ---------- */
function MinimalTemplate({ campaign, profile, ctaUrl, t }: TemplateProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-xl px-6 py-16">
        {/* Profile */}
        <div className="mb-12 text-center">
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="mx-auto h-12 w-12 rounded-full object-cover mb-3"
            />
          )}
          <p className="text-sm text-slate-500">{profile.display_name}</p>
        </div>

        {/* Hero */}
        {campaign.hero_image_url && (
          <div className="mb-10 rounded-lg overflow-hidden">
            <img
              src={campaign.hero_image_url}
              alt={campaign.title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
          {campaign.title}
        </h1>

        {/* Description */}
        {campaign.description && (
          <div className="mb-8 text-center">
            {campaign.description.split("\n").map((line, i) => (
              <p key={i} className="text-slate-600 text-sm leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Coupon */}
        {campaign.coupon && (
          <div className="mb-8 flex justify-center">
            <CouponBadge coupon={campaign.coupon} t={t} />
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <a
            href={ctaUrl}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-8 py-3 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 transition-colors"
          >
            {campaign.cta_text}
          </a>
        </div>
      </div>
    </div>
  );
}

/* ---------- BOLD TEMPLATE ---------- */
function BoldTemplate({ campaign, profile, ctaUrl, t }: TemplateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
      {/* Hero */}
      {campaign.hero_image_url && (
        <div className="relative h-72 sm:h-96 w-full overflow-hidden">
          <img
            src={campaign.hero_image_url}
            alt={campaign.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-violet-600" />
        </div>
      )}

      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        {/* Profile */}
        <div className="mb-10 flex items-center justify-center gap-3">
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-white/30"
            />
          )}
          <span className="text-white/80">{profile.display_name}</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight">
          {campaign.title}
        </h1>

        {/* Description */}
        {campaign.description && (
          <div className="mb-10">
            {campaign.description.split("\n").map((line, i) => (
              <p key={i} className="text-white/90 text-lg leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Coupon */}
        {campaign.coupon && (
          <div className="mb-10 inline-flex flex-col items-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 px-8 py-5">
            {campaign.coupon.discount_type === "percentage" && campaign.coupon.discount_value && (
              <span className="text-3xl font-bold">{t("percentOff", { value: String(campaign.coupon.discount_value) })}</span>
            )}
            {campaign.coupon.discount_type === "fixed" && campaign.coupon.discount_value && (
              <span className="text-3xl font-bold">{t("fixedOff", { value: campaign.coupon.discount_value.toLocaleString() })}</span>
            )}
            {campaign.coupon.discount_type === "free_service" && (
              <span className="text-3xl font-bold">{t("freeService")}</span>
            )}
            <span className="text-white/80 mt-1">{campaign.coupon.title}</span>
          </div>
        )}

        {/* CTA */}
        <div>
          <a
            href={ctaUrl}
            className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-lg font-bold text-violet-700 shadow-2xl hover:bg-white/90 transition-all transform hover:scale-105"
          >
            {campaign.cta_text}
          </a>
        </div>
      </div>
    </div>
  );
}

/* ---------- FESTIVE TEMPLATE ---------- */
function FestiveTemplate({ campaign, profile, ctaUrl, t }: TemplateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50">
      {/* Decorative top border */}
      <div className="h-2 bg-gradient-to-r from-rose-400 via-amber-400 to-rose-400" />

      {/* Hero */}
      {campaign.hero_image_url && (
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img
            src={campaign.hero_image_url}
            alt={campaign.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-50/90" />
        </div>
      )}

      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        {/* Profile */}
        <div className="mb-8 flex items-center justify-center gap-3">
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-amber-300"
            />
          )}
          <span className="text-amber-800 font-medium">{profile.display_name}</span>
        </div>

        {/* Decorative element */}
        <div className="mb-6 text-4xl">&#x2728;</div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-900 mb-6">
          {campaign.title}
        </h1>

        {/* Description */}
        {campaign.description && (
          <div className="mb-8">
            {campaign.description.split("\n").map((line, i) => (
              <p key={i} className="text-amber-800 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Coupon */}
        {campaign.coupon && (
          <div className="mb-8 inline-flex flex-col items-center rounded-2xl border-2 border-rose-300 bg-white px-8 py-5 shadow-lg">
            <span className="text-xs font-medium uppercase tracking-wider text-rose-500 mb-2">
              特別オファー
            </span>
            {campaign.coupon.discount_type === "percentage" && campaign.coupon.discount_value && (
              <span className="text-3xl font-bold text-rose-600">{t("percentOff", { value: String(campaign.coupon.discount_value) })}</span>
            )}
            {campaign.coupon.discount_type === "fixed" && campaign.coupon.discount_value && (
              <span className="text-3xl font-bold text-rose-600">{t("fixedOff", { value: campaign.coupon.discount_value.toLocaleString() })}</span>
            )}
            {campaign.coupon.discount_type === "free_service" && (
              <span className="text-3xl font-bold text-rose-600">{t("freeService")}</span>
            )}
            <span className="text-amber-800 mt-1">{campaign.coupon.title}</span>
            {campaign.coupon.description && (
              <span className="text-xs text-amber-600 mt-1">{campaign.coupon.description}</span>
            )}
          </div>
        )}

        {/* CTA */}
        <div>
          <a
            href={ctaUrl}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-10 py-4 text-base font-bold text-white shadow-lg hover:from-rose-600 hover:to-amber-600 transition-all transform hover:scale-105"
          >
            {campaign.cta_text}
          </a>
        </div>

        {/* Decorative bottom element */}
        <div className="mt-12 text-2xl">&#x2728; &#x1F389; &#x2728;</div>
      </div>

      {/* Decorative bottom border */}
      <div className="h-2 bg-gradient-to-r from-rose-400 via-amber-400 to-rose-400" />
    </div>
  );
}
