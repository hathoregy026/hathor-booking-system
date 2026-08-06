import fs from "node:fs";

const h = fs.readFileSync("lib/gastronomy-springs-html.ts", "utf8");
const urls = [...h.matchAll(/springs\.estate[^"\\s]{0,120}/g)].map((m) => m[0]);
console.log([...new Set(urls)]);
