import type { ReactNode } from "react";

/** Boot EX experience + cream theme before hydration. */
const EX_BOOT = `(function(){try{var d=document.documentElement;d.setAttribute("data-ex-experience","");}catch(e){}})();`;

const EX_CRITICAL_CSS = `
.ex-route,
.ex-route .public-site,
.ex-route .public-main,
.ex-route .page-transition {
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

export default function ExLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ex-route">
      <style dangerouslySetInnerHTML={{ __html: EX_CRITICAL_CSS }} />
      <script dangerouslySetInnerHTML={{ __html: EX_BOOT }} />
      {children}
    </div>
  );
}
