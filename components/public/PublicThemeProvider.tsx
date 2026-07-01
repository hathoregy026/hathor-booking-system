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
  normalizePublicTheme,
  persistPublicTheme,
  readPublicThemeFromDocument,
} from "@/lib/public-theme";

type PublicThemeContextValue = {
  theme: PublicTheme;
  setTheme: (theme: PublicTheme) => void;
  toggleTheme: () => void;
};

const PublicThemeContext = createContext<PublicThemeContextValue | null>(null);

function readStoredTheme(): PublicTheme {
  try {
    return normalizePublicTheme(localStorage.getItem(PUBLIC_THEME_STORAGE_KEY));
  } catch {
    return readPublicThemeFromDocument();
  }
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
