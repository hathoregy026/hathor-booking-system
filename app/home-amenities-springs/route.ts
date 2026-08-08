import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Pure Springs amenities clone for homepage iframe.
 * Same source + serving path as /test-slide — only hide chrome / post-nature chapters.
 * No gold theme, no CMS image swaps.
 */
export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "public",
    "springs-layout",
    "index.html",
  );
  let html = await readFile(filePath, "utf8");

  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    "<title>Springs Amenities Clone (homepage)</title>",
  );

  html = html.replace(
    '<html data-springs-test-slide="true"',
    '<html data-springs-test-slide="true" data-hathor-amenities-springs="true"',
  );

  html = html.replace(
    'id="i-intro"',
    'id="i-intro" data-hathor-amenities-root="true"',
  );

  const embed = `
<style id="hathor-amenities-pure-embed">
  /* Hide Springs chrome only — never touch reveal/appear/preloader */
  header,
  .header,
  .menu,
  .menu-picker,
  .cookie-consent,
  #cookie-consent,
  .turn-message,
  .browser-message,
  .favourite-btn,
  .l-callback,
  .modal,
  footer.footer {
    display: none !important;
  }
  /* Stop after nature chapter */
  #i-interiors,
  #i-interiors ~ * {
    display: none !important;
  }
  /* Hide loco scrollbar only — do NOT set overflow:hidden on html/body. */
  .c-scrollbar {
    display: none !important;
    width: 0 !important;
  }
  /* After Springs marks intro done, kill a stuck preloader (green void). */
  html.is-preloader-disabled .preloader,
  html.is-preloader-disabled .js-preloader,
  html.is-intro-seen .preloader,
  html.is-intro-seen .js-preloader {
    display: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }
</style>
<script src="/home-amenities-springs/bridge.js" defer></script>
`;

  html = html.replace("</head>", `${embed}\n</head>`);

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
