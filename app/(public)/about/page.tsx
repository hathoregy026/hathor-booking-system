import type { Metadata } from "next";
import { AboutPageContent } from "@/components/pages/AboutPageContent";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { ABOUT_SEO } from "@/lib/seo/page-metadata";
import "../../about-editorial.css";
import "../../editorial-chrome.css";

export const metadata: Metadata = ABOUT_SEO;

export default function AboutPage() {
  return (
    <>
      <PageStructuredData
        path="/about"
        name="About Hathor Dahabiya | A Private Nile Sailing"
        description={
          typeof ABOUT_SEO.description === "string" ? ABOUT_SEO.description : ""
        }
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
      />
      <AboutPageContent />
    </>
  );
}
