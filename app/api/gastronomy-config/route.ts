import { NextResponse } from "next/server";
import { getActiveSiteImages } from "@/lib/image-management";
import {
  DEFAULT_GASTRONOMY_TYPOGRAPHY,
  gastronomyTypographyToCss,
  getGastronomyTypography,
  withSiteTypographyFonts,
  type GastronomyTypography,
} from "@/lib/gastronomy-typography";
import { deliverPublicSiteImage } from "@/lib/local-optimized-site-images";
import { SITE_IMAGE_SLOTS } from "@/lib/site-image-slots";
import { publicSiteImageSrc } from "@/lib/site-image-url";
import {
  DEFAULT_TYPOGRAPHY_SETTINGS,
  getTypographySettingsMobileSafe,
  getTypographySettingsSafe,
} from "@/lib/typography-settings";

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
  let desktop: GastronomyTypography = DEFAULT_GASTRONOMY_TYPOGRAPHY;
  let phone: GastronomyTypography = DEFAULT_GASTRONOMY_TYPOGRAPHY;
  try {
    const [imgs, diningDesktop, diningPhone, siteDesktop, sitePhone] =
      await Promise.all([
        getActiveSiteImages("/gastronomy"),
        getGastronomyTypography(),
        getGastronomyTypography(true),
        getTypographySettingsSafe(),
        getTypographySettingsMobileSafe(),
      ]);
    images = imgs;
    desktop = withSiteTypographyFonts(
      diningDesktop,
      siteDesktop ?? DEFAULT_TYPOGRAPHY_SETTINGS,
    );
    phone = withSiteTypographyFonts(
      diningPhone,
      sitePhone ?? siteDesktop ?? DEFAULT_TYPOGRAPHY_SETTINGS,
    );
  } catch {
    desktop = withSiteTypographyFonts(
      DEFAULT_GASTRONOMY_TYPOGRAPHY,
      DEFAULT_TYPOGRAPHY_SETTINGS,
    );
    phone = desktop;
  }
  return NextResponse.json(
    {
      images: {
        ...defaults,
        ...Object.fromEntries(
          images
            .filter((image) => !image.name.startsWith("gastronomy-"))
            .map((image) => {
              const raw = publicSiteImageSrc(image.name, image.url);
              return [
                image.name,
                raw ? deliverPublicSiteImage(image.name, raw) : raw,
              ];
            }),
        ),
      },
      css: gastronomyTypographyToCss(desktop),
      phoneCss: gastronomyTypographyToCss(phone),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
