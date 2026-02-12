import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Rate limit: 5 attempts per IP per 15 minutes
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

function signToken(profileId: string, timestamp: number): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for token signing");
  const payload = `${profileId}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64");
}

export function verifyToken(token: string, profileId: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString();
    const parts = decoded.split(":");
    if (parts.length !== 3) return false;
    const [tokenProfileId, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    if (tokenProfileId !== profileId) return false;
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) return false;

    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret) return false;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${tokenProfileId}:${timestampStr}`)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id, password } = body;

    if (!profile_id || !password) {
      return NextResponse.json(
        { error: "profile_id とパスワードは必須です" },
        { status: 400 }
      );
    }

    // Validate input lengths
    if (typeof profile_id !== "string" || profile_id.length > 100) {
      return NextResponse.json({ error: "無効なリクエストです" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length > 200) {
      return NextResponse.json({ error: "無効なリクエストです" }, { status: 400 });
    }

    // Rate limit: 5 attempts per IP per 15 minutes
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitKey = `verify-pw:${ip}:${profile_id}`;
    if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "試行回数の上限に達しました。しばらくしてからお試しください" },
        { status: 429 }
      );
    }

    // Fetch the profile's hashed password
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("page_password")
      .eq("id", profile_id)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json(
        { error: "プロフィールが見つかりません" },
        { status: 404 }
      );
    }

    if (!profile.page_password) {
      return NextResponse.json(
        { error: "このページにはパスワードが設定されていません" },
        { status: 400 }
      );
    }

    // Compare the provided password with the stored bcrypt hash
    const isValid = await bcrypt.compare(password, profile.page_password);

    if (!isValid) {
      return NextResponse.json(
        { error: "パスワードが正しくありません" },
        { status: 401 }
      );
    }

    // Generate HMAC-signed token
    const timestamp = Date.now();
    const token = signToken(profile_id, timestamp);

    return NextResponse.json({ success: true, token }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
