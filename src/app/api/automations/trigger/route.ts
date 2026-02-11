import { NextRequest, NextResponse } from "next/server";
import { triggerAutomation } from "@/lib/automations";

// POST: Trigger automations for an event
// Accept: { trigger_type, customer_id, profile_id }
// This is called internally from other API routes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trigger_type, customer_id, profile_id } = body;

    if (!trigger_type || !customer_id || !profile_id) {
      return NextResponse.json(
        { error: "trigger_type, customer_id, profile_id は必須です" },
        { status: 400 }
      );
    }

    await triggerAutomation(trigger_type, customer_id, profile_id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
