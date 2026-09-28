import { z } from "zod";
import {
  DEFAULT_PAGE_VISIBILITY_SETTINGS,
  MANAGED_PUBLIC_PAGES,
  defaultPageVisibilityMap,
  type ManagedPublicPageId,
  type PageVisibilitySettings,
} from "@/lib/page-visibility-shared";

/* Server and dashboard only: public pages read the settings the server has
   already parsed, and never need zod in their bundle. */
const pageIdSchema = z.enum(
  MANAGED_PUBLIC_PAGES.map((page) => page.id) as [
    ManagedPublicPageId,
    ...ManagedPublicPageId[],
  ],
);

export const pageVisibilitySettingsSchema = z.object({
  pages: z.record(pageIdSchema, z.boolean()),
});

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
