import { NextResponse } from "next/server";
import {
  ACCOMMODATION_SLOTS_BY_PAGE,
  isAccommodationPageId,
} from "@/lib/accommodation-springs";
import { resolveSiteImageMap } from "@/lib/resolve-site-images";
import { SITE_IMAGE_SLOTS } from "@/lib/site-image-slots";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const page = new URL(request.url).searchParams.get("page")?.trim() ?? "";
  if (!isAccommodationPageId(page)) {
    return NextResponse.json(
      { error: "Invalid accommodation page" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const slotNames = ACCOMMODATION_SLOTS_BY_PAGE[page];
  const slotSet = new Set(slotNames);
  const defaults = Object.fromEntries(
    SITE_IMAGE_SLOTS.filter((slot) => slotSet.has(slot.name)).map((slot) => [
      slot.name,
      slot.url,
    ]),
  );

  let images: Record<string, string> = { ...defaults };
  try {
    const map = await resolveSiteImageMap();
    for (const name of slotNames) {
      const resolved = map[name]?.src?.trim();
      if (resolved) images[name] = resolved;
    }
  } catch {
    images = { ...defaults };
  }

  return NextResponse.json(
    { page, images },
    { headers: { "Cache-Control": "no-store" } },
  );
}
