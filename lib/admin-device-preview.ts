/** Admin + public phone/desktop preview viewport helpers. */

export type AdminDevicePreview = "desktop" | "phone";

/** iPhone 14-ish frame used in admin phone preview. */
export const ADMIN_PHONE_PREVIEW_WIDTH = 390;

/** Public site: phone settings apply at this max width (matches existing public.css). */
export const PUBLIC_PHONE_MAX_WIDTH = 767;

/** Phone + tablet viewports. Desktop begins strictly above 1024px. */
export const PUBLIC_NARROW_MAX_WIDTH = 1024;

export function isAdminDevicePreview(value: unknown): value is AdminDevicePreview {
  return value === "desktop" || value === "phone";
}

/** Wrap generated !important CSS so it only wins on phone viewports. */
export function wrapCssForPhoneViewport(css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return "";
  return `@media (max-width: ${PUBLIC_PHONE_MAX_WIDTH}px) {\n${trimmed}\n}`;
}

/** Phone + tablet override (hero logo/CTA visibility). */
export function wrapCssForNarrowViewport(css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return "";
  return `@media (max-width: ${PUBLIC_NARROW_MAX_WIDTH}px) {\n${trimmed}\n}`;
}

/** Desktop CSS + phone override block for live site injection. */
export function combineDesktopAndPhoneCss(
  desktopCss: string,
  phoneCss: string,
): string {
  const desk = desktopCss.trim();
  const phone = wrapCssForPhoneViewport(phoneCss);
  return [desk, phone].filter(Boolean).join("\n\n");
}

/** Desktop + narrow (≤1024) override — use for hero logo so tablets aren't clipped. */
export function combineDesktopAndNarrowCss(
  desktopCss: string,
  narrowCss: string,
): string {
  const desk = desktopCss.trim();
  const narrow = wrapCssForNarrowViewport(narrowCss);
  return [desk, narrow].filter(Boolean).join("\n\n");
}
