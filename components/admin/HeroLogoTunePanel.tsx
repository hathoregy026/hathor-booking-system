"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ExternalLink, Loader2, RotateCcw, Save } from "lucide-react";
import { AdminDevicePreviewToggle } from "@/components/admin/AdminDevicePreviewToggle";
import { AdminPhoneDeviceFrame } from "@/components/admin/AdminPhoneDeviceFrame";
import { HeroLogoTunePreview } from "@/components/admin/HeroLogoTunePreview";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch, isTransientFetchError } from "@/lib/admin-fetch";
import {
  ADMIN_PHONE_PREVIEW_WIDTH,
  type AdminDevicePreview,
} from "@/lib/admin-device-preview";
import {
  DEFAULT_HERO_LOGO_TUNE,
  type HeroLogoTune,
  type HeroLogoVAlign,
  type HathorLogoPartsVariant,
  isHeroLogoTuneEqual,
  parseHeroLogoTune,
} from "@/lib/hero-logo-tune-shared";
import {
  HATHOR_LOGO_PARTS_VARIANTS,
  HATHOR_LOGO_PARTS_VARIANT_LABELS,
} from "@/lib/hathor-logo-letters";

const EDITOR_SECTIONS = [
  { id: "preview", label: "Preview" },
  { id: "colour", label: "Letter colour" },
  { id: "align", label: "Alignment" },
  { id: "overall", label: "Overall" },
  { id: "edges", label: "Screen edges" },
  { id: "center", label: "Center gaps" },
  { id: "spacing", label: "Letter spacing" },
  { id: "nudge", label: "Fine nudge" },
] as const;

type SectionId = (typeof EDITOR_SECTIONS)[number]["id"];

function AlignIcon({ kind }: { kind: HeroLogoVAlign }) {
  if (kind === "top") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        <path
          d="M3 3.5h12M6 3.5v9M12 3.5v6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (kind === "middle") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        <path
          d="M3 9h12M6 4.5v9M12 6v6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        d="M3 14.5h12M6 5.5v9M12 8.5v6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const VALIGN_OPTIONS: { value: HeroLogoVAlign; label: string }[] = [
  { value: "top", label: "Align tops" },
  { value: "middle", label: "Align middles" },
  { value: "bottom", label: "Align bottoms" },
];

function Section({
  id,
  step,
  title,
  description,
  children,
}: {
  id: SectionId;
  step: number;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="wt-section" id={`hlt-${id}`}>
      <header className="wt-section__head">
        <span className="wt-section__step">{String(step).padStart(2, "0")}</span>
        <div className="wt-section__titles">
          <h3 className="wt-section__title">{title}</h3>
          {description ? <p className="wt-section__desc">{description}</p> : null}
        </div>
      </header>
      <div className="wt-section__body">{children}</div>
    </section>
  );
}

function NumberField({
  label,
  hint,
  value,
  min,
  max,
  step = 1,
  suffix = "px",
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (n: number) => void;
}) {
  const [text, setText] = useState(() => String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const commit = (raw: string) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      setText(String(value));
      return;
    }
    const next = clamp(n);
    onChange(next);
    setText(String(next));
  };

  return (
    <label className="hlt-field">
      <span className="hlt-field__label">
        {label}
        <span className="hlt-field__live">
          {step < 1 ? Number(value).toFixed(2) : value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        className="hlt-field__range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        aria-label={`${label} slider`}
      />
      <span className="hlt-field__input-wrap">
        <input
          type="text"
          inputMode={step < 1 ? "decimal" : "numeric"}
          autoComplete="off"
          spellCheck={false}
          value={text}
          onChange={(e) => {
            const raw = e.target.value.trim();
            if (raw !== "" && !/^-?\d*\.?\d*$/.test(raw)) return;
            setText(raw);
            if (raw === "" || raw === "-" || raw === "." || raw === "-.") return;
            const n = Number(raw);
            if (Number.isFinite(n)) onChange(clamp(n));
          }}
          onBlur={() => commit(text)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(text);
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="hlt-field__input"
          aria-label={label}
        />
        <span className="hlt-field__suffix">{suffix}</span>
      </span>
      {hint ? <span className="hlt-field__hint">{hint}</span> : null}
    </label>
  );
}

export function HeroLogoTunePanel() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<AdminDevicePreview>("desktop");
  const [desktopTune, setDesktopTune] = useState<HeroLogoTune>(
    DEFAULT_HERO_LOGO_TUNE,
  );
  const [phoneTune, setPhoneTune] = useState<HeroLogoTune>(
    DEFAULT_HERO_LOGO_TUNE,
  );
  const [savedDesktop, setSavedDesktop] = useState<HeroLogoTune>(
    DEFAULT_HERO_LOGO_TUNE,
  );
  const [savedPhone, setSavedPhone] = useState<HeroLogoTune>(
    DEFAULT_HERO_LOGO_TUNE,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("preview");

  const tune = device === "phone" ? phoneTune : desktopTune;
  const setTune = device === "phone" ? setPhoneTune : setDesktopTune;
  const saved = device === "phone" ? savedPhone : savedDesktop;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const response = await adminFetch("/api/admin/hero-logo-tune");
        const data = (await response.json().catch(() => ({}))) as {
          tune?: unknown;
          tuneMobile?: unknown;
        };
        if (cancelled) return;
        const nextDesktop = parseHeroLogoTune(data.tune);
        const nextPhone = parseHeroLogoTune(data.tuneMobile ?? data.tune);
        setDesktopTune(nextDesktop);
        setSavedDesktop(nextDesktop);
        setPhoneTune(nextPhone);
        setSavedPhone(nextPhone);
      } catch (error) {
        if (!cancelled && !isTransientFetchError(error)) {
          showToast("error", "Could not load logo settings — editing defaults.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Load once on mount — do not re-fetch while the user is typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dirty = !isHeroLogoTuneEqual(tune, saved);
  const desktopDirty = !isHeroLogoTuneEqual(desktopTune, savedDesktop);
  const phoneDirty = !isHeroLogoTuneEqual(phoneTune, savedPhone);

  const patch = (partial: Partial<HeroLogoTune>) =>
    setTune((t) => ({ ...t, ...partial }));

  const setVAlign = (vAlign: HeroLogoVAlign) => {
    patch({
      vAlign,
      yH1: 0,
      yA: 0,
      yT: 0,
      yH2: 0,
      yO: 0,
      yR: 0,
    });
  };

  const discard = () => setTune(saved);

  const jumpTo = (id: SectionId) => {
    setActiveSection(id);
    const el = document.getElementById(`hlt-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = parseHeroLogoTune(tune);
      const response = await adminFetch(
        "/api/admin/hero-logo-tune",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tune: payload, device }),
        },
        60_000,
      );
      const data = (await response.json().catch(() => ({}))) as {
        tune?: unknown;
        error?: string;
        ok?: boolean;
      };
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired — log in again, then Save.");
        }
        throw new Error(data.error || `Save failed (${response.status})`);
      }
      const next = parseHeroLogoTune(data.tune ?? payload);
      setTune(next);
      if (device === "phone") setSavedPhone(next);
      else setSavedDesktop(next);
      showToast(
        "success",
        device === "phone"
          ? "Phone logo saved. Check the live site on a phone (or DevTools ≤767px)."
          : "Desktop logo saved. Open the homepage and hard-refresh to confirm.",
      );
      void fetch(`/api/hero-logo-tune?t=${Date.now()}`, { cache: "no-store" }).catch(
        () => undefined,
      );
    } catch (error) {
      if (!isTransientFetchError(error)) {
        showToast(
          "error",
          error instanceof Error ? error.message : "Could not save logo settings.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="wt-panel wt-panel--loading">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        Loading logo tune…
      </div>
    );
  }

  return (
    <div className="wt-panel hlt-panel">
      <header className="wt-topbar">
        <div className="wt-topbar__copy">
          <h1 className="wt-topbar__title">Hero Logo Tune</h1>
          <p className="wt-topbar__subtitle">
            Switch Desktop / Phone to edit each version separately. Phone
            preview uses a real {ADMIN_PHONE_PREVIEW_WIDTH}×844 device frame
            (≤767px live).
          </p>
          <AdminDevicePreviewToggle
            value={device}
            onChange={setDevice}
            desktopDirty={desktopDirty}
            phoneDirty={phoneDirty}
            disabled={saving}
          />
        </div>
        <div className="wt-topbar__actions">
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            disabled={!dirty || saving}
            onClick={discard}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Discard
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={!dirty || saving}
            onClick={() => void save()}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            {device === "phone" ? "Save phone logo" : "Save desktop logo"}
          </button>
        </div>
      </header>

      <div className="wt-layout">
        <aside className="wt-nav" aria-label="Logo tune sections">
          <p className="wt-nav__label">Sections</p>
          <div className="wt-nav__list">
            {EDITOR_SECTIONS.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`wt-nav__item${active ? " is-active" : ""}`}
                  aria-current={active ? "true" : undefined}
                  onClick={() => jumpTo(item.id)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="wt-editor">
          <div className="wt-editor__toolbar">
            <div>
              <p className="wt-editor__eyebrow">
                Editing {device === "phone" ? "phone" : "desktop"} logo
              </p>
              <h2 className="wt-editor__title">
                {device === "phone" ? "Phone layout" : "Desktop layout"}
              </h2>
            </div>
            <a
              className="wt-preview"
              href={`/?logoRefresh=1&t=${Date.now()}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Open live
            </a>
          </div>

          <fieldset
            disabled={saving}
            className="hlt-editor-form border-0 p-0 m-0 min-w-0"
          >
            <Section
              id="preview"
              step={1}
              title="Live preview"
              description={
                device === "phone"
                  ? "Real phone bezel at 390×844 — tune phone values here."
                  : "Full-width hero preview at your current browser width."
              }
            >
              <div
                className={`hlt-preview-shell${device === "phone" ? " hlt-preview-shell--phone" : ""}`}
              >
                {device === "phone" ? (
                  <div className="admin-phone-iframe-shell hlt-phone-shell">
                    <p className="admin-phone-iframe-shell__label">
                      Phone preview · {ADMIN_PHONE_PREVIEW_WIDTH}×844
                    </p>
                    <AdminPhoneDeviceFrame
                      width={ADMIN_PHONE_PREVIEW_WIDTH}
                      height={844}
                      label="Phone bezel preview"
                    >
                      <HeroLogoTunePreview
                        tune={tune}
                        stageWidth={ADMIN_PHONE_PREVIEW_WIDTH}
                        chrome="phone"
                      />
                    </AdminPhoneDeviceFrame>
                  </div>
                ) : (
                  <HeroLogoTunePreview tune={tune} />
                )}
              </div>
            </Section>

            <Section
              id="colour"
              step={2}
              title="Letter colour set"
              description="Swaps only the letter images. Positions, gaps, and animation stay exactly as tuned."
            >
              <label className="hlt-field">
                <span className="hlt-field__label">Parts variant</span>
                <span className="hlt-field__input-wrap">
                  <select
                    className="hlt-field__input"
                    value={tune.partsVariant}
                    aria-label="Letter colour set"
                    onChange={(e) =>
                      patch({
                        partsVariant: e.target.value as HathorLogoPartsVariant,
                      })
                    }
                  >
                    {HATHOR_LOGO_PARTS_VARIANTS.map((id) => (
                      <option key={id} value={id}>
                        {HATHOR_LOGO_PARTS_VARIANT_LABELS[id]}
                      </option>
                    ))}
                  </select>
                </span>
              </label>
            </Section>

            <Section
              id="align"
              step={3}
              title="Position · Alignment"
              description="Shared top / middle / bottom line for letter frames (like Figma)."
            >
              <div className="hlt-align-row" role="group" aria-label="Alignment">
                {VALIGN_OPTIONS.map((opt) => {
                  const active = tune.vAlign === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      title={opt.label}
                      aria-label={opt.label}
                      aria-pressed={active}
                      className={`hlt-align-btn${active ? " hlt-align-btn--active" : ""}`}
                      onClick={() => setVAlign(opt.value)}
                    >
                      <AlignIcon kind={opt.value} />
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section
              id="overall"
              step={4}
              title="Overall"
              description="Size, vertical position, Book Now nudge, and land animation speed."
            >
              <div className="hlt-grid">
                <NumberField
                  label="Size"
                  hint="Scales letter height only"
                  value={tune.size}
                  min={0.2}
                  max={2.5}
                  step={0.01}
                  suffix="×"
                  onChange={(size) => patch({ size })}
                />
                <NumberField
                  label="Bottom position (Y)"
                  hint="Negative = lower"
                  value={tune.y}
                  min={-800}
                  max={600}
                  onChange={(y) => patch({ y })}
                />
                <NumberField
                  label="Book Now vertical nudge"
                  value={tune.ctaNudge}
                  min={-300}
                  max={300}
                  onChange={(ctaNudge) => patch({ ctaNudge })}
                />
                <NumberField
                  label="Animation duration"
                  hint="Live land speed after Save"
                  value={tune.animDuration}
                  min={0.2}
                  max={8}
                  step={0.1}
                  suffix="s"
                  onChange={(animDuration) => patch({ animDuration })}
                />
              </div>
            </Section>

            <Section
              id="edges"
              step={5}
              title="Screen edge → outer letters"
              description="Hard limits. 0 = flush on the edge. Letters cannot cross outside."
            >
              <div className="hlt-grid">
                <NumberField
                  label="Left edge → H"
                  value={tune.edgeLeft}
                  min={0}
                  max={400}
                  onChange={(edgeLeft) => patch({ edgeLeft })}
                />
                <NumberField
                  label="R → right edge"
                  value={tune.edgeRight}
                  min={0}
                  max={400}
                  onChange={(edgeRight) => patch({ edgeRight })}
                />
              </div>
            </Section>

            <Section
              id="center"
              step={6}
              title="T ↔ Book Now ↔ H (center)"
              description="Full free zone to the Book Now edge. 0 = letter flush on the button."
            >
              <div className="hlt-grid">
                <NumberField
                  label="T → Book Now"
                  hint="Moves T only"
                  value={tune.gapTButton}
                  min={-200}
                  max={2400}
                  onChange={(gapTButton) => patch({ gapTButton })}
                />
                <NumberField
                  label="Book Now → H"
                  hint="Moves right H only"
                  value={tune.gapButtonH}
                  min={-200}
                  max={2400}
                  onChange={(gapButtonH) => patch({ gapButtonH })}
                />
              </div>
            </Section>

            <Section
              id="spacing"
              step={7}
              title="Spacing between letters"
              description="Exact pixels between two letters. Each control moves the next letter only."
            >
              <div className="hlt-grid">
                <NumberField
                  label="H → A"
                  value={tune.gapHA}
                  min={-200}
                  max={2400}
                  onChange={(gapHA) => patch({ gapHA })}
                />
                <NumberField
                  label="A → T"
                  value={tune.gapAT}
                  min={-200}
                  max={2400}
                  onChange={(gapAT) => patch({ gapAT })}
                />
                <NumberField
                  label="H → O (right)"
                  value={tune.gapHO}
                  min={-200}
                  max={2400}
                  onChange={(gapHO) => patch({ gapHO })}
                />
                <NumberField
                  label="O → R"
                  value={tune.gapOR}
                  min={-200}
                  max={2400}
                  onChange={(gapOR) => patch({ gapOR })}
                />
              </div>
            </Section>

            <Section
              id="nudge"
              step={8}
              title="Fine nudge (per letter)"
              description="Extra up (−) / down (+) after alignment. Independent per letter."
            >
              <div className="hlt-grid">
                <NumberField
                  label="H (left)"
                  value={tune.yH1}
                  min={-300}
                  max={300}
                  onChange={(yH1) => patch({ yH1 })}
                />
                <NumberField
                  label="A"
                  value={tune.yA}
                  min={-300}
                  max={300}
                  onChange={(yA) => patch({ yA })}
                />
                <NumberField
                  label="T"
                  value={tune.yT}
                  min={-300}
                  max={300}
                  onChange={(yT) => patch({ yT })}
                />
                <NumberField
                  label="H (right)"
                  value={tune.yH2}
                  min={-300}
                  max={300}
                  onChange={(yH2) => patch({ yH2 })}
                />
                <NumberField
                  label="O"
                  value={tune.yO}
                  min={-300}
                  max={300}
                  onChange={(yO) => patch({ yO })}
                />
                <NumberField
                  label="R"
                  value={tune.yR}
                  min={-300}
                  max={300}
                  onChange={(yR) => patch({ yR })}
                />
              </div>
            </Section>
          </fieldset>
        </div>
      </div>
    </div>
  );
}
