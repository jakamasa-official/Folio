import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://folio.jp";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/wallpaper`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/signup`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Add published profile pages
  try {
    const supabase = await createClient();
    const { data: profiles } = await supabase
      .from("profiles")
      .select("username, updated_at")
      .eq("is_published", true);

    const profilePages: MetadataRoute.Sitemap = (profiles || []).map((p) => ({
      url: `${baseUrl}/${p.username}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...profilePages];
  } catch {
    return staticPages;
  }
}
