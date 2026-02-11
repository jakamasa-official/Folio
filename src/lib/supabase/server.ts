import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  // Check for Authorization header (sent by localStorage-based client)
  const authHeader = headerStore.get("authorization");

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // This can be ignored when called from a Server Component
          }
        },
      },
      ...(authHeader
        ? {
            global: {
              headers: {
                Authorization: authHeader,
              },
            },
          }
        : {}),
    }
  );

  return client;
}
