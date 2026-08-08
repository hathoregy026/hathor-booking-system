import { LiveSiteSettingsPanel } from "@/components/admin/LiveSiteSettingsPanel";
import { Globe2 } from "lucide-react";

export default function AdminLiveSitePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="admin-page-title">Live Site</h1>
        <p className="admin-page-subtitle">
          Turn the public website on or off. When off, Coming Soon appears on
          the custom domain only — your Vercel link stays fully working for
          development.
        </p>
      </div>

      <div className="admin-card p-6">
        <div className="flex items-center gap-3">
          <Globe2
            className="h-5 w-5"
            style={{ color: "var(--accent)" }}
            aria-hidden
          />
          <h2 className="admin-heading text-lg">Public visibility</h2>
        </div>
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Use this while the site is unfinished so clients on the domain see
          Coming Soon. Keep using the Vercel URL to work. Dashboard access is
          never blocked.
        </p>
        <div className="mt-6">
          <LiveSiteSettingsPanel />
        </div>
      </div>
    </div>
  );
}
