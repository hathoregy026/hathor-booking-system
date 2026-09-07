import type { Metadata } from "next";
import { WellnessEditorialPageContent } from "@/components/pages/WellnessEditorialPageContent";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { WELLNESS_SEO } from "@/lib/seo/page-metadata";
import "../../wellness-editorial.css";
import "../../editorial-chrome.css";

export const metadata: Metadata = WELLNESS_SEO;

export default function WellnessPage() {
  return (
    <>
      <PageStructuredData
        path="/wellness"
        name="Seneb Spa on the Nile | Hathor Dahabiya Wellness"
        description={
          typeof WELLNESS_SEO.description === "string"
            ? WELLNESS_SEO.description
            : ""
        }
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Wellness", path: "/wellness" },
        ]}
      />
      <WellnessEditorialPageContent />
    </>
  );
}
