import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { combineDesktopAndPhoneCss } from "@/lib/admin-device-preview";
import { PUBLIC_CMS_CACHE_TAG } from "@/lib/public-cms-bundle";
import { resolveSiteImageMap } from "@/lib/resolve-site-images";
import { SITE_IMAGE_SLOTS } from "@/lib/site-image-slots";
import { SUITES_DASHBOARD_SLOT_NAMES } from "@/lib/site-image-usage";
import {
  getSuitesTypography,
  DEFAULT_SUITES_TYPOGRAPHY,
  DEFAULT_SUITES_TYPOGRAPHY_PHONE,
} from "@/lib/suites-typography";
import { suitesTypographyToCss } from "@/lib/suites-typography-shared";

/** Edge-friendly short cache — admin saves revalidate via public-cms tag. */
export const revalidate = 60;

const SUITES_SLOT_SET = new Set<string>(SUITES_DASHBOARD_SLOT_NAMES);

const loadSuitesConfig = unstable_cache(
  async () => {
    const defaults = Object.fromEntries(
      SITE_IMAGE_SLOTS.filter((slot) => SUITES_SLOT_SET.has(slot.name)).map(
        (slot) => [slot.name, slot.url],
      ),
    );

    let images: Record<string, string> = { ...defaults };
    let css = combineDesktopAndPhoneCss(
      suitesTypographyToCss(DEFAULT_SUITES_TYPOGRAPHY, DEFAULT_SUITES_TYPOGRAPHY),
      suitesTypographyToCss(
        DEFAULT_SUITES_TYPOGRAPHY_PHONE,
        DEFAULT_SUITES_TYPOGRAPHY_PHONE,
      ),
    );

    try {
      const [map, desktop, phone] = await Promise.all([
        resolveSiteImageMap(),
        getSuitesTypography(),
        getSuitesTypography(true),
      ]);
      for (const name of SUITES_DASHBOARD_SLOT_NAMES) {
        const resolved = map[name]?.src?.trim();
        if (resolved) images[name] = resolved;
      }
      css = combineDesktopAndPhoneCss(
        suitesTypographyToCss(desktop, DEFAULT_SUITES_TYPOGRAPHY),
        suitesTypographyToCss(phone, DEFAULT_SUITES_TYPOGRAPHY_PHONE),
      );
    } catch {
      images = { ...defaults };
    }

    return { images, css };
  },
  ["suites-config-v1"],
  { revalidate: 60, tags: [PUBLIC_CMS_CACHE_TAG] },
);

export async function GET() {
  const payload = await loadSuitesConfig();
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
