import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication via Bearer token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify the token with Supabase to get the user
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "認証トークンが無効です" },
        { status: 401 }
      );
    }

    // Get the user's profile to find their profile_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "プロフィールが見つかりません" },
        { status: 404 }
      );
    }

    // Fetch email subscribers for this profile
    const { data: subscribers, error: fetchError } = await supabaseAdmin
      .from("email_subscribers")
      .select("email, subscribed_at")
      .eq("profile_id", profile.id)
      .order("subscribed_at", { ascending: false });

    if (fetchError) {
      console.error("購読者取得エラー:", fetchError);
      return NextResponse.json(
        { error: "購読者データの取得に失敗しました" },
        { status: 500 }
      );
    }

    // Build CSV content
    const csvRows = ["email,subscribed_at"];
    for (const sub of subscribers || []) {
      // Escape CSV fields that might contain commas or quotes
      const email = sub.email.includes(",")
        ? `"${sub.email.replace(/"/g, '""')}"`
        : sub.email;
      csvRows.push(`${email},${sub.subscribed_at}`);
    }
    const csvContent = csvRows.join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="subscribers.csv"',
      },
    });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
