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

/** Plain-English: where this text appears on the live site. */
const ROLE_WHERE: Record<TypographyRole, string> = {
  hero_title:
    "Big headline on the dark hero photo (home, cruises, and similar pages).",
  hero_subtitle: "Smaller line directly under the hero headline.",
  page_title: "Main title at the top of Suites, Experiences, About, etc.",
  page_subtitle: "Short line under that page title.",
  body_text: "Normal paragraph text in page content.",
};

const ROLE_ORDER: TypographyRole[] = [
  "hero_title",
  "hero_subtitle",
  "page_title",
  "page_subtitle",
  "body_text",
];

function fontOptionsFor(current: HathorLuxuryFont): HathorLuxuryFont[] {
  if (HATHOR_FONT_INSTALLED[current]) return [...HATHOR_AVAILABLE_LUXURY_FONTS];
  return [current, ...HATHOR_AVAILABLE_LUXURY_FONTS];
}

/** CSS vars — admin.css applies them with !important so Inter never wins. */
function liveVars(style: TypographyTextStyle): CSSProperties {
  return {
    ["--typo-live-font" as string]: `"${style.fontFamily}", serif`,
    ["--typo-live-size" as string]: `${style.fontSize}px`,
    ["--typo-live-color" as string]: style.color,
    ["--typo-live-lh" as string]: String(style.lineHeight),
    ["--typo-live-ls" as string]: `${style.letterSpacing}px`,
    ["--typo-live-shadow" as string]: style.innerShadow
      ? "1px 1px 0 rgba(0,0,0,0.35), -0.5px -0.5px 0 rgba(255,255,255,0.25)"
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
  const stageTone =
    activeRole === "hero_title" || activeRole === "hero_subtitle"
      ? "dark"
      : "light";

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
            Pick one text type → change it in the big preview → Save when ready.
            The live website only updates after Save.
          </p>
        </div>
      </header>

      <div className="typo-rolebar" role="tablist" aria-label="Which text to edit">
        {ROLE_ORDER.map((role) => {
          const on = activeRole === role;
          return (
            <button
              key={role}
              type="button"
              role="tab"
              aria-selected={on}
              className={`typo-rolebar__btn${on ? " typo-rolebar__btn--on" : ""}`}
              onClick={() => setActiveRole(role)}
            >
              {TYPOGRAPHY_ROLE_LABELS[role]}
            </button>
          );
        })}
      </div>

      <div
        className={`typo-stage typo-stage--${stageTone}`}
        style={liveVars(value)}
        key={activeRole}
      >
        <div className="typo-stage__banner">
          <span className="typo-stage__editing">You are editing</span>
          <strong className="typo-stage__role">
            {TYPOGRAPHY_ROLE_LABELS[activeRole]}
          </strong>
        </div>
        <p className="typo-stage__where">{ROLE_WHERE[activeRole]}</p>
        <p className="typo-stage__sample">{SAMPLES[activeRole]}</p>
        <p className="typo-stage__readout">
          Font: {value.fontFamily} · Size: {value.fontSize}px · Color:{" "}
          {value.color}
        </p>
      </div>

      <div className="typo-easy__controls admin-card">
        <SimpleField label="Font (click one — preview updates above)">
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
            ? "Draft only — click Save to update the live website."
            : "Saved — live site matches this."}
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
