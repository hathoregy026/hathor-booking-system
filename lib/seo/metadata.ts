import type { Metadata } from "next";
import {
  clipMetaDescription,
  SEO_BRAND_NAME,
  SEO_DEFAULT_OG_IMAGE,
  SEO_LOCALE,
  SEO_SITE_ORIGIN,
} from "@/lib/seo/site";

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
  const robots = index
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
    alternates: { canonical: path },
    robots,
    openGraph: {
      title,
      description: descriptionClipped,
      url: path,
      siteName: SEO_BRAND_NAME,
      locale: SEO_LOCALE,
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
