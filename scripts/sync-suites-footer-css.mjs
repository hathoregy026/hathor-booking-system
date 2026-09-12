/*
 * /suites is a same-origin iframe clone, so app/site-footer.css never reaches
 * the footer injected inside it. This regenerates the clone's copy from the one
 * source of truth, plus the night token block lifted out of app/night-mode.css
 * and the handful of rules the clone needs because button-system.css and the
 * font faces are not loaded in that document.
 *
 * Runs on build. Never hand-edit public/suites-normal/styles/hathor-lux-footer.css.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(root, "app", "site-footer.css");
const NIGHT = join(root, "app", "night-mode.css");
const TARGET = join(
  root,
  "public",
  "suites-normal",
  "styles",
  "hathor-lux-footer.css",
);

/** Pull the `/* ---- Site footer ---- *​/` section out of night-mode.css. */
function nightFooterBlock() {
  const css = readFileSync(NIGHT, "utf8");
  const start = css.indexOf("/* ---- Site footer ----");
  if (start < 0) throw new Error("night-mode.css: site footer section missing");
  const end = css.indexOf("/* ---- Raised cards and hero copy chrome ---- */", start);
  if (end < 0) throw new Error("night-mode.css: end of footer section missing");
  return css.slice(start, end).trimEnd();
}

/**
 * The night footer block is written in terms of --night-*, and those tokens are
 * declared on the HOST document's <html>. Inside the frame they resolve to
 * nothing, which makes every property that references them invalid and drops
 * the footer back to the clone's own colours. So carry the declarations across
 * — read from night-mode.css section 2, never retyped here.
 */
function nightTokenBlock() {
  const css = readFileSync(NIGHT, "utf8");
  const start = css.indexOf("   2. NIGHT TOKENS");
  if (start < 0) throw new Error("night-mode.css: night tokens section missing");
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  if (open < 0 || close < 0) throw new Error("night-mode.css: token block unreadable");
  const decls = [...css.slice(open + 1, close).matchAll(/(--night-[\w-]+)\s*:\s*([^;]+);/g)]
    .map(([, name, value]) => `  ${name}: ${value.trim()};`)
    .join("\n");
  if (!decls) throw new Error("night-mode.css: no --night-* tokens found");
  return `html[data-public-theme="night"] .hathor-lux-footer-host {\n${decls}\n}`;
}

/*
 * The clone document has neither the pill roster nor the site's local fonts.
 * Geometry here mirrors app/button-system.css exactly so the one button design
 * survives the iframe boundary; the faces fall back to the clone's own stacks.
 */
const CLONE_ONLY = `
/* ------------------------------------------------------------------------
   Clone-only additions — see scripts/sync-suites-footer-css.mjs
   ------------------------------------------------------------------------ */

.hathor-lux-footer-host .hf {
  --hf-display: "Italiana", "Gamgote", Georgia, serif;
  --hf-script: "Bastliga One", "Quiet Luxury", cursive;
  --hf-meta-font: "Plus Jakarta Sans", "Helvetica Neue", Arial, sans-serif;
}

/*
 * The clone's own stylesheet colours bare headings and links, and its night
 * theme re-points those variables — both outrank a single footer class. The
 * type roles are restated here so the footer reads the same inside the frame
 * as it does outside it.
 */
.hathor-lux-footer-host .hf .hf__col-title,
.hathor-lux-footer-host .hf .hf__script {
  color: var(--hf-gold);
}

.hathor-lux-footer-host .hf .hf__title,
.hathor-lux-footer-host .hf .hf__eyebrow {
  color: var(--hf-ink);
}

.hathor-lux-footer-host .hf .hf__link {
  color: var(--hf-ink-soft);
}

.hathor-lux-footer-host .hf :is(.hf__legal, .hf__base-link) {
  color: var(--hf-meta);
}

/* The shared pill, restated: same geometry, same states, no roster to inherit.
   The roster's contract is outline-by-default, filled opt-in — kept here. */
.hathor-lux-footer-host .hf__cta {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: max-content;
  min-width: var(--hathor-btn-width, 12.5rem);
  max-width: 100%;
  height: var(--hathor-btn-height, 2.85rem);
  padding: 0 1.75rem;
  border: 1px solid rgba(36, 29, 20, 0.58);
  border-radius: 999px;
  background: transparent;
  color: #241d14;
  font-family: var(--hf-meta-font);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: var(--hathor-btn-tracking, 0.18em);
  line-height: 1;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  white-space: nowrap;
  transition:
    background-color 320ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 320ms cubic-bezier(0.22, 1, 0.36, 1),
    color 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

.hathor-lux-footer-host .hf__cta--fill {
  border-color: #12100c;
  background: #12100c;
  color: #cdb684;
}

@media (hover: hover) and (pointer: fine) {
  .hathor-lux-footer-host .hf__cta:hover {
    border-color: #b69f64;
    background: #b69f64;
    color: #fff;
  }
}

html[data-public-theme="night"] .hathor-lux-footer-host .hf__cta {
  border-color: rgba(240, 233, 220, 0.55);
  color: #ece5d7;
}

html[data-public-theme="night"] .hathor-lux-footer-host .hf__cta--fill {
  border-color: #cbb079;
  background: #cbb079;
  color: #14110d;
}

html[data-public-theme="night"] .hathor-lux-footer-host .hf__cta:hover {
  border-color: #dfc894;
  background: #dfc894;
  color: #14110d;
}

@media (max-width: 680px) {
  .hathor-lux-footer-host .hf__desk {
    align-items: stretch;
    width: 100%;
  }

  .hathor-lux-footer-host .hf__actions {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    align-self: stretch;
    width: 100%;
    gap: 0.5rem;
  }

  .hathor-lux-footer-host .hf__cta {
    flex: 1 1 calc(50% - 0.25rem) !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
    height: var(--hathor-btn-height, 2.7rem) !important;
    padding: 0 0.45rem !important;
    font-size: 0.58rem !important;
    letter-spacing: 0.06em !important;
    white-space: nowrap !important;
    overflow: hidden;
  }
}
`;

const header = `/* GENERATED FILE — do not edit.
   Source: app/site-footer.css + the site-footer block of app/night-mode.css.
   Regenerate with: node scripts/sync-suites-footer-css.mjs
*/

`;

mkdirSync(dirname(TARGET), { recursive: true });
writeFileSync(
  TARGET,
  [
    header + readFileSync(SOURCE, "utf8").trimEnd(),
    nightTokenBlock(),
    nightFooterBlock(),
    CLONE_ONLY.trim(),
  ].join("\n\n") + "\n",
  "utf8",
);

console.log(`[suites-footer-css] wrote ${TARGET}`);
