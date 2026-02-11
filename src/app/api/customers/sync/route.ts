import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

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

    const profileId = profile.id;

    // Fetch all data sources in parallel
    const [bookingsResult, contactsResult, subscribersResult] =
      await Promise.all([
        supabaseAdmin
          .from("bookings")
          .select("booker_name, booker_email")
          .eq("profile_id", profileId),
        supabaseAdmin
          .from("contact_submissions")
          .select("sender_name, sender_email")
          .eq("profile_id", profileId),
        supabaseAdmin
          .from("email_subscribers")
          .select("email")
          .eq("profile_id", profileId),
      ]);

    // Build a map of unique emails with aggregated data
    const customerMap = new Map<
      string,
      {
        name: string;
        email: string;
        sources: Set<string>;
        totalBookings: number;
        totalMessages: number;
      }
    >();

    // Process bookings
    for (const booking of bookingsResult.data || []) {
      const email = booking.booker_email?.toLowerCase().trim();
      if (!email) continue;

      const existing = customerMap.get(email);
      if (existing) {
        existing.totalBookings++;
        existing.sources.add("booking");
        // Prefer names with more content
        if (booking.booker_name && booking.booker_name.length > existing.name.length) {
          existing.name = booking.booker_name;
        }
      } else {
        customerMap.set(email, {
          name: booking.booker_name || email,
          email,
          sources: new Set(["booking"]),
          totalBookings: 1,
          totalMessages: 0,
        });
      }
    }

    // Process contact submissions
    for (const contact of contactsResult.data || []) {
      const email = contact.sender_email?.toLowerCase().trim();
      if (!email) continue;

      const existing = customerMap.get(email);
      if (existing) {
        existing.totalMessages++;
        existing.sources.add("contact");
        if (contact.sender_name && contact.sender_name.length > existing.name.length) {
          existing.name = contact.sender_name;
        }
      } else {
        customerMap.set(email, {
          name: contact.sender_name || email,
          email,
          sources: new Set(["contact"]),
          totalBookings: 0,
          totalMessages: 1,
        });
      }
    }

    // Process email subscribers
    for (const subscriber of subscribersResult.data || []) {
      const email = subscriber.email?.toLowerCase().trim();
      if (!email) continue;

      const existing = customerMap.get(email);
      if (existing) {
        existing.sources.add("subscriber");
      } else {
        customerMap.set(email, {
          name: email,
          email,
          sources: new Set(["subscriber"]),
          totalBookings: 0,
          totalMessages: 0,
        });
      }
    }

    // Upsert each customer into the customers table
    const now = new Date().toISOString();
    let synced = 0;

    for (const [email, data] of customerMap) {
      const source = Array.from(data.sources).join(",");

      // Check if customer already exists for this profile
      const { data: existing } = await supabaseAdmin
        .from("customers")
        .select("id, total_bookings, total_messages")
        .eq("profile_id", profileId)
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        // Update existing customer
        await supabaseAdmin
          .from("customers")
          .update({
            total_bookings: data.totalBookings,
            total_messages: data.totalMessages,
            source,
            last_seen_at: now,
            updated_at: now,
          })
          .eq("id", existing.id);
      } else {
        // Insert new customer
        await supabaseAdmin.from("customers").insert({
          profile_id: profileId,
          name: data.name,
          email,
          source,
          tags: [],
          total_bookings: data.totalBookings,
          total_messages: data.totalMessages,
          first_seen_at: now,
          last_seen_at: now,
        });
      }

      synced++;
    }

    return NextResponse.json(
      { success: true, synced },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "同期処理に失敗しました" },
      { status: 500 }
    );
  }
}
