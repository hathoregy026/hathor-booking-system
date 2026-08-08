"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import {
  DEFAULT_LIVE_SITE_SETTINGS,
  isLiveSiteSettingsEqual,
  parseLiveSiteSettings,
  type LiveSiteSettings,
} from "@/lib/live-site-settings-shared";

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

export function LiveSiteSettingsPanel() {
  const { showToast } = useToast();
  const [liveSite, setLiveSite] = useState<LiveSiteSettings>(
    DEFAULT_LIVE_SITE_SETTINGS,
  );
  const [savedLiveSite, setSavedLiveSite] = useState<LiveSiteSettings>(
    DEFAULT_LIVE_SITE_SETTINGS,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminFetch("/api/admin/live-site");
      if (!response.ok) {
        throw new Error(
          await readAdminError(response, "Failed to load live site settings"),
        );
      }
      const data = (await response.json()) as { settings?: unknown };
      const settings = parseLiveSiteSettings(data.settings);
      setLiveSite(settings);
      setSavedLiveSite(settings);
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Failed to load live site settings",
      );
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadSettings(); // eslint-disable-line react-hooks/set-state-in-effect -- dashboard mount fetch
  }, [loadSettings]);

  const dirty = !isLiveSiteSettingsEqual(liveSite, savedLiveSite);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await adminFetch("/api/admin/live-site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: liveSite }),
      });
      if (!response.ok) {
        throw new Error(
          await readAdminError(response, "Failed to save live site settings"),
        );
      }
      const data = (await response.json()) as { settings?: unknown };
      const saved = parseLiveSiteSettings(data.settings);
      setLiveSite(saved);
      setSavedLiveSite(saved);
      showToast(
        "success",
        saved.enabled
          ? "Live site is on — public pages are visible"
          : "Live site is off — visitors see Coming Soon",
      );
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Failed to save live site settings",
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
        Loading live site settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
          checked={liveSite.enabled}
          onChange={(event) =>
            setLiveSite((current) => ({
              ...current,
              enabled: event.target.checked,
            }))
          }
        />
        <span>
          <span className="admin-heading block text-sm">Site is live</span>
          <span
            className="mt-1 block text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            When off, visitors see Coming Soon (logo + background). Admin and
            APIs stay available so you can turn it back on. Page content is not
            changed — only hidden.
          </span>
        </span>
      </label>

      <div
        className={
          liveSite.enabled
            ? "rounded-xl px-4 py-3 text-sm"
            : "rounded-xl px-4 py-3 text-sm"
        }
        style={{
          border: "1px solid var(--border)",
          background: liveSite.enabled
            ? "color-mix(in srgb, var(--accent) 12%, transparent)"
            : "color-mix(in srgb, #b45309 14%, transparent)",
          color: "var(--text-primary)",
        }}
      >
        {liveSite.enabled
          ? "Status: Live — the public website is visible."
          : "Status: Hidden — visitors will see Coming Soon after you save."}
      </div>

      <div>
        <ImageUpload
          label="Coming Soon background image"
          value={liveSite.backgroundImageUrl}
          onChange={(url) =>
            setLiveSite((current) => ({
              ...current,
              backgroundImageUrl:
                url ?? DEFAULT_LIVE_SITE_SETTINGS.backgroundImageUrl,
            }))
          }
          folder="live-site"
          pageName="Live Site"
          imageLabel="Coming Soon background"
          imageKind="hero"
          helperText="Shown at 10% opacity behind the logo and “Coming Soon” text when the site is off."
          variant="admin"
          allowClear={false}
        />

        {liveSite.backgroundImageUrl ? (
          <div
            className="relative mt-4 overflow-hidden rounded-xl"
            style={{
              border: "1px solid var(--border)",
              background: "#ece8df",
              minHeight: "12rem",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={liveSite.backgroundImageUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover object-center"
              style={{ opacity: 0.1 }}
            />
            <div className="relative z-[1] flex min-h-[12rem] flex-col items-center justify-center gap-3 px-4 py-8 text-center">
              <span
                className="text-xs uppercase tracking-[0.22em]"
                style={{ color: "var(--text-secondary)" }}
              >
                Preview · 10% opacity
              </span>
              <span className="admin-heading text-base tracking-[0.2em] uppercase">
                Coming Soon
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving || !dirty}
          className="admin-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Save className="h-4 w-4" aria-hidden />
          )}
          Save live site settings
        </button>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-inline-link inline-flex items-center gap-1.5 text-sm"
        >
          Open public site
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </div>
  );
}
