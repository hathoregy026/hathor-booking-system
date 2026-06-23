export type AdminTheme = "day" | "night";

export const ADMIN_THEME_STORAGE_KEY = "hathor-admin-theme";

export const ADMIN_THEME_LABELS: Record<
  AdminTheme,
  { label: string; icon: string }
> = {
  day: { label: "Day", icon: "☀️" },
  night: { label: "Night", icon: "🌙" },
};

export function isAdminTheme(value: string | null): value is AdminTheme {
  if (value === "luxury") return false;
  return value === "day" || value === "night";
}

export function normalizeAdminTheme(value: string | null): AdminTheme {
  if (value === "day") return "day";
  return "night";
}
