import type { Metadata } from "next";
import { AboutPageContent } from "@/components/pages/AboutPageContent";

export const metadata: Metadata = {
  title: "Dahabiya Nile Cruise Egypt | Luxury Sailing on the Nile",
  description:
    "Welcome aboard Hathor Dahabiya — experience Egypt where timeless tradition meets modern luxury on an ultra-private Nile cruise.",
  openGraph: {
    title: "About Hathor Dahabiya | Luxury Nile Cruise",
    description:
      "Discover our luxury cabins, suites, royal suites, and world-class dining aboard Hathor Dahabiya.",
  },
};

export default function AboutPage() {
  return <AboutPageContent />;
}
