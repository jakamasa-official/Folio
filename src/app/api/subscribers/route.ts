import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { triggerAutomation } from "@/lib/automations";

// Rate limit: 5 subscriptions per IP per hour
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
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
    const { profile_id, email } = body;

    if (!profile_id || !email) {
      return NextResponse.json(
        { error: "必須項目を入力してください" },
        { status: 400 }
      );
    }

    // Validate inputs
    if (typeof profile_id !== "string" || profile_id.length > 100) {
      return NextResponse.json({ error: "無効なリクエストです" }, { status: 400 });
    }
    if (typeof email !== "string" || email.length > 320 || !isValidEmail(email)) {
      return NextResponse.json({ error: "有効なメールアドレスを入力してください" }, { status: 400 });
    }

    // Rate limit
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitKey = `subscribe:${ip}`;
    if (!checkRateLimit(rateLimitKey, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "登録回数の上限に達しました。しばらくしてからお試しください" },
        { status: 429 }
      );
    }

    // Validate profile exists
    const { data: profileExists } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", profile_id)
      .maybeSingle();

    if (!profileExists) {
      return NextResponse.json({ error: "プロフィールが見つかりません" }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from("email_subscribers")
      .insert({ profile_id, email });

    if (error) {
      // Handle duplicate gracefully
      if (error.code === "23505") {
        return NextResponse.json({ success: true }, { status: 200 });
      }
      return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
    }

    // Auto-create customer from new subscriber (if not already exists)
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const { data: existingCustomer } = await supabaseAdmin
        .from("customers")
        .select("id")
        .eq("profile_id", profile_id)
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (!existingCustomer) {
        const now = new Date().toISOString();
        await supabaseAdmin.from("customers").insert({
          profile_id,
          name: normalizedEmail,
          email: normalizedEmail,
          source: "subscriber",
          tags: [],
          total_bookings: 0,
          total_messages: 0,
          first_seen_at: now,
          last_seen_at: now,
        });
      }
      // Trigger automation for subscribe (fire-and-forget)
      if (existingCustomer) {
        triggerAutomation("after_subscribe", existingCustomer.id, profile_id);
      } else {
        const { data: newCust } = await supabaseAdmin
          .from("customers")
          .select("id")
          .eq("profile_id", profile_id)
          .eq("email", normalizedEmail)
          .maybeSingle();
        if (newCust) {
          triggerAutomation("after_subscribe", newCust.id, profile_id);
        }
      }
    } catch (customerError) {
      // Never block subscription response due to customer creation failure
      console.error("顧客自動作成エラー（メール購読）:", customerError);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
