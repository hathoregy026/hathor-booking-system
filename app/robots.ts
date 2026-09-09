import type { MetadataRoute } from "next";
import { SEO_SITE_ORIGIN } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/booking",
          "/booking/",
          "/book",
          "/preview",
          "/preview/",
          "/dev",
          "/dev/",
          "/site-index",
          "/home-2",
          "/test-scroll-reveal",
          "/test-slide",
        ],
      },
    ],
    sitemap: `${SEO_SITE_ORIGIN}/sitemap.xml`,
    host: SEO_SITE_ORIGIN.replace(/^https?:\/\//, ""),
  };
}
