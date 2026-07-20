"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Loader2, RotateCcw, Save, Undo2 } from "lucide-react";
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

const BODY_SAMPLE =
  "Sail the Nile aboard a private dahabiya — unhurried days, fine dining, and suites crafted for quiet luxury from Luxor to Aswan.";

function fontOptionsFor(current: HathorLuxuryFont): HathorLuxuryFont[] {
  if (HATHOR_FONT_INSTALLED[current]) return [...HATHOR_AVAILABLE_LUXURY_FONTS];
  return [current, ...HATHOR_AVAILABLE_LUXURY_FONTS];
}

function SimpleField({
  label,
  valueLabel,
  children,
}: {
  label: string;
  valueLabel?: string;
  children: ReactNode;
}) {
  return (
    <label className="typo-easy__field">
      <span className="typo-easy__field-label">
        {label}
        {valueLabel ? (
          <span className="typo-easy__field-value">{valueLabel}</span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

function LiveSectionsPreview({
  settings,
  activeRole,
  onSelectRole,
}: {
  settings: TypographySettings;
  activeRole: TypographyRole;
  onSelectRole: (role: TypographyRole) => void;
}) {
  const heroActive =
    activeRole === "hero_title" || activeRole === "hero_subtitle";
  const pageActive =
    activeRole === "page_title" || activeRole === "page_subtitle";
  const bodyActive = activeRole === "body_text";

  return (
    <div className="typo-live" aria-live="polite">
      <p className="typo-live__hint">
        Live preview — updates as you tune. Click a section to edit it.
      </p>

      <div className="typo-live__grid">
        <button
          type="button"
          className={`typo-live__card typo-live__card--hero${heroActive ? " typo-live__card--active" : ""}`}
          onClick={() => onSelectRole("hero_title")}
        >
          <span className="typo-live__card-label">Hero</span>
          <span
            className="typo-live__title"
            style={typographyToInlineStyle(settings.hero_title)}
          >
            Hathor Dahabiya
          </span>
          <span
            className="typo-live__subtitle"
            style={typographyToInlineStyle(settings.hero_subtitle)}
          >
            A private Nile sailing
          </span>
        </button>

        <button
          type="button"
          className={`typo-live__card typo-live__card--page${pageActive ? " typo-live__card--active" : ""}`}
          onClick={() => onSelectRole("page_title")}
        >
          <span className="typo-live__card-label">Page</span>
          <span
            className="typo-live__title"
            style={typographyToInlineStyle(settings.page_title)}
          >
            Our Suites
          </span>
          <span
            className="typo-live__subtitle"
            style={typographyToInlineStyle(settings.page_subtitle)}
          >
            Luxury on the water
          </span>
        </button>

        <button
          type="button"
          className={`typo-live__card typo-live__card--body${bodyActive ? " typo-live__card--active" : ""}`}
          onClick={() => onSelectRole("body_text")}
        >
          <span className="typo-live__card-label">Body</span>
          <span
            className="typo-live__body"
            style={typographyToInlineStyle(settings.body_text)}
          >
            {BODY_SAMPLE}
          </span>
        </button>
      </div>
    </div>
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
  const [activeRole, setActiveRole] =
    useState<TypographyRole>("hero_title");
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
  const value = settings[activeRole];

  const patch = (partial: Partial<TypographyTextStyle>) => {
    setSettings((prev) => ({
      ...prev,
      [activeRole]: { ...prev[activeRole], ...partial },
    }));
  };

  const handleSave = async () => {
    if (!dirty || saving) return;
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
      showToast("success", "Saved to live site.");
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

  const handleDiscard = () => {
    setSettings(saved);
  };

  const handleResetRole = () => {
    setSettings((prev) => ({
      ...prev,
      [activeRole]: DEFAULT_TYPOGRAPHY_SETTINGS[activeRole],
    }));
  };

  if (loading) {
    return (
      <div className="typo-easy typo-easy--loading">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading typography…
      </div>
    );
  }

  return (
    <div className="typo-easy">
      <header className="typo-easy__header">
        <div>
          <h1 className="admin-page-title">Typography &amp; Styles</h1>
          <p className="admin-page-subtitle">
            Preview every section live above. Tune below — nothing goes live
            until you press Save.
          </p>
        </div>
      </header>

      <LiveSectionsPreview
        settings={settings}
        activeRole={activeRole}
        onSelectRole={setActiveRole}
      />

      <div
        className="typo-easy__tabs"
        role="tablist"
        aria-label="Which text to style"
      >
        {TYPOGRAPHY_ROLES.map((role) => {
          const active = role === activeRole;
          return (
            <button
              key={role}
              type="button"
              role="tab"
              aria-selected={active}
              className={`typo-easy__tab${active ? " typo-easy__tab--active" : ""}`}
              onClick={() => setActiveRole(role)}
            >
              {TYPOGRAPHY_ROLE_LABELS[role]}
            </button>
          );
        })}
      </div>

      <div className="typo-easy__controls admin-card">
        <p className="typo-easy__editing">
          Editing: <strong>{TYPOGRAPHY_ROLE_LABELS[activeRole]}</strong>
        </p>

        <SimpleField label="Font">
          <div className="typo-easy__font-grid">
            {fontOptionsFor(value.fontFamily).map((font) => {
              const selected = value.fontFamily === font;
              const missing = !HATHOR_FONT_INSTALLED[font];
              return (
                <button
                  key={font}
                  type="button"
                  className={`typo-easy__font-btn${selected ? " typo-easy__font-btn--active" : ""}`}
                  style={{ fontFamily: `'${font}', serif` }}
                  onClick={() => patch({ fontFamily: font })}
                  disabled={missing && !selected}
                  title={missing ? "Font file not installed yet" : font}
                >
                  {font}
                </button>
              );
            })}
          </div>
        </SimpleField>

        <div className="typo-easy__row">
          <SimpleField label="Size" valueLabel={`${value.fontSize}px`}>
            <input
              type="range"
              className="typo-easy__range"
              min={12}
              max={96}
              step={1}
              value={value.fontSize}
              onChange={(e) => patch({ fontSize: Number(e.target.value) })}
            />
          </SimpleField>

          <SimpleField label="Color">
            <div className="typo-easy__color">
              <input
                type="color"
                className="typo-easy__swatch"
                value={value.color}
                onChange={(e) =>
                  patch({ color: e.target.value.toUpperCase() })
                }
                aria-label="Color"
              />
              <span className="typo-easy__hex">{value.color}</span>
            </div>
          </SimpleField>
        </div>

        <div className="typo-easy__row">
          <SimpleField label="Line height" valueLabel={String(value.lineHeight)}>
            <input
              type="range"
              className="typo-easy__range"
              min={0.9}
              max={2}
              step={0.05}
              value={value.lineHeight}
              onChange={(e) => patch({ lineHeight: Number(e.target.value) })}
            />
          </SimpleField>

          <SimpleField
            label="Letter spacing"
            valueLabel={`${value.letterSpacing}px`}
          >
            <input
              type="range"
              className="typo-easy__range"
              min={-4}
              max={12}
              step={0.5}
              value={value.letterSpacing}
              onChange={(e) =>
                patch({ letterSpacing: Number(e.target.value) })
              }
            />
          </SimpleField>
        </div>

        <div className="typo-easy__row typo-easy__row--actions">
          <button
            type="button"
            role="switch"
            aria-checked={value.innerShadow}
            className={`typo-easy__shadow${value.innerShadow ? " typo-easy__shadow--on" : ""}`}
            onClick={() => patch({ innerShadow: !value.innerShadow })}
          >
            Inner shadow: {value.innerShadow ? "On" : "Off"}
          </button>

          <button
            type="button"
            className="typo-easy__reset-role"
            onClick={handleResetRole}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset this text
          </button>
        </div>
      </div>

      <div
        className={`typo-easy__savebar${dirty ? " typo-easy__savebar--dirty" : ""}`}
      >
        <p className="typo-easy__savebar-status">
          {dirty
            ? "You have unsaved changes — live site is unchanged until you save."
            : "All changes are saved to the live site."}
        </p>
        <div className="typo-easy__savebar-actions">
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={handleDiscard}
            disabled={!dirty || saving}
          >
            <Undo2 className="h-4 w-4" />
            Discard
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary typo-easy__save-btn"
            onClick={() => void handleSave()}
            disabled={!dirty || saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save to live site
          </button>
        </div>
      </div>
    </div>
  );
}
