"use client";

import { Moon, Sun } from "lucide-react";
import { type PublicTheme } from "@/lib/public-theme";
import { usePublicTheme } from "./PublicThemeProvider";

export function PublicThemeToggle() {
  const { theme, setTheme, mounted } = usePublicTheme();

  if (!mounted) {
    return (
      <span
        className="public-theme-toggle public-theme-toggle--placeholder"
        aria-hidden
      />
    );
  }

  const isDay = theme === "day";
  const next: PublicTheme = isDay ? "night" : "day";
  const Icon = isDay ? Sun : Moon;

  return (
    <button
      type="button"
      className="public-theme-toggle cursor-hover"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} view`}
      title={`${next === "day" ? "Day" : "Night"} view`}
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span className="sr-only">{next === "day" ? "Day" : "Night"} view</span>
    </button>
  );
}
