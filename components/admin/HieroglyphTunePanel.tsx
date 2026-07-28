"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch, isTransientFetchError } from "@/lib/admin-fetch";
import {
  DEFAULT_HIEROGLYPH_TUNE,
  type HieroglyphTune,
  isHieroglyphTuneEqual,
  parseHieroglyphTune,
} from "@/lib/hieroglyph-tune-shared";

const TILE_URL = "/branding/egyptian-hyroglyphs-hathor-cruise-solid-v2.webp";

function NumberField({
  label,
  hint,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  displayMultiplier,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  /** Show value × multiplier in the live readout (e.g. 100 for %). */
  displayMultiplier?: number;
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

  const live =
    displayMultiplier != null
      ? `${(value * displayMultiplier).toFixed(1)}%`
      : step < 1
        ? `${Number(value).toFixed(3)}${suffix}`
        : `${value}${suffix}`;

  return (
    <label className="hlt-field">
      <span className="hlt-field__label">
        {label}
        <span className="hlt-field__live">{live}</span>
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
        <span className="hlt-field__suffix">{suffix || "\u00a0"}</span>
      </span>
      {hint ? <span className="hlt-field__hint">{hint}</span> : null}
    </label>
  );
}

function GlyphPreview({
  opacity,
  tileSize,
  cream,
  label,
}: {
  opacity: number;
  tileSize: number;
  cream: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          height: 160,
          backgroundColor: cream,
          border: "1px solid var(--border)",
        }}
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("${TILE_URL}")`,
            backgroundRepeat: "repeat",
            backgroundPosition: "center top",
            backgroundSize: `${tileSize}px auto`,
            opacity,
          }}
        />
      </div>
    </div>
  );
}

export function HieroglyphTunePanel() {
  const { showToast } = useToast();
  const [tune, setTune] = useState<HieroglyphTune>(DEFAULT_HIEROGLYPH_TUNE);
  const [saved, setSaved] = useState<HieroglyphTune>(DEFAULT_HIEROGLYPH_TUNE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dirty = !isHieroglyphTuneEqual(tune, saved);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await adminFetch("/api/admin/hieroglyph-tune");
        const data = (await response.json()) as { tune?: unknown };
        if (cancelled) return;
        const next = parseHieroglyphTune(data.tune);
        setTune(next);
        setSaved(next);
      } catch (error) {
        if (cancelled) return;
        if (!isTransientFetchError(error)) {
          showToast("error", "Could not load glyph settings.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const patch = (partial: Partial<HieroglyphTune>) => {
    setTune((prev) => ({ ...prev, ...partial }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await adminFetch("/api/admin/hieroglyph-tune", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tune }),
      });
      const data = (await response.json()) as { tune?: unknown; ok?: boolean };
      if (!response.ok || data.ok === false) {
        throw new Error("Save failed");
      }
      const next = parseHieroglyphTune(data.tune);
      setTune(next);
      setSaved(next);
      showToast("success", "Glyph background saved to live site.");
      void fetch(`/api/hieroglyph-tune?t=${Date.now()}`, { cache: "no-store" }).catch(
        () => undefined,
      );
    } catch (error) {
      if (!isTransientFetchError(error)) {
        showToast("error", "Could not save glyph settings.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-page-title">Background Glyphs</h1>
        <p className="admin-page-subtitle max-w-2xl">
          Control the cream-page hieroglyph pattern opacity and tile size. Day
          and night each have their own transparency; size is shared across
          themes with a separate phone size.
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

        <div
          className="grid gap-4 sm:grid-cols-2"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          <GlyphPreview
            label="Day preview"
            cream="#ece8df"
            opacity={tune.dayOpacity}
            tileSize={tune.tileSize}
          />
          <GlyphPreview
            label="Night preview"
            cream="#0b0907"
            opacity={tune.nightOpacity}
            tileSize={tune.tileSize}
          />
        </div>

        <fieldset
          disabled={saving || loading}
          className="m-0 min-w-0 space-y-8 border-0 p-0"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          <section className="hlt-section">
            <h2 className="admin-heading text-base">Transparency</h2>
            <p className="hlt-section__hint">
              How visible the gold glyphs are on cream (day) and dark (night)
              backgrounds. 0% = hidden, higher = stronger pattern.
            </p>
            <div className="hlt-grid">
              <NumberField
                label="Day opacity"
                hint="Default 5.6% · enter 0–0.35 (shown as %)"
                value={tune.dayOpacity}
                min={0}
                max={0.35}
                step={0.001}
                suffix=""
                displayMultiplier={100}
                onChange={(dayOpacity) => patch({ dayOpacity })}
              />
              <NumberField
                label="Night opacity"
                hint="Default 2% · enter 0–0.35 (shown as %)"
                value={tune.nightOpacity}
                min={0}
                max={0.35}
                step={0.001}
                suffix=""
                displayMultiplier={100}
                onChange={(nightOpacity) => patch({ nightOpacity })}
              />
            </div>
          </section>

          <section className="hlt-section">
            <h2 className="admin-heading text-base">Tile size</h2>
            <p className="hlt-section__hint">
              Width of each repeating glyph tile. Larger = fewer, bigger glyphs;
              smaller = denser pattern.
            </p>
            <div className="hlt-grid">
              <NumberField
                label="Desktop size"
                hint="Default 320px"
                value={tune.tileSize}
                min={80}
                max={800}
                step={4}
                suffix="px"
                onChange={(tileSize) => patch({ tileSize })}
              />
              <NumberField
                label="Phone size"
                hint="Default 240px · ≤768px screens"
                value={tune.tileSizeMobile}
                min={60}
                max={600}
                step={4}
                suffix="px"
                onChange={(tileSizeMobile) => patch({ tileSizeMobile })}
              />
            </div>
          </section>
        </fieldset>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            className="admin-btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-60"
            disabled={saving || loading}
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
          <button
            type="button"
            className="admin-btn-outline inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-60"
            disabled={saving || loading}
            onClick={() => setTune(DEFAULT_HIEROGLYPH_TUNE)}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset to defaults
          </button>
          <a
            href={`/?t=${Date.now()}`}
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
