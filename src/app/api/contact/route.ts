import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { contactNotificationEmail } from "@/lib/email-templates";
import { triggerAutomation } from "@/lib/automations";

// Rate limit: 5 submissions per IP per hour
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = rateLimit.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id, sender_name, sender_email, message } = body;

    // Validate all fields are non-empty
    if (!profile_id || !sender_name || !sender_email || !message) {
      return NextResponse.json(
        { error: "すべての項目を入力してください" },
        { status: 400 }
      );
    }

    // Validate input lengths
    if (typeof sender_name !== "string" || sender_name.length > 200) {
      return NextResponse.json({ error: "名前が長すぎます" }, { status: 400 });
    }
    if (typeof sender_email !== "string" || sender_email.length > 320) {
      return NextResponse.json({ error: "メールアドレスが無効です" }, { status: 400 });
    }
    if (typeof message !== "string" || message.length > 5000) {
      return NextResponse.json({ error: "メッセージは5000文字以内で入力してください" }, { status: 400 });
    }
    if (typeof profile_id !== "string" || profile_id.length > 100) {
      return NextResponse.json({ error: "無効なリクエストです" }, { status: 400 });
    }

    // Validate email format
    if (!isValidEmail(sender_email)) {
      return NextResponse.json(
        { error: "有効なメールアドレスを入力してください" },
        { status: 400 }
      );
    }

    // Rate limit check
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rateLimitKey = `contact:${ip}`;
    if (!checkRateLimit(rateLimitKey, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "送信回数の上限に達しました。しばらくしてからお試しください" },
        { status: 429 }
      );
    }

    const { error } = await supabaseAdmin.from("contact_submissions").insert({
      profile_id,
      sender_name,
      sender_email,
      message,
    });

    if (error) {
      console.error("お問い合わせ保存エラー:", error);
      return NextResponse.json(
        { error: "お問い合わせの送信に失敗しました" },
        { status: 500 }
      );
    }

    // Fire-and-forget conversion event
    void supabaseAdmin.from("conversion_events").insert({
      profile_id,
      event_type: "contact_submit",
      metadata: { sender_name, sender_email },
    });

    // Auto-create or update customer from contact submission
    try {
      const email = sender_email?.toLowerCase().trim();
      if (email) {
        const { data: existingCustomer } = await supabaseAdmin
          .from("customers")
          .select("id, total_messages")
          .eq("profile_id", profile_id)
          .eq("email", email)
          .maybeSingle();

        const now = new Date().toISOString();
        if (existingCustomer) {
          await supabaseAdmin
            .from("customers")
            .update({
              total_messages: (existingCustomer.total_messages || 0) + 1,
              last_seen_at: now,
              updated_at: now,
            })
            .eq("id", existingCustomer.id);
        } else {
          await supabaseAdmin.from("customers").insert({
            profile_id,
            name: sender_name || email,
            email,
            source: "contact",
            tags: [],
            total_bookings: 0,
            total_messages: 1,
            first_seen_at: now,
            last_seen_at: now,
          });
        }

        // Trigger automation for contact (fire-and-forget)
        const customerId = existingCustomer?.id;
        if (customerId) {
          triggerAutomation("after_contact", customerId, profile_id);
        } else {
          const { data: newCust } = await supabaseAdmin
            .from("customers")
            .select("id")
            .eq("profile_id", profile_id)
            .eq("email", email)
            .maybeSingle();
          if (newCust) {
            triggerAutomation("after_contact", newCust.id, profile_id);
          }
        }
      }
    } catch (customerError) {
      // Never block contact submission response due to customer creation failure
      console.error("顧客自動作成エラー（お問い合わせ）:", customerError);
    }

    // Send email notification to business owner (fire-and-forget)
    (async () => {
      try {
        const { data: ownerProfile } = await supabaseAdmin
          .from("profiles")
          .select("contact_email")
          .eq("id", profile_id)
          .single();

        const ownerEmail = ownerProfile?.contact_email;
        if (ownerEmail) {
          sendEmail({
            to: ownerEmail,
            subject: `新しいお問い合わせ: ${sender_name}様より`,
            html: contactNotificationEmail({
              senderName: sender_name,
              senderEmail: sender_email,
              message,
            }),
          }).catch((err) => console.error("[contact] Owner notification email failed:", err));
        }
      } catch (err) {
        console.error("[contact] Email notification error:", err);
      }
    })();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
