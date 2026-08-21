import fs from "fs";

const css = fs.readFileSync(
  "assets/CLONE. httpssprings.estate/assets/stylesheets/infrastructure.css",
  "utf8",
);

const patterns = [
  /\.i-slider[^{]*\{[^}]*\}/g,
  /\.i-slider__[^{]*\{[^}]*\}/g,
  /@media[^{]+\{(?:[^{}]|\{[^}]*\})*\}/g,
];

const hits = new Set();
for (const re of patterns) {
  for (const m of css.matchAll(re)) {
    if (m[0].includes("i-slider")) hits.add(m[0]);
  }
}

// also pull nearby by index search
const idx = css.indexOf(".i-slider");
console.log("first i-slider index", idx);
console.log(css.slice(Math.max(0, idx - 40), idx + 2500));
