import { WelcomeSplashSettingsPanel } from "@/components/admin/WelcomeSplashSettingsPanel";
import { CmsPageHeader } from "@/components/admin/CmsPageHeader";
import { Sparkles } from "lucide-react";

export default function AdminPreloadScreenPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <CmsPageHeader
        title="Preload Screen"
        description="Turn the welcome splash on or off and change its background image. Saves publish to the live site immediately."
        icon={Sparkles}
      />

      <section className="card p-5 sm:p-6">
        <div>
          <h2 className="text-base font-semibold tracking-tight sm:text-lg">
            Welcome splash
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            Full-screen first impression on hathor.com
          </p>
        </div>
        <div className="gold-hairline my-5" />
        <div>
          <WelcomeSplashSettingsPanel />
        </div>
      </section>
    </div>
  );
}