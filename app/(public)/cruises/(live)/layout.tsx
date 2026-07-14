import type { ReactNode } from "react";
import { CruisesScrollBoot } from "../CruisesScrollBoot";
import "../cruises-scroll.css";

const CRUISES_BOOT = `(function(){try{var d=document.documentElement,b=document.body;d.setAttribute("data-cruises-experience","");b.style.backgroundColor="#ece8df";}catch(e){}})();`;

const CRUISES_CRITICAL_CSS = `
html[data-cruises-experience],
html[data-cruises-experience] body,
html[data-cruises-experience] .public-site {
  background-color: #ece8df !important;
  background-image: url("/branding/egyptian-hyroglyphs-hathor-cruise-tile.webp") !important;
  background-repeat: repeat !important;
  background-position: center top !important;
  background-size: 640px auto !important;
}
html[data-cruises-experience] .cruises-scroll-route,
html[data-cruises-experience] .cruises-page {
  background-color: transparent !important;
  background-image: none !important;
}
html[data-cruises-experience] .cruises-sheet {
  background-color: #ece8df !important;
  background-image: url("/branding/egyptian-hyroglyphs-hathor-cruise-tile.webp") !important;
  background-repeat: repeat !important;
  background-position: center top !important;
  background-size: 640px auto !important;
}
html[data-cruises-experience] .cruises-hero,
html[data-cruises-experience] .cruises-hero__stage {
  background-image: none !important;
}
`;

export default function CruisesLiveLayout({
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
