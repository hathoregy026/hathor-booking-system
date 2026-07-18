"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch, isTransientFetchError } from "@/lib/admin-fetch";
import {
  DEFAULT_HERO_LOGO_TUNE,
  type HeroLogoTune,
  isHeroLogoTuneEqual,
  parseHeroLogoTune,
} from "@/lib/hero-logo-tune-shared";

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
  return (
    <label className="hlt-field">
      <span className="hlt-field__label">{label}</span>
      <span className="hlt-field__input-wrap">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (!Number.isFinite(next)) return;
            onChange(Math.min(max, Math.max(min, next)));
          }}
          className="hlt-field__input"
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

  const patch = (partial: Partial<HeroLogoTune>) =>
    setTune((t) => ({ ...t, ...partial }));

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
          Type numbers in the boxes (no sliders). Save, then hard-refresh the
          homepage. When it looks right, tell the developer to hardcode the
          values and remove this page.
        </p>
      </div>

      <div className="admin-card space-y-8 p-6">
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
            <section className="hlt-section">
              <h2 className="admin-heading text-base">Overall</h2>
              <div className="hlt-grid">
                <NumberField
                  label="Size"
                  hint="1 = default. Try 0.9–1.2"
                  value={tune.size}
                  min={0.55}
                  max={1.45}
                  step={0.01}
                  suffix="×"
                  onChange={(size) => patch({ size })}
                />
                <NumberField
                  label="Bottom position (Y)"
                  hint="Negative = lower / tuck under sheet"
                  value={tune.y}
                  min={-220}
                  max={160}
                  onChange={(y) => patch({ y })}
                />
                <NumberField
                  label="Edge inset (left & right)"
                  hint="Space from screen edges"
                  value={tune.edgeInset}
                  min={0}
                  max={120}
                  onChange={(edgeInset) => patch({ edgeInset })}
                />
                <NumberField
                  label="Center gap (Book Now)"
                  hint="Empty middle between T and H"
                  value={tune.centerGap}
                  min={80}
                  max={320}
                  onChange={(centerGap) => patch({ centerGap })}
                />
                <NumberField
                  label="Book Now vertical nudge"
                  value={tune.ctaNudge}
                  min={-80}
                  max={80}
                  onChange={(ctaNudge) => patch({ ctaNudge })}
                />
                <NumberField
                  label="Animation duration"
                  hint="Higher = slower rise"
                  value={tune.animDuration}
                  min={0.6}
                  max={5}
                  step={0.1}
                  suffix="s"
                  onChange={(animDuration) => patch({ animDuration })}
                />
              </div>
            </section>

            <section className="hlt-section">
              <h2 className="admin-heading text-base">
                Spacing between letters
              </h2>
              <p className="hlt-section__hint">
                Each box is the gap after that letter, before the next one.
              </p>
              <div className="hlt-grid">
                <NumberField
                  label="H → A"
                  value={tune.gapHA}
                  min={-40}
                  max={120}
                  onChange={(gapHA) => patch({ gapHA })}
                />
                <NumberField
                  label="A → T"
                  value={tune.gapAT}
                  min={-40}
                  max={120}
                  onChange={(gapAT) => patch({ gapAT })}
                />
                <NumberField
                  label="H → O (right side)"
                  value={tune.gapHO}
                  min={-40}
                  max={120}
                  onChange={(gapHO) => patch({ gapHO })}
                />
                <NumberField
                  label="O → R"
                  value={tune.gapOR}
                  min={-40}
                  max={120}
                  onChange={(gapOR) => patch({ gapOR })}
                />
              </div>
            </section>

            <section className="hlt-section">
              <h2 className="admin-heading text-base">
                Alignment (per letter vertical)
              </h2>
              <p className="hlt-section__hint">
                Move each letter up (−) or down (+) on its own. Units are pixels.
              </p>
              <div className="hlt-grid">
                <NumberField
                  label="H (left)"
                  value={tune.yH1}
                  min={-80}
                  max={80}
                  onChange={(yH1) => patch({ yH1 })}
                />
                <NumberField
                  label="A"
                  value={tune.yA}
                  min={-80}
                  max={80}
                  onChange={(yA) => patch({ yA })}
                />
                <NumberField
                  label="T"
                  value={tune.yT}
                  min={-80}
                  max={80}
                  onChange={(yT) => patch({ yT })}
                />
                <NumberField
                  label="H (right)"
                  value={tune.yH2}
                  min={-80}
                  max={80}
                  onChange={(yH2) => patch({ yH2 })}
                />
                <NumberField
                  label="O"
                  value={tune.yO}
                  min={-80}
                  max={80}
                  onChange={(yO) => patch({ yO })}
                />
                <NumberField
                  label="R"
                  value={tune.yR}
                  min={-80}
                  max={80}
                  onChange={(yR) => patch({ yR })}
                />
              </div>
            </section>
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
