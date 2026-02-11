import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface LineEvent {
  type: string;
  source: {
    type: string;
    userId: string;
  };
  timestamp: number;
  replyToken?: string;
  message?: {
    type: string;
    id: string;
    text?: string;
  };
}

interface LineWebhookBody {
  destination: string;
  events: LineEvent[];
}

function validateSignature(
  body: string,
  signature: string,
  channelSecret: string
): boolean {
  const hash = createHmac("SHA256", channelSecret)
    .update(body)
    .digest("base64");
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

async function getLineUserProfile(
  userId: string,
  accessToken: string
): Promise<{ displayName: string; pictureUrl?: string } | null> {
  try {
    const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { displayName: data.displayName, pictureUrl: data.pictureUrl };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-line-signature");

    if (!signature) {
      // Return 200 even on error — LINE requires it
      return NextResponse.json({ message: "Missing signature" }, { status: 200 });
    }

    let body: LineWebhookBody;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ message: "Invalid JSON" }, { status: 200 });
    }

    // LINE sends a verification request with empty events array
    if (!body.events || body.events.length === 0) {
      return NextResponse.json({ message: "OK" }, { status: 200 });
    }

    // Find the profile that owns this LINE channel by matching the destination
    // First try to match by destination (bot userId = line_channel_id)
    // This avoids loading ALL profiles' secrets on every webhook
    const { data: matchedProfiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, line_channel_id, line_channel_secret, line_channel_access_token")
      .eq("line_channel_id", body.destination)
      .not("line_channel_secret", "is", null)
      .not("line_channel_access_token", "is", null)
      .limit(1);

    if (profilesError || !matchedProfiles || matchedProfiles.length === 0) {
      return NextResponse.json({ message: "OK" }, { status: 200 });
    }

    // Validate the signature against the matched profile's channel secret
    const matchedProfile = matchedProfiles.find((p) =>
      validateSignature(rawBody, signature, p.line_channel_secret)
    );

    if (!matchedProfile) {
      console.error("LINE webhook: Signature validation failed");
      return NextResponse.json({ message: "OK" }, { status: 200 });
    }

    const profileId = matchedProfile.id;
    const accessToken = matchedProfile.line_channel_access_token;

    // Process events
    for (const event of body.events) {
      const lineUserId = event.source?.userId;
      if (!lineUserId) continue;

      if (event.type === "follow") {
        // User added the LINE account as friend
        const userProfile = await getLineUserProfile(lineUserId, accessToken);

        // Upsert line_contacts entry
        const { data: existingContact } = await supabaseAdmin
          .from("line_contacts")
          .select("id, customer_id")
          .eq("profile_id", profileId)
          .eq("line_user_id", lineUserId)
          .maybeSingle();

        if (existingContact) {
          // Re-followed: update is_friend and profile info
          await supabaseAdmin
            .from("line_contacts")
            .update({
              is_friend: true,
              display_name: userProfile?.displayName || null,
              picture_url: userProfile?.pictureUrl || null,
            })
            .eq("id", existingContact.id);
        } else {
          // New contact — create line_contacts entry
          const { data: newContact } = await supabaseAdmin
            .from("line_contacts")
            .insert({
              profile_id: profileId,
              line_user_id: lineUserId,
              display_name: userProfile?.displayName || null,
              picture_url: userProfile?.pictureUrl || null,
              is_friend: true,
            })
            .select("id")
            .single();

          // Create a customer record if none linked
          if (newContact) {
            const now = new Date().toISOString();
            const { data: customer } = await supabaseAdmin
              .from("customers")
              .insert({
                profile_id: profileId,
                name: userProfile?.displayName || "LINE User",
                line_user_id: lineUserId,
                source: "line",
                tags: [],
                first_seen_at: now,
                last_seen_at: now,
                total_bookings: 0,
                total_messages: 0,
              })
              .select("id")
              .single();

            if (customer) {
              await supabaseAdmin
                .from("line_contacts")
                .update({ customer_id: customer.id })
                .eq("id", newContact.id);
            }
          }
        }
      } else if (event.type === "unfollow") {
        // User blocked or unfriended
        await supabaseAdmin
          .from("line_contacts")
          .update({ is_friend: false })
          .eq("profile_id", profileId)
          .eq("line_user_id", lineUserId);
      } else if (event.type === "message") {
        // Message received — no logging of content for privacy
      }
    }

    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (err) {
    console.error("LINE webhook error:", err);
    // Always return 200 for LINE
    return NextResponse.json({ message: "OK" }, { status: 200 });
  }
}
