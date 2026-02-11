import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSystemSegments } from "@/lib/segmentation";

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
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "プロフィールが見つかりません", status: 404 };
  }

  return { profile };
}

// POST — Initialize system segments for a profile (idempotent)
export async function POST() {
  try {
    const result = await getAuthenticatedProfile();
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const profileId = result.profile.id;

    // Check if system segments already exist for this profile
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("customer_segments")
      .select("id")
      .eq("profile_id", profileId)
      .eq("type", "system")
      .limit(1);

    if (checkError) {
      console.error("セグメント確認エラー:", checkError);
      return NextResponse.json(
        { error: "セグメントの確認に失敗しました" },
        { status: 500 }
      );
    }

    // If system segments already exist, skip creation
    if (existing && existing.length > 0) {
      // Fetch all segments to return
      const { data: allSegments } = await supabaseAdmin
        .from("customer_segments")
        .select("*")
        .eq("profile_id", profileId)
        .order("type", { ascending: true })
        .order("created_at", { ascending: true });

      return NextResponse.json(
        {
          segments: allSegments || [],
          initialized: false,
          message: "システムセグメントは既に初期化されています",
        },
        { status: 200 }
      );
    }

    // Create all 8 system segments
    const systemSegments = getSystemSegments(profileId);

    const { data: created, error: insertError } = await supabaseAdmin
      .from("customer_segments")
      .insert(systemSegments)
      .select();

    if (insertError) {
      console.error("セグメント初期化エラー:", insertError);
      return NextResponse.json(
        { error: "システムセグメントの作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        segments: created || [],
        initialized: true,
        message: "システムセグメントを初期化しました",
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
