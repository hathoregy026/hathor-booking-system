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
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    // Prevent App Router client cache from showing a previous deploy after soft/navigated revisits.
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
  async headers() {
    return [
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
        source: "/suites",
        destination: "/rooms",
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
