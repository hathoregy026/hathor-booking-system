import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const jsDir = path.join(root, "public", "gastronomy-springs", "assets", "javascripts");
const srcJs = path.join(root, "assets", "CLONE. httpssprings.estate", "assets", "javascripts");

for (const name of ["1.js", "31.js", "plan-lazy.js", "popover-lazy.js", "shared.js", "design.js"]) {
  const from = path.join(srcJs, name);
  const to = path.join(jsDir, name);
  if (fs.existsSync(from)) fs.copyFileSync(from, to);
}

const shared = path.join(jsDir, "shared.js");
let js = fs.readFileSync(shared, "utf8");
js = js.replaceAll(
  'o.p="/assets/javascripts/"',
  'o.p="/gastronomy-springs/assets/javascripts/"',
);
fs.writeFileSync(shared, js);
console.log("patched shared.js publicPath");

const css = fs.readFileSync(
  path.join(root, "public", "gastronomy-springs", "assets", "stylesheets", "global.css"),
  "utf8",
);
const fonts = [...css.matchAll(/url\(([^)]+\.(?:woff2?|otf|ttf)[^)]*)\)/gi)].map((m) =>
  m[1].replace(/["']/g, ""),
);
console.log("font urls", [...new Set(fonts)].slice(0, 20));
