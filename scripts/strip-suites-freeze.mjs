import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const htmlPath = path.resolve(
  process.cwd(),
  "public/suites-normal/index.html",
);

export function stripSuitesFreezeScripts(html) {
  let next = html.replace(
    /<script id="hathor-freeze-guard">[\s\S]*?<\/script>/i,
    "",
  );
  next = next.replace(
    /<script id="cookie-law-info-js-extra">[\s\S]*?<\/script>\s*/i,
    "",
  );
  next = next.replace(
    /<script id="cookie-law-info-js"[^>]*><\/script>\s*/i,
    "",
  );
  next = next.replace(/<script id="YT-js"[^>]*><\/script>\s*/i, "");
  next = next.replace(
    /<script id="wp-emoji-settings"[\s\S]*?<\/script>\s*/i,
    "",
  );
  next = next.replace(
    /<script type="module">\s*\/\*! This file is auto-generated \*\/[\s\S]*?wp-emoji-loader[\s\S]*?<\/script>\s*/i,
    "",
  );
  next = next.replace(
    /window\.addEventListener\('LazyLoad::Initialized'[\s\S]*?src="scripts\/vendor\/lazyload\.min\.js"><\/script>/i,
    "",
  );
  return next;
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === thisFile) {
  const html = await readFile(htmlPath, "utf8");
  await writeFile(htmlPath, stripSuitesFreezeScripts(html), "utf8");
  console.log("stripped freeze scripts from suites-normal/index.html");
}
