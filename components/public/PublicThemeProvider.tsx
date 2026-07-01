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
  normalizePublicTheme,
} from "@/lib/public-theme";

type PublicThemeContextValue = {
  theme: PublicTheme;
  setTheme: (theme: PublicTheme) => void;
  mounted: boolean;
};

const PublicThemeContext = createContext<PublicThemeContextValue | null>(null);

function applyThemeToDocument(theme: PublicTheme) {
  document.documentElement.setAttribute("data-public-theme", theme);
}

export function PublicThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<PublicTheme>("day");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(PUBLIC_THEME_STORAGE_KEY);
    const next = normalizePublicTheme(stored);
    setThemeState(next);
    applyThemeToDocument(next);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyThemeToDocument(theme);
    localStorage.setItem(PUBLIC_THEME_STORAGE_KEY, theme);
  }, [theme, mounted]);

  const setTheme = useCallback((next: PublicTheme) => {
    setThemeState(next);
    applyThemeToDocument(next);
    try {
      localStorage.setItem(PUBLIC_THEME_STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
  }, []);

  return (
    <PublicThemeContext.Provider value={{ theme, setTheme, mounted }}>
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
