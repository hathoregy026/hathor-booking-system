import type { Metadata } from "next";
import { WellnessEditorialPageContent } from "@/components/pages/WellnessEditorialPageContent";
import "../../wellness-editorial.css";
import "../../editorial-chrome.css";

export const metadata: Metadata = {
  title: "Wellness Hathor Dahabiya Cruise | Spa Experience on the Nile",
  description:
    "Seneb Spa and Historia Fitness Center aboard Hathor Dahabiya: Egyptian wellness traditions on a floating oasis.",
  openGraph: {
    title: "Seneb Spa | Hathor Wellness",
    description:
      "Renew your soul on the Nile with signature spa therapies and a fitness center with panoramic river views.",
  },
};

export default function WellnessPage() {
  return <WellnessEditorialPageContent />;
}
