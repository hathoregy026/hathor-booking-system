import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

/** Shared shape of a translated content page's search settings. Server-only. */
export type LocalePage = {
  path: string;
  metadata: Metadata;
  /** WebPage name and the page's own breadcrumb label. */
  name: string;
  crumb: string;
  description: string;
};

export const localePage = (input: {
  path: string;
  title: string;
  description: string;
  name: string;
  crumb: string;
  image?: { url: string; width: number; height: number; alt: string };
}): LocalePage => ({
  path: input.path,
  name: input.name,
  crumb: input.crumb,
  description: input.description,
  metadata: buildPageMetadata({
    title: input.title,
    description: input.description,
    path: input.path,
    image: input.image,
  }),
});
