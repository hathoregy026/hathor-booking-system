import fs from "node:fs";

const src = fs
  .readFileSync("assets/GPT SITE RESTORE/styles.css", "utf8")
  .split(/\r?\n/);

const slice = (start, end) => src.slice(start - 1, end).join("\n");

const transform = (block) =>
  block
    .replace(/var\(--serif\)/g, "var(--gd-serif)")
    .replace(/var\(--gold\)/g, "var(--gd-gold)")
    .replace(/var\(--champagne\)/g, "var(--gd-champagne)")
    .replace(/var\(--gutter\)/g, "var(--gd-gutter)")
    .replace(/var\(--ink\)/g, "var(--gd-ink)")
    .replace(/#d8c49a/g, "var(--gd-gold-soft)")
    .replace(/#d4bf86/g, "var(--gd-gold-soft)")
    .replace(/\.v6--dining/g, ".gastronomy-dining-page")
    .replace(/\.v6-progress/g, ".gastronomy-dining-progress")
    .replace(/\.v6-hero__edge/g, ".gastronomy-dining-hero__edge");

const header = `/* GPT SITE RESTORE dining.html — scoped clone for /gastronomy */
.gastronomy-dining-page {
  --gd-gold: var(--public-gold, #b69f64);
  --gd-champagne: var(--public-gold, #b69f64);
  --gd-gold-soft: #d4bf86;
  --gd-serif: var(--public-serif, var(--font-hathor-display, Georgia, serif));
  --gd-sans: var(--public-sans, var(--font-hathor-body, system-ui, sans-serif));
  --gd-gutter: var(--content-gutter, clamp(12px, 2.2vw, 28px));
  --gd-ink: #f3eee4;
  background: #070605;
  color: var(--gd-ink);
  font-family: var(--gd-sans);
  overflow-x: clip;
}

.gastronomy-dining-page img {
  max-width: none;
  display: block;
}

.gastronomy-dining-progress {
  z-index: 2000;
  background: #ffffff24;
  height: 2px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}

.gastronomy-dining-progress i {
  background: var(--gd-gold);
  transform-origin: 0;
  will-change: transform;
  height: 100%;
  display: block;
  transform: scaleX(0);
}

.gastronomy-dining-hero__edge {
  z-index: 8;
  writing-mode: vertical-rl;
  letter-spacing: 0.27em;
  font-size: 7px;
  position: absolute;
  top: 24%;
  left: 27px;
  color: var(--gd-champagne);
  opacity: 0.85;
}
`;

const body = transform(slice(8675, 9681) + "\n" + slice(9683, 9792));
const em = transform(slice(12604, 12634).replace(/\.v6 em,/g, ".gastronomy-dining-page em,"));
const scoped = `
.gastronomy-dining-page p,
.gastronomy-dining-page .dining-hero__copy p,
.gastronomy-dining-page .dining-orbit__copy p,
.gastronomy-dining-page .dining-course__meta p,
.gastronomy-dining-page .dining-wine__copy p,
.gastronomy-dining-page .dining-chef__copy p,
.gastronomy-dining-page .dining-finale__copy p,
.gastronomy-dining-page .dining-gallery__caption {
  color: #f3ebe0;
  opacity: 1;
  text-shadow: 0 2px 22px rgba(0, 0, 0, 0.45);
}

.gastronomy-dining-page .dining-hero__copy > span,
.gastronomy-dining-page .dining-orbit__copy > span,
.gastronomy-dining-page .dining-course__meta > span,
.gastronomy-dining-page .dining-wine__copy > span,
.gastronomy-dining-page .dining-chef__copy > span,
.gastronomy-dining-page .dining-finale__copy > span,
.gastronomy-dining-page .dining-cascade__sticky > header span {
  color: var(--gd-gold-soft);
  opacity: 1;
}
`;

fs.writeFileSync("app/gastronomy-dining.css", header + body + "\n" + em + scoped);
console.log("Wrote app/gastronomy-dining.css");
