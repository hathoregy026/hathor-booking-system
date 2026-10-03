import type { Metadata } from "next";
import { CharterPageContent } from "@/components/pages/CharterPageContent";
import { LocaleWebsiteText } from "@/components/public/LocaleWebsiteText";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { charterServiceNode } from "@/components/seo/charterService";
import { CHARTER_COPY } from "@/lib/i18n/charter-copy";
import { CHARTER_SEO_IT, CHARTER_SEO_TITLE_IT } from "@/lib/i18n/charter-seo-it";
import "../../../charter-editorial.css";
import "../../../editorial-chrome.css";

export const metadata: Metadata = CHARTER_SEO_IT;

export default function ItalianCharterPage() {
  const description =
    typeof CHARTER_SEO_IT.description === "string" ? CHARTER_SEO_IT.description : "";

  const charterService = charterServiceNode({
    path: "/it/charter",
    name: "Charter privato in dahabiya",
    description,
    serviceType: "Crociera privata sul Nilo in charter",
    catalogName: "Itinerari del charter privato sul Nilo",
    tripName: (route) => `Charter privato in dahabiya · ${route}`,
    place: CHARTER_COPY.it.place,
  });

  return (
    <>
      <PageStructuredData
        path="/it/charter"
        name={CHARTER_SEO_TITLE_IT}
        description={description}
        breadcrumbs={[
          { name: "Home", path: "/it" },
          { name: "Charter privato in dahabiya", path: "/it/charter" },
        ]}
        image="/media/hathor/r2/charter-hero.webp"
        extra={[charterService]}
      />
      <LocaleWebsiteText locale="it">
        <CharterPageContent />
      </LocaleWebsiteText>
    </>
  );
}
