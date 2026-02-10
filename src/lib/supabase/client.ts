import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: SupabaseClient<any, "public", any> | null = null;

export function createClient() {
  if (!client) {
    // Use @supabase/supabase-js directly (localStorage-based sessions)
    // instead of @supabase/ssr (cookie-based) since we have no middleware.
    // This fixes desktop browsers blocking/restricting cookie-based auth.
    client = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
