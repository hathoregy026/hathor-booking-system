import type { Metadata } from "next";
import { HighlightsPageContent } from "@/components/pages/highlights/HighlightsPageContent";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { HIGHLIGHTS_SEO } from "@/lib/seo/page-metadata";
import "../../editorial-chrome.css";
import "../../highlights-editorial.css";

export const metadata: Metadata = HIGHLIGHTS_SEO;

export default function HighlightsPage() {
  return (
    <>
      <PageStructuredData
        path="/highlights"
        name="Nile Cruise Highlights | Temples Between Luxor and Aswan"
        description={
          typeof HIGHLIGHTS_SEO.description === "string"
            ? HIGHLIGHTS_SEO.description
            : ""
        }
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Highlights", path: "/highlights" },
        ]}
        image="/media/hathor/r2/highlights-hero.webp"
      />
      <HighlightsPageContent />
    </>
  );
}
