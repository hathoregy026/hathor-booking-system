"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import {
  defaultPageVisibilityMap,
  getManagedPageGroups,
  isPageVisibilitySettingsEqual,
  parsePageVisibilitySettings,
  type ManagedPublicPageId,
  type PageVisibilitySettings,
} from "@/lib/page-visibility-shared";

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

function ToggleRow({
  label,
  path,
  live,
  onChange,
}: {
  label: string;
  path: string;
  live: boolean;
  onChange: (live: boolean) => void;
}) {
  return (
    <div className="page-visibility-row">
      <div className="page-visibility-row__text">
        <p className="page-visibility-row__label">{label}</p>
        <p className="page-visibility-row__path">{path}</p>
      </div>
      <label className="page-visibility-row__toggle">
        <input
          type="checkbox"
          checked={live}
          onChange={(event) => onChange(event.target.checked)}
          aria-label={`${live ? "Live" : "Under construction"} — ${label}`}
        />
        <span className="page-visibility-row__toggle-ui" aria-hidden />
        <span className="page-visibility-row__status">
          {live ? "Live" : "Under construction"}
        </span>
      </label>
    </div>
  );
}

export function PageVisibilityPanel() {
  const { showToast } = useToast();
  const groups = useMemo(() => getManagedPageGroups(), []);
  const [settings, setSettings] = useState<PageVisibilitySettings>({
    pages: defaultPageVisibilityMap(),
  });
  const [savedSettings, setSavedSettings] = useState<PageVisibilitySettings>({
    pages: defaultPageVisibilityMap(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminFetch("/api/admin/page-visibility");
      if (!response.ok) {
        throw new Error(
          await readAdminError(response, "Failed to load page settings"),
        );
      }
      const data = (await response.json()) as { settings?: unknown };
      const next = parsePageVisibilitySettings(data.settings);
      setSettings(next);
      setSavedSettings(next);
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Failed to load page settings",
      );
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadSettings(); // eslint-disable-line react-hooks/set-state-in-effect -- dashboard mount fetch
  }, [loadSettings]);

  const dirty = !isPageVisibilitySettingsEqual(settings, savedSettings);

  const setPageLive = (id: ManagedPublicPageId, live: boolean) => {
    setSettings((current) => ({
      pages: {
        ...current.pages,
        [id]: live,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await adminFetch("/api/admin/page-visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (!response.ok) {
        throw new Error(
          await readAdminError(response, "Failed to save page settings"),
        );
      }
      const data = (await response.json()) as { settings?: unknown };
      const saved = parsePageVisibilitySettings(data.settings);
      setSettings(saved);
      setSavedSettings(saved);
      showToast("success", "Page visibility saved to live site");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Failed to save page settings",
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
        Loading pages…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(({ group, pages }) => (
        <section key={group} className="card overflow-hidden">
          <div
            className="border-b px-5 py-4"
            style={{ borderColor: "var(--border)" }}
          >
            <h2 className="admin-heading text-base">{group}</h2>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {pages.map((page) => (
              <ToggleRow
                key={page.id}
                label={page.label}
                path={page.path}
                live={settings.pages[page.id] !== false}
                onChange={(live) => setPageLive(page.id, live)}
              />
            ))}
          </div>
        </section>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving || !dirty}
          className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Save className="h-4 w-4" aria-hidden />
          )}
          Save page settings
        </button>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-inline-link inline-flex items-center gap-1.5 text-sm"
        >
          Preview live site
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </div>
  );
}
