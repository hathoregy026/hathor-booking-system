/**
 * Point webpack publicPath at /suites-springs/assets/javascripts/
 * so lazy chunks (webgl-wellness, webgl-nature, etc.) resolve correctly.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const jsDir = path.join(root, "public", "suites-springs", "assets", "javascripts");
const shared = path.join(jsDir, "shared.js");

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
