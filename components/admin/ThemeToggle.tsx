"use client";

import { Moon, Sun } from "lucide-react";
import { type AdminTheme } from "@/lib/admin-theme";
import { useAdminTheme } from "./ThemeProvider";

const THEMES: { id: AdminTheme; label: string; icon: typeof Sun }[] = [
  { id: "day", label: "Day", icon: Sun },
  { id: "night", label: "Night", icon: Moon },
];

type ThemeToggleProps = {
  /** Icon-only single button for narrow mobile headers */
  compact?: boolean;
};

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, setTheme } = useAdminTheme();

  if (compact) {
    const isDay = theme === "day";
    const Icon = isDay ? Sun : Moon;
    const next: AdminTheme = isDay ? "night" : "day";

    return (
      <button
        type="button"
        onClick={() => setTheme(next)}
        className="admin-header-icon-btn"
        aria-label={`Switch to ${next} mode`}
        title={`Switch to ${next} mode`}
      >
        <Icon className="h-4 w-4" style={{ color: "var(--accent)" }} aria-hidden />
      </button>
    );
  }

  return (
    <div className="admin-theme-switch" role="group" aria-label="Theme mode">
      {THEMES.map(({ id, label, icon: Icon }) => {
        const isActive = theme === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            title={`${label} mode`}
            aria-pressed={isActive}
            aria-label={`${label} mode`}
            className="flex items-center justify-center gap-1.5"
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden xl:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
