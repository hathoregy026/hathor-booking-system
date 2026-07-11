import type { ReactNode } from "react";
import { CruisesOption3Boot } from "./CruisesOption3Boot";
import "./option-3-scroll.css";

const OPTION_3_BOOT = `(function(){try{var d=document.documentElement,b=document.body;d.setAttribute("data-cruises-option-3-experience","");d.classList.add("has-page-scroll-transition");b.classList.add("has-page-scroll-transition");b.style.backgroundColor="#f4f1ea";}catch(e){}})();`;

const OPTION_3_CRITICAL_CSS = `
html[data-cruises-option-3-experience],
html[data-cruises-option-3-experience] body {
  background-color: #f4f1ea !important;
}
html[data-cruises-option-3-experience] .public-site > .owo-footer {
  display: none !important;
}
html[data-cruises-option-3-experience]:not(.cruises-option-3-scroll-ready) .cruises-sheet-follower {
  visibility: hidden !important;
}
html[data-cruises-option-3-experience]:not(.cruises-option-3-scroll-ready) .cruises-option-3-content-layer {
  visibility: hidden !important;
}
html[data-cruises-option-3-experience]:not(.cruises-option-3-scroll-ready) .cruises-giant-logo {
  opacity: 0 !important;
}
`;

export default function CruisesOption3Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: OPTION_3_CRITICAL_CSS }} />
      <script dangerouslySetInnerHTML={{ __html: OPTION_3_BOOT }} />
      <div className="cruises-option-3-route">
        <p className="cruises-option-3-demo-banner" role="note">
          Option 3 — Two layers: split animation + synced content column
        </p>
        <CruisesOption3Boot>{children}</CruisesOption3Boot>
      </div>
    </>
  );
}
