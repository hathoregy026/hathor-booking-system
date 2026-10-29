import type { Metadata } from "next";
import { notFound } from "next/navigation";

/* After hydration Next shows this route's metadata, not the 404's, so it is stated here too. */
export const metadata: Metadata = {
  title: "Pagina non trovata",
  robots: { index: false, follow: true },
};

/** Any /it address without a page shows the Italian 404 instead of Next's English default. */
export default function ItalianMissingPage() {
  notFound();
}
