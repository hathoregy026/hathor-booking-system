import type { Metadata } from "next";
import { PartnersPageContent } from "@/components/pages/PartnersPageContent";

export const metadata: Metadata = {
  title: "Partners | Hathor Dahabiya Nile Cruise",
  description:
    "Trusted travel and hospitality partners who sail with Hathor Dahabiya on the Nile.",
  openGraph: {
    title: "Our Partners | Hathor Dahabiya",
    description: "Trusted worldwide — partners who share our care for the Nile.",
  },
};

export default function PartnersPage() {
  return <PartnersPageContent />;
}
