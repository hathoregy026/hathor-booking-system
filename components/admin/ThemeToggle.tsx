"use client";

import { Moon, Sun } from "lucide-react";
import { type AdminTheme } from "@/lib/admin-theme";
import { useAdminTheme } from "./ThemeProvider";

const THEMES: { id: AdminTheme; label: string; icon: typeof Sun }[] = [
  { id: "day", label: "Day", icon: Sun },
  { id: "night", label: "Night", icon: Moon },
];

export function ThemeToggle() {
  const { theme, setTheme } = useAdminTheme();

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
            className="flex items-center justify-center gap-1.5"
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
