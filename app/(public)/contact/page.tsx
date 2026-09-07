import type { Metadata } from "next";
import { ContactPageContent } from "@/components/pages/ContactPageContent";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { CONTACT_SEO } from "@/lib/seo/page-metadata";
import "../../editorial-chrome.css";
import "../../contact-editorial.css";

export const metadata: Metadata = CONTACT_SEO;

export default function ContactPage() {
  return (
    <>
      <PageStructuredData
        path="/contact"
        name="Contact Hathor Dahabiya | Nile Cruise Reservations"
        description={
          typeof CONTACT_SEO.description === "string"
            ? CONTACT_SEO.description
            : ""
        }
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
      />
      <ContactPageContent />
    </>
  );
}
