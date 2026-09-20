import {
  SITE_IMAGE_PAGE_ORDER,
  SITE_IMAGE_PAGE_SLOTS,
} from "@/lib/site-image-usage-map.generated";

export type PageScopedSiteImageAlias = {
  name: string;
  sourceName: string;
  pagePath: string;
  displayOrder: number;
};

function normalizePagePath(pathname: string): string {
  const clean = pathname.split(/[?#]/, 1)[0] || "/";
  if (clean === "/") return clean;
  return clean.replace(/\/+$/, "") || "/";
}

function pageKey(pathname: string): string {
  if (pathname === "/") return "home";
  return pathname
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const usageCount = new Map<string, number>();
for (const path of SITE_IMAGE_PAGE_ORDER) {
  for (const name of new Set(SITE_IMAGE_PAGE_SLOTS[path] ?? [])) {
    usageCount.set(name, (usageCount.get(name) ?? 0) + 1);
  }
}

const aliases: PageScopedSiteImageAlias[] = [];
const aliasByPageAndSource = new Map<string, string>();
const sourceByAlias = new Map<string, string>();

for (const pagePath of SITE_IMAGE_PAGE_ORDER) {
  const seen = new Set<string>();
  (SITE_IMAGE_PAGE_SLOTS[pagePath] ?? []).forEach((sourceName, index) => {
    if (seen.has(sourceName) || (usageCount.get(sourceName) ?? 0) < 2) return;
    seen.add(sourceName);
    const name = `page-${pageKey(pagePath)}-${sourceName}`;
    aliases.push({ name, sourceName, pagePath, displayOrder: index + 1 });
    aliasByPageAndSource.set(`${normalizePagePath(pagePath)}\u0000${sourceName}`, name);
    sourceByAlias.set(name, sourceName);
  });
}

/**
 * Dedicated slots created only for photos whose old slot was painted on more
 * than one live page. Their initial image comes from `sourceName`; once one is
 * edited it has its own database row and storage folder.
 */
export const PAGE_SCOPED_SITE_IMAGE_ALIASES: readonly PageScopedSiteImageAlias[] =
  aliases;

/** Resolve the independent slot used by one route, or keep an already-unique slot. */
export function getPageScopedSiteImageName(
  pathname: string,
  sourceName: string,
): string {
  if (sourceByAlias.has(sourceName)) return sourceName;
  return (
    aliasByPageAndSource.get(
      `${normalizePagePath(pathname)}\u0000${sourceName}`,
    ) ?? sourceName
  );
}

/** The former shared slot an independent page slot inherited its first image from. */
export function getSiteImageSourceName(name: string): string {
  return sourceByAlias.get(name) ?? name;
}

/** Old shared slots remain in storage/database for compatibility, but stay out of CMS tabs. */
export function isLegacySharedSiteImageSource(name: string): boolean {
  return (usageCount.get(name) ?? 0) > 1;
}
