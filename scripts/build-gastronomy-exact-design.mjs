/**
 * Publishes the captured Springs Design document as an isolated static page.
 *
 * It intentionally retains the original document, body shell, CSS and script
 * order. The React public shell must not own this experience because it alters
 * the original smooth-scroll / Barba lifecycle.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = path.join(
  root,
  "assets",
  "CLONE. httpssprings.estate",
  "design",
  "index.html",
);
const destinationDir = path.join(
  root,
  "public",
  "gastronomy-springs",
  "design",
);
const destination = path.join(destinationDir, "index.html");

let html = fs.readFileSync(source, "utf8");

// Serve captured scripts and styles from this app. They run in the standalone
// document at parse time, exactly as in the captured Springs page.
html = html.replaceAll(
  'href="/assets/',
  'href="/gastronomy-springs/assets/',
);
html = html.replaceAll(
  'src="/assets/',
  'src="/gastronomy-springs/assets/',
);
html = html.replaceAll(
  'data-src="/assets/',
  'data-src="/gastronomy-springs/assets/',
);
html = html.replaceAll(
  'srcset="/assets/',
  'srcset="/gastronomy-springs/assets/',
);
html = html.replaceAll(
  'data-srcset="/assets/',
  'data-srcset="/gastronomy-springs/assets/',
);
html = html.replaceAll(
  "xlink:href=\"&#x2F;assets&#x2F;",
  'xlink:href="&#x2F;gastronomy-springs&#x2F;assets&#x2F;',
);
html = html.replaceAll(
  'href="&#x2F;assets&#x2F;',
  'href="&#x2F;gastronomy-springs&#x2F;assets&#x2F;',
);

// The HAR capture keeps all content images at their original public source.
// Preserve them as absolute assets rather than replacing them with unrelated
// dining images or broken local cache paths.
html = html.replaceAll("https://springs.estate/", "https://springs.house/");
html = html.replace(
  /(["'(])\/media\//g,
  "$1https://springs.house/media/",
);
html = html.replaceAll(
  "/gastronomy-springs/assets/images/",
  "https://springs.house/assets/images/",
);
html = html.replaceAll(
  "&#x2F;gastronomy-springs&#x2F;assets&#x2F;images&#x2F;",
  "https:&#x2F;&#x2F;springs.house&#x2F;assets&#x2F;images&#x2F;",
);

// Browser-message was not included in the capture and is nonessential to the
// page itself. Omitting only that optional helper prevents a 404.
html = html.replace(
  /<script[^>]*browser-message\/browser-message\.js[^>]*><\/script>/g,
  "",
);

fs.mkdirSync(destinationDir, { recursive: true });
fs.writeFileSync(destination, html);
console.log(`Wrote exact standalone Design document: ${destination}`);
