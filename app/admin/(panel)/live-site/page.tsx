import { LiveSiteSettingsPanel } from "@/components/admin/LiveSiteSettingsPanel";
import { CmsPageHeader } from "@/components/admin/CmsPageHeader";
import { Globe2 } from "lucide-react";

export default function AdminLiveSitePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <CmsPageHeader
        title="Live Site"
        description="Turn the public website on or off. When off, Coming Soon appears on the custom domain only — your Vercel link stays fully working for development."
        icon={Globe2}
      />

      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight sm:text-lg">
              Public visibility
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              Domain gate for unfinished launches
            </p>
          </div>
        </div>
        <div className="gold-hairline my-5" />
        <p className="text-sm leading-relaxed text-muted">
          Use this while the site is unfinished so clients on the domain see
          Coming Soon. Keep using the Vercel URL to work. Dashboard access is
          never blocked.
        </p>
        <div className="mt-6">
          <LiveSiteSettingsPanel />
        </div>
      </section>
    </div>
  );
}