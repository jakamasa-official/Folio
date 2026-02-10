import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "パスワードは必須です" },
        { status: 400 }
      );
    }

    if (password.length < 4 || password.length > 200) {
      return NextResponse.json(
        { error: "パスワードは4〜200文字で設定してください" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 10);
    return NextResponse.json({ hash }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
