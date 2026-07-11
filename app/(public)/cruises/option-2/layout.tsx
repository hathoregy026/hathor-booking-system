import type { ReactNode } from "react";
import { CruisesOption2Boot } from "./CruisesOption2Boot";
import "./option-2.css";

const OPTION_2_BOOT = `(function(){try{var d=document.documentElement,b=document.body;d.setAttribute("data-cruises-option-2-experience","");d.classList.add("has-page-scroll-transition");b.classList.add("has-page-scroll-transition");b.style.backgroundColor="#f4f1ea";}catch(e){}})();`;

const OPTION_2_CRITICAL_CSS = `
html[data-cruises-option-2-experience],
html[data-cruises-option-2-experience] body {
  background-color: #f4f1ea !important;
}
html[data-cruises-option-2-experience] .public-site > .owo-footer {
  display: none !important;
}
`;

export default function CruisesOption2Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: OPTION_2_CRITICAL_CSS }} />
      <script dangerouslySetInnerHTML={{ __html: OPTION_2_BOOT }} />
      <div className="cruises-option-2-route">
        <p className="cruises-option-2-demo-banner" role="note">
          Option 2 — One elevator: all content rides the cream sheet together
        </p>
        <CruisesOption2Boot>{children}</CruisesOption2Boot>
      </div>
    </>
  );
}
