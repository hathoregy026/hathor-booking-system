"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch, isTransientFetchError } from "@/lib/admin-fetch";
import {
  DEFAULT_HERO_LOGO_TUNE,
  type HeroLogoTune,
  parseHeroLogoTune,
} from "@/lib/hero-logo-tune";

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

  const dirty =
    tune.size !== saved.size ||
    tune.y !== saved.y ||
    tune.ctaNudge !== saved.ctaNudge ||
    tune.animDuration !== saved.animDuration;

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
          Temporary controls for the homepage HATHOR letters. Move the sliders,
          click Save, then hard-refresh the live homepage. When the look is
          final, tell the developer — these values will be hardcoded and this
          page removed.
        </p>
      </div>

      <div className="admin-card space-y-6 p-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading…
          </div>
        ) : (
          <>
            <SliderRow
              label="Size"
              hint="1.00 = default edge-to-edge size. Lower = smaller, higher = bigger."
              value={tune.size}
              min={0.55}
              max={1.45}
              step={0.01}
              display={`${tune.size.toFixed(2)}×`}
              onChange={(size) => setTune((t) => ({ ...t, size }))}
            />
            <SliderRow
              label="Bottom position (Y)"
              hint="Negative numbers move letters down (tuck under the cream sheet). Positive moves them up."
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
              hint="How long the letters take to rise in. Higher = slower. Default is 2.6 seconds."
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
