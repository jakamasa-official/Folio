import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Trigger automation rules for a given event.
 * This is fire-and-forget — errors are caught internally and never thrown.
 *
 * Usage:
 *   triggerAutomation("after_booking", customerId, profileId);
 */
export async function triggerAutomation(
  triggerType: string,
  customerId: string,
  profileId: string
) {
  try {
    // Find matching active rules
    const { data: rules } = await supabaseAdmin
      .from("automation_rules")
      .select("id, delay_hours")
      .eq("profile_id", profileId)
      .eq("trigger_type", triggerType)
      .eq("is_active", true);

    if (!rules?.length) return;

    const now = new Date();
    for (const rule of rules) {
      // Check for duplicate pending entry (same rule + customer)
      const { data: existing } = await supabaseAdmin
        .from("automation_logs")
        .select("id")
        .eq("rule_id", rule.id)
        .eq("customer_id", customerId)
        .eq("status", "pending")
        .maybeSingle();

      if (existing) continue;

      const scheduledAt = new Date(
        now.getTime() + (rule.delay_hours || 0) * 60 * 60 * 1000
      );

      await supabaseAdmin.from("automation_logs").insert({
        rule_id: rule.id,
        customer_id: customerId,
        profile_id: profileId,
        status: "pending",
        scheduled_at: scheduledAt.toISOString(),
      });
    }
  } catch (err) {
    console.error("[automations] Trigger error:", err);
  }
}
