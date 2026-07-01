import { PUBLIC_THEME_STORAGE_KEY } from "@/lib/public-theme";

const INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${PUBLIC_THEME_STORAGE_KEY}");document.documentElement.setAttribute("data-public-theme",t==="night"?"night":"day");}catch(e){document.documentElement.setAttribute("data-public-theme","day");}})();`;

export function PublicThemeInit() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: INIT_SCRIPT }}
      suppressHydrationWarning
    />
  );
}
