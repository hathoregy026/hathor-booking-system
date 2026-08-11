import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 defaults qualities to [75] only — anything else snaps to 75.
    // 90 keeps photo detail; 75 stays allowed for any legacy callers.
    qualities: [75, 90],
    // Prefer WebP over AVIF: re-encoding already-compressed photo WebPs as
    // AVIF at the old q75 default looked blocky / “pixelated” site-wide.
    formats: ["image/webp"],
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
        source: "/cruises-list",
        destination: "/cruises",
        permanent: true,
      },
      {
        source: "/mask-reveal",
        destination: "/cruises",
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
      // Live-site room detail paths (same links) → cruises until detail pages exist
      {
        source: "/rooms/:slug",
        destination: "/cruises",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
