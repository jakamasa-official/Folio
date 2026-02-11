import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Rate limit: 10 lookups per IP per minute
const lookupRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkLookupRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = lookupRateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    lookupRateLimit.set(ip, { count: 1, resetAt: now + 60 * 1000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

/**
 * Public customer lookup by profile_id + email.
 * Used by the public stamp card page to find a customer and show their stamp progress.
 * Only returns id — no PII.
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limit check
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    if (!checkLookupRateLimit(ip)) {
      return NextResponse.json(
        { error: "リクエスト回数の上限に達しました" },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const profile_id = searchParams.get("profile_id");
    const email = searchParams.get("email");

    if (!profile_id || typeof profile_id !== "string" || profile_id.length > 100) {
      return NextResponse.json(
        { error: "profile_id は必須です" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || email.length > 320) {
      return NextResponse.json(
        { error: "email は必須です" },
        { status: 400 }
      );
    }

    const { data: customer, error } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("profile_id", profile_id)
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "顧客の検索に失敗しました" },
        { status: 500 }
      );
    }

    // Return only id — never name or other PII to unauthenticated callers
    return NextResponse.json(
      { customer: customer ? { id: customer.id } : null },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
