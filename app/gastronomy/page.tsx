import type { Metadata } from "next";
import { GastronomyPageContent } from "@/components/pages/GastronomyPageContent";

export const metadata: Metadata = {
  title: "Springs Design",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Deliberately outside (public): the page is a complete captured document
 * inside an isolated frame and must not inherit PublicLayout infrastructure.
 */
export default function GastronomyPage() {
  return <GastronomyPageContent />;
}
