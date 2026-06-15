/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Force HTTPS for 2 years, include subdomains
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // No iframe embedding (clickjacking defence)
  { key: "X-Frame-Options", value: "DENY" },
  // Browsers must respect declared content types (anti-MIME-sniffing)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full referrer URLs cross-origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down powerful browser APIs we don't use
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()",
  },
  // CSP — permissive enough for Next.js inline scripts/styles + Google Fonts,
  // but blocks third-party script injection, object/embed and frame ancestors.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' https://res.cloudinary.com blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
      "connect-src 'self' https://*.vercel-insights.com https://*.upstash.io https://*.kv.vercel-storage.com https://api.cloudinary.com https://api.razorpay.com https://lumberjack.razorpay.com",
      "frame-ancestors 'none'",
      "form-action 'self' https://api.razorpay.com https://checkout.razorpay.com",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  // Cross-origin isolation lite
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // remove "X-Powered-By: Next.js" fingerprint
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Panels are reached by typing the route directly — no buttons on the site.
  // Short memorable aliases: /client → portal, /emp → staff.
  async redirects() {
    return [
      { source: "/client", destination: "/portal", permanent: false },
      { source: "/client/:path*", destination: "/portal/:path*", permanent: false },
      { source: "/emp", destination: "/staff", permanent: false },
      { source: "/emp/:path*", destination: "/staff/:path*", permanent: false },

      // SEO — pages Google indexed before they were removed now 404. 301 them to
      // the closest live page so crawlers + any backlinks land somewhere real
      // (clears Search Console "Not found (404)").
      { source: "/work", destination: "/insights", permanent: true },
      { source: "/work/:path*", destination: "/insights", permanent: true },
      { source: "/newsroom", destination: "/insights", permanent: true },
      { source: "/newsroom/:path*", destination: "/insights", permanent: true },
      { source: "/blog", destination: "/insights", permanent: true },
      { source: "/blog/:path*", destination: "/insights", permanent: true },
      { source: "/leadership", destination: "/about", permanent: true },
      { source: "/investors", destination: "/about", permanent: true },
      { source: "/awards", destination: "/about", permanent: true },
      { source: "/sustainability", destination: "/about", permanent: true },
      { source: "/locations", destination: "/contact", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // Extra cache + no-index on admin / api endpoints
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
      {
        source: "/portal/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
      {
        source: "/staff/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
