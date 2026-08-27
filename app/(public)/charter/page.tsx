import type { Metadata } from "next";
import { CharterPageContent } from "@/components/pages/CharterPageContent";

export const metadata: Metadata = {
  title: "Charter Dahabiya Cruise",
  description:
    "Charter Hathor Dahabiya for a private Nile sailing between Luxor and Aswan, with exclusive suites, fine dining, and a dedicated crew.",
  alternates: {
    canonical: "/charter",
  },
};

export default function CharterPage() {
  return <CharterPageContent />;
}
