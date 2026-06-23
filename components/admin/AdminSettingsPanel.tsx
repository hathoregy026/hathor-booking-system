"use client";

import { Settings } from "lucide-react";

export function AdminSettingsPanel() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="admin-card p-6">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5" style={{ color: "var(--accent)" }} aria-hidden />
          <h2 className="admin-heading text-lg">Admin access</h2>
        </div>
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Login is protected by the{" "}
          <code
            className="rounded px-1.5 py-0.5 text-xs"
            style={{
              background: "color-mix(in srgb, var(--accent) 10%, transparent)",
              color: "var(--accent)",
            }}
          >
            ADMIN_PASSWORD
          </code>{" "}
          environment variable. Update it in your{" "}
          <code
            className="rounded px-1.5 py-0.5 text-xs"
            style={{
              background: "color-mix(in srgb, var(--accent) 10%, transparent)",
              color: "var(--accent)",
            }}
          >
            .env
          </code>{" "}
          file and restart the server to change your password.
        </p>
      </div>

      <div className="admin-card p-6">
        <h2 className="admin-heading text-lg">Notifications</h2>
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          The bell icon in the header shows new confirmed bookings from the
          public site. Notifications refresh every 45 seconds while you are
          logged in.
        </p>
      </div>

      <div className="admin-card p-6">
        <h2 className="admin-heading text-lg">Appearance</h2>
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Use the theme toggle in the header to switch between Day and Night
          modes. Your preference is saved automatically in this browser.
        </p>
      </div>
    </div>
  );
}
