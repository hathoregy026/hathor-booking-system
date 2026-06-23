"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ADMIN_THEME_STORAGE_KEY,
  type AdminTheme,
  normalizeAdminTheme,
} from "@/lib/admin-theme";

type ThemeContextValue = {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>("night");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_THEME_STORAGE_KEY);
    setThemeState(normalizeAdminTheme(stored));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(ADMIN_THEME_STORAGE_KEY, theme);
  }, [theme, mounted]);

  const setTheme = useCallback((next: AdminTheme) => {
    setThemeState(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAdminTheme must be used within AdminThemeProvider");
  }
  return context;
}
