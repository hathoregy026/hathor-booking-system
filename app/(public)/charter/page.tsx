import type { Metadata } from "next";
import { CharterPageContent } from "@/components/pages/CharterPageContent";

export const metadata: Metadata = {
  title: "Charter | Hathor Nile Cruise",
  description: "Charter Hathor, your floating palace on the Nile.",
};

export default function CharterPage() {
  return <CharterPageContent />;
}
