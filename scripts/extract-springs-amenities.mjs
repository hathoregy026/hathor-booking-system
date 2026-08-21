import fs from "fs";

const html = fs.readFileSync(
  "assets/CLONE. httpssprings.estate/infrastructure/index.html",
  "utf8",
);
const css = fs.readFileSync(
  "assets/CLONE. httpssprings.estate/assets/stylesheets/infrastructure.css",
  "utf8",
);
const js = fs.readFileSync(
  "assets/CLONE. httpssprings.estate/assets/javascripts/shared.js",
  "utf8",
);

const ids = ["i-intro", "i-video", "i-slider", "i-opening"];
const nextAfter = {
  "i-intro": "i-video",
  "i-video": "i-slider",
  "i-slider": "i-opening",
  "i-opening": "i-garden",
};

for (const id of ids) {
  const marker = `id="${id}"`;
  const start = html.indexOf(marker);
  if (start < 0) {
    console.log("MISSING", id);
    continue;
  }
  let s = html.lastIndexOf("<div", start);
  if (s < 0) s = html.lastIndexOf("<", start);
  const next = nextAfter[id];
  let end = html.indexOf(`id="${next}"`, start + 10);
  if (end < 0) end = start + 30000;
  // walk back from next id to a reasonable boundary
  const chunk = html.slice(s, end);
  fs.writeFileSync(`.tmp-springs-${id}.html`, chunk);
  console.log(id, chunk.length);

  // strip tags to see text content
  const text = chunk
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200);
  fs.writeFileSync(`.tmp-springs-${id}-text.txt`, text);
}

// extract sticky CSS block
const stickyStart = css.indexOf(".sticky{");
const stickyEnd = css.indexOf(".content-animation", stickyStart);
fs.writeFileSync(
  ".tmp-springs-sticky.css",
  css.slice(stickyStart, stickyStart + 3500),
);

// extract chapter CSS
for (const sel of [".i-intro{", ".i-video{", ".i-slider{", ".i-opening{"]) {
  const i = css.indexOf(sel);
  console.log(sel, i);
  if (i >= 0) {
    fs.writeFileSync(
      `.tmp-springs-${sel.replace(/[^a-z]/g, "")}.css`,
      css.slice(i, i + 2500),
    );
  }
}

// extract parallax patterns
for (const name of [
  "introImage",
  "infrastructureIntroCaptionDesktop",
  "infrastructureIntroCaptionMobile",
  "videoZoom",
  "videoTranslate",
  "videoTitle",
  "videoImage",
  "videoCaptionMoveUp",
  "infrastructureSliderScroll",
]) {
  const i = js.indexOf(`${name}:`);
  console.log(name, i);
  if (i >= 0) fs.writeFileSync(`.tmp-springs-pattern-${name}.js`, js.slice(i, i + 900));
}

console.log("done");
