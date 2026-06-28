import type { Metadata } from "next";
import { CharterPageContent } from "@/components/pages/CharterPageContent";

export const metadata: Metadata = {
  title: "Charter Dahabiya Cruise | Private Nile Experience",
  description:
    "Charter the entire Hathor Dahabiya for your group — full privacy, dedicated crew, luxury service, and customized itineraries.",
  openGraph: {
    title: "Charter Hathor Dahabiya",
    description:
      "Book a private Dahabiya charter from Luxor, Aswan, Cairo, or Dendera — contact us for a personalized offer.",
  },
};

export default function CharterPage() {
  return <CharterPageContent />;
}
