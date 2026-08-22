"use client";

import Link from "next/link";
import { Bell, Lock, Moon, Sparkles, Sun } from "lucide-react";
import { Accordion, AccordionSection } from "./Accordion";
import { ThemeToggle } from "./ThemeToggle";
import { useAdminTheme } from "./ThemeProvider";

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

      <Accordion>
        <AccordionSection
          title="Appearance"
          description="Day and Night modes for the admin console"
          icon={ThemeIcon}
          summary={theme === "day" ? "Day mode" : "Night mode"}
          action={<ThemeToggle />}
          defaultOpen
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-muted">
              Switch between Day and Night. Your preference is saved in this
              browser and applies across the admin shell.
            </p>
            <div
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
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
        </AccordionSection>

        <AccordionSection
          title="Preload screen"
          description="Welcome splash on the public site"
          icon={Sparkles}
          action={
            <Link
              href="/admin/preload-screen"
              className="btn-outline h-9 px-3 text-sm"
            >
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
        </AccordionSection>

        <AccordionSection
          title="Admin access"
          description="How the dashboard is protected"
          icon={Lock}
        >
          <p className="text-sm leading-relaxed text-muted">
            Login is protected by the <CodeChip>ADMIN_PASSWORD</CodeChip>{" "}
            environment variable. Update it in your <CodeChip>.env</CodeChip>{" "}
            file and restart the server to change your password.
          </p>
        </AccordionSection>

        <AccordionSection
          title="Notifications"
          description="New booking alerts in the header"
          icon={Bell}
        >
          <p className="text-sm leading-relaxed text-muted">
            The bell icon in the header shows new confirmed bookings from the
            public site. Notifications refresh while you are logged in.
          </p>
        </AccordionSection>
      </Accordion>
    </div>
  );
}
