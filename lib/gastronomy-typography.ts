import { prisma } from "@/lib/prisma";
import { withDb } from "@/lib/db-safe";
import {
  HATHOR_FONT_STACKS,
  type TypographyTextStyle,
} from "@/lib/typography-settings-shared";
import {
  DEFAULT_GASTRONOMY_TYPOGRAPHY,
  gastronomyTypographySchema,
  type GastronomyTypography,
} from "@/lib/gastronomy-typography-shared";

export const GASTRONOMY_TYPOGRAPHY_KEY = "gastronomy-typography";
export const GASTRONOMY_TYPOGRAPHY_MOBILE_KEY = "gastronomy-typography-mobile";

export {
  DEFAULT_GASTRONOMY_TYPOGRAPHY,
  gastronomyTypographySchema,
};
export type { GastronomyTypography };

function parse(value: string | null): GastronomyTypography {
  try {
    return gastronomyTypographySchema.parse(JSON.parse(value ?? ""));
  } catch {
    return DEFAULT_GASTRONOMY_TYPOGRAPHY;
  }
}

export async function getGastronomyTypography(phone = false) {
  const key = phone ? GASTRONOMY_TYPOGRAPHY_MOBILE_KEY : GASTRONOMY_TYPOGRAPHY_KEY;
  const row = await withDb(() => prisma.siteSetting.findUnique({ where: { key } }));
  return parse(row?.value ?? null);
}

export async function saveGastronomyTypography(value: unknown, phone = false) {
  const settings = gastronomyTypographySchema.parse(value);
  const key = phone ? GASTRONOMY_TYPOGRAPHY_MOBILE_KEY : GASTRONOMY_TYPOGRAPHY_KEY;
  await withDb(() =>
    prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: JSON.stringify(settings) },
      update: { value: JSON.stringify(settings) },
    }),
  );
  return settings;
}

function roleCss(selector: string, style: TypographyTextStyle) {
  const fontStack = HATHOR_FONT_STACKS[style.fontFamily].replace(
    /var\([^)]*\),?\s*/g,
    "",
  );
  const shadow = style.innerShadow
    ? "1px 1px 0 rgba(0,0,0,.35),-.5px -.5px 0 rgba(255,255,255,.25)"
    : "none";
  return `${selector}{font-family:${fontStack}!important;font-size:${style.fontSize}px!important;color:${style.color}!important;line-height:${style.lineHeight}!important;letter-spacing:${style.letterSpacing}px!important;text-shadow:${shadow}!important;}`;
}

function privateDiningTitleCss(style: TypographyTextStyle) {
  const fontStack = HATHOR_FONT_STACKS[style.fontFamily].replace(
    /var\([^)]*\),?\s*/g,
    "",
  );
  return `#de-intro .de-intro__caption-title.is-hidden--lg-up::after{font-family:${fontStack}!important;font-size:${style.fontSize}px!important;color:${style.color}!important;line-height:${style.lineHeight}!important;letter-spacing:${style.letterSpacing}px!important;}`;
}

const privateMenuPanelCss = `
#de-flats-80691 .de-flats__text,
#de-flats-80691 .de-flats__text *,
#de-flats-251302 .de-flats__text,
#de-flats-251302 .de-flats__text *,
#de-flats-644069 .de-flats__text,
#de-flats-644069 .de-flats__text *{color:#f5e8d1!important;}`;

export function gastronomyTypographyToCss(settings: GastronomyTypography) {
  return [
    privateDiningTitleCss(settings.display),
    roleCss(".g1,.h0,.h1,.h2,.h3", settings.display),
    roleCss(".text-c1,.text-c2,.text-c2-small", settings.indication),
    roleCss("p,.btn__text", settings.body),
    privateMenuPanelCss,
  ].join("");
}
