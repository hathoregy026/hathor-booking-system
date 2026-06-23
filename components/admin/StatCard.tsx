import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  isLoading?: boolean;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  changeType = "neutral",
  isLoading = false,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div className="admin-card admin-card--hover p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-10 rounded-xl" style={{ background: "var(--border)" }} />
          <div className="h-4 w-24 rounded" style={{ background: "var(--border)" }} />
          <div className="h-8 w-20 rounded" style={{ background: "var(--border)" }} />
          <div className="h-12 rounded-lg" style={{ background: "var(--border)" }} />
        </div>
      </div>
    );
  }

  const pillClass =
    changeType === "positive"
      ? "admin-change-pill admin-change-pill--positive"
      : changeType === "negative"
        ? "admin-change-pill admin-change-pill--negative"
        : "admin-change-pill admin-change-pill--neutral";

  return (
    <div className="admin-card admin-card--hover p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: "color-mix(in srgb, var(--accent) 15%, transparent)",
            color: "var(--accent)",
          }}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        {change && <span className={pillClass}>{change}</span>}
      </div>

      <p className="mt-5 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">
        {value}
      </p>

      <div className="admin-stat-sparkline" aria-hidden />
    </div>
  );
}
