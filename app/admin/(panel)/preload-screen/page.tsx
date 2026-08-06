import { WelcomeSplashSettingsPanel } from "@/components/admin/WelcomeSplashSettingsPanel";
import { Sparkles } from "lucide-react";

export default function AdminPreloadScreenPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="admin-page-title">Preload Screen</h1>
        <p className="admin-page-subtitle">
          Turn the welcome splash on or off and change its background image.
          Saves publish to the live site immediately.
        </p>
      </div>

      <div className="admin-card p-6">
        <div className="flex items-center gap-3">
          <Sparkles
            className="h-5 w-5"
            style={{ color: "var(--accent)" }}
            aria-hidden
          />
          <h2 className="admin-heading text-lg">Welcome splash</h2>
        </div>
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          The full-screen image visitors see when they first land on hathor.com.
        </p>
        <div className="mt-6">
          <WelcomeSplashSettingsPanel />
        </div>
      </div>
    </div>
  );
}
