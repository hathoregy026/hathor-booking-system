import type { Metadata } from "next";
import { CruisesPageContent } from "@/components/pages/CruisesPageContent";
import { HATHOR_LOGO_LETTERS } from "@/lib/hathor-logo-letters";

export const metadata: Metadata = {
  title: "Mask Reveal | Hathor Nile Cruise",
  description:
    "Development test page — copy of the Dahabiya cruises experience for mask reveal work.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaskRevealPage() {
  const firstLetter = HATHOR_LOGO_LETTERS[0]?.src;
  return (
    <>
      {firstLetter ? (
        <link rel="preload" href={firstLetter} as="image" type="image/webp" />
      ) : null}
      <CruisesPageContent />
    </>
  );
}
