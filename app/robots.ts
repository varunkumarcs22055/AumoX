import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aumoxo.tech";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Private panels + their short aliases (the aliases 3xx-redirect, which
          // Search Console flags as "Page with redirect" if it crawls them).
          "/admin", "/admin/", "/portal", "/portal/", "/staff", "/staff/",
          "/client", "/client/", "/emp", "/emp/",
          "/api/", "/_next/",
          // Old pages that no longer exist (now 301'd) — keep crawlers off them.
          "/work", "/newsroom", "/blog", "/leadership", "/investors",
          "/awards", "/sustainability", "/locations",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
