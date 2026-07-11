import type { ReactNode } from "react";
import { CruisesOption1Boot } from "./CruisesOption1Boot";
import "./option-1.css";

const OPTION_1_BOOT = `(function(){try{var d=document.documentElement,b=document.body;d.setAttribute("data-cruises-option-1-experience","");d.classList.add("has-page-scroll-transition");b.classList.add("has-page-scroll-transition");b.style.backgroundColor="#f4f1ea";}catch(e){}})();`;

const OPTION_1_CRITICAL_CSS = `
html[data-cruises-option-1-experience],
html[data-cruises-option-1-experience] body {
  background-color: #f4f1ea !important;
}
html[data-cruises-option-1-experience] .public-site > .owo-footer {
  display: none !important;
}
`;

export default function CruisesOption1Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: OPTION_1_CRITICAL_CSS }} />
      <script dangerouslySetInnerHTML={{ __html: OPTION_1_BOOT }} />
      <div className="cruises-option-1-route">
        <p className="cruises-option-1-demo-banner" role="note">
          Option 1 — Spa style: hero blinds + dome, listings fade in below
        </p>
        <CruisesOption1Boot>{children}</CruisesOption1Boot>
      </div>
    </>
  );
}
