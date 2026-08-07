import { PUBLIC_THEME_STORAGE_KEY } from "@/lib/public-theme";

const INIT_SCRIPT = `(function(){try{var k="${PUBLIC_THEME_STORAGE_KEY}";var t=localStorage.getItem(k);var theme;if(t==="night"||t==="day"){theme=t;}else if(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches){theme="night";}else{theme="day";}document.documentElement.setAttribute("data-public-theme",theme);}catch(e){document.documentElement.setAttribute("data-public-theme","day");}})();`;

export function PublicThemeInit() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: INIT_SCRIPT }}
      suppressHydrationWarning
    />
  );
}
