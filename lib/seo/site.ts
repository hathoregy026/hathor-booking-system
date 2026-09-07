import { HATHOR_FAVICON_SRC, HATHOR_HERO_POSTER_SRC } from "@/lib/branding";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { PUBLIC_SOCIAL_LINKS } from "@/lib/public-social";

/** Canonical public origin for EasyTravEgypt / Hathor Dahabiya. */
export const SEO_SITE_ORIGIN = "https://www.easytravegypt.com";

export const SEO_BRAND_NAME = "Hathor Dahabiya";
export const SEO_LEGAL_NAME = "EasyTravEgypt";
export const SEO_SITE_NAME = "Hathor Dahabiya";
export const SEO_LOCALE = "en_US";
export const SEO_LANGUAGE = "en";

export const SEO_DEFAULT_OG_IMAGE = {
  url: HATHOR_HERO_POSTER_SRC,
  width: 1920,
  height: 1080,
  alt: "Hathor Dahabiya sailing a luxury Nile cruise between Luxor and Aswan",
} as const;

export const SEO_LOGO_PATH = HATHOR_FAVICON_SRC;

export function seoAbsoluteUrl(path = "/"): string {
  const cleaned = path.trim() || "/";
  if (/^https?:\/\//i.test(cleaned)) return cleaned.replace(/\/$/, "") || SEO_SITE_ORIGIN;
  const normalised = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  if (normalised === "/") return `${SEO_SITE_ORIGIN}/`;
  return `${SEO_SITE_ORIGIN}${normalised}`;
}

export function clipMetaDescription(value: string, max = 155): string {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  const sliced = compact.slice(0, max - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).trimEnd()}…`;
}

export function jsonLdSafe(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export const SEO_SOCIAL_URLS = PUBLIC_SOCIAL_LINKS.map((link) => link.href);

export const SEO_CONTACT = {
  email: PUBLIC_CONTACT.email,
  telephone: PUBLIC_CONTACT.phone,
  telephoneDisplay: PUBLIC_CONTACT.phoneDisplay,
  streetAddress: "One Kattamiya, Tower 211, Floor 11, Flat 111, Ring Road",
  addressLocality: "Cairo",
  addressCountry: "EG",
} as const;
