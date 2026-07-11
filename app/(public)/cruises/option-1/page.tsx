import type { Metadata } from "next";
import { CruisesOption1PageContent } from "@/components/pages/cruises-options/CruisesOption1PageContent";

const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

export const metadata: Metadata = {
  title: "Cruises Option 1 — Spa Style | Hathor",
  description: "Demo: hero blinds + dome pin, cruise listings fade in below.",
  robots: { index: false, follow: false },
};

export default function CruisesOption1Page() {
  return (
    <>
      <link rel="preload" href={BACK_LOGO_SRC} as="image" type="image/svg+xml" />
      <CruisesOption1PageContent />
    </>
  );
}
