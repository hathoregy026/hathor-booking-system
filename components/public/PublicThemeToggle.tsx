"use client";

import { Moon, Sun } from "lucide-react";
import { usePublicTheme } from "./PublicThemeProvider";

export function PublicThemeToggle() {
  const { theme, toggleTheme } = usePublicTheme();

  const isDay = theme === "day";
  const Icon = isDay ? Sun : Moon;

  return (
    <button
      type="button"
      className="public-theme-toggle cursor-hover"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleTheme();
      }}
      aria-label={`Switch to ${isDay ? "night" : "day"} view`}
      title={`${isDay ? "Night" : "Day"} view`}
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span className="sr-only">{isDay ? "Night" : "Day"} view</span>
    </button>
  );
}
