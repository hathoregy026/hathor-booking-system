import type { HeroPageKey } from "@/lib/typography-settings-shared";

/**
 * Map a public pathname to the Website Text / typography page key.
 * Used to scope per-page font and size overrides.
 */
export function pathnameToWebsiteTextPage(pathname: string): HeroPageKey | null {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === "/") return "home";
  if (path === "/about") return "about";
  if (path === "/cruises" || path === "/cruises-list") return "cruises";
  if (path === "/highlights") return "highlights";
  if (path === "/gastronomy") return "gastronomy";
  if (path === "/wellness") return "wellness";
  if (path === "/charter") return "charter";
  if (path === "/contact") return "contact";
  if (path === "/partners") return "partners";
  if (path === "/blogs" || path.startsWith("/blogs/")) return "blog";
  if (path === "/rooms" || path.startsWith("/rooms/")) return "suites";
  if (path === "/suites" || path === "/suites-preview") return "suites";
  if (path === "/luxury-cabins-Nile-Cruise") return "luxury_cabins";
  if (path === "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise") return "royal_suites";

  return null;
}
