import type { ReactNode } from "react";
import { GastronomyMaskRevealBoot } from "@/components/pages/GastronomyMaskRevealBoot";
import "@/app/gastronomy-springs-design.css";

const BOOT = `(function(){try{var d=document.documentElement;d.setAttribute("data-gastronomy-mask","");document.body.style.backgroundColor="#ece8df";}catch(e){}})();`;

const CRITICAL = `
html[data-gastronomy-mask],
html[data-gastronomy-mask] body,
html[data-gastronomy-mask] .public-site {
  background-color: #ece8df !important;
  overflow: visible !important;
  overflow-x: visible !important;
}
html[data-gastronomy-mask] .public-site::before { display: none !important; }
html[data-gastronomy-mask] .public-main,
html[data-gastronomy-mask] .public-main--hero,
html[data-gastronomy-mask] .page-transition,
html[data-gastronomy-mask] .gastronomy-mask-route {
  padding-top: 0 !important;
  margin-top: 0 !important;
  max-width: none !important;
  width: 100% !important;
  background: transparent !important;
  overflow: visible !important;
  transform: none !important;
  filter: none !important;
}
`;

export default function GastronomyLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CRITICAL }} />
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      <div className="gastronomy-mask-route">
        <GastronomyMaskRevealBoot>{children}</GastronomyMaskRevealBoot>
      </div>
    </>
  );
}
