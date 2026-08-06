import type { ReactNode } from "react";
import { GastronomyMaskRevealBoot } from "@/components/pages/GastronomyMaskRevealBoot";
import "@/app/gastronomy-springs-design.css";

const GASTRONOMY_MASK_BOOT = `(function(){try{var d=document.documentElement,b=document.body;d.setAttribute("data-gastronomy-mask","");b.style.backgroundColor="#ece8df";}catch(e){}})();`;

const GASTRONOMY_MASK_CRITICAL_CSS = `
html[data-gastronomy-mask],
html[data-gastronomy-mask] body,
html[data-gastronomy-mask] .public-site {
  background-color: #ece8df !important;
  background-image: none !important;
  overflow: visible !important;
  overflow-x: visible !important;
  overflow-y: visible !important;
}
html[data-gastronomy-mask] .public-site::before {
  content: none !important;
  display: none !important;
}
html[data-gastronomy-mask] .public-main--hero,
html[data-gastronomy-mask] .public-main,
html[data-gastronomy-mask] .page-transition,
html[data-gastronomy-mask] .gastronomy-mask-route {
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

export default function GastronomyLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GASTRONOMY_MASK_CRITICAL_CSS }} />
      <script dangerouslySetInnerHTML={{ __html: GASTRONOMY_MASK_BOOT }} />
      <div className="gastronomy-mask-route">
        <GastronomyMaskRevealBoot>{children}</GastronomyMaskRevealBoot>
      </div>
    </>
  );
}
