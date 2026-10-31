import type { Metadata } from "next";
import { CharterPageContent } from "@/components/pages/CharterPageContent";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { charterServiceNode } from "@/components/seo/charterService";
import { CHARTER_SEO, CHARTER_SEO_TITLE } from "@/lib/seo/page-metadata";
import "../../charter-editorial.css";
import "../../editorial-chrome.css";

export const metadata: Metadata = CHARTER_SEO;

export default function CharterPage() {
  const description =
    typeof CHARTER_SEO.description === "string" ? CHARTER_SEO.description : "";

  const charterService = charterServiceNode({
    path: "/charter",
    name: "Private Dahabiya Charter",
    description,
    serviceType: "Private Nile cruise charter",
    catalogName: "Private Nile cruise charter passages",
    tripName: (route) => `Private Dahabiya charter · ${route}`,
  });

  return (
    <>
      <PageStructuredData
        path="/charter"
        name={CHARTER_SEO_TITLE}
        description={description}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Charter Dahabiya Cruise", path: "/charter" },
        ]}
        image="/media/hathor/r2/charter-hero.webp"
        extra={[charterService]}
      />
      <CharterPageContent />
    </>
  );
}
