"use client";

import { usePathname } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationNode, websiteNode } from "@/components/seo/siteNodes";
import { splitLocalePath } from "@/lib/i18n/locale";

/* Rendered by the shared root layout, so the language comes from the address. */
export function SiteStructuredData() {
  const { locale } = splitLocalePath(usePathname());
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [organizationNode(locale), websiteNode()],
      }}
    />
  );
}
