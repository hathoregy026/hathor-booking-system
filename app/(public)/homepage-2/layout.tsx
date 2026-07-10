import type { ReactNode } from "react";

/** Boot homepage-2 book bar + cream theme before hydration. */
const HP2_BOOT = `(function(){try{var d=document;d.documentElement.setAttribute("data-homepage2-experience","");}catch(e){}})();`;

const HP2_CRITICAL_CSS = `
.homepage-2-route,
.homepage-2-route .public-site,
.homepage-2-route .public-main,
.homepage-2-route .page-transition {
  --hp2-cream: #f4f1ea;
  background-color: var(--hp2-cream) !important;
}
html[data-homepage2-experience] .homepage-2-root [data-page-transition] .pt-stage,
html[data-homepage2-experience] .homepage-2-root [data-page-transition] .pt-sheet,
html[data-homepage2-experience] .homepage-2-root [data-page-transition] .pt-sheet__rise-cap,
html[data-homepage2-experience] .homepage-2-content-section,
html[data-homepage2-experience] .homepage-2-column-tail {
  background-color: var(--hp2-cream) !important;
}
html[data-homepage2-experience] .public-site > .owo-footer:not(.homepage-2-footer) {
  display: none !important;
}
`;

export default function HomePage2Layout({ children }: { children: ReactNode }) {
  return (
    <div className="homepage-2-route">
      <style dangerouslySetInnerHTML={{ __html: HP2_CRITICAL_CSS }} />
      <script dangerouslySetInnerHTML={{ __html: HP2_BOOT }} />
      {children}
    </div>
  );
}
