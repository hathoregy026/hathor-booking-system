import type { Metadata } from "next";
import {
  clipMetaDescription,
  SEO_BRAND_NAME,
  SEO_DEFAULT_OG_IMAGE,
  SEO_SITE_ORIGIN,
} from "@/lib/seo/site";
import {
  hreflangAlternates,
  isLocaleIndexed,
  pageLanguageVersions,
  PUBLIC_LOCALE_OG,
  splitLocalePath,
} from "@/lib/i18n/locale";

export type SeoOgImage = {
  url: string;
  width?: number;
  height?: number;
  alt: string;
};

export type BuildPageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: readonly string[];
  image?: SeoOgImage;
  index?: boolean;
  follow?: boolean;
  ogType?: "website" | "article";
  publishedTime?: string;
};

/*
 * Languages are handled here, once, for every page: the language comes from
 * `path` (`/it/…` is Italian), hreflang lists each indexed version of the page,
 * and a language whose search switch is off (LOCALE_INDEXED) is noindex.
 * A page that exists in English only gets exactly what it had before.
 */

const INDEXABLE_ROBOTS = { index: true, follow: true } as const;
const NOINDEX_ROBOTS = { index: false, follow: true } as const;

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  image = SEO_DEFAULT_OG_IMAGE,
  index = true,
  follow = true,
  ogType = "website",
  publishedTime,
}: BuildPageMetadataInput): Metadata {
  const descriptionClipped = clipMetaDescription(description);
  const { locale } = splitLocalePath(path);
  const languages = hreflangAlternates(path);
  const alternateLocale = pageLanguageVersions(path)
    .filter((version) => version.locale !== locale)
    .map((version) => PUBLIC_LOCALE_OG[version.locale]);
  const robots = index && isLocaleIndexed(locale)
    ? follow
      ? INDEXABLE_ROBOTS
      : { index: true, follow: false }
    : follow
      ? NOINDEX_ROBOTS
      : { index: false, follow: false };

  return {
    metadataBase: new URL(SEO_SITE_ORIGIN),
    title: { absolute: title },
    description: descriptionClipped,
    keywords: keywords ? [...keywords] : undefined,
    alternates: languages ? { canonical: path, languages } : { canonical: path },
    robots,
    openGraph: {
      title,
      description: descriptionClipped,
      url: path,
      siteName: SEO_BRAND_NAME,
      locale: PUBLIC_LOCALE_OG[locale],
      ...(alternateLocale.length ? { alternateLocale } : {}),
      type: ogType,
      publishedTime,
      images: [
        {
          url: image.url,
          width: image.width ?? 1920,
          height: image.height ?? 1080,
          alt: image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: descriptionClipped,
      images: [image.url],
    },
  };
}
