"use client";

import Link from "next/link";
import {
  Bell,
  Lock,
  Moon,
  Sparkles,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAdminTheme } from "./ThemeProvider";

function SettingsCard({
  title,
  description,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: "color-mix(in srgb, var(--accent) 16%, transparent)",
              color: "var(--accent)",
            }}
          >
            <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight sm:text-lg">
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-sm text-muted">{description}</p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      <div className="gold-hairline my-5" />
      {children}
    </section>
  );
}

function CodeChip({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="rounded px-1.5 py-0.5 text-xs font-medium"
      style={{
        background: "color-mix(in srgb, var(--accent) 12%, transparent)",
        color: "var(--accent)",
      }}
    >
      {children}
    </code>
  );
}

export function AdminSettingsPanel() {
  const { theme } = useAdminTheme();
  const ThemeIcon = theme === "day" ? Sun : Moon;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="admin-page-title">Settings</h1>
        <p className="admin-page-subtitle">
          System configuration, appearance, and admin access
        </p>
      </div>

      <SettingsCard
        title="Appearance"
        description="Day and Night modes for the admin console"
        icon={ThemeIcon}
        action={<ThemeToggle />}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-muted">
            Switch between Day and Night. Your preference is saved in this
            browser and applies across the admin shell.
          </p>
          <div
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
            style={{ borderColor: "var(--border)" }}
          >
            <ThemeIcon
              className="h-4 w-4"
              style={{ color: "var(--accent)" }}
              aria-hidden
            />
            {theme === "day" ? "Day mode" : "Night mode"}
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Preload screen"
        description="Welcome splash on the public site"
        icon={Sparkles}
        action={
          <Link href="/admin/preload-screen" className="btn-outline h-9 px-3 text-sm">
            Open
          </Link>
        }
      >
        <p className="text-sm leading-relaxed text-muted">
          Toggle the welcome splash and change its background image from the{" "}
          <Link href="/admin/preload-screen" className="admin-inline-link">
            Preload Screen
          </Link>{" "}
          page in CMS.
        </p>
      </SettingsCard>

      <SettingsCard
        title="Admin access"
        description="How the dashboard is protected"
        icon={Lock}
      >
        <p className="text-sm leading-relaxed text-muted">
          Login is protected by the <CodeChip>ADMIN_PASSWORD</CodeChip>{" "}
          environment variable. Update it in your <CodeChip>.env</CodeChip>{" "}
          file and restart the server to change your password.
        </p>
      </SettingsCard>

      <SettingsCard
        title="Notifications"
        description="New booking alerts in the header"
        icon={Bell}
      >
        <p className="text-sm leading-relaxed text-muted">
          The bell icon in the header shows new confirmed bookings from the
          public site. Notifications refresh while you are logged in.
        </p>
      </SettingsCard>
    </div>
  );
}
