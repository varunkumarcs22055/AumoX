import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aumoxo.tech";

/**
 * Dynamic sitemap.xml — listed in priority order so crawlers focus on
 * commercial / lead-gen pages first.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,           lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/services`,   lastModified: now, changeFrequency: "weekly",  priority: 0.95 },
    { url: `${BASE_URL}/products`,   lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE_URL}/industries`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/about`,      lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/contact`,    lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/careers`,    lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/insights`,   lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/partners`,   lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`,    lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/terms`,      lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/cookies`,    lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  return entries;
}
