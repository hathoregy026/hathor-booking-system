import type { Metadata } from "next";
import { CharterPageContent } from "@/components/pages/CharterPageContent";
import {
  PageStructuredData,
  serviceNode,
} from "@/components/seo/PageStructuredData";
import { CHARTER_SEO } from "@/lib/seo/page-metadata";
import "../../charter-editorial.css";
import "../../editorial-chrome.css";

export const metadata: Metadata = CHARTER_SEO;

export default function CharterPage() {
  const description =
    typeof CHARTER_SEO.description === "string" ? CHARTER_SEO.description : "";

  return (
    <>
      <PageStructuredData
        path="/charter"
        name="Private Nile Cruise Egypt | Hathor Dahabiya Charter"
        description={description}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Private Charter", path: "/charter" },
        ]}
        image="/media/hathor/r2/charter-hero.webp"
        extra={[
          serviceNode({
            path: "/charter",
            name: "Private Dahabiya Charter",
            description,
            serviceType: "Private Nile cruise charter",
          }),
        ]}
      />
      <CharterPageContent />
    </>
  );
}
