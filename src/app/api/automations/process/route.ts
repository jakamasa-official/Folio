import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import {
  followUpEmail,
  reviewRequestEmail,
  templateToHtml,
} from "@/lib/email-templates";

// POST: Process pending automation logs (called by cron)
// Authenticated via CRON_SECRET header, not user auth
export async function POST(request: NextRequest) {
  try {
    // Authenticate via cron secret
    const cronSecret = request.headers.get("x-cron-secret");
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date().toISOString();

    // Fetch pending logs where scheduled_at <= now, limit 50
    const { data: logs, error: fetchError } = await supabaseAdmin
      .from("automation_logs")
      .select("id, rule_id, customer_id, profile_id")
      .eq("status", "pending")
      .lte("scheduled_at", now)
      .order("scheduled_at", { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error("[automations/process] Fetch error:", fetchError);
      return NextResponse.json(
        { error: "ログの取得に失敗しました" },
        { status: 500 }
      );
    }

    if (!logs?.length) {
      return NextResponse.json({ processed: 0 }, { status: 200 });
    }

    let sentCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const log of logs) {
      try {
        // Fetch the rule
        const { data: rule } = await supabaseAdmin
          .from("automation_rules")
          .select("*, coupon:coupons(id, title, code)")
          .eq("id", log.rule_id)
          .maybeSingle();

        if (!rule || !rule.is_active) {
          await supabaseAdmin
            .from("automation_logs")
            .update({ status: "skipped", sent_at: now })
            .eq("id", log.id);
          skippedCount++;
          continue;
        }

        // Fetch customer
        const { data: customer } = await supabaseAdmin
          .from("customers")
          .select("id, name, email")
          .eq("id", log.customer_id)
          .maybeSingle();

        if (!customer?.email) {
          await supabaseAdmin
            .from("automation_logs")
            .update({
              status: "skipped",
              sent_at: now,
              error: "顧客のメールアドレスがありません",
            })
            .eq("id", log.id);
          skippedCount++;
          continue;
        }

        // Fetch profile for business name
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("display_name, username, google_review_url")
          .eq("id", log.profile_id)
          .maybeSingle();

        const businessName = profile?.display_name || "Folio";
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

        let emailResult: string | null = null;

        // Execute action based on action_type
        switch (rule.action_type) {
          case "send_email": {
            const subject = rule.subject || `${businessName}からのお知らせ`;
            const body = rule.body || "";

            // Replace placeholders
            const resolvedBody = body
              .replace(/\{\{customer_name\}\}/g, customer.name || "お客様")
              .replace(/\{\{business_name\}\}/g, businessName);

            const html = rule.template_id
              ? templateToHtml(businessName, subject, resolvedBody)
              : followUpEmail({
                  businessName,
                  customerName: customer.name || "お客様",
                  message: resolvedBody,
                });

            emailResult = await sendEmail({
              to: customer.email,
              subject,
              html,
            });
            break;
          }

          case "send_review_request": {
            const reviewUrl =
              profile?.google_review_url ||
              `${appUrl}/${profile?.username || ""}`;

            const html = reviewRequestEmail({
              businessName,
              customerName: customer.name || "お客様",
              reviewUrl,
            });

            emailResult = await sendEmail({
              to: customer.email,
              subject: `${businessName} - レビューのお願い`,
              html,
            });
            break;
          }

          case "send_coupon": {
            const couponCode = rule.coupon?.code || "";
            const couponTitle = rule.coupon?.title || "クーポン";
            const subject =
              rule.subject || `${businessName}からクーポンのプレゼント`;
            const body =
              `${customer.name || "お客様"}様\n\n` +
              `${businessName}をご利用いただきありがとうございます。\n` +
              `特別クーポンをお届けします。\n\n` +
              `クーポン: ${couponTitle}\n` +
              `コード: ${couponCode}\n\n` +
              `ぜひご利用ください。`;

            const html = followUpEmail({
              businessName,
              customerName: customer.name || "お客様",
              message: body,
            });

            emailResult = await sendEmail({
              to: customer.email,
              subject,
              html,
            });
            break;
          }
        }

        if (emailResult) {
          await supabaseAdmin
            .from("automation_logs")
            .update({ status: "sent", sent_at: now })
            .eq("id", log.id);
          sentCount++;
        } else {
          await supabaseAdmin
            .from("automation_logs")
            .update({
              status: "failed",
              sent_at: now,
              error: "メール送信に失敗しました",
            })
            .eq("id", log.id);
          failedCount++;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        await supabaseAdmin
          .from("automation_logs")
          .update({ status: "failed", sent_at: now, error: errorMessage })
          .eq("id", log.id);
        failedCount++;
      }
    }

    return NextResponse.json(
      {
        processed: logs.length,
        sent: sentCount,
        failed: failedCount,
        skipped: skippedCount,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
