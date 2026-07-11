import type { Metadata } from "next";
import { CruisesOption4PageContent } from "@/components/pages/cruises-options/CruisesOption4PageContent";

const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

export const metadata: Metadata = {
  title: "Cruises Option 4 — Hybrid Spa | Hathor",
  description:
    "Hybrid Venetian spa transition: sticky blinds + arch rise, listings in normal flow.",
  robots: { index: false, follow: false },
};

export default function CruisesOption4Page() {
  return (
    <>
      <link rel="preload" href={BACK_LOGO_SRC} as="image" type="image/svg+xml" />
      <CruisesOption4PageContent />
    </>
  );
}
