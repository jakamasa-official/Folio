import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { templateToHtml } from "@/lib/email-templates";

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
    .select("id, display_name, username, google_review_url, is_pro")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "プロフィールが見つかりません", status: 404 };
  }

  return { profile };
}

/**
 * Replace placeholders in template text with actual customer/profile data.
 */
function resolvePlaceholders(
  text: string,
  customer: { name: string; email: string | null },
  profile: { display_name: string; username: string; google_review_url: string | null }
): string {
  const profileUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://folio.page"}/${profile.username}`;

  return text
    .replace(/\{\{customer_name\}\}/g, customer.name || "")
    .replace(/\{\{business_name\}\}/g, profile.display_name || "")
    .replace(/\{\{booking_date\}\}/g, "") // Booking context not available in bulk send
    .replace(/\{\{booking_time\}\}/g, "")
    .replace(/\{\{review_url\}\}/g, profile.google_review_url || "")
    .replace(/\{\{profile_url\}\}/g, profileUrl)
    .replace(/\{\{coupon_code\}\}/g, "") // Coupon context not available here
    .replace(/\{\{stamp_count\}\}/g, "")
    .replace(/\{\{referral_url\}\}/g, "")
    .replace(/\{\{unsubscribe_url\}\}/g, "#"); // TODO: Implement unsubscribe URL
}

// POST: Send messages to one or more customers
export async function POST(request: NextRequest) {
  try {
    const result = await getAuthenticatedProfile();
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    // --- Pro gate: email campaigns require Pro ---
    if (!result.profile.is_pro) {
      return NextResponse.json(
        { error: "メール配信はプロプランでご利用いただけます", upgrade: true },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { template_id, customer_ids, subject, body: customBody, channel } = body;

    if (!customer_ids || !Array.isArray(customer_ids) || customer_ids.length === 0) {
      return NextResponse.json(
        { error: "送信先の顧客を選択してください" },
        { status: 400 }
      );
    }

    if (customer_ids.length > 500) {
      return NextResponse.json(
        { error: "一度に送信できるのは500件までです" },
        { status: 400 }
      );
    }

    const messageChannel = channel || "email";
    if (messageChannel !== "email" && messageChannel !== "line") {
      return NextResponse.json(
        { error: "チャンネルが無効です" },
        { status: 400 }
      );
    }

    // Fetch template if template_id is provided
    let templateSubject = subject || "";
    let templateBody = customBody || "";

    if (template_id) {
      const { data: template, error: templateError } = await supabaseAdmin
        .from("message_templates")
        .select("*")
        .eq("id", template_id)
        .eq("profile_id", result.profile.id)
        .single();

      if (templateError || !template) {
        return NextResponse.json(
          { error: "テンプレートが見つかりません" },
          { status: 404 }
        );
      }

      // Use template subject/body if not overridden
      if (!templateSubject) templateSubject = template.subject;
      if (!templateBody) templateBody = template.body;
    }

    if (!templateSubject || !templateBody) {
      return NextResponse.json(
        { error: "件名と本文が必要です" },
        { status: 400 }
      );
    }

    // Fetch customers
    const { data: customers, error: customerError } = await supabaseAdmin
      .from("customers")
      .select("id, name, email")
      .eq("profile_id", result.profile.id)
      .in("id", customer_ids);

    if (customerError) {
      console.error("顧客取得エラー:", customerError);
      return NextResponse.json(
        { error: "顧客データの取得に失敗しました" },
        { status: 500 }
      );
    }

    if (!customers || customers.length === 0) {
      return NextResponse.json(
        { error: "有効な顧客が見つかりません" },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    let successCount = 0;
    let failureCount = 0;

    for (const customer of customers) {
      const resolvedSubject = resolvePlaceholders(templateSubject, customer, result.profile);
      const resolvedBody = resolvePlaceholders(templateBody, customer, result.profile);

      let status: "sent" | "failed" = "failed";

      // Attempt to send email if customer has an email address
      if (messageChannel === "email" && customer.email) {
        const htmlContent = templateToHtml(
          result.profile.display_name || "Folio",
          resolvedSubject,
          resolvedBody
        );
        const emailId = await sendEmail({
          to: customer.email,
          subject: resolvedSubject,
          html: htmlContent,
        });
        status = emailId ? "sent" : "failed";
      }

      if (status === "sent") {
        successCount++;
      } else {
        failureCount++;
      }

      // Log to sent_messages
      const { error: insertError } = await supabaseAdmin
        .from("sent_messages")
        .insert({
          profile_id: result.profile.id,
          template_id: template_id || null,
          customer_id: customer.id,
          channel: messageChannel,
          recipient_email: customer.email || null,
          subject: resolvedSubject,
          body: resolvedBody,
          status,
          sent_at: now,
        });

      if (insertError) {
        console.error("メッセージ記録エラー:", insertError);
      }

      // Update total_messages count (best-effort)
      try {
        const { error: rpcError } = await supabaseAdmin.rpc("increment_customer_messages", {
          customer_id_input: customer.id,
        });
        if (rpcError) {
          await supabaseAdmin
            .from("customers")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", customer.id);
        }
      } catch {
        // Silently ignore
      }
    }

    return NextResponse.json(
      { success: true, sent: successCount, failed: failureCount, total: customers.length },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
