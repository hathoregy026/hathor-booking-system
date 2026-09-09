"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  PUBLIC_THEME_STORAGE_KEY,
  type PublicTheme,
  applyPublicThemeToDocument,
  isPublicTheme,
  persistPublicTheme,
  readPublicThemeFromDocument,
} from "@/lib/public-theme";

type PublicThemeContextValue = {
  theme: PublicTheme;
  setTheme: (theme: PublicTheme) => void;
  toggleTheme: () => void;
};

const PublicThemeContext = createContext<PublicThemeContextValue | null>(null);

/**
 * An explicitly saved choice always wins.
 *
 * With nothing saved, fall back to the document rather than to "day": the
 * blocking script in <head> has already resolved `prefers-color-scheme` onto
 * `data-public-theme` before first paint. Normalising a missing key straight
 * to "day" made React disagree with that script, so a visitor on a dark system
 * watched the site load in night and then flip to day one frame after
 * hydration — and the toggle came up labelled for the wrong theme.
 */
function readStoredTheme(): PublicTheme {
  try {
    const saved = localStorage.getItem(PUBLIC_THEME_STORAGE_KEY);
    if (isPublicTheme(saved)) return saved;
  } catch {
    /* storage unavailable — the document attribute is still authoritative */
  }
  return readPublicThemeFromDocument();
}

export function PublicThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<PublicTheme>(() => {
    if (typeof window === "undefined") return "day";
    return readStoredTheme();
  });

  useEffect(() => {
    const next = readStoredTheme();
    setThemeState(next);
    applyPublicThemeToDocument(next);
  }, []);

  const setTheme = useCallback((next: PublicTheme) => {
    setThemeState(next);
    applyPublicThemeToDocument(next);
    persistPublicTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: PublicTheme = current === "day" ? "night" : "day";
      applyPublicThemeToDocument(next);
      persistPublicTheme(next);
      return next;
    });
  }, []);

  useEffect(() => {
    applyPublicThemeToDocument(theme);
  }, [theme]);

  return (
    <PublicThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </PublicThemeContext.Provider>
  );
}

export function usePublicTheme() {
  const context = useContext(PublicThemeContext);
  if (!context) {
    throw new Error("usePublicTheme must be used within PublicThemeProvider");
  }
  return context;
}
