import type { ReactNode } from "react";

const HP3_ATTR_SCRIPT = `(function(){try{document.documentElement.setAttribute("data-homepage3-experience","");}catch(e){}})();`;

export default function HomePage3Layout({ children }: { children: ReactNode }) {
  return (
    <div className="homepage-3-route">
      <script dangerouslySetInnerHTML={{ __html: HP3_ATTR_SCRIPT }} />
      {children}
    </div>
  );
}
