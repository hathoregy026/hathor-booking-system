import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const htmlPath = path.resolve(
  process.cwd(),
  "public/suites-normal/index.html",
);

const FREEZE_GUARD = `<script id="hathor-freeze-guard">(function(){var O=window.MutationObserver;if(!O)return;function G(cb){var obs=new O(cb);var n=obs.observe.bind(obs);obs.observe=function(t,o){if(t&&o&&o.subtree&&(t===document.documentElement||t===document.body||t.tagName==="HTML"||t.tagName==="BODY"))return;return n(t,o);};return obs;}G.prototype=O.prototype;window.MutationObserver=G;})();</script>`;

export function stripSuitesFreezeScripts(html) {
  let next = html;
  if (!next.includes('id="hathor-freeze-guard"')) {
    next = next.replace("<head>", `<head>${FREEZE_GUARD}`);
  }
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
