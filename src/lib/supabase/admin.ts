import { createClient } from "@supabase/supabase-js";

// Service role client — bypasses RLS. Use only in API routes, never on client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin = createClient<any>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
