import { createClient } from "@/lib/supabase/client";

/**
 * Authenticated fetch wrapper.
 * Adds the Supabase access token as Authorization header so API routes
 * (which use server-side Supabase) can authenticate the user.
 */
export async function apiFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const headers = new Headers(options?.headers);
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }
  if (!headers.has("Content-Type") && options?.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, { ...options, headers });
}
