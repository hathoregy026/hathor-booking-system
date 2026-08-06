import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "public", "gastronomy-springs", "assets", "stylesheets");
for (const f of ["global.css", "design.css"]) {
  const p = path.join(dir, f);
  let css = fs.readFileSync(p, "utf8");
  css = css.replaceAll("url(/assets/", "url(/gastronomy-springs/assets/");
  css = css.replaceAll("url('/assets/", "url('/gastronomy-springs/assets/");
  css = css.replaceAll('url("/assets/', 'url("/gastronomy-springs/assets/');
  fs.writeFileSync(p, css);
  console.log("rewrote", f);
}

const html = fs.readFileSync(path.join(process.cwd(), "lib", "gastronomy-springs-html.ts"), "utf8");
console.log({
  hathor: html.includes("Hathor Flavors"),
  intro: html.includes("de-intro"),
  hero: html.includes("dining-hero"),
  springsLeft: (html.match(/springs\.estate/g) || []).length,
});
