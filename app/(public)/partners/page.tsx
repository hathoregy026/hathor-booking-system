import type { Metadata } from "next";
import { PartnersPageContent } from "@/components/pages/PartnersPageContent";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { PARTNERS_SEO } from "@/lib/seo/page-metadata";
import "../../partners-editorial.css";
import "../../editorial-chrome.css";
import "../../partners-company-strip.css";

export const metadata: Metadata = PARTNERS_SEO;

export default function PartnersPage() {
  return (
    <>
      <PageStructuredData
        path="/partners"
        name="Travel Partners | Hathor Dahabiya"
        description={
          typeof PARTNERS_SEO.description === "string"
            ? PARTNERS_SEO.description
            : ""
        }
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Partners", path: "/partners" },
        ]}
      />
      <PartnersPageContent />
    </>
  );
}
