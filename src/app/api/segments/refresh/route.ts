import { NextResponse } from "next/server";
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
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "プロフィールが見つかりません", status: 404 };
  }

  return { profile };
}

// POST — Refresh all segment memberships for the authenticated profile
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

    // 1. Fetch all active segments for this profile
    const { data: segments, error: segError } = await supabaseAdmin
      .from("customer_segments")
      .select("*")
      .eq("profile_id", profileId)
      .eq("is_active", true);

    if (segError) {
      console.error("セグメント取得エラー:", segError);
      return NextResponse.json(
        { error: "セグメントの取得に失敗しました" },
        { status: 500 }
      );
    }

    if (!segments || segments.length === 0) {
      return NextResponse.json(
        { summary: { segments_updated: 0, total_memberships: 0 } },
        { status: 200 }
      );
    }

    // 2. Fetch all customers for this profile
    const { data: customers, error: custError } = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("profile_id", profileId)
      .limit(2000);

    if (custError) {
      console.error("顧客取得エラー:", custError);
      return NextResponse.json(
        { error: "顧客データの取得に失敗しました" },
        { status: 500 }
      );
    }

    if (!customers || customers.length === 0) {
      // Clear all memberships and counts
      for (const segment of segments) {
        await supabaseAdmin
          .from("customer_segment_members")
          .delete()
          .eq("segment_id", segment.id);
        await supabaseAdmin
          .from("customer_segments")
          .update({ customer_count: 0, updated_at: new Date().toISOString() })
          .eq("id", segment.id);
      }
      return NextResponse.json(
        { summary: { segments_updated: segments.length, total_memberships: 0 } },
        { status: 200 }
      );
    }

    // 3. Fetch extras in bulk (referrals, stamps)
    const customerIds = customers.map((c: Customer) => c.id);
    const extrasMap: Record<string, CustomerExtras> = {};
    for (const id of customerIds) {
      extrasMap[id] = { hasReferrals: false, hasStamps: false };
    }

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

    // 4. For each segment, evaluate all customers and update memberships
    let totalMemberships = 0;

    for (const segment of segments) {
      const criteria = segment.criteria as SegmentCriteria;
      const matchingCustomerIds: string[] = [];

      for (const customer of customers as Customer[]) {
        const extras = extrasMap[customer.id];
        const computed = computeCustomerFields(customer, extras);
        if (evaluateSegmentCriteria(customer, computed, criteria, extras)) {
          matchingCustomerIds.push(customer.id);
        }
      }

      // Delete old memberships for this segment
      await supabaseAdmin
        .from("customer_segment_members")
        .delete()
        .eq("segment_id", segment.id);

      // Insert new memberships
      if (matchingCustomerIds.length > 0) {
        const rows = matchingCustomerIds.map((customerId) => ({
          segment_id: segment.id,
          customer_id: customerId,
        }));

        // Insert in batches of 500
        for (let i = 0; i < rows.length; i += 500) {
          const batch = rows.slice(i, i + 500);
          await supabaseAdmin.from("customer_segment_members").insert(batch);
        }
      }

      // Update customer count
      await supabaseAdmin
        .from("customer_segments")
        .update({
          customer_count: matchingCustomerIds.length,
          updated_at: new Date().toISOString(),
        })
        .eq("id", segment.id);

      totalMemberships += matchingCustomerIds.length;
    }

    return NextResponse.json(
      {
        summary: {
          segments_updated: segments.length,
          total_memberships: totalMemberships,
          customers_evaluated: customers.length,
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
