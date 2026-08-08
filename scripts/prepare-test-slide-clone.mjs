/**
 * Prepare a static Springs infrastructure clone for /test-slide.
 * Source: assets/CLONE. httpssprings.estate — no Hathor remapping.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const cloneRoot = path.join(root, "assets", "CLONE. httpssprings.estate");
const outRoot = path.join(root, "public", "springs-layout");
const htmlSrc = path.join(cloneRoot, "infrastructure", "index.html");
const SPRINGS = "https://springs.estate";

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyIfExists(rel) {
  const from = path.join(cloneRoot, rel);
  if (!fs.existsSync(from)) {
    console.warn("missing", rel);
    return false;
  }
  const to = path.join(outRoot, rel);
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
  return true;
}

function rewriteCssUrls(text) {
  return text
    .replace(/url\(\s*(['"]?)\/assets\//g, `url($1${SPRINGS}/assets/`)
    .replace(/url\(\s*(['"]?)\.\.\/assets\//g, `url($1${SPRINGS}/assets/`);
}

const html = fs.readFileSync(htmlSrc, "utf8");
const sectionIds = [...html.matchAll(/\bid="(i-[^"]+)"/g)].map((m) => m[1]);

const required = [
  "assets/stylesheets/global.css",
  "assets/stylesheets/infrastructure.css",
  "assets/stylesheets/browser-message.css",
  "assets/javascripts/shared.js",
  "assets/javascripts/infrastructure.js",
  "assets/javascripts/1.js",
  "assets/javascripts/31.js",
  "assets/javascripts/browser-message/browser-message.js",
];

for (const rel of required) copyIfExists(rel);

for (const rel of [
  "assets/stylesheets/global.css",
  "assets/stylesheets/infrastructure.css",
  "assets/stylesheets/browser-message.css",
]) {
  const p = path.join(outRoot, rel);
  if (!fs.existsSync(p)) continue;
  fs.writeFileSync(p, rewriteCssUrls(fs.readFileSync(p, "utf8")), "utf8");
}

let outHtml = html;

/* 1) Entity-encoded /assets/ in SVG use → live Springs */
outHtml = outHtml.replace(/&#x2F;assets&#x2F;/gi, `${SPRINGS}/assets/`);

/* 2) Local stylesheets + javascripts (path + optional query) */
outHtml = outHtml.replace(
  /([*"'])\/assets\/(stylesheets|javascripts)\/([^"'*]+)/g,
  "$1/springs-layout/assets/$2/$3",
);

/* 3) Any remaining root-absolute /assets/ → live Springs */
outHtml = outHtml.replace(
  /([*"'=])\/assets\//g,
  `$1${SPRINGS}/assets/`,
);

outHtml = outHtml.replace(
  "<html",
  '<html data-springs-test-slide="true"',
);

ensureDir(outRoot);
fs.writeFileSync(path.join(outRoot, "index.html"), outHtml, "utf8");

fs.writeFileSync(
  path.join(outRoot, "clone-inventory.json"),
  JSON.stringify(
    {
      source: "assets/CLONE. httpssprings.estate/infrastructure/index.html",
      sections: sectionIds,
      localCssJs: required,
      mediaStrategy: `${SPRINGS} absolute URLs (literal clone)`,
      output: "public/springs-layout/index.html",
      route: "/test-slide",
    },
    null,
    2,
  ),
  "utf8",
);

const cssHref = outHtml.match(/href="([^"]*global\.css[^"]*)"/)?.[1];
const jsSrc = outHtml.match(/src="([^"]*shared\.js[^"]*)"/)?.[1];
console.log("sections", sectionIds);
console.log("global.css →", cssHref);
console.log("shared.js →", jsSrc);
console.log("wrote", path.join(outRoot, "index.html"));
