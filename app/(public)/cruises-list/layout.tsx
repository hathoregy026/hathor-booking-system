import type { ReactNode } from "react";
import { MaskRevealBoot } from "../mask-reveal/MaskRevealBoot";
import "../mask-reveal/mask-reveal.css";
import "../mask-reveal/cruises-intro.css";
import "../../editorial-chrome.css";
import "../../anima-title-split.css";

/**
 * Cruises = short Suites-style horizontal intro + listing with filters.
 * Native scroll (via MaskRevealBoot) keeps sticky filters working.
 */
const CRUISES_BOOT = `(function(){try{var d=document.documentElement,b=document.body;d.setAttribute("data-mask-reveal","");b.style.backgroundColor="#ece8df";}catch(e){}})();`;

const CRUISES_CRITICAL_CSS = `
html[data-mask-reveal],
html[data-mask-reveal] body,
html[data-mask-reveal] .public-site {
  background-color: #ece8df !important;
  background-image: none !important;
  overflow: visible !important;
  overflow-x: visible !important;
  overflow-y: visible !important;
}
html[data-mask-reveal] .public-site::before {
  content: none !important;
  display: none !important;
}
html[data-mask-reveal] .public-main--hero,
html[data-mask-reveal] .public-main,
html[data-mask-reveal] .page-transition,
html[data-mask-reveal] .mask-reveal-route {
  padding-top: 0 !important;
  margin-top: 0 !important;
  max-width: none !important;
  width: 100% !important;
  background: transparent !important;
  overflow: visible !important;
  overflow-x: visible !important;
  transform: none !important;
  filter: none !important;
  perspective: none !important;
}
`;

export default function CruisesListLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CRUISES_CRITICAL_CSS }} />
      <script dangerouslySetInnerHTML={{ __html: CRUISES_BOOT }} />
      <div className="mask-reveal-route">
        <MaskRevealBoot>{children}</MaskRevealBoot>
      </div>
    </>
  );
}
