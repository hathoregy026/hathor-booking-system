import { z } from "zod";

export const PAGE_VISIBILITY_KEY = "page-visibility";

/** Guest-facing marketing routes managed from the admin Pages panel. */
export type ManagedPublicPage = {
  id: string;
  path: string;
  label: string;
  group: string;
  /** Legacy or alternate paths that resolve to this page. */
  aliases?: readonly string[];
};

export const MANAGED_PUBLIC_PAGES: readonly ManagedPublicPage[] = [
  { id: "home", path: "/", label: "Home", group: "Main" },
  {
    id: "suites",
    path: "/suites",
    label: "Suites",
    group: "Suites",
  },
  {
    id: "luxury-cabins",
    path: "/luxury-cabins-Nile-Cruise",
    label: "Luxury Rooms",
    group: "Suites",
    aliases: ["/accommodation", "/accommodations"],
  },
  {
    id: "rooms",
    path: "/rooms",
    label: "Luxury Suites",
    group: "Suites",
    aliases: ["/Nile-Cruise-Luxury-Suites"],
  },
  {
    id: "royal-suites",
    path: "/royal-suites",
    label: "Royal Suites",
    group: "Suites",
  },
  {
    id: "cruises",
    path: "/cruises-list",
    label: "Scheduled Voyages",
    group: "Cruises",
    aliases: ["/cruises"],
  },
  {
    id: "voyages",
    path: "/voyages",
    label: "Our Voyages",
    group: "Cruises",
  },
  { id: "charter", path: "/charter", label: "Private Charter", group: "Cruises" },
  { id: "highlights", path: "/highlights", label: "Highlights", group: "Voyage" },
  { id: "wellness", path: "/wellness", label: "Wellness & Spa", group: "Voyage" },
  {
    id: "gastronomy",
    path: "/gastronomy",
    label: "Dining",
    group: "Voyage",
    aliases: ["/dining"],
  },
  { id: "about", path: "/about", label: "Our Story", group: "About" },
  {
    id: "blog",
    path: "/blogs",
    label: "Journal",
    group: "About",
    aliases: ["/blog"],
  },
  { id: "partners", path: "/partners", label: "Partners", group: "About" },
  { id: "contact", path: "/contact", label: "Contact", group: "Main" },
] as const;

export type ManagedPublicPageId = (typeof MANAGED_PUBLIC_PAGES)[number]["id"];

export type PageVisibilityMap = Record<ManagedPublicPageId, boolean>;

export type PageVisibilitySettings = {
  /** When true the page is live; when false visitors see Coming Soon. */
  pages: PageVisibilityMap;
};

const pageIdSchema = z.enum(
  MANAGED_PUBLIC_PAGES.map((page) => page.id) as [
    ManagedPublicPageId,
    ...ManagedPublicPageId[],
  ],
);

export const pageVisibilitySettingsSchema = z.object({
  pages: z.record(pageIdSchema, z.boolean()),
});

export function defaultPageVisibilityMap(): PageVisibilityMap {
  return Object.fromEntries(
    MANAGED_PUBLIC_PAGES.map((page) => [page.id, true]),
  ) as PageVisibilityMap;
}

export const DEFAULT_PAGE_VISIBILITY_SETTINGS: PageVisibilitySettings = {
  pages: defaultPageVisibilityMap(),
};

const PATH_TO_PAGE = buildPathLookup();

function buildPathLookup(): Map<string, ManagedPublicPage> {
  const map = new Map<string, ManagedPublicPage>();
  for (const page of MANAGED_PUBLIC_PAGES) {
    map.set(normalizePublicPath(page.path), page);
    for (const alias of page.aliases ?? []) {
      map.set(normalizePublicPath(alias), page);
    }
  }
  return map;
}

export function normalizePublicPath(pathname: string): string {
  const raw = pathname.split("?")[0]?.split("#")[0] ?? "/";
  if (raw === "") return "/";
  const trimmed = raw.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/** Resolve a URL pathname to a managed page record, if any. */
export function resolveManagedPublicPage(
  pathname: string,
): ManagedPublicPage | null {
  const normalized = normalizePublicPath(pathname);
  const direct = PATH_TO_PAGE.get(normalized);
  if (direct) return direct;

  if (normalized.startsWith("/blogs/")) {
    return PATH_TO_PAGE.get("/blogs") ?? null;
  }

  return null;
}

export function parsePageVisibilitySettings(
  raw: unknown,
): PageVisibilitySettings {
  const defaults = defaultPageVisibilityMap();
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const pagesRaw =
    src.pages && typeof src.pages === "object"
      ? (src.pages as Record<string, unknown>)
      : {};

  const pages = { ...defaults };
  for (const page of MANAGED_PUBLIC_PAGES) {
    const value = pagesRaw[page.id];
    if (typeof value === "boolean") {
      pages[page.id] = value;
    }
  }

  const parsed = pageVisibilitySettingsSchema.safeParse({ pages });
  return parsed.success ? parsed.data : DEFAULT_PAGE_VISIBILITY_SETTINGS;
}

export function isPageVisibilitySettingsEqual(
  a: PageVisibilitySettings,
  b: PageVisibilitySettings,
): boolean {
  return MANAGED_PUBLIC_PAGES.every(
    (page) => a.pages[page.id] === b.pages[page.id],
  );
}

export function isPageLive(
  pathname: string,
  settings: PageVisibilitySettings,
): boolean {
  const managed = resolveManagedPublicPage(pathname);
  if (!managed) return true;
  return settings.pages[managed.id] !== false;
}

export function getManagedPageGroups(): { group: string; pages: ManagedPublicPage[] }[] {
  const groups = new Map<string, ManagedPublicPage[]>();
  for (const page of MANAGED_PUBLIC_PAGES) {
    const list = groups.get(page.group) ?? [];
    list.push(page);
    groups.set(page.group, list);
  }
  return [...groups.entries()].map(([group, pages]) => ({ group, pages }));
}
