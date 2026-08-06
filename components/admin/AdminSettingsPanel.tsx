"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, Save, Settings, Sparkles } from "lucide-react";
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

export function AdminSettingsPanel() {
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="admin-page-title">Settings</h1>
        <p className="admin-page-subtitle">System configuration and preferences</p>
      </div>

      <div className="admin-card p-6">
        <div className="flex items-center gap-3">
          <Sparkles
            className="h-5 w-5"
            style={{ color: "var(--accent)" }}
            aria-hidden
          />
          <h2 className="admin-heading text-lg">Preload screen</h2>
        </div>
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Control the full-screen welcome image visitors see when they first land
          on the public site. Changes publish to the live site when you save.
        </p>

        {isLoading ? (
          <div
            className="mt-6 flex items-center gap-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading preload settings…
          </div>
        ) : (
          <div className="mt-6 space-y-6">
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
                  When off, visitors go straight to the homepage without the
                  welcome hold and fade.
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
                pageName="Site Settings"
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
                    className="block max-h-48 w-full object-cover object-center"
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
        )}
      </div>

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
