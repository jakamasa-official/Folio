import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Rate limit: 3 POST requests per IP per hour
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id, booker_name, booker_email, booking_date, time_slot, note } = body;

    // Validate required fields
    if (!profile_id || !booker_name || !booker_email || !booking_date || !time_slot) {
      return NextResponse.json(
        { error: "必須項目をすべて入力してください" },
        { status: 400 }
      );
    }

    // Validate input types and lengths
    if (typeof profile_id !== "string" || profile_id.length > 100) {
      return NextResponse.json({ error: "無効なリクエストです" }, { status: 400 });
    }
    if (typeof booker_name !== "string" || booker_name.length > 200) {
      return NextResponse.json({ error: "名前が長すぎます" }, { status: 400 });
    }
    if (typeof booker_email !== "string" || booker_email.length > 320) {
      return NextResponse.json({ error: "メールアドレスが無効です" }, { status: 400 });
    }
    if (typeof booking_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(booking_date)) {
      return NextResponse.json({ error: "日付の形式が無効です" }, { status: 400 });
    }
    if (typeof time_slot !== "string" || !/^\d{2}:\d{2}$/.test(time_slot)) {
      return NextResponse.json({ error: "時間の形式が無効です" }, { status: 400 });
    }
    if (note && (typeof note !== "string" || note.length > 2000)) {
      return NextResponse.json({ error: "備考は2000文字以内で入力してください" }, { status: 400 });
    }

    // Rate limit check
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rateLimitKey = `bookings:${ip}`;
    if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "予約回数の上限に達しました。しばらくしてからお試しください" },
        { status: 429 }
      );
    }

    // Check if the slot is already booked
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("profile_id", profile_id)
      .eq("booking_date", booking_date)
      .eq("time_slot", time_slot)
      .limit(1);

    if (checkError) {
      console.error("予約確認エラー:", checkError);
      return NextResponse.json(
        { error: "予約状況の確認に失敗しました" },
        { status: 500 }
      );
    }

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "この時間枠はすでに予約されています" },
        { status: 409 }
      );
    }

    // Insert the booking
    const { error: insertError } = await supabaseAdmin.from("bookings").insert({
      profile_id,
      booker_name,
      booker_email,
      booking_date,
      time_slot,
      note: note || null,
    });

    if (insertError) {
      console.error("予約作成エラー:", insertError);
      return NextResponse.json(
        { error: "予約の作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profile_id = searchParams.get("profile_id");
    const date = searchParams.get("date");

    if (!profile_id || !date) {
      return NextResponse.json(
        { error: "profile_id と date は必須です" },
        { status: 400 }
      );
    }

    // Only return time_slot for public availability checks (no PII)
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("time_slot")
      .eq("profile_id", profile_id)
      .eq("booking_date", date)
      .order("time_slot", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "予約情報の取得に失敗しました" },
        { status: 500 }
      );
    }

    // Return only booked time slots (no personal data)
    const bookedSlots = (data || []).map((b: { time_slot: string }) => b.time_slot);
    return NextResponse.json({ bookedSlots }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
