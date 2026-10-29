import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NOT_FOUND_METADATA_IT } from "@/lib/i18n/not-found-it";

/* After hydration Next shows this route's metadata, not the 404's, so it is stated here too. */
export const metadata: Metadata = NOT_FOUND_METADATA_IT;

/** Any /it address without a page shows the Italian 404 instead of Next's English default. */
export default function ItalianMissingPage() {
  notFound();
}
