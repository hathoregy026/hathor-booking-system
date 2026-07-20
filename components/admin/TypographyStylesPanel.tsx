"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Loader2, RotateCcw, Save, Undo2 } from "lucide-react";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch, isTransientFetchError } from "@/lib/admin-fetch";
import {
  DEFAULT_TYPOGRAPHY_SETTINGS,
  HATHOR_AVAILABLE_LUXURY_FONTS,
  HATHOR_FONT_INSTALLED,
  TYPOGRAPHY_ROLE_LABELS,
  isTypographySettingsEqual,
  parseTypographySettings,
  type HathorLuxuryFont,
  type TypographyRole,
  type TypographySettings,
  type TypographyTextStyle,
} from "@/lib/typography-settings-shared";

const SAMPLES: Record<TypographyRole, string> = {
  hero_title: "Hathor Dahabiya",
  hero_subtitle: "A private Nile sailing",
  page_title: "Our Suites",
  page_subtitle: "Luxury on the water",
  body_text:
    "Sail the Nile aboard a private dahabiya — unhurried days, fine dining, and suites crafted for quiet luxury from Luxor to Aswan.",
};

function fontOptionsFor(current: HathorLuxuryFont): HathorLuxuryFont[] {
  if (HATHOR_FONT_INSTALLED[current]) return [...HATHOR_AVAILABLE_LUXURY_FONTS];
  return [current, ...HATHOR_AVAILABLE_LUXURY_FONTS];
}

/** Inline styles that win over admin Inter inheritance. */
function liveStyle(style: TypographyTextStyle): CSSProperties {
  return {
    fontFamily: `"${style.fontFamily}", serif`,
    fontSize: `${style.fontSize}px`,
    color: style.color,
    lineHeight: style.lineHeight,
    letterSpacing: `${style.letterSpacing}px`,
    textShadow: style.innerShadow
      ? "inset 0 1px 2px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.2)"
      : "none",
  };
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

function EditableLine({
  role,
  active,
  settings,
  onSelect,
}: {
  role: TypographyRole;
  active: boolean;
  settings: TypographySettings;
  onSelect: (role: TypographyRole) => void;
}) {
  const style = settings[role];
  return (
    <button
      type="button"
      className={`typo-pick${active ? " typo-pick--on" : ""}`}
      onClick={() => onSelect(role)}
      aria-pressed={active}
    >
      <span className="typo-pick__meta">
        <span className="typo-pick__role">{TYPOGRAPHY_ROLE_LABELS[role]}</span>
        <span className="typo-pick__cue">
          {active ? "Editing this" : "Click to edit"}
        </span>
      </span>
      <span className="typo-pick__words" style={liveStyle(style)}>
        {SAMPLES[role]}
      </span>
    </button>
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
  const [flash, setFlash] = useState(0);

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
    setFlash((n) => n + 1);
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
            1) Click the words you want to change. 2) Tune them below. 3) Save
            to live site when done.
          </p>
        </div>
      </header>

      <div className="typo-board" aria-live="polite">
        <section className="typo-board__section typo-board__section--hero">
          <h2 className="typo-board__heading">Hero</h2>
          <EditableLine
            role="hero_title"
            active={activeRole === "hero_title"}
            settings={settings}
            onSelect={setActiveRole}
          />
          <EditableLine
            role="hero_subtitle"
            active={activeRole === "hero_subtitle"}
            settings={settings}
            onSelect={setActiveRole}
          />
        </section>

        <section className="typo-board__section typo-board__section--page">
          <h2 className="typo-board__heading">Page</h2>
          <EditableLine
            role="page_title"
            active={activeRole === "page_title"}
            settings={settings}
            onSelect={setActiveRole}
          />
          <EditableLine
            role="page_subtitle"
            active={activeRole === "page_subtitle"}
            settings={settings}
            onSelect={setActiveRole}
          />
        </section>

        <section className="typo-board__section typo-board__section--body">
          <h2 className="typo-board__heading">Body</h2>
          <EditableLine
            role="body_text"
            active={activeRole === "body_text"}
            settings={settings}
            onSelect={setActiveRole}
          />
        </section>
      </div>

      <div className="typo-easy__controls admin-card">
        <div className="typo-target" key={flash}>
          <p className="typo-target__label">
            You are changing
            <strong> {TYPOGRAPHY_ROLE_LABELS[activeRole]}</strong>
          </p>
          <p className="typo-target__sample" style={liveStyle(value)}>
            {SAMPLES[activeRole]}
          </p>
          <p className="typo-target__readout">
            {value.fontFamily} · {value.fontSize}px · {value.color}
          </p>
        </div>

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
                  style={{ fontFamily: `"${font}", serif` }}
                  onClick={() => patch({ fontFamily: font })}
                  disabled={missing && !selected}
                  title={missing ? "Font file not installed yet" : font}
                >
                  <span className="typo-easy__font-btn-name">{font}</span>
                  <span
                    className="typo-easy__font-btn-demo"
                    style={{ fontFamily: `"${font}", serif` }}
                  >
                    Aa
                  </span>
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
            onClick={() => {
              setSettings((prev) => ({
                ...prev,
                [activeRole]: DEFAULT_TYPOGRAPHY_SETTINGS[activeRole],
              }));
              setFlash((n) => n + 1);
            }}
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
            ? "Unsaved draft — live site unchanged until you save."
            : "Live site matches what you see."}
        </p>
        <div className="typo-easy__savebar-actions">
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={() => setSettings(saved)}
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
