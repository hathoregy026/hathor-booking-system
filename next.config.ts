import type { NextConfig } from "next";

/*
 * Content Security Policy — enforced to block unapproved scripts, frames,
 * forms, plug-ins and network destinations.
 *
 * 'unsafe-inline' / 'unsafe-eval' on script-src are required by Next's inline
 * bootstrap and by GSAP/Lenis-style runtime code. Tightening those needs a
 * nonce pass — a separate job, after launch.
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://hathor-booking-system.vercel.app https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
  "media-src 'self' blob: https://*.supabase.co",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co https://va.vercel-scripts.com https://vitals.vercel-insights.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com",
  "worker-src 'self' blob:",
  "frame-src 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

/* Applied to every route. None of these change rendering. */
const SECURITY_HEADERS = [
  {
    key: "Content-Security-Policy",
    value: CSP_DIRECTIVES,
  },
  {
    // Browsers must use HTTPS for this origin. No `preload` yet — that is a
    // one-way door (removal from the preload list takes months).
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  {
    // Blocks clickjacking of the admin panel. CSP frame-ancestors above is the
    // modern equivalent; this covers older browsers.
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    // Stop the browser guessing content types (MIME-confusion attacks).
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Send the full URL to ourselves, only the origin to third parties.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Deny hardware APIs the site never uses.
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig: NextConfig = {
  images: {
    // Next 16 defaults qualities to [75] only — anything else snaps to 75.
    // 90 keeps photo detail; 75 stays allowed for any legacy callers.
    qualities: [75, 90],
    // Keep in sync with SITE_IMAGE_OPTIMIZER_WIDTH in lib/local-optimized-site-images.ts
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Prefer WebP over AVIF: re-encoding already-compressed photo WebPs as
    // AVIF at the old q75 default looked blocky / “pixelated” site-wide.
    formats: ["image/webp"],
    // Keep optimized derivatives on the Vercel image cache so repeat views
    // do not re-fetch origin files from Supabase Storage.
    minimumCacheTTL: 60 * 60 * 24 * 31,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    // Prefer fresh Flight/RSC payloads on soft nav (min static staleTimes is 30s in Next 16).
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
  async headers() {
    /*
     * Cache strategy (safe for deploys + performance):
     * - Hashed Next chunks (`/_next/static/*`): immutable forever (filename changes per build).
     * - HTML / documents: browsers must revalidate; Vercel still ISR-invalidates on deploy.
     * - Unhashed public JS/CSS (Springs iframes): short revalidate so in-place edits land.
     * - Versioned media/video under content-addressed paths: long immutable.
     */
    return [
      {
        // Security headers on every route. Listed first; later entries in this
        // array only add Cache-Control, so nothing here is overwritten.
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Kill-switch SW must never be sticky — clients need the latest unregister logic.
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        // Videos: revalidate so in-place swaps recover; prefer versioned filenames.
        source: "/media/hathor/videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
          {
            key: "Accept-Ranges",
            value: "bytes",
          },
        ],
      },
      {
        source: "/media/hathor/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/email/hathor-email-icon.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/email/hathor-email-logo.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/email/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Branding can change in place — never pin forever or browsers keep old glyphs forever.
        source: "/branding/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Springs clone assets use stable filenames (shared.js, design.js) — revalidate.
        source: "/suites-springs/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/accommodation-springs/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/gastronomy-springs/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/springs-layout/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/suites-normal/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/home-amenities-springs/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/js/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/cruises",
        destination: "/cruises-list",
        permanent: true,
      },
      {
        source: "/mask-reveal",
        destination: "/cruises-list",
        permanent: true,
      },
      {
        source: "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
        destination: "/charter",
        permanent: true,
      },
      {
        source: "/blog",
        destination: "/blogs",
        permanent: true,
      },
      {
        source: "/journal",
        destination: "/blogs",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/accommodation",
        destination: "/luxury-cabins-Nile-Cruise",
        permanent: true,
      },
      {
        source: "/accommodations",
        destination: "/luxury-cabins-Nile-Cruise",
        permanent: true,
      },
      {
        source: "/dining",
        destination: "/gastronomy",
        permanent: true,
      },
      {
        source: "/Nile-Cruise-Luxury-Suites",
        destination: "/rooms",
        permanent: true,
      },
      {
        source: "/homepage-2",
        destination: "/",
        permanent: true,
      },
      {
        source: "/homepage-3",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
