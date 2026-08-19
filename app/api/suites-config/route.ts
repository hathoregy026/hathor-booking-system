import { NextResponse } from "next/server";
import { combineDesktopAndPhoneCss } from "@/lib/admin-device-preview";
import { resolveSiteImageMap } from "@/lib/resolve-site-images";
import { SITE_IMAGE_SLOTS } from "@/lib/site-image-slots";
import { SUITES_DASHBOARD_SLOT_NAMES } from "@/lib/site-image-usage";
import {
  getSuitesTypography,
  DEFAULT_SUITES_TYPOGRAPHY,
  DEFAULT_SUITES_TYPOGRAPHY_PHONE,
} from "@/lib/suites-typography";
import { suitesTypographyToCss } from "@/lib/suites-typography-shared";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SUITES_SLOT_SET = new Set<string>(SUITES_DASHBOARD_SLOT_NAMES);

export async function GET() {
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

  return NextResponse.json(
    { images, css },
    { headers: { "Cache-Control": "no-store" } },
  );
}
