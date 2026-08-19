import { cp, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import * as cheerio from "cheerio";

const projectRoot = process.cwd();
const sourceRoot =
  process.env.NORMAL_HOMEPAGE_SOURCE ??
  "C:\\Users\\Uer\\Downloads\\NORMAL IS DEF BORING";
const publicRoot = path.resolve(projectRoot, "public");
const outputRoot = path.resolve(publicRoot, "suites-normal");

if (!outputRoot.startsWith(`${publicRoot}${path.sep}`)) {
  throw new Error("Refusing to rebuild outside the project public directory.");
}

const resolvedSource = await realpath(sourceRoot);
const sourceIndex = path.join(resolvedSource, "source", "homepage.html");

const hathorImages = [
  "/media/hathor/scraped/suites-hero.webp",
  "/media/hathor/scraped/suites-luxury-rooms.webp",
  "/media/hathor/scraped/suites-luxury-suites.webp",
  "/media/hathor/scraped/suites-royal.webp",
  "/media/hathor/scraped/luxsuite-1.webp",
  "/media/hathor/scraped/luxsuite-2.webp",
  "/media/hathor/scraped/luxsuite-3.webp",
  "/media/hathor/scraped/luxsuite-4.webp",
  "/media/hathor/scraped/luxsuite-5.webp",
  "/media/hathor/scraped/luxsuite-6.webp",
  "/media/hathor/scraped/royal-1.webp",
  "/media/hathor/scraped/royal-2.webp",
  "/media/hathor/scraped/royal-3.webp",
  "/media/hathor/scraped/royal-4.webp",
  "/media/hathor/scraped/royal-5.webp",
  "/media/hathor/scraped/royal-6.webp",
  "/media/hathor/scraped/royal-7.webp",
  "/media/hathor/scraped/royal-8.webp",
  "/media/hathor/scraped/cabin-1.webp",
  "/media/hathor/scraped/cabin-2.webp",
  "/media/hathor/scraped/cabin-3.webp",
  "/media/hathor/scraped/cabin-4.webp",
  "/media/hathor/scraped/cabin-5.webp",
  "/media/hathor/scraped/cabin-6.webp",
  "/media/hathor/scraped/cabin-7.webp",
  "/media/hathor/scraped/cabin-8.webp",
  "/media/hathor/optimized/room-luxury.webp",
  "/media/hathor/optimized/room-royal.webp",
  "/media/hathor/optimized/room-suite.webp",
  "/media/hathor/optimized/home-call-to-action.webp",
];

const decorativeImages = [
  "ajax-loader.gif",
  "asterisco.svg",
  "close.svg",
  "favicon-150x150.png",
  "favicon-300x300.png",
  "logo_boring_footer.svg",
  "logo_normalisboring.svg",
  "revisit.svg",
  "youtube.png",
];

await rm(outputRoot, { recursive: true, force: true });
await mkdir(path.join(outputRoot, "assets", "images"), { recursive: true });

await Promise.all(
  ["fonts"].map((directory) =>
    cp(
      path.join(resolvedSource, "assets", directory),
      path.join(outputRoot, "assets", directory),
      { recursive: true },
    ),
  ),
);
await cp(path.join(resolvedSource, "styles"), path.join(outputRoot, "styles"), {
  recursive: true,
});
await cp(path.join(resolvedSource, "scripts"), path.join(outputRoot, "scripts"), {
  recursive: true,
});

await Promise.all(
  decorativeImages.map((file) =>
    cp(
      path.join(resolvedSource, "assets", "images", file),
      path.join(outputRoot, "assets", "images", file),
    ),
  ),
);

const html = await readFile(sourceIndex, "utf8");
const $ = cheerio.load(html, { decodeEntities: false });

$("head").prepend('<base href="/suites-normal/">');

const localizeResource = (value) => {
  if (!value) return value;

  const clean = value.replace(/&#038;/g, "&");
  const pathname = clean.split("?")[0];
  const fileName = pathname.split("/").pop()?.replace(/'$/, "") ?? "";

  if (pathname.includes("/wp-content/uploads/")) return clean;
  if (pathname.includes("/css/fonts/")) return `assets/fonts/${fileName}`;
  if (pathname.includes("/themes/normalisboring25/images/")) {
    return `assets/images/${fileName}`;
  }
  if (pathname.includes("cookie-law-info/lite/frontend/images/")) {
    return `assets/images/${fileName}`;
  }
  if (pathname.endsWith("/contact-form-7/includes/css/styles.css")) {
    return "styles/contact-form-7.css";
  }
  if (pathname.endsWith("/swiper-bundle.min.css")) {
    return "styles/swiper-bundle.min.css";
  }
  if (pathname.endsWith("/themes/normalisboring25/css/main.css")) {
    return "styles/main.css";
  }
  if (pathname.endsWith("/gsap.min.js")) return "scripts/vendor/gsap.min.js";
  if (pathname.endsWith("/ScrollTrigger.min.js")) {
    return "scripts/vendor/ScrollTrigger.min.js";
  }
  if (pathname.endsWith("/swiper-bundle.min.js")) {
    return "scripts/vendor/swiper-bundle.min.js";
  }
  if (pathname.endsWith("/ScrollSmoother.min.js")) {
    return "scripts/vendor/ScrollSmoother.min.js";
  }
  if (pathname.endsWith("/SplitText.min.js")) {
    return "scripts/vendor/SplitText.min.js";
  }
  if (pathname.endsWith("/MorphSVGPlugin.min.js")) {
    return "scripts/vendor/MorphSVGPlugin.min.js";
  }
  if (clean.startsWith("https://unpkg.com/swup@4")) {
    return "scripts/vendor/swup.min.js";
  }
  if (pathname.endsWith("/lenis.min.js")) return "scripts/vendor/lenis.min.js";
  if (pathname.endsWith("/cookie-law-info/lite/frontend/js/script.min.js")) {
    return "scripts/vendor/cookie-law-info.min.js";
  }
  if (pathname.endsWith("/rocket-lazy-load/assets/js/16.1/lazyload.min.js")) {
    return "scripts/vendor/lazyload.min.js";
  }
  if (pathname.endsWith("/wp-includes/js/dist/hooks.min.js")) {
    return "scripts/vendor/wp-hooks.min.js";
  }
  if (pathname.endsWith("/wp-includes/js/dist/i18n.min.js")) {
    return "scripts/vendor/wp-i18n.min.js";
  }
  if (pathname.endsWith("/wp-includes/js/wp-emoji-loader.min.js")) {
    return "scripts/vendor/wp-emoji-loader.min.js";
  }
  if (pathname.endsWith("/wp-includes/js/wp-emoji-release.min.js")) {
    return "scripts/vendor/wp-emoji-release.min.js";
  }
  if (pathname.endsWith("/contact-form-7/includes/swv/js/index.js")) {
    return "scripts/vendor/contact-form-validation.js";
  }
  if (pathname.endsWith("/contact-form-7/includes/js/index.js")) {
    return "scripts/vendor/contact-form.js";
  }
  if (pathname.includes("/themes/normalisboring25/js/")) {
    return `scripts/${fileName}`;
  }

  return value;
};

$("link[href], script[src]").each((_, element) => {
  const node = $(element);
  const attribute = element.tagName === "link" ? "href" : "src";
  node.attr(attribute, localizeResource(node.attr(attribute)));
});

$("link[rel='icon'], link[rel='apple-touch-icon']").attr(
  "href",
  "/branding/hathor-logo-nile-cruise-favicon.webp",
);
$("meta[name='msapplication-TileImage']").attr(
  "content",
  "/branding/hathor-logo-nile-cruise-favicon.webp",
);

let photoIndex = 0;
$("img").each((_, element) => {
  const image = $(element);
  const src = image.attr("src") ?? image.attr("data-lazy-src") ?? "";
  const isPhotograph =
    (src.includes("/wp-content/uploads/") || src.includes("assets/images/")) &&
    /\.(?:jpe?g|png|webp)(?:\?|$)/i.test(src) &&
    !/(?:favicon|youtube)\./i.test(src);

  if (!isPhotograph) {
    image.attr("src", localizeResource(image.attr("src")));
    image.attr("data-lazy-src", localizeResource(image.attr("data-lazy-src")));
    return;
  }

  const replacement = hathorImages[photoIndex % hathorImages.length];
  photoIndex += 1;

  image.attr("src", replacement);
  image.attr("data-lazy-src", replacement);
  image.removeAttr("srcset");
  image.removeAttr("data-lazy-srcset");
  image.removeAttr("sizes");
  image.attr("alt", "Hathor luxury suite aboard the Nile dahabiya");
});

$("link[rel='preload'][as='image']").remove();

const outputHtml = $.html()
  .replaceAll(
    "https://normalisboring.es/wp-content/plugins/cookie-law-info/lite/frontend/images/",
    "assets/images/",
  )
  .replaceAll(
    "https://normalisboring.es/wp-includes/js/wp-emoji-release.min.js?ver=7.0.4",
    "scripts/vendor/wp-emoji-release.min.js",
  );

await writeFile(path.join(outputRoot, "index.html"), outputHtml, "utf8");

console.log(
  JSON.stringify(
    {
      output: outputRoot,
      replacedPhotographs: photoIndex,
      hathorImageSlots: hathorImages.length,
    },
    null,
    2,
  ),
);
