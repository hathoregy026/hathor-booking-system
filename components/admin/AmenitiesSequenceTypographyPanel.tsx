"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Loader2,
  RotateCcw,
  Save,
} from "lucide-react";
import { AdminDevicePreviewToggle } from "@/components/admin/AdminDevicePreviewToggle";
import { HexColorInput } from "@/components/admin/HexColorInput";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import type { AdminDevicePreview } from "@/lib/admin-device-preview";
import {
  DEFAULT_AMENITIES_LAYOUT,
  DEFAULT_AMENITIES_SPACING,
  DEFAULT_AMENITIES_TYPOGRAPHY,
  parseAmenitiesTypography,
  type AmenitiesLayout,
  type AmenitiesSpacing,
  type AmenitiesStyleRole,
  type AmenitiesTextStyle,
} from "@/lib/amenities-typography-shared";
import {
  DEFAULT_WEBSITE_TEXT,
  parseWebsiteText,
  type WebsiteText,
} from "@/lib/website-text-shared";
import {
  HATHOR_FONT_GROUPS,
  HATHOR_FONT_STACKS,
  type TypographyTextStyle,
} from "@/lib/typography-settings-shared";

type CopyTarget =
  | { kind: "slide"; index: number }
  | { kind: "story"; index: number };

type DragLine = AmenitiesStyleRole;
type PreviewSurface = "onImage" | "onGold" | "onCream";

const PREVIEW_SURFACE_BG: Record<PreviewSurface, string> = {
  onImage: "#1a1714",
  onGold: "#B69F64",
  onCream: "#ece8df",
};

const PREVIEW_SURFACE_LABEL: Record<PreviewSurface, string> = {
  onImage: "On image",
  onGold: "On golden bg",
  onCream: "On cream bg",
};

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

const DRAG_LINE_LABELS: Record<DragLine, string> = {
  title: "Title",
  indication: "Sub / indication",
  body: "Body",
};

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
    hint: "Paragraphs on gold panels (slider, opening rail, nature caption) and opening card labels.",
  },
  {
    id: "style-spacing",
    label: "Layout & line height",
    mode: "spacing",
    hint: "Drag title, sub, and body freely (overlap allowed). Sub stays in front. Gaps and line height still apply on the live site.",
  },
];

function sameJson(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function clampOffset(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(240, Math.max(-240, Math.round(n)));
}

function roleTextShadow(on: boolean) {
  return on
    ? "1px 1px 0 rgba(0,0,0,.35), -.5px -.5px 0 rgba(255,255,255,.25)"
    : "none";
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
  const [dragLine, setDragLine] = useState<DragLine>("indication");
  const [previewSurface, setPreviewSurface] =
    useState<PreviewSurface>("onImage");
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const fontMenuRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    line: DragLine;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  /** Latest styles for Save — avoids stale hex after blur → setState race. */
  const stylesRef = useRef({
    desktop: DEFAULT_AMENITIES_TYPOGRAPHY,
    phone: DEFAULT_AMENITIES_TYPOGRAPHY,
  });

  const text = device === "phone" ? phoneText : desktopText;
  const setText = device === "phone" ? setPhoneText : setDesktopText;
  const savedText = device === "phone" ? savedPhoneText : savedDesktopText;
  const styles = device === "phone" ? phoneStyles : desktopStyles;
  const savedStyles = device === "phone" ? savedPhoneStyles : savedDesktopStyles;
  const layout = styles.layout;

  useEffect(() => {
    stylesRef.current = { desktop: desktopStyles, phone: phoneStyles };
  }, [desktopStyles, phoneStyles]);

  const active = RAIL.find((item) => item.id === activeId) ?? RAIL[0];
  const dirty =
    !sameJson(text.home.stackSlides, savedText.home.stackSlides) ||
    !sameJson(text.home.textBlocks, savedText.home.textBlocks) ||
    !sameJson(styles, savedStyles);

  useEffect(() => {
    if (active.mode === "style") setDragLine(active.role);
  }, [active]);

  useEffect(() => {
    setFontMenuOpen(false);
  }, [activeId, active.mode, device]);

  useEffect(() => {
    if (!fontMenuOpen) return;
    const onDoc = (event: MouseEvent) => {
      if (!fontMenuRef.current?.contains(event.target as Node)) {
        setFontMenuOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFontMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [fontMenuOpen]);

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
        stylesRef.current = { desktop: desk, phone };
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

  const commitStyles = (
    next: typeof DEFAULT_AMENITIES_TYPOGRAPHY,
  ) => {
    if (device === "phone") {
      stylesRef.current.phone = next;
      setPhoneStyles(next);
    } else {
      stylesRef.current.desktop = next;
      setDesktopStyles(next);
    }
  };

  const patchStyle = (
    role: AmenitiesStyleRole,
    partial: Partial<AmenitiesTextStyle>,
  ) => {
    const prev = device === "phone" ? stylesRef.current.phone : stylesRef.current.desktop;
    const nextRole = { ...prev[role], ...partial };
    /* Keep legacy `color` / `colorOnBg` aligned with gold for older readers. */
    if (partial.colorOnGold) {
      nextRole.color = partial.colorOnGold;
      nextRole.colorOnBg = partial.colorOnGold;
    } else if (partial.colorOnBg) {
      nextRole.color = partial.colorOnBg;
      nextRole.colorOnGold = partial.colorOnBg;
    } else if (
      partial.color &&
      !partial.colorOnGold &&
      !partial.colorOnCream &&
      !partial.colorOnImage
    ) {
      nextRole.colorOnGold = partial.color;
      nextRole.colorOnBg = partial.color;
    }
    commitStyles({ ...prev, [role]: nextRole });
  };

  const rolePreviewColor = (role: AmenitiesStyleRole) => {
    if (previewSurface === "onImage") return styles[role].colorOnImage;
    if (previewSurface === "onCream") return styles[role].colorOnCream;
    return styles[role].colorOnGold;
  };

  const patchSpacing = (partial: Partial<AmenitiesSpacing>) => {
    const prev = device === "phone" ? stylesRef.current.phone : stylesRef.current.desktop;
    commitStyles({
      ...prev,
      spacing: { ...prev.spacing, ...partial },
    });
  };

  const patchLayout = (partial: Partial<AmenitiesLayout>) => {
    const prev = device === "phone" ? stylesRef.current.phone : stylesRef.current.desktop;
    commitStyles({
      ...prev,
      layout: { ...prev.layout, ...partial },
    });
  };

  const activeOffset =
    dragLine === "title"
      ? { x: layout.titleX, y: layout.titleY }
      : dragLine === "indication"
        ? { x: layout.indicationX, y: layout.indicationY }
        : { x: layout.bodyX, y: layout.bodyY };

  const setActiveOffset = (x: number, y: number) => {
    const cx = clampOffset(x);
    const cy = clampOffset(y);
    if (dragLine === "title") patchLayout({ titleX: cx, titleY: cy });
    else if (dragLine === "indication")
      patchLayout({ indicationX: cx, indicationY: cy });
    else patchLayout({ bodyX: cx, bodyY: cy });
  };

  const onDragStart =
    (line: DragLine) => (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setDragLine(line);
      const L = styles.layout;
      dragRef.current = {
        line,
        startX: event.clientX,
        startY: event.clientY,
        origX:
          line === "title"
            ? L.titleX
            : line === "indication"
              ? L.indicationX
              : L.bodyX,
        origY:
          line === "title"
            ? L.titleY
            : line === "indication"
              ? L.indicationY
              : L.bodyY,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    };

  const onDragMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const nextX = clampOffset(drag.origX + (event.clientX - drag.startX));
    const nextY = clampOffset(drag.origY + (event.clientY - drag.startY));
    if (drag.line === "title") patchLayout({ titleX: nextX, titleY: nextY });
    else if (drag.line === "indication")
      patchLayout({ indicationX: nextX, indicationY: nextY });
    else patchLayout({ bodyX: nextX, bodyY: nextY });
  };

  const onDragEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
  };

  const sampleStyle = useMemo(() => {
    if (active.mode === "style") return styles[active.role];
    return styles[dragLine];
  }, [active, dragLine, styles]);

  /** Always show title + sub + body; prefer live copy when editing a chapter. */
  const previewCopy = useMemo(() => {
    const fallback = {
      title: "Every landmark,\na pleasure.",
      indication: "Sail The Nile\nOn Hathor",
      body: "Glide between Luxor and Aswan on an intimate dahabiya, where restaurant craft meets warm hospitality.",
    };

    if (active.mode === "copy" && active.target.kind === "slide") {
      const slide = text.home.stackSlides[active.target.index];
      return {
        title: slide?.title?.trim() || fallback.title,
        indication: slide?.indication?.trim() || fallback.indication,
        body: slide?.body?.trim() || fallback.body,
      };
    }

    if (active.mode === "copy" && active.target.kind === "story") {
      const story = text.home.textBlocks[active.target.index];
      return {
        title: story?.title?.trim() || fallback.title,
        indication: fallback.indication,
        body: story?.body?.trim() || fallback.body,
      };
    }

    const slide0 = text.home.stackSlides[0];
    return {
      title: slide0?.title?.trim() || fallback.title,
      indication: slide0?.indication?.trim() || fallback.indication,
      body: slide0?.body?.trim() || fallback.body,
    };
  }, [active, text.home.stackSlides, text.home.textBlocks]);

  const save = async () => {
    if (!dirty || saving) return;
    /*
     * Hex fields commit on type when valid, but blur any focused input first so
     * a half-edited value never races Save with stale React state.
     */
    if (typeof document !== "undefined") {
      const activeEl = document.activeElement;
      if (activeEl instanceof HTMLElement) activeEl.blur();
    }
    setSaving(true);
    try {
      /* Let blur/onChange flush into state + stylesRef before reading. */
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      const stylesToSave =
        device === "phone"
          ? stylesRef.current.phone
          : stylesRef.current.desktop;
      const [textRes, styleRes] = await Promise.all([
        adminFetch("/api/admin/website-text", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: text, device }),
        }),
        adminFetch("/api/admin/amenities-typography", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: stylesToSave, device }),
        }),
      ]);
      if (!textRes.ok) throw new Error("Failed to save amenities wording");
      if (!styleRes.ok) throw new Error("Failed to save amenities styles");

      const textData = (await textRes.json()) as { settings?: unknown };
      const styleData = (await styleRes.json()) as { settings?: unknown };
      const nextText = parseWebsiteText(textData.settings);
      const nextStyles = parseAmenitiesTypography(styleData.settings);

      setText(nextText);
      commitStyles(nextStyles);
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

        <div
          className={`typo-stage typo-stage--dark typo-stage--hero-pair typo-stage--am-trio${device === "phone" ? " typo-stage--phone" : ""}`}
        >
          <div className="typo-stage__banner">
            <span className="typo-stage__editing">
              You are editing ({device === "phone" ? "phone" : "desktop"})
            </span>
            <strong className="typo-stage__role">{active.label}</strong>
          </div>
          <p className="typo-stage__where">{active.hint}</p>

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
            className="typo-stage__align"
            role="tablist"
            aria-label="Colour surface preview"
          >
            {(
              [
                ["onImage", "On image"],
                ["onGold", "On golden bg"],
                ["onCream", "On cream bg"],
              ] as const
            ).map(([surface, label]) => (
              <button
                key={surface}
                type="button"
                role="tab"
                aria-selected={previewSurface === surface}
                className={`typo-stage__align-btn${previewSurface === surface ? " typo-stage__align-btn--on" : ""}`}
                onClick={() => setPreviewSurface(surface)}
              >
                {label}
              </button>
            ))}
          </div>

          <div
            className="typo-stage__canvas"
            style={{
              background: PREVIEW_SURFACE_BG[previewSurface],
              justifyContent:
                layout.align === "left"
                  ? "flex-start"
                  : layout.align === "right"
                    ? "flex-end"
                    : "center",
              textAlign: layout.align,
              alignItems:
                layout.align === "left"
                  ? "flex-start"
                  : layout.align === "right"
                    ? "flex-end"
                    : "center",
            }}
          >
            <button
              type="button"
              className={`typo-stage__drag${dragLine === "title" ? " typo-stage__drag--on" : ""}`}
              style={{
                transform: `translate(${layout.titleX}px, ${layout.titleY}px)`,
                zIndex: dragLine === "title" ? 4 : 1,
                fontFamily: HATHOR_FONT_STACKS[styles.title.fontFamily],
                fontSize: Math.min(
                  styles.title.fontSize,
                  device === "phone" ? 34 : 48,
                ),
                color: rolePreviewColor("title"),
                lineHeight: styles.title.lineHeight,
                letterSpacing: styles.title.letterSpacing,
                textShadow: roleTextShadow(styles.title.innerShadow),
              }}
              onPointerDown={onDragStart("title")}
              onPointerMove={onDragMove}
              onPointerUp={onDragEnd}
              onPointerCancel={onDragEnd}
            >
              <span className="typo-stage__line-tag">Title · drag</span>
              <span
                className="typo-stage__sample typo-stage__sample--inline"
                style={{ whiteSpace: "pre-line" }}
              >
                {previewCopy.title}
              </span>
            </button>

            <button
              type="button"
              className={`typo-stage__drag${dragLine === "indication" ? " typo-stage__drag--on" : ""}`}
              style={{
                transform: `translate(${layout.indicationX}px, ${layout.indicationY}px)`,
                /* Sub always paints in front of title + body (hero second-line concept). */
                zIndex: 5,
                fontFamily: HATHOR_FONT_STACKS[styles.indication.fontFamily],
                fontSize: styles.indication.fontSize,
                color: rolePreviewColor("indication"),
                lineHeight: styles.indication.lineHeight,
                letterSpacing: styles.indication.letterSpacing,
                textTransform: "uppercase",
                textShadow: roleTextShadow(styles.indication.innerShadow),
              }}
              onPointerDown={onDragStart("indication")}
              onPointerMove={onDragMove}
              onPointerUp={onDragEnd}
              onPointerCancel={onDragEnd}
            >
              <span className="typo-stage__line-tag">Sub · drag</span>
              <span
                className="typo-stage__sample typo-stage__sample--inline"
                style={{ whiteSpace: "pre-line" }}
              >
                {previewCopy.indication}
              </span>
            </button>

            <button
              type="button"
              className={`typo-stage__drag${dragLine === "body" ? " typo-stage__drag--on" : ""}`}
              style={{
                transform: `translate(${layout.bodyX}px, ${layout.bodyY}px)`,
                zIndex: dragLine === "body" ? 4 : 2,
                fontFamily: HATHOR_FONT_STACKS[styles.body.fontFamily],
                fontSize: styles.body.fontSize,
                color: rolePreviewColor("body"),
                lineHeight: styles.body.lineHeight,
                letterSpacing: styles.body.letterSpacing,
                textShadow: roleTextShadow(styles.body.innerShadow),
                maxWidth: "22rem",
              }}
              onPointerDown={onDragStart("body")}
              onPointerMove={onDragMove}
              onPointerUp={onDragEnd}
              onPointerCancel={onDragEnd}
            >
              <span className="typo-stage__line-tag">Body · drag</span>
              <span
                className="typo-stage__sample typo-stage__sample--inline"
                style={{ whiteSpace: "pre-line" }}
              >
                {previewCopy.body}
              </span>
            </button>
          </div>

          <p className="typo-stage__readout">
            {`Align ${layout.align} · ${PREVIEW_SURFACE_LABEL[previewSurface]} · ${DRAG_LINE_LABELS[dragLine]} at ${activeOffset.x}px, ${activeOffset.y}px · ${sampleStyle.fontFamily} ${sampleStyle.fontSize}px`}
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
              <p className="typo-easy__controls-hint">
                Drag any line in the preview. Active:{" "}
                <strong>{DRAG_LINE_LABELS[dragLine]}</strong>
              </p>
              <div className="typo-easy__fields-row">
                <label className="typo-easy__field">
                  <span>Move X</span>
                  <input
                    className="admin-input"
                    type="number"
                    min={-240}
                    max={240}
                    value={activeOffset.x}
                    onChange={(e) =>
                      setActiveOffset(Number(e.target.value), activeOffset.y)
                    }
                  />
                </label>
                <label className="typo-easy__field">
                  <span>Move Y</span>
                  <input
                    className="admin-input"
                    type="number"
                    min={-240}
                    max={240}
                    value={activeOffset.y}
                    onChange={(e) =>
                      setActiveOffset(activeOffset.x, Number(e.target.value))
                    }
                  />
                </label>
              </div>
              <div className="typo-easy__field">
                <span>Font</span>
                <div className="typo-easy__font-dd" ref={fontMenuRef}>
                  <button
                    type="button"
                    className={`typo-easy__font-dd-trigger${fontMenuOpen ? " typo-easy__font-dd-trigger--open" : ""}`}
                    aria-haspopup="listbox"
                    aria-expanded={fontMenuOpen}
                    aria-label="Choose font"
                    onClick={() => setFontMenuOpen((open) => !open)}
                  >
                    <span
                      className="typo-easy__font-dd-sample"
                      style={{
                        fontFamily:
                          HATHOR_FONT_STACKS[styles[active.role].fontFamily],
                      }}
                    >
                      {styles[active.role].fontFamily}
                    </span>
                    <span className="typo-easy__font-dd-chevron" aria-hidden>
                      {fontMenuOpen ? "▴" : "▾"}
                    </span>
                  </button>
                  {fontMenuOpen ? (
                    <div
                      className="typo-easy__font-dd-menu"
                      role="listbox"
                      aria-label="Fonts"
                    >
                      {HATHOR_FONT_GROUPS.flatMap((fontGroup) =>
                        fontGroup.variants.map((variant) => {
                          const selected =
                            styles[active.role].fontFamily === variant.id;
                          const label =
                            fontGroup.variants.length > 1
                              ? `${fontGroup.family} · ${variant.label}`
                              : fontGroup.family;
                          return (
                            <button
                              key={variant.id}
                              type="button"
                              role="option"
                              aria-selected={selected}
                              className={`typo-easy__font-dd-option${selected ? " typo-easy__font-dd-option--on" : ""}`}
                              style={{
                                fontFamily: HATHOR_FONT_STACKS[variant.id],
                              }}
                              onClick={() => {
                                patchStyle(active.role, {
                                  fontFamily:
                                    variant.id as TypographyTextStyle["fontFamily"],
                                });
                                setFontMenuOpen(false);
                              }}
                            >
                              <span className="typo-easy__font-dd-option-label">
                                {label}
                              </span>
                              <span className="typo-easy__font-dd-option-demo">
                                Hathor
                              </span>
                            </button>
                          );
                        }),
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
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
              </div>
              <div className="typo-easy__fields-row">
                <label className="typo-easy__field">
                  <span>Colour on image</span>
                  <HexColorInput
                    aria-label="Colour on image"
                    value={styles[active.role].colorOnImage}
                    onChange={(hex) => {
                      setPreviewSurface("onImage");
                      patchStyle(active.role, { colorOnImage: hex });
                    }}
                  />
                </label>
                <label className="typo-easy__field">
                  <span>Colour on golden bg</span>
                  <HexColorInput
                    aria-label="Colour on golden background"
                    value={styles[active.role].colorOnGold}
                    onChange={(hex) => {
                      setPreviewSurface("onGold");
                      patchStyle(active.role, { colorOnGold: hex });
                    }}
                  />
                </label>
              </div>
              <label className="typo-easy__field">
                <span>Colour on cream bg</span>
                <HexColorInput
                  aria-label="Colour on cream background"
                  value={styles[active.role].colorOnCream}
                  onChange={(hex) => {
                    setPreviewSurface("onCream");
                    patchStyle(active.role, { colorOnCream: hex });
                  }}
                />
              </label>
              <p className="typo-easy__controls-hint">
                Three surfaces: <strong>image</strong> (photo overlays),{" "}
                <strong>golden bg</strong> (slider / video caption / opening
                rail / nature), <strong>cream bg</strong> (intro cream panel /
                video cream titles). Hex applies as soon as it is valid — Save
                to push live.
              </p>
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
              <p className="typo-easy__controls-hint">
                Editing <strong>{DRAG_LINE_LABELS[dragLine]}</strong> — drag in
                the preview or use Move X / Move Y. Sub stays in front.
                Overlap is allowed.
              </p>
              <div className="typo-easy__fields-row">
                <label className="typo-easy__field">
                  <span>Move X</span>
                  <input
                    className="admin-input"
                    type="number"
                    min={-240}
                    max={240}
                    value={activeOffset.x}
                    onChange={(e) =>
                      setActiveOffset(Number(e.target.value), activeOffset.y)
                    }
                  />
                </label>
                <label className="typo-easy__field">
                  <span>Move Y</span>
                  <input
                    className="admin-input"
                    type="number"
                    min={-240}
                    max={240}
                    value={activeOffset.y}
                    onChange={(e) =>
                      setActiveOffset(activeOffset.x, Number(e.target.value))
                    }
                  />
                </label>
              </div>
              <button
                className="typo-easy__reset"
                type="button"
                onClick={() =>
                  patchLayout({
                    ...DEFAULT_AMENITIES_LAYOUT,
                    align: layout.align,
                  })
                }
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset positions
              </button>

              <p
                className="typo-easy__stage-copy"
                style={{ margin: "0.75rem 0 0" }}
              >
                Space between roles (live margins)
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

              <p
                className="typo-easy__stage-copy"
                style={{ margin: "0.75rem 0 0" }}
              >
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
                onClick={() => {
                  const prev =
                    device === "phone"
                      ? stylesRef.current.phone
                      : stylesRef.current.desktop;
                  commitStyles({
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
                    layout: {
                      ...DEFAULT_AMENITIES_LAYOUT,
                      align: prev.layout.align,
                    },
                  });
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset layout, gaps &amp;
                line heights
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
