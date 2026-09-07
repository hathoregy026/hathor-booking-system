import type { Metadata } from "next";
import { MaskRevealPageContent } from "@/components/pages/MaskRevealPageContent";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { CRUISES_LIST_SEO } from "@/lib/seo/page-metadata";

export const metadata: Metadata = CRUISES_LIST_SEO;

export default function CruisesListPage() {
  return (
    <>
      <PageStructuredData
        path="/cruises-list"
        name="Scheduled Hathor Sailings | Book a Dahabiya Nile Cruise"
        description={
          typeof CRUISES_LIST_SEO.description === "string"
            ? CRUISES_LIST_SEO.description
            : ""
        }
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Voyages", path: "/voyages" },
          { name: "Scheduled sailings", path: "/cruises-list" },
        ]}
      />
      <MaskRevealPageContent />
    </>
  );
}
