/**
 * DEVELOPMENT-ONLY — homepage motion stack with default CMS props (no DB fetch).
 */
import { notFound } from "next/navigation";
import { HomeExperienceShell } from "@/components/pages/HomeExperienceShell";
import { HomePageClient } from "@/components/pages/HomePageClient";
import {
  DEFAULT_HERO_LOGO_TUNE,
  DEFAULT_HERO_LOGO_TUNE_MOBILE,
} from "@/lib/hero-logo-tune-shared";

export const dynamic = "force-dynamic";

export default function MotionLabHomePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <HomeExperienceShell>
      <HomePageClient
        heroLogoTune={DEFAULT_HERO_LOGO_TUNE}
        heroLogoTuneMobile={DEFAULT_HERO_LOGO_TUNE_MOBILE}
        accordionCruises={[]}
      />
    </HomeExperienceShell>
  );
}
