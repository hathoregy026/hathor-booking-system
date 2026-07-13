import type { ReactNode } from "react";

/** Boot home experience + cream theme before hydration. */
const HOME_BOOT = `(function(){try{var d=document.documentElement;d.setAttribute("data-ex-experience","");}catch(e){}})();`;

const HOME_CRITICAL_CSS = `
.home-experience-route,
.home-experience-route .public-site,
.home-experience-route .public-main,
.home-experience-route .page-transition {
  --ex-cream: #f4f1ea;
  background-color: var(--ex-cream) !important;
}
html[data-ex-experience] .ex-root [data-page-transition],
html[data-ex-experience] .ex-content-section {
  background-color: var(--ex-cream) !important;
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
