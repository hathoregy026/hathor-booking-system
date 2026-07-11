import type { Metadata } from "next";
import { CruisesOption4PageContent } from "@/components/pages/cruises-options/CruisesOption4PageContent";

const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

export const metadata: Metadata = {
  title: "Cruises Option 4 — Horizon Stripes | Hathor",
  description:
    "Venetian gold stripe reveal with flat horizon rail rise — no dome.",
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
