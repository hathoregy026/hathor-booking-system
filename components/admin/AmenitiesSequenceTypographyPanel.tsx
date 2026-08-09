"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { AdminDevicePreviewToggle } from "@/components/admin/AdminDevicePreviewToggle";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import type { AdminDevicePreview } from "@/lib/admin-device-preview";
import {
  DEFAULT_AMENITIES_SPACING,
  DEFAULT_AMENITIES_TYPOGRAPHY,
  parseAmenitiesTypography,
  type AmenitiesSpacing,
  type AmenitiesStyleRole,
  type AmenitiesTypography,
} from "@/lib/amenities-typography-shared";
import {
  DEFAULT_WEBSITE_TEXT,
  parseWebsiteText,
  type WebsiteText,
} from "@/lib/website-text-shared";
import {
  HATHOR_LUXURY_FONTS,
  HATHOR_FONT_STACKS,
  type TypographyTextStyle,
} from "@/lib/typography-settings-shared";

type CopyTarget =
  | { kind: "slide"; index: number }
  | { kind: "story"; index: number };

type RailItem =
  | { id: string; label: string; mode: "copy"; target: CopyTarget; hint: string }
  | {
      id: string;
      label: string;
      mode: "style";
      role: AmenitiesStyleRole;
      hint: string;
    }
  | { id: string; label: string; mode: "spacing"; hint: string };

const SLIDE_LABELS = [
  "1 — Fullscreen intro",
  "2 — Rising full-bleed",
  "3 — Inset + half/half",
  "4 — Fixed left + stack",
] as const;

const STORY_LABELS = [
  "Way of Life — opening + slider",
  "Dining — opening + slider",
] as const;

const RAIL: RailItem[] = [
  ...SLIDE_LABELS.map((label, index) => ({
    id: `slide-${index}`,
    label,
    mode: "copy" as const,
    target: { kind: "slide" as const, index },
    hint:
      index === 0
        ? "Title and indication on the intro photo; body on the cream panel."
        : "Title, small label, and body for this amenities chapter.",
  })),
  ...STORY_LABELS.map((label, index) => ({
    id: `story-${index}`,
    label,
    mode: "copy" as const,
    target: { kind: "story" as const, index },
    hint:
      index === 0
        ? "Opening chapter title, body, and CTA button label."
        : "Dining card, slider panel, and CTA button label.",
  })),
  {
    id: "style-title",
    label: "Title style",
    mode: "style",
    role: "title",
    hint: "Big titles across the amenities sequence (intro, video, slider, opening, nature).",
  },
  {
    id: "style-indication",
    label: "Sub / indication style",
    mode: "style",
    role: "indication",
    hint: "Small labels under titles (slider subs, nature sub, intro indication).",
  },
  {
    id: "style-body",
    label: "Body style",
    mode: "style",
    role: "body",
    hint: "Paragraphs on gold panels (slider, opening rail, nature caption).",
  },
  {
    id: "style-spacing",
    label: "Spacing & line height",
    mode: "spacing",
    hint: "Preview big title, small label, and body together. Tune gaps between them and each role’s line height.",
  },
];

function sameJson(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function AmenitiesSequenceTypographyPanel() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<AdminDevicePreview>("desktop");
  const [activeId, setActiveId] = useState(RAIL[0].id);

  const [desktopText, setDesktopText] = useState(DEFAULT_WEBSITE_TEXT);
  const [phoneText, setPhoneText] = useState(DEFAULT_WEBSITE_TEXT);
  const [savedDesktopText, setSavedDesktopText] = useState(DEFAULT_WEBSITE_TEXT);
  const [savedPhoneText, setSavedPhoneText] = useState(DEFAULT_WEBSITE_TEXT);

  const [desktopStyles, setDesktopStyles] = useState(DEFAULT_AMENITIES_TYPOGRAPHY);
  const [phoneStyles, setPhoneStyles] = useState(DEFAULT_AMENITIES_TYPOGRAPHY);
  const [savedDesktopStyles, setSavedDesktopStyles] = useState(
    DEFAULT_AMENITIES_TYPOGRAPHY,
  );
  const [savedPhoneStyles, setSavedPhoneStyles] = useState(
    DEFAULT_AMENITIES_TYPOGRAPHY,
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const text = device === "phone" ? phoneText : desktopText;
  const setText = device === "phone" ? setPhoneText : setDesktopText;
  const savedText = device === "phone" ? savedPhoneText : savedDesktopText;
  const styles = device === "phone" ? phoneStyles : desktopStyles;
  const setStyles = device === "phone" ? setPhoneStyles : setDesktopStyles;
  const savedStyles = device === "phone" ? savedPhoneStyles : savedDesktopStyles;

  const active = RAIL.find((item) => item.id === activeId) ?? RAIL[0];
  const dirty =
    !sameJson(text.home.stackSlides, savedText.home.stackSlides) ||
    !sameJson(text.home.textBlocks, savedText.home.textBlocks) ||
    !sameJson(styles, savedStyles);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [textRes, styleRes] = await Promise.all([
        adminFetch("/api/admin/website-text"),
        adminFetch("/api/admin/amenities-typography"),
      ]);
      if (textRes.ok) {
        const data = (await textRes.json()) as {
          settings?: unknown;
          settingsMobile?: unknown;
        };
        const desk = parseWebsiteText(data.settings);
        const phone = parseWebsiteText(data.settingsMobile ?? data.settings);
        setDesktopText(desk);
        setSavedDesktopText(desk);
        setPhoneText(phone);
        setSavedPhoneText(phone);
      }
      if (styleRes.ok) {
        const data = (await styleRes.json()) as {
          settings?: unknown;
          settingsMobile?: unknown;
        };
        const desk = parseAmenitiesTypography(data.settings);
        const phone = parseAmenitiesTypography(
          data.settingsMobile ?? data.settings,
        );
        setDesktopStyles(desk);
        setSavedDesktopStyles(desk);
        setPhoneStyles(phone);
        setSavedPhoneStyles(phone);
      }
    } catch {
      showToast("error", "Could not load amenities sequence text.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const patchSlide = (
    index: number,
    partial: Partial<WebsiteText["home"]["stackSlides"][number]>,
  ) => {
    setText((prev) => ({
      ...prev,
      home: {
        ...prev.home,
        stackSlides: prev.home.stackSlides.map((slide, i) =>
          i === index ? { ...slide, ...partial } : slide,
        ),
      },
    }));
  };

  const patchStory = (
    index: number,
    partial: Partial<WebsiteText["home"]["textBlocks"][number]>,
  ) => {
    setText((prev) => ({
      ...prev,
      home: {
        ...prev.home,
        textBlocks: prev.home.textBlocks.map((block, i) =>
          i === index ? { ...block, ...partial } : block,
        ),
      },
    }));
  };

  const patchStyle = (
    role: AmenitiesStyleRole,
    partial: Partial<TypographyTextStyle>,
  ) => {
    setStyles((prev) => ({
      ...prev,
      [role]: { ...prev[role], ...partial },
    }));
  };

  const patchSpacing = (partial: Partial<AmenitiesSpacing>) => {
    setStyles((prev) => ({
      ...prev,
      spacing: { ...prev.spacing, ...partial },
    }));
  };

  const sampleStyle = useMemo(() => {
    if (active.mode === "style") return styles[active.role];
    return styles.title;
  }, [active, styles]);

  const sampleText = useMemo(() => {
    if (active.mode === "spacing") {
      return "Title\nSub label\nBody copy sits under the sub.";
    }
    if (active.mode === "style") {
      if (active.role === "title") return "Every landmark, a pleasure.";
      if (active.role === "indication") return "Sail The Nile On Hathor";
      return "Glide between Luxor and Aswan on an intimate dahabiya.";
    }
    if (active.target.kind === "slide") {
      const slide = text.home.stackSlides[active.target.index];
      return slide?.title?.split("\n")[0] || "Amenities title";
    }
    const story = text.home.textBlocks[active.target.index];
    return story?.title?.split("\n")[0] || "Story title";
  }, [active, text.home.stackSlides, text.home.textBlocks]);

  const save = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      const [textRes, styleRes] = await Promise.all([
        adminFetch("/api/admin/website-text", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: text, device }),
        }),
        adminFetch("/api/admin/amenities-typography", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: styles, device }),
        }),
      ]);
      if (!textRes.ok) throw new Error("Failed to save amenities wording");
      if (!styleRes.ok) throw new Error("Failed to save amenities styles");

      const textData = (await textRes.json()) as { settings?: unknown };
      const styleData = (await styleRes.json()) as { settings?: unknown };
      const nextText = parseWebsiteText(textData.settings);
      const nextStyles = parseAmenitiesTypography(styleData.settings);

      setText(nextText);
      setStyles(nextStyles);
      if (device === "phone") {
        setSavedPhoneText(nextText);
        setSavedPhoneStyles(nextStyles);
      } else {
        setSavedDesktopText(nextText);
        setSavedDesktopStyles(nextStyles);
      }

      /* Keep Site Typography “On images” wording aligned with slide 1. */
      try {
        const typoRes = await adminFetch("/api/admin/typography");
        if (typoRes.ok) {
          const typoJson = (await typoRes.json()) as {
            settings?: Record<string, unknown>;
            settingsMobile?: Record<string, unknown>;
          };
          const base =
            device === "phone"
              ? (typoJson.settingsMobile ?? typoJson.settings)
              : typoJson.settings;
          if (base && typeof base === "object") {
            await adminFetch("/api/admin/typography", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                settings: {
                  ...base,
                  on_images_copy: {
                    title: nextText.home.stackSlides[0]?.title ?? "",
                    indication: nextText.home.stackSlides[0]?.indication ?? "",
                    body: nextText.home.stackSlides[0]?.body ?? "",
                  },
                },
                device,
              }),
            });
          }
        }
      } catch {
        /* wording already saved */
      }

      showToast(
        "success",
        device === "phone"
          ? "Phone amenities sequence saved."
          : "Amenities sequence saved to live site.",
      );
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Could not save amenities sequence.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="typo-easy typo-easy--loading">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading Amenities sequence…
      </div>
    );
  }

  return (
    <section className="typo-easy" aria-labelledby="amenities-typography-title">
      <header className="typo-easy__header">
        <div>
          <h2 id="amenities-typography-title" className="admin-page-title">
            Amenities Sequence
          </h2>
          <p className="admin-page-subtitle">
            Edit wording and type styles for the homepage amenities scroll
            sequence (after Our Voyages). Desktop and Phone each have their own
            copy and styles.
          </p>
        </div>
        <AdminDevicePreviewToggle
          value={device}
          onChange={setDevice}
          desktopDirty={
            !sameJson(
              desktopText.home.stackSlides,
              savedDesktopText.home.stackSlides,
            ) ||
            !sameJson(
              desktopText.home.textBlocks,
              savedDesktopText.home.textBlocks,
            ) ||
            !sameJson(desktopStyles, savedDesktopStyles)
          }
          phoneDirty={
            !sameJson(
              phoneText.home.stackSlides,
              savedPhoneText.home.stackSlides,
            ) ||
            !sameJson(
              phoneText.home.textBlocks,
              savedPhoneText.home.textBlocks,
            ) ||
            !sameJson(phoneStyles, savedPhoneStyles)
          }
          disabled={saving}
        />
      </header>

      <div className="typo-easy__workspace">
        <aside className="typo-easy__rail" aria-label="Amenities chapters">
          <div className="typo-rolebar typo-rolebar--rail" role="tablist">
            {RAIL.map((item) => {
              const selected = item.id === active.id;
              return (
                <div
                  key={item.id}
                  className={`typo-rolebar__item${selected ? " typo-rolebar__item--on" : ""}`}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    className={`typo-rolebar__btn${selected ? " typo-rolebar__btn--on" : ""}`}
                    onClick={() => setActiveId(item.id)}
                  >
                    <span>{item.label}</span>
                    <span className="typo-rolebar__chevron" aria-hidden>
                      {selected ? "▾" : "▸"}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="typo-easy__stage typo-easy__stage--light">
          <span className="typo-easy__stage-kicker">
            You are editing ({device})
          </span>
          <h3>{active.label}</h3>
          <p className="typo-easy__stage-copy">{active.hint}</p>
          {active.mode === "spacing" ? (
            <div
              className="typo-easy__sample"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 0,
                color: styles.title.color,
              }}
            >
              <span
                style={{
                  fontFamily: HATHOR_FONT_STACKS[styles.title.fontFamily],
                  fontSize: Math.min(
                    styles.title.fontSize,
                    device === "phone" ? 34 : 40,
                  ),
                  letterSpacing: styles.title.letterSpacing,
                  lineHeight: styles.title.lineHeight,
                  marginBottom: styles.spacing.titleToIndication,
                  whiteSpace: "pre-line",
                  textShadow: styles.title.innerShadow
                    ? "1px 1px 0 rgba(0,0,0,.35), -.5px -.5px 0 rgba(255,255,255,.25)"
                    : "none",
                }}
              >
                {"Every landmark,\na pleasure."}
              </span>
              <span
                style={{
                  fontFamily: HATHOR_FONT_STACKS[styles.indication.fontFamily],
                  fontSize: styles.indication.fontSize,
                  letterSpacing: styles.indication.letterSpacing,
                  lineHeight: styles.indication.lineHeight,
                  marginBottom: styles.spacing.indicationToBody,
                  textTransform: "uppercase",
                  whiteSpace: "pre-line",
                  maxWidth: "22rem",
                }}
              >
                {"Sail The Nile\nOn Hathor"}
              </span>
              <span
                style={{
                  fontFamily: HATHOR_FONT_STACKS[styles.body.fontFamily],
                  fontSize: styles.body.fontSize,
                  letterSpacing: styles.body.letterSpacing,
                  lineHeight: styles.body.lineHeight,
                  marginBottom: styles.spacing.bodyToCta,
                  maxWidth: "22rem",
                  whiteSpace: "pre-line",
                }}
              >
                {
                  "Glide between Luxor and Aswan on an intimate dahabiya, where restaurant craft meets warm hospitality."
                }
              </span>
              <span
                style={{
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  border: `1px solid ${styles.title.color}`,
                  borderRadius: 999,
                  padding: "0.55rem 1.1rem",
                }}
              >
                Discover more
              </span>
            </div>
          ) : (
            <p
              className="typo-easy__sample"
              style={{
                fontFamily: HATHOR_FONT_STACKS[sampleStyle.fontFamily],
                fontSize: Math.min(
                  sampleStyle.fontSize,
                  device === "phone" ? 34 : 64,
                ),
                color: sampleStyle.color,
                lineHeight: sampleStyle.lineHeight,
                letterSpacing: sampleStyle.letterSpacing,
                textShadow: sampleStyle.innerShadow
                  ? "1px 1px 0 rgba(0,0,0,.35), -.5px -.5px 0 rgba(255,255,255,.25)"
                  : "none",
                whiteSpace: "pre-line",
              }}
            >
              {sampleText}
            </p>
          )}
          <p className="typo-easy__stage-meta">
            {active.mode === "spacing"
              ? `Gaps ${styles.spacing.titleToIndication}/${styles.spacing.indicationToBody}/${styles.spacing.bodyToCta}px · LH title ${styles.title.lineHeight} · sub ${styles.indication.lineHeight} · body ${styles.body.lineHeight}`
              : `Font: ${sampleStyle.fontFamily} · Size: ${sampleStyle.fontSize}px · Colour: ${sampleStyle.color}`}
          </p>
        </div>

        <div className="typo-easy__controls admin-card">
          {active.mode === "copy" && active.target.kind === "slide" ? (
            <>
              <label className="typo-easy__field">
                <span>Title</span>
                <textarea
                  className="admin-input"
                  rows={2}
                  value={
                    text.home.stackSlides[active.target.index]?.title ?? ""
                  }
                  onChange={(e) =>
                    patchSlide(active.target.index, { title: e.target.value })
                  }
                />
              </label>
              <label className="typo-easy__field">
                <span>Small label</span>
                <input
                  className="admin-input"
                  type="text"
                  value={
                    text.home.stackSlides[active.target.index]?.indication ??
                    ""
                  }
                  onChange={(e) =>
                    patchSlide(active.target.index, {
                      indication: e.target.value,
                    })
                  }
                />
              </label>
              <label className="typo-easy__field">
                <span>Body</span>
                <textarea
                  className="admin-input"
                  rows={4}
                  value={text.home.stackSlides[active.target.index]?.body ?? ""}
                  onChange={(e) =>
                    patchSlide(active.target.index, { body: e.target.value })
                  }
                />
              </label>
            </>
          ) : null}

          {active.mode === "copy" && active.target.kind === "story" ? (
            <>
              <label className="typo-easy__field">
                <span>Title</span>
                <textarea
                  className="admin-input"
                  rows={2}
                  value={
                    text.home.textBlocks[active.target.index]?.title ?? ""
                  }
                  onChange={(e) =>
                    patchStory(active.target.index, { title: e.target.value })
                  }
                />
              </label>
              <label className="typo-easy__field">
                <span>Body</span>
                <textarea
                  className="admin-input"
                  rows={5}
                  value={text.home.textBlocks[active.target.index]?.body ?? ""}
                  onChange={(e) =>
                    patchStory(active.target.index, { body: e.target.value })
                  }
                />
              </label>
              <label className="typo-easy__field">
                <span>Button label</span>
                <input
                  className="admin-input"
                  type="text"
                  value={text.home.textBlocks[active.target.index]?.cta ?? ""}
                  onChange={(e) =>
                    patchStory(active.target.index, { cta: e.target.value })
                  }
                />
              </label>
            </>
          ) : null}

          {active.mode === "style" ? (
            <>
              <label className="typo-easy__field">
                <span>Font</span>
                <select
                  className="admin-input"
                  value={styles[active.role].fontFamily}
                  onChange={(e) =>
                    patchStyle(active.role, {
                      fontFamily: e.target
                        .value as TypographyTextStyle["fontFamily"],
                    })
                  }
                >
                  {HATHOR_LUXURY_FONTS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </label>
              <div className="typo-easy__fields-row">
                <label className="typo-easy__field">
                  <span>Size</span>
                  <input
                    className="admin-input"
                    type="number"
                    min={8}
                    max={200}
                    value={styles[active.role].fontSize}
                    onChange={(e) =>
                      patchStyle(active.role, {
                        fontSize: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="typo-easy__field">
                  <span>Colour</span>
                  <input
                    className="admin-input"
                    type="color"
                    value={styles[active.role].color}
                    onChange={(e) =>
                      patchStyle(active.role, { color: e.target.value })
                    }
                  />
                </label>
              </div>
              <div className="typo-easy__fields-row">
                <label className="typo-easy__field">
                  <span>Line height</span>
                  <input
                    className="admin-input"
                    type="number"
                    min={0.6}
                    max={3}
                    step={0.05}
                    value={styles[active.role].lineHeight}
                    onChange={(e) =>
                      patchStyle(active.role, {
                        lineHeight: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="typo-easy__field">
                  <span>Letter spacing</span>
                  <input
                    className="admin-input"
                    type="number"
                    min={-5}
                    max={20}
                    step={0.1}
                    value={styles[active.role].letterSpacing}
                    onChange={(e) =>
                      patchStyle(active.role, {
                        letterSpacing: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>
              <label className="typo-easy__checkbox">
                <input
                  type="checkbox"
                  checked={styles[active.role].innerShadow}
                  onChange={(e) =>
                    patchStyle(active.role, {
                      innerShadow: e.target.checked,
                    })
                  }
                />{" "}
                Inner shadow
              </label>
              <button
                className="typo-easy__reset"
                type="button"
                onClick={() =>
                  patchStyle(
                    active.role,
                    DEFAULT_AMENITIES_TYPOGRAPHY[active.role],
                  )
                }
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset this style
              </button>
            </>
          ) : null}

          {active.mode === "spacing" ? (
            <>
              <p className="typo-easy__stage-copy" style={{ margin: 0 }}>
                Space between roles
              </p>
              <div className="typo-easy__fields-row">
                <label className="typo-easy__field">
                  <span>Title → sub (px)</span>
                  <input
                    className="admin-input"
                    type="number"
                    min={0}
                    max={120}
                    value={styles.spacing.titleToIndication}
                    onChange={(e) =>
                      patchSpacing({
                        titleToIndication: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="typo-easy__field">
                  <span>Sub → body (px)</span>
                  <input
                    className="admin-input"
                    type="number"
                    min={0}
                    max={120}
                    value={styles.spacing.indicationToBody}
                    onChange={(e) =>
                      patchSpacing({
                        indicationToBody: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>
              <label className="typo-easy__field">
                <span>Body → button (px)</span>
                <input
                  className="admin-input"
                  type="number"
                  min={0}
                  max={160}
                  value={styles.spacing.bodyToCta}
                  onChange={(e) =>
                    patchSpacing({ bodyToCta: Number(e.target.value) })
                  }
                />
              </label>

              <p className="typo-easy__stage-copy" style={{ margin: "0.75rem 0 0" }}>
                Line height within each role
              </p>
              <div className="typo-easy__fields-row">
                <label className="typo-easy__field">
                  <span>Big title</span>
                  <input
                    className="admin-input"
                    type="number"
                    min={0.6}
                    max={3}
                    step={0.05}
                    value={styles.title.lineHeight}
                    onChange={(e) =>
                      patchStyle("title", {
                        lineHeight: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="typo-easy__field">
                  <span>Small label</span>
                  <input
                    className="admin-input"
                    type="number"
                    min={0.6}
                    max={3}
                    step={0.05}
                    value={styles.indication.lineHeight}
                    onChange={(e) =>
                      patchStyle("indication", {
                        lineHeight: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>
              <label className="typo-easy__field">
                <span>Body</span>
                <input
                  className="admin-input"
                  type="number"
                  min={0.6}
                  max={3}
                  step={0.05}
                  value={styles.body.lineHeight}
                  onChange={(e) =>
                    patchStyle("body", {
                      lineHeight: Number(e.target.value),
                    })
                  }
                />
              </label>
              <button
                className="typo-easy__reset"
                type="button"
                onClick={() =>
                  setStyles((prev) => ({
                    ...prev,
                    title: {
                      ...prev.title,
                      lineHeight:
                        DEFAULT_AMENITIES_TYPOGRAPHY.title.lineHeight,
                    },
                    indication: {
                      ...prev.indication,
                      lineHeight:
                        DEFAULT_AMENITIES_TYPOGRAPHY.indication.lineHeight,
                    },
                    body: {
                      ...prev.body,
                      lineHeight: DEFAULT_AMENITIES_TYPOGRAPHY.body.lineHeight,
                    },
                    spacing: { ...DEFAULT_AMENITIES_SPACING },
                  }))
                }
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset gaps &amp; line
                heights
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="typo-easy__savebar">
        <span>
          {dirty
            ? "Unsaved Amenities sequence changes."
            : "All changes saved."}
        </span>
        <button
          className="admin-btn admin-btn--primary"
          type="button"
          disabled={saving || !dirty}
          onClick={() => void save()}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}{" "}
          Save Amenities sequence
        </button>
      </div>
    </section>
  );
}
