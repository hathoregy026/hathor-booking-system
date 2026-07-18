"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, RotateCcw, Save } from "lucide-react";
import { HeroLogoTunePreview } from "@/components/admin/HeroLogoTunePreview";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch, isTransientFetchError } from "@/lib/admin-fetch";
import {
  DEFAULT_HERO_LOGO_TUNE,
  type HeroLogoAlign,
  type HeroLogoTune,
  isHeroLogoTuneEqual,
  parseHeroLogoTune,
} from "@/lib/hero-logo-tune-shared";

function SliderRow({
  label,
  hint,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="admin-heading text-sm">{label}</span>
        <span className="font-mono text-sm" style={{ color: "var(--accent)" }}>
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent)]"
      />
      <p className="text-xs" style={{ color: "var(--muted)" }}>
        {hint}
      </p>
    </label>
  );
}

const ALIGN_OPTIONS: { value: HeroLogoAlign; label: string }[] = [
  { value: "top", label: "Top" },
  { value: "center", label: "Center" },
  { value: "bottom", label: "Bottom" },
];

export function HeroLogoTunePanel() {
  const { showToast } = useToast();
  const [tune, setTune] = useState<HeroLogoTune>(DEFAULT_HERO_LOGO_TUNE);
  const [saved, setSaved] = useState<HeroLogoTune>(DEFAULT_HERO_LOGO_TUNE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminFetch("/api/admin/hero-logo-tune");
      if (!response.ok) throw new Error("load failed");
      const data = (await response.json()) as { tune?: unknown };
      const next = parseHeroLogoTune(data.tune);
      setTune(next);
      setSaved(next);
    } catch (error) {
      if (!isTransientFetchError(error)) {
        showToast("error", "Could not load logo settings.");
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty = !isHeroLogoTuneEqual(tune, saved);

  const save = async () => {
    setSaving(true);
    try {
      const response = await adminFetch("/api/admin/hero-logo-tune", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tune }),
      });
      if (!response.ok) throw new Error("save failed");
      const data = (await response.json()) as { tune?: unknown };
      const next = parseHeroLogoTune(data.tune);
      setTune(next);
      setSaved(next);
      showToast("success", "Saved — hard-refresh the homepage to see it.");
    } catch (error) {
      if (!isTransientFetchError(error)) {
        showToast("error", "Could not save logo settings.");
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
          Move sliders and watch the preview update instantly. Click Save when
          you like it, then hard-refresh the live homepage. When finished, tell
          the developer to hardcode these values and remove this page.
        </p>
      </div>

      {!loading && <HeroLogoTunePreview tune={tune} />}

      <div className="admin-card space-y-6 p-6">
        {loading ? (
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--muted)" }}
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading…
          </div>
        ) : (
          <>
            <div>
              <p className="admin-heading mb-3 text-sm">Letter alignment</p>
              <div className="flex flex-wrap gap-2">
                {ALIGN_OPTIONS.map((opt) => {
                  const active = tune.align === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={
                        active
                          ? "admin-btn-primary px-4 py-2 text-sm"
                          : "admin-btn-outline px-4 py-2 text-sm"
                      }
                      onClick={() =>
                        setTune((t) => ({ ...t, align: opt.value }))
                      }
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                How H / A / T / H / O / R line up with each other (tops, middles,
                or bottoms).
              </p>
            </div>

            <SliderRow
              label="Size"
              hint="1.00 = default size. Lower = smaller, higher = bigger."
              value={tune.size}
              min={0.55}
              max={1.45}
              step={0.01}
              display={`${tune.size.toFixed(2)}×`}
              onChange={(size) => setTune((t) => ({ ...t, size }))}
            />
            <SliderRow
              label="Distance from screen edges"
              hint="Space from the left and right edges of the screen. 0 = touching the edges."
              value={tune.edgeInset}
              min={0}
              max={120}
              step={1}
              display={`${tune.edgeInset}px`}
              onChange={(edgeInset) => setTune((t) => ({ ...t, edgeInset }))}
            />
            <SliderRow
              label="Space between letters"
              hint="Gap between neighboring letters (H–A–T and H–O–R). Can go slightly negative to pull them tighter."
              value={tune.letterGap}
              min={-20}
              max={80}
              step={1}
              display={`${tune.letterGap}px`}
              onChange={(letterGap) => setTune((t) => ({ ...t, letterGap }))}
            />
            <SliderRow
              label="Center gap (Book Now space)"
              hint="Width of the empty middle between T and H where Book Now sits."
              value={tune.centerGap}
              min={100}
              max={280}
              step={1}
              display={`${tune.centerGap}px`}
              onChange={(centerGap) => setTune((t) => ({ ...t, centerGap }))}
            />
            <SliderRow
              label="Bottom position (Y)"
              hint="Negative = lower (tuck under cream sheet). Positive = higher."
              value={tune.y}
              min={-220}
              max={160}
              step={1}
              display={`${tune.y}px`}
              onChange={(y) => setTune((t) => ({ ...t, y }))}
            />
            <SliderRow
              label="Book Now vertical nudge"
              hint="Fine-tune the button up (−) or down (+) relative to the letters."
              value={tune.ctaNudge}
              min={-80}
              max={80}
              step={1}
              display={`${tune.ctaNudge}px`}
              onChange={(ctaNudge) => setTune((t) => ({ ...t, ctaNudge }))}
            />
            <SliderRow
              label="Animation speed (duration)"
              hint="How long letters take to rise. Higher = slower. Default 2.6s."
              value={tune.animDuration}
              min={0.6}
              max={5}
              step={0.1}
              display={`${tune.animDuration.toFixed(1)}s`}
              onChange={(animDuration) =>
                setTune((t) => ({ ...t, animDuration }))
              }
            />
          </>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            className="admin-btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-60"
            disabled={loading || saving || !dirty}
            onClick={() => void save()}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            Save to live site
          </button>
          <button
            type="button"
            className="admin-btn-outline inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-60"
            disabled={loading || saving}
            onClick={() => setTune(saved)}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Undo unsaved
          </button>
          <a
            href="/"
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
