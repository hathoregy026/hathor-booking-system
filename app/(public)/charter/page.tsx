import type { Metadata } from "next";
import { CharterPageContent } from "@/components/pages/CharterPageContent";
import "../../awards-cinema.css";
import "../../charter-page.css";

export const metadata: Metadata = {
  title: "Charter | Hathor Nile Cruise",
  description:
    "Charter Hathor — your floating palace on the Nile. Private vessel, suites, dining and excursions.",
  openGraph: {
    title: "Charter Hathor",
    description: "Secure your private passage through ancient Egypt.",
  },
};

export default function CharterPage() {
  return <CharterPageContent />;
}
