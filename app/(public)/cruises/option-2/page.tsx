import type { Metadata } from "next";
import { CruisesOption2PageContent } from "@/components/pages/cruises-options/CruisesOption2PageContent";

export const metadata: Metadata = {
  title: "Cruises Option 2 — One Elevator | Hathor",
  description: "Demo: all cruise content inside the rising cream sheet.",
  robots: { index: false, follow: false },
};

export default function CruisesOption2Page() {
  return <CruisesOption2PageContent />;
}
