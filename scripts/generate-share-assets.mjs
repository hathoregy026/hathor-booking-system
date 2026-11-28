/**
 * Builds the site icons and the link-preview (Open Graph) cards from the
 * vector Hathor mark in public/branding.
 *
 *   node scripts/generate-share-assets.mjs
 *
 * Icons: the browser-tab SVG is the plain Hathor mark and follows the
 * browser's light/dark setting (black mark on light, white mark on dark).
 * Every other icon — favicon.ico, the Apple touch icon Google uses in search
 * results, and the structured-data logo — is the owner's cream tile with the
 * gold mark, opaque so it reads the same on light and dark pages. (The old
 * white-on-transparent icon showed in Google as an empty circle.)
 *
 * Share cards: 1200×630 JPEGs (WhatsApp, Telegram, iMessage, Facebook, X) —
 * the photo itself with the Hathor mark laid over it, translucent, top centre
 * (inside the square crop WhatsApp uses for small previews). JPEG rather than
 * WebP because WhatsApp drops WebP previews; each stays under ~300 KB.
 *
 * To change a card's photo: edit SHARE_CARDS, re-run, and keep the photo →
 * card map in lib/seo/share-cards.ts in step. Social apps and the CDN cache
 * previews by URL, so a changed card needs a new output filename.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");

const INK = "#14120e";
/* The owner's icon reference: gold mark on warm cream, mark ~54% of the height. */
const CREAM = "#ece9e1";
const GOLD = "#b79965";
const TILE_MARK_HEIGHT = 0.536;
const MARK_SVG = "branding/hathor-logo-nile-cruise-panorama-on-nile-visit-egypt-HATHOR-ICON.svg";

/**
 * Photo → share card. `src` is relative to the repo root. `crop` picks the
 * 1.905:1 window: `top` (px in the source) or a sharp gravity in `position`.
 * `mark` is the mark's centre on the 1200×630 card, chosen per photo on a
 * clear patch (no faces, lights or frames) and kept inside x 331–869, so the
 * centred square crop of small previews still holds it. The mark is white on
 * darker ground and black on light walls and skies, like the tab icon.
 */
const DEFAULT_MARK = { x: 600, y: 105 };
const SHARE_CARDS = [
  { src: "assets/share/hathor-dahabiya-temple-sunset.webp", out: "hathor-dahabiya-nile-cruise.jpg", crop: { top: 240 } },
  { src: "public/media/hathor/r2/blog-hero.webp", out: "journal.jpg" },
  { src: "public/media/hathor/r2/charter-hero.webp", out: "charter.jpg", mark: { x: 700, y: 548 } },
  { src: "public/media/hathor/r2/cabins-hero.webp", out: "cabins.jpg", mark: { x: 350, y: 140 } },
  { src: "public/media/hathor/r2/highlights-hero.webp", out: "highlights.jpg" },
  { src: "public/media/hathor/r2/room-royal.webp", out: "royal-suite.jpg", mark: { x: 600, y: 150 } },
  { src: "public/media/hathor/optimized/scraped-suites-hero.webp", out: "suites.jpg", mark: { x: 790, y: 110 } },
  { src: "public/media/hathor/scraped/suites-hero.webp", out: "suites-collection.jpg", mark: { x: 600, y: 172 } },
  { src: "public/media/hathor/scraped/royal-1.webp", out: "room-royal-suite.jpg", mark: { x: 600, y: 150 } },
  { src: "public/media/hathor/scraped/luxsuite-1.webp", out: "room-luxury-suite.jpg", mark: { x: 725, y: 115 } },
  { src: "public/media/hathor/scraped/cabin-1.webp", out: "room-luxury-king.jpg", mark: { x: 800, y: 80 } },
  /* Walnut panel: its lit top edge reads light, but the wood is dark. */
  { src: "public/media/hathor/scraped/cabin-5.webp", out: "room-luxury-twin.jpg", mark: { x: 690, y: 110, tone: "white" } },
];
/* Mean luminance (0–255) behind the mark above which it turns black. */
const LIGHT_GROUND = 170;

const CARD_W = 1200;
const CARD_H = 630;
const CARD_MAX_BYTES = 300 * 1024;
const MARK_H = 118;
const MARK_OPACITY = { white: 0.82, black: 0.68 };

/** Inner markup (paths + circle) of the 250×250 Hathor mark, without fills. */
async function markShapes() {
  const svg = await readFile(path.join(PUBLIC, MARK_SVG), "utf8");
  const shapes = svg.match(/<(path|circle)\b[^>]*\/>/g);
  if (!shapes?.length) throw new Error(`No shapes in ${MARK_SVG}`);
  return shapes.map((s) => s.replace(/\s*class="[^"]*"/, "")).join("");
}

/** The bare mark in one colour; `stroke` thickens it for 16–32 px. */
function markSvg(shapes, fill, { stroke = 0, ground = null, scale = 1 } = {}) {
  const outline = stroke ? ` stroke="${fill}" stroke-width="${stroke}" stroke-linejoin="round"` : "";
  const offset = (250 - 250 * scale) / 2;
  const bg = ground ? `<rect width="250" height="250" fill="${ground}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250" width="250" height="250">${bg}<g transform="translate(${offset} ${offset + 2 * scale}) scale(${scale})" fill="${fill}"${outline}>${shapes}</g></svg>`;
}

/** Ink bounding box of the mark in its 250×250 units, measured from a render. */
async function markBox(shapes) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250" width="1000" height="1000"><g fill="#000">${shapes}</g></svg>`;
  const { info } = await sharp(Buffer.from(svg))
    .flatten({ background: "#ffffff" })
    .trim({ background: "#ffffff", threshold: 10 })
    .toBuffer({ resolveWithObject: true });
  const k = 250 / 1000;
  return { x: -info.trimOffsetLeft * k, y: -info.trimOffsetTop * k, w: info.width * k, h: info.height * k };
}

/*
 * Site icon tile: the gold mark centred on cream, opaque, so it reads the same
 * on Google's light and dark result pages and on any home screen.
 */
function brandTileSvg(shapes, box, { height = TILE_MARK_HEIGHT, stroke = 0 } = {}) {
  const s = (height * 250) / box.h;
  const tx = 125 - (box.x + box.w / 2) * s;
  const ty = 125 - (box.y + box.h / 2) * s;
  const outline = stroke ? ` stroke="${GOLD}" stroke-width="${stroke}" stroke-linejoin="round"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250" width="250" height="250"><rect width="250" height="250" fill="${CREAM}"/><g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})" fill="${GOLD}"${outline}>${shapes}</g></svg>`;
}

async function renderPng(svg, px) {
  return sharp(Buffer.from(svg), { density: Math.max(72, Math.ceil((72 * px) / 250) * 4) })
    .resize(px, px)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** ICO container with PNG-encoded entries (supported by every current browser and Google). */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  entries.forEach(({ size, png }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(png.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += png.length;
  });
  return Buffer.concat([header, dir, ...entries.map((e) => e.png)]);
}

async function writeIcons() {
  const shapes = await markShapes();

  /* Browser tab icon: black on light themes, white on dark (as before). */
  const adaptive = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250"><style>g{fill:#000}@media (prefers-color-scheme:dark){g{fill:#fff}}</style><g>${shapes}</g></svg>`;
  await writeFile(path.join(PUBLIC, "branding/hathor-icon.svg"), adaptive);

  /*
   * Everything else is the cream-and-gold tile: Google picks one of these for
   * search results (it took the Apple touch icon) and shows it in light and
   * dark mode alike. The 16/32 px entries enlarge and thicken the mark so it
   * survives tab size in browsers without SVG icons.
   */
  const box = await markBox(shapes);
  const ico = buildIco([
    { size: 16, png: await renderPng(brandTileSvg(shapes, box, { height: 0.7, stroke: 10 }), 16) },
    { size: 32, png: await renderPng(brandTileSvg(shapes, box, { height: 0.64, stroke: 6 }), 32) },
    { size: 48, png: await renderPng(brandTileSvg(shapes, box), 48) },
  ]);
  await writeFile(path.join(PUBLIC, "favicon.ico"), ico);
  /* iOS rounds the corners itself. */
  await writeFile(path.join(PUBLIC, "apple-touch-icon.png"), await renderPng(brandTileSvg(shapes, box), 180));
  /* Organisation logo for structured data. */
  await writeFile(
    path.join(PUBLIC, "branding/hathor-logo-square-512.png"),
    await renderPng(brandTileSvg(shapes, box), 512),
  );
  console.log("icons: favicon.ico, branding/hathor-icon.svg, apple-touch-icon.png, branding/hathor-logo-square-512.png");
}

async function writeShareCards() {
  const outDir = path.join(PUBLIC, "media/hathor/share");
  await mkdir(outDir, { recursive: true });
  const shapes = await markShapes();

  /* Translucent mark in one tone; white gets a faint ink halo for pale skies. */
  async function tonedMark(tone) {
    const fill = tone === "white" ? "#ffffff" : INK;
    const solid = await sharp(Buffer.from(markSvg(shapes, fill)), { density: 300 })
      .resize({ height: MARK_H })
      .png()
      .toBuffer();
    const fade = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="#fff" fill-opacity="${MARK_OPACITY[tone]}"/></svg>`,
    );
    const mark = await sharp(solid).composite([{ input: fade, tile: true, blend: "dest-in" }]).png().toBuffer();
    const halo =
      tone === "white"
        ? await sharp(solid)
            .extend({ top: 30, bottom: 30, left: 30, right: 30, background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .linear([0, 0, 0, 0.35], [20, 18, 14, 0])
            .blur(12)
            .png()
            .toBuffer()
        : null;
    const { width, height } = await sharp(solid).metadata();
    return { mark, halo, width, height };
  }
  const marks = { white: await tonedMark("white"), black: await tonedMark("black") };

  for (const card of SHARE_CARDS) {
    const input = sharp(path.join(ROOT, card.src));
    const meta = await input.metadata();
    let base;
    if (card.crop?.top != null) {
      const h = Math.round((meta.width * CARD_H) / CARD_W);
      base = input.extract({ left: 0, top: card.crop.top, width: meta.width, height: h }).resize(CARD_W, CARD_H);
    } else {
      base = input.resize(CARD_W, CARD_H, { fit: "cover", position: card.crop?.position ?? "attention" });
    }
    const photo = await base.png().toBuffer();
    const centre = card.mark ?? DEFAULT_MARK;
    const box = { width: marks.white.width, height: marks.white.height };
    const left = Math.round(centre.x - box.width / 2);
    const top = Math.round(centre.y - box.height / 2);
    const { channels } = await sharp(photo).extract({ left, top, ...box }).greyscale().stats();
    const ground = channels[0].mean;
    const tone = centre.tone ?? (ground > LIGHT_GROUND ? "black" : "white");
    const { mark, halo } = marks[tone];
    const layers = halo ? [{ input: halo, left: left - 30, top: top - 30 }] : [];
    layers.push({ input: mark, left, top });
    const png = await sharp(photo).composite(layers).png().toBuffer();
    let quality = 86;
    let buf;
    do {
      buf = await sharp(png).jpeg({ quality, mozjpeg: true, progressive: true }).toBuffer();
      quality -= 4;
    } while (buf.length > CARD_MAX_BYTES && quality >= 60);
    await writeFile(path.join(outDir, card.out), buf);
    console.log(`share: ${card.out} ${(buf.length / 1024).toFixed(0)} KB (q${quality + 4}) ${tone} mark on ${ground.toFixed(0)} ← ${card.src}`);
  }
}

await writeIcons();
await writeShareCards();
