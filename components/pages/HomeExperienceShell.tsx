import type { ReactNode } from "react";

/** Boot home experience + cream theme before hydration. */
const HOME_BOOT = `(function(){try{var d=document.documentElement;d.setAttribute("data-ex-experience","");}catch(e){}})();`;

const HOME_CRITICAL_CSS = `
html[data-ex-experience] .ex-root {
  --ex-cream: #ece8df;
  --hieroglyph-tile: url("/branding/egyptian-hyroglyphs-hathor-cruise-solid-v2.webp");
  position: relative !important;
  isolation: isolate !important;
  background-color: var(--ex-cream) !important;
  background-image: none !important;
}
html[data-ex-experience] .ex-root::before {
  content: "" !important;
  display: block !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
  pointer-events: none !important;
  background-image: var(--hieroglyph-tile) !important;
  background-repeat: repeat !important;
  background-position: center top !important;
  background-size: 640px auto !important;
  opacity: 0.04 !important;
}
html[data-ex-experience] .ex-root > * {
  position: relative;
  z-index: 1;
}
.home-experience-route,
html[data-ex-experience] .public-main,
html[data-ex-experience] .page-transition,
html[data-ex-experience] .ex-content-section {
  background-color: transparent !important;
  background-image: none !important;
}
.home-experience-route::before,
html[data-ex-experience] .public-site::before {
  content: none !important;
  display: none !important;
}
html[data-ex-experience] .home-hero-container {
  background-color: #1a1410 !important;
  background-image: none !important;
  z-index: 2 !important;
}
html[data-ex-experience] .home-hero-container::before {
  content: none !important;
  display: none !important;
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
