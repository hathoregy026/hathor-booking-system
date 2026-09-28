import type { ReactNode } from "react";

/**
 * Preview-only Suites native rebuild.
 * Production /suites remains the Springs iframe experience.
 */
const BOOT = `(function(){try{var d=document.documentElement,b=document.body;d.setAttribute("data-suites-native","");b.style.backgroundColor="#ece8df";}catch(e){}})();`;

const CRITICAL = `
html[data-suites-native],
html[data-suites-native] body,
html[data-suites-native] .public-site {
  background-color: #ece8df !important;
  background-image: none !important;
}
html[data-suites-native] .public-site::before {
  content: none !important;
  display: none !important;
}
html[data-suites-native] .public-main--hero,
html[data-suites-native] .public-main,
html[data-suites-native] .page-transition,
html[data-suites-native] .suites-native-route {
  padding-top: 0 !important;
  margin-top: 0 !important;
  max-width: none !important;
  width: 100% !important;
  background: transparent !important;
}
`;

export default function SuitesPreviewLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CRITICAL }} />
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      <div className="suites-native-route">{children}</div>
    </>
  );
}
