import type { ReactNode } from "react";

/** Inline + script run before paint — no wait for hydration or external CSS. */
const HP2_BOOT = `(function(){try{var d=document;d.documentElement.setAttribute("data-homepage2-experience","");if(d.body)d.body.classList.add("has-page-scroll-transition");}catch(e){}})();`;

const HP2_CRITICAL_CSS = `
.homepage-2-route,
.homepage-2-route .public-site,
.homepage-2-route .public-main,
.homepage-2-route .page-transition {
  background-color: #f4f1ea !important;
}
.homepage-2-route [data-homepage2-transition] {
  --pt-cream: #f4f1ea;
  --pt-dome-r-start: 1250px;
  --pt-dome-r-end: 22px;
}
.homepage-2-route [data-homepage2-transition] .pt-sheet__rise-cap {
  width: 100%;
  min-height: 120svh !important;
}
.homepage-2-route [data-homepage2-transition] .pt-sheet {
  background-color: #f4f1ea !important;
  border-top-left-radius: 50% var(--pt-dome-r-start) !important;
  border-top-right-radius: 50% var(--pt-dome-r-start) !important;
}
.homepage-2-route [data-homepage2-transition] .pt-stage {
  overflow: hidden !important;
  background-color: #f4f1ea !important;
}
`;

export default function HomePage2Layout({ children }: { children: ReactNode }) {
  return (
    <div className="homepage-2-route">
      <style dangerouslySetInnerHTML={{__html: `
  /* 1. FORCE THE TALL SCROLL RUNWAY IMMEDIATELY */
  html[data-homepage2-experience] [data-homepage2-transition] .pt-sheet__rise-cap {
    width: 100% !important;
    min-height: 120vh !important;
    min-height: 120svh !important;
  }

  /* 2. BOOK BAR — visible immediately (no slide-in flash) */
  html[data-homepage2-experience] .homepage-2-book-bar__pill--left,
  html[data-homepage2-experience] .homepage-2-book-bar__pill--right,
  html[data-homepage2-experience] .homepage-2-book-bar__logo {
    transform: none !important;
    opacity: 1 !important;
    animation: none !important;
  }
`}} />
      <style dangerouslySetInnerHTML={{ __html: HP2_CRITICAL_CSS }} />
      <script dangerouslySetInnerHTML={{ __html: HP2_BOOT }} />
      {children}
    </div>
  );
}
