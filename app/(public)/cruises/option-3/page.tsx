import type { Metadata } from "next";
import { CruisesOption3PageContent } from "@/components/pages/cruises-options/CruisesOption3PageContent";

const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

export const metadata: Metadata = {
  title: "Cruises Option 3 — Two Layers | Hathor",
  description: "Demo: split animation layer with synced content column.",
  robots: { index: false, follow: false },
};

export default function CruisesOption3Page() {
  return (
    <>
      <link rel="preload" href={BACK_LOGO_SRC} as="image" type="image/svg+xml" />
      <CruisesOption3PageContent />
    </>
  );
}
