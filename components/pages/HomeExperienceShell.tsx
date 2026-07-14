import type { ReactNode } from "react";

/** Boot home experience + cream theme before hydration. */
const HOME_BOOT = `(function(){try{var d=document.documentElement;d.setAttribute("data-ex-experience","");}catch(e){}})();`;

const HOME_CRITICAL_CSS = `
.home-experience-route,
.home-experience-route .public-site,
html[data-ex-experience] .public-site,
html[data-ex-experience] .ex-root {
  --ex-cream: #ece8df;
  --hieroglyph-tile: url("/branding/egyptian-hyroglyphs-hathor-cruise-tile.webp");
  background-color: var(--ex-cream) !important;
  background-image: var(--hieroglyph-tile) !important;
  background-repeat: repeat !important;
  background-position: center top !important;
  background-size: 640px auto !important;
}
.home-experience-route .public-main,
.home-experience-route .page-transition,
html[data-ex-experience] .public-main,
html[data-ex-experience] .page-transition,
html[data-ex-experience] .ex-content-section {
  background-color: transparent !important;
  background-image: none !important;
}
html[data-ex-experience] .home-hero-container {
  background-color: #1a1410 !important;
  background-image: none !important;
}
html[data-ex-experience] .public-site > .owo-footer:not(.ex-site-footer) {
  display: none !important;
}
html[data-ex-experience] .public-main--hero,
html[data-ex-experience] .public-main {
  margin-top: 0 !important;
  padding-top: 0 !important;
}
html[data-ex-experience] .site-nav-bar__logo {
  transform: none !important;
  opacity: 1 !important;
  animation: none !important;
}
`;

export function HomeExperienceShell({ children }: { children: ReactNode }) {
  return (
    <div className="home-experience-route ex-route">
      <style dangerouslySetInnerHTML={{ __html: HOME_CRITICAL_CSS }} />
      <script dangerouslySetInnerHTML={{ __html: HOME_BOOT }} />
      {children}
    </div>
  );
}
