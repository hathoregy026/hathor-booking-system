"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { AlignCenter, AlignLeft, AlignRight, Loader2, RotateCcw, Save, Undo2 } from "lucide-react";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch, isTransientFetchError } from "@/lib/admin-fetch";
import {
  DEFAULT_HERO_LAYOUT,
  DEFAULT_TYPOGRAPHY_SETTINGS,
  HATHOR_AVAILABLE_LUXURY_FONTS,
  HATHOR_FONT_INSTALLED,
  HERO_ALIGNS,
  isTypographySettingsEqual,
  parseTypographySettings,
  type HathorLuxuryFont,
  type HeroAlign,
  type HeroLayout,
  type TypographyRole,
  type TypographySettings,
  type TypographyTextStyle,
} from "@/lib/typography-settings-shared";

type EditorGroup = "hero" | "page_title" | "page_subtitle" | "body_text";

const GROUP_LABELS: Record<EditorGroup, string> = {
  hero: "Hero (all pages)",
  page_title: "Page title",
  page_subtitle: "Page subtitle",
  body_text: "Body text",
};

const GROUP_WHERE: Record<EditorGroup, string> = {
  hero: "Drag either title freely (they can overlap). Align left / center / right. Saves to every page hero.",
  page_title: "Main title at the top of Suites, Experiences, About, etc.",
  page_subtitle: "Short line under that page title.",
  body_text: "Normal paragraph text in page content.",
};

const SAMPLES: Record<TypographyRole, string> = {
  hero_title: "Ultra Luxury",
  hero_subtitle: "Dahabiya Cruise",
  page_title: "Our Suites",
  page_subtitle: "Luxury on the water",
  body_text:
    "Sail the Nile aboard a private dahabiya — unhurried days, fine dining, and suites crafted for quiet luxury from Luxor to Aswan.",
};

const HERO_LINE_LABELS: Record<"hero_title" | "hero_subtitle", string> = {
  hero_title: "Main title",
  hero_subtitle: "Second title (script)",
};

function fontOptionsFor(current: HathorLuxuryFont): HathorLuxuryFont[] {
  if (HATHOR_FONT_INSTALLED[current]) return [...HATHOR_AVAILABLE_LUXURY_FONTS];
  return [current, ...HATHOR_AVAILABLE_LUXURY_FONTS];
}

function clampOffset(n: number): number {
  return Math.min(240, Math.max(-240, Math.round(n)));
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
  const [group, setGroup] = useState<EditorGroup>("hero");
  const [heroLine, setHeroLine] = useState<"hero_title" | "hero_subtitle">(
    "hero_title",
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const dragRef = useRef<{
    line: "hero_title" | "hero_subtitle";
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

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
  const activeRole: TypographyRole =
    group === "hero" ? heroLine : group;
  const value = settings[activeRole];
  const layout = settings.hero_layout;
  const stageTone = group === "hero" ? "dark" : "light";
  const editingLabel =
    group === "hero"
      ? `Hero · ${HERO_LINE_LABELS[heroLine]}`
      : GROUP_LABELS[group];

  const patch = (partial: Partial<TypographyTextStyle>) => {
    setSettings((prev) => ({
      ...prev,
      [activeRole]: { ...prev[activeRole], ...partial },
    }));
  };

  const patchLayout = (partial: Partial<HeroLayout>) => {
    setSettings((prev) => ({
      ...prev,
      hero_layout: { ...prev.hero_layout, ...partial },
    }));
  };

  const activeOffset =
    heroLine === "hero_title"
      ? { x: layout.mainX, y: layout.mainY }
      : { x: layout.secondX, y: layout.secondY };

  const setActiveOffset = (x: number, y: number) => {
    if (heroLine === "hero_title") {
      patchLayout({ mainX: clampOffset(x), mainY: clampOffset(y) });
    } else {
      patchLayout({ secondX: clampOffset(x), secondY: clampOffset(y) });
    }
  };

  const onDragStart =
    (line: "hero_title" | "hero_subtitle") =>
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setHeroLine(line);
      const L = settings.hero_layout;
      dragRef.current = {
        line,
        startX: event.clientX,
        startY: event.clientY,
        origX: line === "hero_title" ? L.mainX : L.secondX,
        origY: line === "hero_title" ? L.mainY : L.secondY,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    };

  const onDragMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    const nextX = clampOffset(drag.origX + dx);
    const nextY = clampOffset(drag.origY + dy);
    if (drag.line === "hero_title") {
      patchLayout({ mainX: nextX, mainY: nextY });
    } else {
      patchLayout({ secondX: nextX, secondY: nextY });
    }
  };

  const onDragEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragRef.current) {
      dragRef.current = null;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
    }
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
      showToast("success", "Saved to live site — all page heroes updated.");
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
            Hero preview: both titles together — drag to move, overlap freely,
            or align. Save applies to every page.
          </p>
        </div>
      </header>

      <div className="typo-rolebar" role="tablist" aria-label="Which text to edit">
        {(Object.keys(GROUP_LABELS) as EditorGroup[]).map((key) => {
          const on = group === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={on}
              className={`typo-rolebar__btn${on ? " typo-rolebar__btn--on" : ""}`}
              onClick={() => {
                setGroup(key);
                if (key === "hero") setHeroLine("hero_title");
              }}
            >
              {GROUP_LABELS[key]}
            </button>
          );
        })}
      </div>

      <div
        className={`typo-stage typo-stage--${stageTone}${group === "hero" ? " typo-stage--hero-pair" : ""}`}
        key={group}
      >
        <div className="typo-stage__banner">
          <span className="typo-stage__editing">You are editing</span>
          <strong className="typo-stage__role">{editingLabel}</strong>
        </div>
        <p className="typo-stage__where">{GROUP_WHERE[group]}</p>

        {group === "hero" ? (
          <>
            <div className="typo-stage__align">
              {(
                [
                  ["left", AlignLeft, "Left"],
                  ["center", AlignCenter, "Center"],
                  ["right", AlignRight, "Right"],
                ] as const
              ).map(([align, Icon, label]) => (
                <button
                  key={align}
                  type="button"
                  className={`typo-stage__align-btn${layout.align === align ? " typo-stage__align-btn--on" : ""}`}
                  onClick={() => patchLayout({ align })}
                  aria-pressed={layout.align === align}
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <div
              className="typo-stage__canvas"
              style={{
                justifyContent:
                  layout.align === "left"
                    ? "flex-start"
                    : layout.align === "right"
                      ? "flex-end"
                      : "center",
                textAlign: layout.align,
              }}
            >
              <button
                type="button"
                className={`typo-stage__drag${heroLine === "hero_title" ? " typo-stage__drag--on" : ""}`}
                style={{
                  ...liveVars(settings.hero_title),
                  transform: `translate(${layout.mainX}px, ${layout.mainY}px)`,
                  zIndex: heroLine === "hero_title" ? 3 : 2,
                }}
                onPointerDown={onDragStart("hero_title")}
                onPointerMove={onDragMove}
                onPointerUp={onDragEnd}
                onPointerCancel={onDragEnd}
              >
                <span className="typo-stage__line-tag">Main · drag</span>
                <span className="typo-stage__sample typo-stage__sample--inline">
                  {SAMPLES.hero_title}
                </span>
              </button>
              <button
                type="button"
                className={`typo-stage__drag${heroLine === "hero_subtitle" ? " typo-stage__drag--on" : ""}`}
                style={{
                  ...liveVars(settings.hero_subtitle),
                  transform: `translate(${layout.secondX}px, ${layout.secondY}px)`,
                  zIndex: heroLine === "hero_subtitle" ? 3 : 1,
                }}
                onPointerDown={onDragStart("hero_subtitle")}
                onPointerMove={onDragMove}
                onPointerUp={onDragEnd}
                onPointerCancel={onDragEnd}
              >
                <span className="typo-stage__line-tag">Second · drag</span>
                <span className="typo-stage__sample typo-stage__sample--inline">
                  {SAMPLES.hero_subtitle}
                </span>
              </button>
            </div>
          </>
        ) : (
          <p className="typo-stage__sample" style={liveVars(value)}>
            {SAMPLES[activeRole]}
          </p>
        )}

        <p className="typo-stage__readout">
          {group === "hero"
            ? `Align ${layout.align} · ${HERO_LINE_LABELS[heroLine]} at ${activeOffset.x}px, ${activeOffset.y}px · ${value.fontFamily} ${value.fontSize}px`
            : `Font: ${value.fontFamily} · Size: ${value.fontSize}px · Color: ${value.color}`}
        </p>
      </div>

      <div className="typo-easy__controls admin-card">
        {group === "hero" ? (
          <>
            <p className="typo-easy__controls-hint">
              Editing <strong>{HERO_LINE_LABELS[heroLine]}</strong> — drag in
              the preview or use the sliders. Overlap is allowed.
            </p>

            <div className="typo-easy__row">
              <SimpleField label="Move X" valueLabel={`${activeOffset.x}px`}>
                <input
                  type="range"
                  className="typo-easy__range"
                  min={-240}
                  max={240}
                  step={1}
                  value={activeOffset.x}
                  onChange={(e) =>
                    setActiveOffset(Number(e.target.value), activeOffset.y)
                  }
                />
              </SimpleField>
              <SimpleField label="Move Y" valueLabel={`${activeOffset.y}px`}>
                <input
                  type="range"
                  className="typo-easy__range"
                  min={-240}
                  max={240}
                  step={1}
                  value={activeOffset.y}
                  onChange={(e) =>
                    setActiveOffset(activeOffset.x, Number(e.target.value))
                  }
                />
              </SimpleField>
            </div>

            <div className="typo-easy__row typo-easy__row--actions">
              <button
                type="button"
                className="typo-easy__reset-role"
                onClick={() =>
                  patchLayout({
                    ...DEFAULT_HERO_LAYOUT,
                    align: layout.align,
                  })
                }
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset positions
              </button>
              <div className="typo-stage__align typo-stage__align--inline">
                {HERO_ALIGNS.map((align) => (
                  <button
                    key={align}
                    type="button"
                    className={`typo-stage__align-btn${layout.align === align ? " typo-stage__align-btn--on" : ""}`}
                    onClick={() => patchLayout({ align: align as HeroAlign })}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}

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
