import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { notFoundMetadata } from "@/lib/i18n/not-found";

/* After hydration Next shows this route's metadata, not the 404's, so it is stated here too. */
export const metadata: Metadata = notFoundMetadata("it");

/** Any /it address without a page shows this language's 404 instead of Next's English default. */
export default function ItalianMissingPage() {
  notFound();
}
