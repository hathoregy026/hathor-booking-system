import type { ReactNode } from "react";
import { CruisesScrollBoot } from "./CruisesScrollBoot";
import "./cruises-scroll.css";

/** Runs before React hydration — prevents cream/footer/layout flash on hard load. */
const CRUISES_BOOT = `(function(){try{var d=document.documentElement,b=document.body;d.setAttribute("data-cruises-experience","");d.classList.add("has-page-scroll-transition");b.classList.add("has-page-scroll-transition");b.style.backgroundColor="#f4f1ea";}catch(e){}})();`;

/** First-paint guards — must not depend on :has() or post-hydration body classes. */
const CRUISES_CRITICAL_CSS = `
html[data-cruises-experience],
html[data-cruises-experience] body {
  background-color: #f4f1ea !important;
}
html[data-cruises-experience] .public-site,
html[data-cruises-experience] .public-main,
html[data-cruises-experience] .page-transition,
html[data-cruises-experience] .cruises-scroll-route,
html[data-cruises-experience] .cruises-scroll-root {
  background-color: #f4f1ea !important;
}
html[data-cruises-experience] .public-site > .owo-footer {
  display: none !important;
}
html[data-cruises-experience]:not(.cruises-scroll-ready) .cruises-sheet-follower {
  visibility: hidden !important;
}
html[data-cruises-experience]:not(.cruises-scroll-ready) .cruises-content-layer {
  visibility: hidden !important;
}
html[data-cruises-experience]:not(.cruises-scroll-ready) .cruises-giant-logo {
  opacity: 0 !important;
}
`;

export default function CruisesLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CRUISES_CRITICAL_CSS }} />
      <script dangerouslySetInnerHTML={{ __html: CRUISES_BOOT }} />
      <div className="cruises-scroll-route">
        <CruisesScrollBoot>{children}</CruisesScrollBoot>
      </div>
    </>
  );
}
