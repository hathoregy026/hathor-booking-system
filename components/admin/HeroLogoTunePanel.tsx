"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, RotateCcw, Save } from "lucide-react";
import { HeroLogoTunePreview } from "@/components/admin/HeroLogoTunePreview";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch, isTransientFetchError } from "@/lib/admin-fetch";
import {
  DEFAULT_HERO_LOGO_TUNE,
  type HeroLogoTune,
  type HeroLogoVAlign,
  isHeroLogoTuneEqual,
  parseHeroLogoTune,
} from "@/lib/hero-logo-tune-shared";

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
  const [tune, setTune] = useState<HeroLogoTune>(DEFAULT_HERO_LOGO_TUNE);
  const [saved, setSaved] = useState<HeroLogoTune>(DEFAULT_HERO_LOGO_TUNE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const response = await adminFetch("/api/admin/hero-logo-tune");
        const data = (await response.json().catch(() => ({}))) as {
          tune?: unknown;
        };
        if (cancelled) return;
        const next = parseHeroLogoTune(data.tune);
        setTune(next);
        setSaved(next);
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

  const save = async () => {
    setSaving(true);
    try {
      const payload = parseHeroLogoTune(tune);
      const response = await adminFetch(
        "/api/admin/hero-logo-tune",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tune: payload }),
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
      setSaved(next);
      showToast(
        "success",
        "Saved. Open the site homepage (/) and hard-refresh to confirm.",
      );
      /* Bust Cloudflare / browser cache on the public homepage. */
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

  return (
    <div className="space-y-6">
      <div>
        <p
          className="admin-section-label mb-2"
          style={{ color: "var(--accent)" }}
        >
          Temporary
        </p>
        <h1 className="admin-page-title">Hero Logo Tune</h1>
        <p className="admin-page-subtitle max-w-2xl">
          Preview is full browser width (same as the hero). Left: H A T between
          the left edge and Book Now. Right: H O R between Book Now and the right
          edge. Each gap spacer is exact — letters shrink to stay in their zone.
        </p>
      </div>

      <div className="admin-card space-y-8 p-6">
        {loading ? (
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--muted)" }}
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading saved values…
          </div>
        ) : null}

        <HeroLogoTunePreview tune={tune} />

        <fieldset
          disabled={saving}
          className="space-y-8 border-0 p-0 m-0 min-w-0"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
            <section className="hlt-section">
              <h2 className="admin-heading text-base">Position · Alignment</h2>
              <p className="hlt-section__hint">
                Shared top / middle / bottom line for letter frames (like Figma).
              </p>
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
            </section>

            <section className="hlt-section">
              <h2 className="admin-heading text-base">Overall</h2>
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
            </section>

            <section className="hlt-section">
              <h2 className="admin-heading text-base">Screen edge → outer letters</h2>
              <p className="hlt-section__hint">
                H stays at the left edge limit; R at the right. Letter gaps below
                push the free letters inward toward Book Now — they are not glued
                as HAT / HOR blocks.
              </p>
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
            </section>

            <section className="hlt-section">
              <h2 className="admin-heading text-base">
                T ↔ Book Now ↔ H (center)
              </h2>
              <p className="hlt-section__hint">
                Exact pixel gap from the letter to the 168px Book Now slot.
                These always move the space — they are not swallowed by empty
                side room.
              </p>
              <div className="hlt-grid">
                <NumberField
                  label="T → Book Now"
                  hint="Padding after T to the button"
                  value={tune.gapTButton}
                  min={-100}
                  max={800}
                  onChange={(gapTButton) => patch({ gapTButton })}
                />
                <NumberField
                  label="Book Now → H"
                  hint="Padding from the button to right H"
                  value={tune.gapButtonH}
                  min={-100}
                  max={800}
                  onChange={(gapButtonH) => patch({ gapButtonH })}
                />
              </div>
            </section>

            <section className="hlt-section">
              <h2 className="admin-heading text-base">Spacing between letters</h2>
              <p className="hlt-section__hint">
                Exact px between those two letters. Wider gaps make neighboring
                letters slightly narrower so everything stays between the edge
                and Book Now — R never clips off the side.
              </p>
              <div className="hlt-grid">
                <NumberField
                  label="H → A"
                  value={tune.gapHA}
                  min={-100}
                  max={800}
                  onChange={(gapHA) => patch({ gapHA })}
                />
                <NumberField
                  label="A → T"
                  value={tune.gapAT}
                  min={-100}
                  max={800}
                  onChange={(gapAT) => patch({ gapAT })}
                />
                <NumberField
                  label="H → O (right)"
                  value={tune.gapHO}
                  min={-100}
                  max={800}
                  onChange={(gapHO) => patch({ gapHO })}
                />
                <NumberField
                  label="O → R"
                  value={tune.gapOR}
                  min={-100}
                  max={800}
                  onChange={(gapOR) => patch({ gapOR })}
                />
              </div>
            </section>

            <section className="hlt-section">
              <h2 className="admin-heading text-base">Fine nudge (per letter)</h2>
              <p className="hlt-section__hint">
                Extra up (−) / down (+) after alignment. Independent per letter.
              </p>
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
            </section>
        </fieldset>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            className="admin-btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-60"
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            {dirty ? "Save to live site" : "Save again to live"}
          </button>
          <button
            type="button"
            className="admin-btn-outline inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-60"
            disabled={saving || !dirty}
            onClick={() => setTune(saved)}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Undo unsaved
          </button>
          <a
            href={`/?logoRefresh=1&t=${Date.now()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn-outline inline-flex items-center gap-2 px-4 py-2.5 text-sm"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Open homepage
          </a>
        </div>
      </div>
    </div>
  );
}
