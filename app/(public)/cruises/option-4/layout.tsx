import type { ReactNode } from "react";
import { CruisesOption4Boot } from "./CruisesOption4Boot";
import "./option-4-spa.css";

const OPTION_4_BOOT = `(function(){try{var d=document.documentElement,b=document.body;d.setAttribute("data-cruises-option-4-experience","");b.style.backgroundColor="#f4f1ea";}catch(e){}})();`;

const OPTION_4_CRITICAL_CSS = `
html[data-cruises-option-4-experience],
html[data-cruises-option-4-experience] body {
  background-color: #f4f1ea !important;
}
html[data-cruises-option-4-experience] .public-site > .owo-footer {
  display: none !important;
}
`;

export default function CruisesOption4Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: OPTION_4_CRITICAL_CSS }} />
      <script dangerouslySetInnerHTML={{ __html: OPTION_4_BOOT }} />
      <div className="cruises-option-4-route">
        <p className="cruises-option-4-demo-banner" role="note">
          Option 4 — Venetian stripe wipe (no dome, no rising sheet)
        </p>
        <CruisesOption4Boot>{children}</CruisesOption4Boot>
      </div>
    </>
  );
}
