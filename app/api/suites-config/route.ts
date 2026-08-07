import { NextResponse } from "next/server";
import { resolveSiteImageMap } from "@/lib/resolve-site-images";
import { SITE_IMAGE_SLOTS } from "@/lib/site-image-slots";
import { SUITES_DASHBOARD_SLOT_NAMES } from "@/lib/site-image-usage";

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
  try {
    const map = await resolveSiteImageMap();
    for (const name of SUITES_DASHBOARD_SLOT_NAMES) {
      const resolved = map[name]?.src?.trim();
      if (resolved) images[name] = resolved;
    }
  } catch {
    images = { ...defaults };
  }

  return NextResponse.json(
    { images },
    { headers: { "Cache-Control": "no-store" } },
  );
}
