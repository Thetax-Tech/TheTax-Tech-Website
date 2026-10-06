import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    // Generated portfolio mockups are SVG: served unmodified, sandboxed so they can never run scripts
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    localPatterns: [{ pathname: "/uploads/**" }, { pathname: "/brand/**" }, { pathname: "/images/**" }, { pathname: "/portfolio/**" }, { pathname: "/blog/**" }],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/brand/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      // Generated artwork changes only on redeploy → cache for a week, revalidate after
      { source: "/portfolio/:path*.svg", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      { source: "/blog/:path*.webp", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/icon.png" }];
  },
  async redirects() {
    // Old WordPress-style URLs from the previous site → new structure
    return [
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/our-services", destination: "/services", permanent: true },
      { source: "/services/ui-ux", destination: "/services/ui-ux-design", permanent: true },
      { source: "/services/graphics-designing", destination: "/services/graphic-design", permanent: true },
    ];
  },
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-mariadb", "mariadb", "sharp", "bcryptjs"],
};

export default nextConfig;
