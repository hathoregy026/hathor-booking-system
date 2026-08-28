import { HATHOR_ICON_GOLD_SRC } from "@/lib/branding";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { DEFAULT_LIVE_SITE_BG_SRC } from "@/lib/live-site-settings-shared";

type SiteComingSoonProps = {
  backgroundImageUrl?: string;
};

/**
 * Full-viewport Coming Soon gate — navbar always visible; no page content.
 */
export function SiteComingSoon({
  backgroundImageUrl = DEFAULT_LIVE_SITE_BG_SRC,
}: SiteComingSoonProps) {
  return (
    <div className="public-site hathor-site site-coming-soon-shell">
      <PublicNavbar />
      <div className="site-coming-soon" role="status" aria-live="polite">
      <div
        className="site-coming-soon__bg"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        aria-hidden
      />
      <div className="site-coming-soon__content">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="site-coming-soon__logo"
          src={HATHOR_ICON_GOLD_SRC}
          alt="Hathor"
          width={220}
          height={220}
          decoding="async"
        />
        <p className="site-coming-soon__label">Coming Soon</p>
      </div>
    </div>
    </div>
  );
}
