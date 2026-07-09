import type { ReactNode } from "react";

/** Runs before paint so homepage-2.css applies immediately (not after React hydration). */
const HP2_ATTR_SCRIPT = `(function(){try{document.documentElement.setAttribute("data-homepage2-experience","");}catch(e){}})();`;

export default function HomePage2Layout({ children }: { children: ReactNode }) {
  return (
    <div className="homepage-2-route">
      <script dangerouslySetInnerHTML={{ __html: HP2_ATTR_SCRIPT }} />
      {children}
    </div>
  );
}
