import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

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
