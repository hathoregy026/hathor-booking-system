"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import {
  DEFAULT_WELCOME_SPLASH_SETTINGS,
  isWelcomeSplashSettingsEqual,
  parseWelcomeSplashSettings,
  type WelcomeSplashSettings,
} from "@/lib/welcome-splash-settings-shared";

async function readAdminError(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) return data.error;
  } catch {
    // Fall through
  }
  return fallback;
}

export function WelcomeSplashSettingsPanel() {
  const { showToast } = useToast();
  const [welcomeSplash, setWelcomeSplash] = useState<WelcomeSplashSettings>(
    DEFAULT_WELCOME_SPLASH_SETTINGS,
  );
  const [savedWelcomeSplash, setSavedWelcomeSplash] =
    useState<WelcomeSplashSettings>(DEFAULT_WELCOME_SPLASH_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminFetch("/api/admin/welcome-splash");
      if (!response.ok) {
        throw new Error(
          await readAdminError(response, "Failed to load preload settings"),
        );
      }
      const data = (await response.json()) as { settings?: unknown };
      const settings = parseWelcomeSplashSettings(data.settings);
      setWelcomeSplash(settings);
      setSavedWelcomeSplash(settings);
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Failed to load preload settings",
      );
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadSettings(); // eslint-disable-line react-hooks/set-state-in-effect -- dashboard mount fetch
  }, [loadSettings]);

  const welcomeDirty = !isWelcomeSplashSettingsEqual(
    welcomeSplash,
    savedWelcomeSplash,
  );

  const handleSaveWelcomeSplash = async () => {
    setIsSaving(true);
    try {
      const response = await adminFetch("/api/admin/welcome-splash", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: welcomeSplash }),
      });
      if (!response.ok) {
        throw new Error(
          await readAdminError(response, "Failed to save preload settings"),
        );
      }
      const data = (await response.json()) as { settings?: unknown };
      const saved = parseWelcomeSplashSettings(data.settings);
      setWelcomeSplash(saved);
      setSavedWelcomeSplash(saved);
      showToast("success", "Preload screen settings saved to live site");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Failed to save preload settings",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center gap-2 py-10 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading preload settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p
        className="rounded-lg border px-3 py-2 text-sm"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface-2, var(--surface))",
          color: "var(--text-secondary)",
        }}
      >
        Public site preload is currently force-off (no gold Welcome Aboard flash
        on land). Saving here keeps assets ready; it will not show until the
        public kill switch is re-enabled in code.
      </p>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
          checked={welcomeSplash.enabled}
          onChange={(event) =>
            setWelcomeSplash((current) => ({
              ...current,
              enabled: event.target.checked,
            }))
          }
        />
        <span>
          <span className="admin-heading block text-sm">
            Show preload screen on site load
          </span>
          <span
            className="mt-1 block text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            When off, visitors go straight to the homepage without the welcome
            hold and fade.
          </span>
        </span>
      </label>

      <div
        className={welcomeSplash.enabled ? undefined : "opacity-60"}
        aria-disabled={!welcomeSplash.enabled}
      >
        <ImageUpload
          label="Preload background image"
          value={welcomeSplash.imageUrl}
          onChange={(url) =>
            setWelcomeSplash((current) => ({
              ...current,
              imageUrl: url ?? DEFAULT_WELCOME_SPLASH_SETTINGS.imageUrl,
            }))
          }
          folder="welcome-splash"
          pageName="Preload Screen"
          imageLabel="Preload screen"
          imageKind="hero"
          helperText="Recommended: a wide editorial image or branded welcome graphic. Used only when the preload screen is enabled."
          variant="admin"
          allowClear={false}
        />

        {welcomeSplash.imageUrl ? (
          <div
            className="mt-4 overflow-hidden rounded-xl"
            style={{ border: "1px solid var(--border)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={welcomeSplash.imageUrl}
              alt="Preload screen preview"
              className="block max-h-56 w-full object-cover object-center"
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void handleSaveWelcomeSplash()}
          disabled={isSaving || !welcomeDirty}
          className="admin-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Save className="h-4 w-4" aria-hidden />
          )}
          Save preload settings
        </button>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-inline-link inline-flex items-center gap-1.5 text-sm"
        >
          Preview on live site
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </div>
  );
}
