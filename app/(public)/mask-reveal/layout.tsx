import type { ReactNode } from "react";
import { MaskRevealBoot } from "./MaskRevealBoot";
import "./mask-reveal.css";

const MASK_REVEAL_BOOT = `(function(){try{var d=document.documentElement,b=document.body;d.setAttribute("data-mask-reveal","");b.style.backgroundColor="#1a1612";}catch(e){}})();`;

const MASK_REVEAL_CRITICAL_CSS = `
html[data-mask-reveal],
html[data-mask-reveal] body,
html[data-mask-reveal] .public-site {
  background-color: #1a1612 !important;
  background-image: none !important;
}
html[data-mask-reveal] .public-site::before {
  content: none !important;
  display: none !important;
}
html[data-mask-reveal] .public-main--hero,
html[data-mask-reveal] .public-main {
  padding-top: 0 !important;
  margin-top: 0 !important;
  max-width: none !important;
  width: 100% !important;
  background: transparent !important;
}
`;

export default function MaskRevealLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: MASK_REVEAL_CRITICAL_CSS }} />
      <script dangerouslySetInnerHTML={{ __html: MASK_REVEAL_BOOT }} />
      <div className="mask-reveal-route">
        <MaskRevealBoot>{children}</MaskRevealBoot>
      </div>
    </>
  );
}
