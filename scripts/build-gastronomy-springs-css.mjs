/**
 * Scope springs global.css + design.css under .gastronomy-springs-page
 * Run: node scripts/build-gastronomy-springs-css.mjs
 */
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import prefixwrap from "postcss-prefixwrap";

const root = process.cwd();
const scope = ".gastronomy-springs-page";

async function scopeFile(inputName, outputName) {
  const input = path.join(root, "app", inputName);
  const output = path.join(root, "app", outputName);
  const css = fs.readFileSync(input, "utf8");
  const result = await postcss([prefixwrap(scope)]).process(css, { from: input });
  fs.writeFileSync(output, result.css);
  console.log(`scoped ${inputName} -> ${outputName} (${result.css.length} bytes)`);
}

await scopeFile("gastronomy-springs-global.raw.css", "gastronomy-springs-global.scoped.css");
await scopeFile("gastronomy-springs-design.raw.css", "gastronomy-springs-design.scoped.css");
console.log("done");
