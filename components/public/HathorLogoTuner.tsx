"use client";

import { useEffect, useState } from "react";

type LogoTune = {
  size: number;
  y: number;
  ctaNudge: number;
};

const DEFAULTS: LogoTune = {
  size: 1,
  y: 0,
  ctaNudge: 0,
};

const STORAGE_KEY = "hathor-logo-tune";

function readQueryEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("logoTune") === "1";
}

function loadStored(): LogoTune {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<LogoTune>;
    return {
      size: typeof parsed.size === "number" ? parsed.size : DEFAULTS.size,
      y: typeof parsed.y === "number" ? parsed.y : DEFAULTS.y,
      ctaNudge:
        typeof parsed.ctaNudge === "number" ? parsed.ctaNudge : DEFAULTS.ctaNudge,
    };
  } catch {
    return DEFAULTS;
  }
}

function applyTune(tune: LogoTune) {
  const hero = document.querySelector<HTMLElement>(
    ".home-hero-container:has(.hero-logo-mark--split)",
  );
  if (!hero) return;
  hero.style.setProperty("--hathor-logo-size", String(tune.size));
  hero.style.setProperty("--hathor-logo-y", `${tune.y}px`);
  hero.style.setProperty("--hathor-cta-y-nudge", `${tune.ctaNudge}px`);
}

/**
 * Live sliders for homepage HATHOR letter size / bottom position.
 * Open with `/?logoTune=1` — values also print as CSS you can paste.
 */
export function HathorLogoTuner() {
  const [enabled, setEnabled] = useState(false);
  const [tune, setTune] = useState<LogoTune>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!readQueryEnabled()) return;
    const initial = loadStored();
    setEnabled(true);
    setTune(initial);
    applyTune(initial);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    applyTune(tune);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tune));
  }, [enabled, tune]);

  if (!enabled) return null;

  const cssSnippet = [
    `  --hathor-logo-size: ${tune.size};`,
    `  --hathor-logo-y: ${tune.y}px;`,
    `  --hathor-cta-y-nudge: ${tune.ctaNudge}px;`,
  ].join("\n");

  const copyCss = async () => {
    try {
      await navigator.clipboard.writeText(cssSnippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <aside
      className="hathor-logo-tuner"
      aria-label="HATHOR logo manual tuning"
    >
      <header className="hathor-logo-tuner__head">
        <strong>Logo tune</strong>
        <span>size + bottom y</span>
      </header>

      <label className="hathor-logo-tuner__row">
        <span>Size ({tune.size.toFixed(2)}×)</span>
        <input
          type="range"
          min={0.55}
          max={1.45}
          step={0.01}
          value={tune.size}
          onChange={(e) =>
            setTune((t) => ({ ...t, size: Number(e.target.value) }))
          }
        />
      </label>

      <label className="hathor-logo-tuner__row">
        <span>Bottom Y ({tune.y}px)</span>
        <input
          type="range"
          min={-600}
          max={400}
          step={1}
          value={tune.y}
          onChange={(e) =>
            setTune((t) => ({ ...t, y: Number(e.target.value) }))
          }
        />
        <small>− lowers / tucks under sheet · + raises</small>
      </label>

      <label className="hathor-logo-tuner__row">
        <span>Book Now Y ({tune.ctaNudge}px)</span>
        <input
          type="range"
          min={-80}
          max={80}
          step={1}
          value={tune.ctaNudge}
          onChange={(e) =>
            setTune((t) => ({ ...t, ctaNudge: Number(e.target.value) }))
          }
        />
      </label>

      <pre className="hathor-logo-tuner__css">{cssSnippet}</pre>
      <div className="hathor-logo-tuner__actions">
        <button type="button" onClick={copyCss}>
          {copied ? "Copied" : "Copy CSS"}
        </button>
        <button
          type="button"
          onClick={() => {
            setTune(DEFAULTS);
            sessionStorage.removeItem(STORAGE_KEY);
          }}
        >
          Reset
        </button>
      </div>
    </aside>
  );
}
