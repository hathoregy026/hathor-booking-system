import type { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "@/lib/blog-posts";
import { SEO_SITE_ORIGIN } from "@/lib/seo/site";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { isPageLive } from "@/lib/page-visibility-shared";

const STATIC_PATHS = [
  "/",
  "/voyages",
  "/voyages/luxor-to-aswan",
  "/voyages/aswan-to-luxor",
  "/voyages/luxor-aswan-luxor",
  "/charter",
  "/suites",
  "/luxury-cabins-Nile-Cruise",
  "/rooms",
  "/royal-suites",
  "/cruises-list",
  "/highlights",
  "/wellness",
  "/gastronomy",
  "/about",
  "/blogs",
  "/partners",
  "/contact",
  "/terms-and-conditions",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  /* /suites shows a thin "coming soon" placeholder while its dashboard
     visibility toggle is off — leave it out of the sitemap until then,
     same self-correcting check as its own generateMetadata(). */
  let suitesLive = true;
  try {
    const cms = await loadPublicCmsBundle();
    suitesLive = isPageLive("/suites", cms.pageVisibility);
  } catch (error) {
    console.error("[sitemap] page visibility unavailable:", error);
  }
  const staticPaths = STATIC_PATHS.filter((path) => path !== "/suites" || suitesLive);

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: path === "/" ? `${SEO_SITE_ORIGIN}/` : `${SEO_SITE_ORIGIN}${path}`,
    lastModified,
    changeFrequency: path === "/" || path === "/voyages" ? "weekly" : "monthly",
    priority:
      path === "/"
        ? 1
        : path === "/voyages" || path === "/charter" || path === "/suites"
          ? 0.9
          : path.startsWith("/voyages/") ||
              path === "/royal-suites" ||
              path === "/luxury-cabins-Nile-Cruise"
            ? 0.85
            : 0.7,
  }));

  try {
    const posts = await getPublishedBlogPosts();
    for (const post of posts) {
      entries.push({
        url: `${SEO_SITE_ORIGIN}/blogs/${post.slug}`,
        lastModified: post.publishedAt,
        changeFrequency: "monthly",
        priority: 0.55,
      });
    }
  } catch (error) {
    console.error("[sitemap] blog posts unavailable:", error);
  }

  return entries;
}
