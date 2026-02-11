import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { reviewRequestEmail } from "@/lib/email-templates";
import { APP_URL } from "@/lib/constants";

async function getAuthenticatedProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "認証が必要です", status: 401 };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, display_name, is_pro")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "プロフィールが見つかりません", status: 404 };
  }

  return { profile };
}

// POST — Send review request to a customer
export async function POST(request: NextRequest) {
  try {
    const result = await getAuthenticatedProfile();
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    // --- Pro gate: review requests require Pro ---
    if (!result.profile.is_pro) {
      return NextResponse.json(
        { error: "レビュー収集はプロプランでご利用いただけます", upgrade: true },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { customer_id } = body;

    if (!customer_id || typeof customer_id !== "string") {
      return NextResponse.json(
        { error: "顧客IDが必要です" },
        { status: 400 }
      );
    }

    // Fetch customer
    const { data: customer, error: custError } = await supabaseAdmin
      .from("customers")
      .select("id, name, email")
      .eq("id", customer_id)
      .eq("profile_id", result.profile.id)
      .single();

    if (custError || !customer) {
      return NextResponse.json(
        { error: "顧客が見つかりません" },
        { status: 404 }
      );
    }

    if (!customer.email) {
      return NextResponse.json(
        { error: "この顧客にはメールアドレスが設定されていません" },
        { status: 400 }
      );
    }

    // Generate unique token
    const token = crypto.randomUUID();

    // Create a placeholder review record with the token
    const { error: insertError } = await supabaseAdmin
      .from("reviews")
      .insert({
        profile_id: result.profile.id,
        customer_id: customer.id,
        reviewer_name: customer.name,
        reviewer_email: customer.email,
        rating: 5, // placeholder, will be replaced when customer submits
        body: "pending_request",
        source: "request",
        status: "pending",
        verified: false,
        token,
      });

    if (insertError) {
      console.error("レビューリクエスト作成エラー:", insertError);
      return NextResponse.json(
        { error: "レビューリクエストの作成に失敗しました" },
        { status: 500 }
      );
    }

    // Build review URL
    const reviewUrl = `${APP_URL}/review/${result.profile.id}?token=${token}`;

    // Send email
    const emailId = await sendEmail({
      to: customer.email,
      subject: `${result.profile.display_name}からのレビューのお願い`,
      html: reviewRequestEmail({
        businessName: result.profile.display_name,
        customerName: customer.name,
        reviewUrl,
      }),
    });

    if (!emailId) {
      return NextResponse.json(
        { error: "メールの送信に失敗しました。しばらくしてからお試しください。" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${customer.name}にレビュー依頼を送信しました`,
    });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
