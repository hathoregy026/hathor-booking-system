import type { Metadata } from "next";
import { MaskRevealPageContent } from "@/components/pages/MaskRevealPageContent";

export const metadata: Metadata = {
  title: "Mask Reveal | Hathor Nile Cruise",
  description:
    "Development test page — Residences-inspired voyage listing layout with Hathor content.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaskRevealPage() {
  return <MaskRevealPageContent />;
}
