/**
 * Point webpack publicPath at /accommodation-springs/assets/javascripts/
 * so Design page lazy chunks resolve correctly.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const shared = path.join(
  root,
  "public",
  "accommodation-springs",
  "assets",
  "javascripts",
  "shared.js",
);

if (!fs.existsSync(shared)) {
  throw new Error(
    `Missing ${shared} — run sync-accommodation-springs-assets first`,
  );
}

let js = fs.readFileSync(shared, "utf8");
js = js.replaceAll(
  'o.p="/assets/javascripts/"',
  'o.p="/accommodation-springs/assets/javascripts/"',
);
js = js.replaceAll(
  'o.p="/suites-springs/assets/javascripts/"',
  'o.p="/accommodation-springs/assets/javascripts/"',
);
js = js.replaceAll(
  'o.p="/gastronomy-springs/assets/javascripts/"',
  'o.p="/accommodation-springs/assets/javascripts/"',
);
fs.writeFileSync(shared, js);
console.log("patched accommodation-springs shared.js publicPath");
