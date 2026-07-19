"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch, isTransientFetchError } from "@/lib/admin-fetch";
import {
  DEFAULT_TYPOGRAPHY_SETTINGS,
  HATHOR_AVAILABLE_LUXURY_FONTS,
  HATHOR_FONT_INSTALLED,
  TYPOGRAPHY_ROLE_LABELS,
  TYPOGRAPHY_ROLES,
  isTypographySettingsEqual,
  parseTypographySettings,
  typographyToInlineStyle,
  type HathorLuxuryFont,
  type TypographyRole,
  type TypographySettings,
  type TypographyTextStyle,
} from "@/lib/typography-settings-shared";

function fontOptionsFor(current: HathorLuxuryFont): HathorLuxuryFont[] {
  if (HATHOR_FONT_INSTALLED[current]) return [...HATHOR_AVAILABLE_LUXURY_FONTS];
  /* Keep a saved-but-missing font selectable until the admin picks an installed one. */
  return [current, ...HATHOR_AVAILABLE_LUXURY_FONTS];
}

function RoleEditor({
  role,
  value,
  onChange,
}: {
  role: TypographyRole;
  value: TypographyTextStyle;
  onChange: (next: TypographyTextStyle) => void;
}) {
  const patch = (partial: Partial<TypographyTextStyle>) =>
    onChange({ ...value, ...partial });

  return (
    <section className="hlt-section typo-role-card">
      <h2 className="admin-heading text-base">{TYPOGRAPHY_ROLE_LABELS[role]}</h2>
      <p
        className="typo-role-card__preview"
        style={typographyToInlineStyle(value)}
      >
        {role.includes("subtitle")
          ? "Sample subtitle — elegance on the Nile"
          : "Sample Title — Hathor"}
      </p>

      <div className="hlt-grid">
        <label className="hlt-field">
          <span className="hlt-field__label">Font Family</span>
          <select
            className="hlt-field__input typo-font-select"
            value={value.fontFamily}
            onChange={(e) =>
              patch({
                fontFamily: e.target.value as TypographyTextStyle["fontFamily"],
              })
            }
            style={{ fontFamily: `'${value.fontFamily}', serif` }}
          >
            {fontOptionsFor(value.fontFamily).map((font) => (
              <option key={font} value={font} style={{ fontFamily: `'${font}', serif` }}>
                {font}
                {!HATHOR_FONT_INSTALLED[font] ? " (file missing)" : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="hlt-field">
          <span className="hlt-field__label">
            Font Size
            <span className="hlt-field__live">{value.fontSize}px</span>
          </span>
          <input
            type="number"
            className="hlt-field__input"
            min={8}
            max={200}
            step={1}
            value={value.fontSize}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) patch({ fontSize: n });
            }}
          />
        </label>

        <label className="hlt-field">
          <span className="hlt-field__label">Color</span>
          <span className="typo-color-row">
            <input
              type="color"
              className="typo-color-swatch"
              value={value.color}
              onChange={(e) => patch({ color: e.target.value.toUpperCase() })}
              aria-label={`${TYPOGRAPHY_ROLE_LABELS[role]} color`}
            />
            <input
              type="text"
              className="hlt-field__input"
              value={value.color}
              spellCheck={false}
              autoComplete="off"
              onChange={(e) => {
                const raw = e.target.value.trim();
                if (/^#[0-9A-Fa-f]{0,6}$/.test(raw)) {
                  if (/^#[0-9A-Fa-f]{6}$/.test(raw)) {
                    patch({ color: raw.toUpperCase() });
                  }
                }
              }}
            />
          </span>
        </label>

        <label className="hlt-field">
          <span className="hlt-field__label">
            Line Height
            <span className="hlt-field__live">{value.lineHeight}</span>
          </span>
          <input
            type="number"
            className="hlt-field__input"
            min={0.8}
            max={3}
            step={0.05}
            value={value.lineHeight}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) patch({ lineHeight: n });
            }}
          />
        </label>

        <label className="hlt-field">
          <span className="hlt-field__label">
            Letter Spacing
            <span className="hlt-field__live">{value.letterSpacing}px</span>
          </span>
          <input
            type="number"
            className="hlt-field__input"
            min={-10}
            max={40}
            step={0.5}
            value={value.letterSpacing}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) patch({ letterSpacing: n });
            }}
          />
        </label>

        <label className="hlt-field typo-toggle-field">
          <span className="hlt-field__label">Inner Shadow</span>
          <button
            type="button"
            role="switch"
            aria-checked={value.innerShadow}
            className={`typo-switch${value.innerShadow ? " typo-switch--on" : ""}`}
            onClick={() => patch({ innerShadow: !value.innerShadow })}
          >
            <span className="typo-switch__thumb" />
            <span className="typo-switch__label">
              {value.innerShadow ? "On" : "Off"}
            </span>
          </button>
        </label>
      </div>
    </section>
  );
}

export function TypographyStylesPanel() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<TypographySettings>(
    DEFAULT_TYPOGRAPHY_SETTINGS,
  );
  const [saved, setSaved] = useState<TypographySettings>(
    DEFAULT_TYPOGRAPHY_SETTINGS,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await adminFetch("/api/admin/typography");
        const data = (await response.json()) as { settings?: unknown };
        if (cancelled) return;
        const next = parseTypographySettings(data.settings);
        setSettings(next);
        setSaved(next);
      } catch (error) {
        if (!cancelled) {
          showToast(
            "error",
            isTransientFetchError(error)
              ? "Could not load typography settings."
              : "Failed to load typography settings.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const dirty = !isTypographySettingsEqual(settings, saved);

  const patchRole = (role: TypographyRole, next: TypographyTextStyle) => {
    setSettings((prev) => ({ ...prev, [role]: next }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = parseTypographySettings(settings);
      const response = await adminFetch("/api/admin/typography", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload }),
      });
      const data = (await response.json()) as {
        settings?: unknown;
        ok?: boolean;
        error?: string;
      };
      if (!response.ok || data.ok === false) {
        throw new Error(data.error || "Save failed");
      }
      const next = parseTypographySettings(data.settings ?? payload);
      setSettings(next);
      setSaved(next);
      showToast("success", "Typography saved to live site.");
      void fetch(`/api/typography?t=${Date.now()}`, { cache: "no-store" }).catch(
        () => {},
      );
    } catch (error) {
      showToast(
        "error",
        isTransientFetchError(error)
          ? "Network error — try Save again."
          : error instanceof Error
            ? error.message
            : "Could not save typography.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_TYPOGRAPHY_SETTINGS);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8 text-[var(--text-secondary)]">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading typography…
      </div>
    );
  }

  return (
    <div className="hlt-panel typo-panel">
      <header className="hlt-panel__header">
        <div>
          <h1 className="admin-page-title">Typography &amp; Styles</h1>
          <p className="admin-page-subtitle max-w-2xl">
            Control fonts, size, color, line-height, letter-spacing, and inner
            shadow for hero and page titles. Only fonts with files in
            public/fonts/ are listed — add the rest later to unlock them.
          </p>
        </div>
        <div className="hlt-panel__actions">
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw className="h-4 w-4" />
            Reset defaults
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => void handleSave()}
            disabled={saving || !dirty}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save to live
          </button>
        </div>
      </header>

      <div className="typo-roles">
        {TYPOGRAPHY_ROLES.map((role) => (
          <RoleEditor
            key={role}
            role={role}
            value={settings[role]}
            onChange={(next) => patchRole(role, next)}
          />
        ))}
      </div>
    </div>
  );
}
