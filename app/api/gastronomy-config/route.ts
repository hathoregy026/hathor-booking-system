import { NextResponse } from "next/server";
import { getActiveSiteImages } from "@/lib/image-management";
import {
  gastronomyTypographyToCss,
  getGastronomyTypography,
  type GastronomyTypography,
} from "@/lib/gastronomy-typography";
import { SITE_IMAGE_SLOTS } from "@/lib/site-image-slots";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const defaults = Object.fromEntries(
    SITE_IMAGE_SLOTS.filter(
      (slot) =>
        slot.pagePath === "/gastronomy" && !slot.name.startsWith("gastronomy-"),
    ).map((slot) => [
      slot.name,
      slot.url,
    ]),
  );
  let images: Array<{ name: string; url: string }> = [];
  let desktop: GastronomyTypography | undefined;
  let phone: GastronomyTypography | undefined;
  try {
    [images, desktop, phone] = await Promise.all([
      getActiveSiteImages("/gastronomy"),
      getGastronomyTypography(),
      getGastronomyTypography(true),
    ]);
  } catch {
    desktop = undefined;
    phone = undefined;
  }
  return NextResponse.json(
    {
      images: {
        ...defaults,
        ...Object.fromEntries(
          images
            .filter((image) => !image.name.startsWith("gastronomy-"))
            .map((image) => [image.name, image.url]),
        ),
      },
      css: desktop ? gastronomyTypographyToCss(desktop) : "",
      phoneCss: phone ? gastronomyTypographyToCss(phone) : "",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
