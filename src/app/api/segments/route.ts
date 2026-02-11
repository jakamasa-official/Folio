import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  computeCustomerFields,
  evaluateSegmentCriteria,
  type SegmentCriteria,
  type CustomerExtras,
} from "@/lib/segmentation";
import type { Customer } from "@/lib/types";

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
    .select("id, is_pro")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "プロフィールが見つかりません", status: 404 };
  }

  return { profile };
}

// Helper: fetch extras (referrals, stamps) for all customers in bulk
async function fetchCustomerExtras(
  profileId: string,
  customerIds: string[]
): Promise<Record<string, CustomerExtras>> {
  const extrasMap: Record<string, CustomerExtras> = {};
  for (const id of customerIds) {
    extrasMap[id] = { hasReferrals: false, hasStamps: false };
  }

  if (customerIds.length === 0) return extrasMap;

  // Fetch referral codes for this profile's customers
  const { data: referralCodes } = await supabaseAdmin
    .from("referral_codes")
    .select("customer_id, referral_count")
    .eq("profile_id", profileId)
    .gt("referral_count", 0);

  if (referralCodes) {
    for (const rc of referralCodes) {
      if (rc.customer_id && extrasMap[rc.customer_id]) {
        extrasMap[rc.customer_id].hasReferrals = true;
      }
    }
  }

  // Fetch customer stamps (check if any have stamps)
  const { data: customerStamps } = await supabaseAdmin
    .from("customer_stamps")
    .select("customer_id")
    .in("customer_id", customerIds)
    .gt("current_stamps", 0);

  if (customerStamps) {
    for (const cs of customerStamps) {
      if (cs.customer_id && extrasMap[cs.customer_id]) {
        extrasMap[cs.customer_id].hasStamps = true;
      }
    }
  }

  return extrasMap;
}

// Helper: compute customer counts for all segments
async function computeSegmentCounts(
  profileId: string,
  segments: Array<{ id: string; criteria: SegmentCriteria }>
) {
  // Fetch all customers for this profile
  const { data: customers } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("profile_id", profileId)
    .limit(2000);

  if (!customers || customers.length === 0) {
    return segments.map((s) => ({
      id: s.id,
      customer_count: 0,
      customer_ids: [] as string[],
    }));
  }

  const customerIds = customers.map((c: Customer) => c.id);
  const extrasMap = await fetchCustomerExtras(profileId, customerIds);

  return segments.map((segment) => {
    const matchingIds: string[] = [];

    for (const customer of customers as Customer[]) {
      const extras = extrasMap[customer.id];
      const computed = computeCustomerFields(customer, extras);
      if (
        evaluateSegmentCriteria(customer, computed, segment.criteria, extras)
      ) {
        matchingIds.push(customer.id);
      }
    }

    return {
      id: segment.id,
      customer_count: matchingIds.length,
      customer_ids: matchingIds,
    };
  });
}

// GET — Get all segments for the authenticated profile
export async function GET() {
  try {
    const result = await getAuthenticatedProfile();
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    // --- Pro gate: segments require Pro ---
    if (!result.profile.is_pro) {
      return NextResponse.json(
        { error: "顧客セグメントはプロプランでご利用いただけます", upgrade: true },
        { status: 403 },
      );
    }

    const { data: segments, error } = await supabaseAdmin
      .from("customer_segments")
      .select("*")
      .eq("profile_id", result.profile.id)
      .order("type", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("セグメント取得エラー:", error);
      return NextResponse.json(
        { error: "セグメントの取得に失敗しました" },
        { status: 500 }
      );
    }

    if (!segments || segments.length === 0) {
      return NextResponse.json({ segments: [] }, { status: 200 });
    }

    // Compute current customer counts for each segment
    const segmentCounts = await computeSegmentCounts(
      result.profile.id,
      segments.map((s) => ({ id: s.id, criteria: s.criteria as SegmentCriteria }))
    );

    const enrichedSegments = segments.map((s) => {
      const countData = segmentCounts.find((sc) => sc.id === s.id);
      return {
        ...s,
        customer_count: countData?.customer_count ?? 0,
        customer_ids: countData?.customer_ids ?? [],
      };
    });

    return NextResponse.json({ segments: enrichedSegments }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

// POST — Create a custom segment
export async function POST(request: NextRequest) {
  try {
    const result = await getAuthenticatedProfile();
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    // --- Pro gate: segments require Pro ---
    if (!result.profile.is_pro) {
      return NextResponse.json(
        { error: "顧客セグメントはプロプランでご利用いただけます", upgrade: true },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name, description, criteria, color, icon, auto_actions } = body;

    if (!name || typeof name !== "string" || name.length > 100) {
      return NextResponse.json(
        { error: "セグメント名を入力してください（100文字以内）" },
        { status: 400 }
      );
    }

    if (!criteria || !criteria.match || !Array.isArray(criteria.rules)) {
      return NextResponse.json(
        { error: "有効なセグメント条件を指定してください" },
        { status: 400 }
      );
    }

    if (criteria.rules.length === 0) {
      return NextResponse.json(
        { error: "少なくとも1つのルールを追加してください" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("customer_segments")
      .insert({
        profile_id: result.profile.id,
        name,
        description: description || null,
        type: "custom",
        criteria,
        color: color || "#6B7280",
        icon: icon || "users",
        auto_actions: auto_actions || [],
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("セグメント作成エラー:", error);
      return NextResponse.json(
        { error: "セグメントの作成に失敗しました" },
        { status: 500 }
      );
    }

    // Compute initial customer count
    const counts = await computeSegmentCounts(result.profile.id, [
      { id: data.id, criteria: criteria as SegmentCriteria },
    ]);

    const countData = counts[0];
    if (countData) {
      await supabaseAdmin
        .from("customer_segments")
        .update({ customer_count: countData.customer_count })
        .eq("id", data.id);
    }

    return NextResponse.json(
      {
        segment: {
          ...data,
          customer_count: countData?.customer_count ?? 0,
          customer_ids: countData?.customer_ids ?? [],
        },
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

// PATCH — Update a segment
export async function PATCH(request: NextRequest) {
  try {
    const result = await getAuthenticatedProfile();
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const body = await request.json();
    const { id, name, description, criteria, color, icon, auto_actions, is_active } =
      body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "セグメントIDが必要です" },
        { status: 400 }
      );
    }

    // Fetch existing segment
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("customer_segments")
      .select("*")
      .eq("id", id)
      .eq("profile_id", result.profile.id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json(
        { error: "セグメントが見つかりません" },
        { status: 404 }
      );
    }

    // System segments: only allow updating auto_actions and is_active
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (existing.type === "system") {
      if (auto_actions !== undefined) updates.auto_actions = auto_actions;
      if (is_active !== undefined) updates.is_active = is_active;
    } else {
      // Custom segments: allow all fields
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (criteria !== undefined) updates.criteria = criteria;
      if (color !== undefined) updates.color = color;
      if (icon !== undefined) updates.icon = icon;
      if (auto_actions !== undefined) updates.auto_actions = auto_actions;
      if (is_active !== undefined) updates.is_active = is_active;
    }

    const { data, error } = await supabaseAdmin
      .from("customer_segments")
      .update(updates)
      .eq("id", id)
      .eq("profile_id", result.profile.id)
      .select()
      .single();

    if (error) {
      console.error("セグメント更新エラー:", error);
      return NextResponse.json(
        { error: "セグメントの更新に失敗しました" },
        { status: 500 }
      );
    }

    // If criteria changed, recompute count
    let customerCount = data.customer_count;
    let customerIds: string[] = [];
    if (criteria !== undefined) {
      const counts = await computeSegmentCounts(result.profile.id, [
        { id: data.id, criteria: criteria as SegmentCriteria },
      ]);
      const countData = counts[0];
      if (countData) {
        customerCount = countData.customer_count;
        customerIds = countData.customer_ids;
        await supabaseAdmin
          .from("customer_segments")
          .update({ customer_count: customerCount })
          .eq("id", data.id);
      }
    }

    return NextResponse.json(
      {
        segment: { ...data, customer_count: customerCount, customer_ids: customerIds },
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

// DELETE — Delete a custom segment
export async function DELETE(request: NextRequest) {
  try {
    const result = await getAuthenticatedProfile();
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "セグメントIDが必要です" },
        { status: 400 }
      );
    }

    // Verify it's a custom segment
    const { data: existing } = await supabaseAdmin
      .from("customer_segments")
      .select("type")
      .eq("id", id)
      .eq("profile_id", result.profile.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "セグメントが見つかりません" },
        { status: 404 }
      );
    }

    if (existing.type === "system") {
      return NextResponse.json(
        { error: "システムセグメントは削除できません" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("customer_segments")
      .delete()
      .eq("id", id)
      .eq("profile_id", result.profile.id);

    if (error) {
      console.error("セグメント削除エラー:", error);
      return NextResponse.json(
        { error: "セグメントの削除に失敗しました" },
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
