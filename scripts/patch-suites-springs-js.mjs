/**
 * Point webpack publicPath at /suites-springs/assets/javascripts/
 * so lazy chunks (webgl-wellness, webgl-nature, etc.) resolve correctly.
 *
 * Also slows the hero gallery mosaic drift for a more luxurious pace.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const jsDir = path.join(root, "public", "suites-springs", "assets", "javascripts");
const shared = path.join(jsDir, "shared.js");
const landing = path.join(jsDir, "landing.js");

if (!fs.existsSync(shared)) {
  throw new Error(`Missing ${shared} — run sync-suites-springs-assets first`);
}

let js = fs.readFileSync(shared, "utf8");
js = js.replaceAll(
  'o.p="/assets/javascripts/"',
  'o.p="/suites-springs/assets/javascripts/"',
);
js = js.replaceAll(
  'o.p="/gastronomy-springs/assets/javascripts/"',
  'o.p="/suites-springs/assets/javascripts/"',
);
fs.writeFileSync(shared, js);
console.log("patched suites-springs shared.js publicPath");

if (fs.existsSync(landing)) {
  let landingJs = fs.readFileSync(landing, "utf8");
  // Springs default gallery loop is 30000ms. Stretch to ~55s for slower,
  // smoother card drift (luxury pacing). Rebuild-safe: only replace stock value.
  const before = landingJs;
  landingJs = landingJs.replace(
    /this\.duration=3e4/,
    "this.duration=55e3",
  );
  if (landingJs === before && !landingJs.includes("this.duration=55e3")) {
    console.warn("warn: gallery duration patch did not match landing.js");
  } else {
    fs.writeFileSync(landing, landingJs);
    console.log("patched suites-springs landing.js gallery duration → 55s");
  }
}
