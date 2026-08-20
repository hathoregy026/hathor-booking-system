import { stripSuitesFreezeScripts } from "./strip-suites-freeze.mjs";
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

const recolorSvg = async (file, replacements) => {
  const target = path.join(outputRoot, "assets", "images", file);
  let svg = await readFile(target, "utf8");
  for (const [from, to] of replacements) svg = svg.replaceAll(from, to);
  await writeFile(target, svg, "utf8");
};

await Promise.all([
  recolorSvg("asterisco.svg", [
    ["<svg ", '<svg fill="#B69F64" '],
    ["#000", "#B69F64"],
  ]),
  recolorSvg("close.svg", [["#828EA2", "#B69F64"]]),
  recolorSvg("logo_boring_footer.svg", [
    ["#040405", "#B69F64"],
    ["#030404", "#B69F64"],
  ]),
]);

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
  image.attr(
    "data-hathor-slot",
    replacement
      .split("/")
      .pop()
      .replace(/\.(?:webp|jpe?g|png)$/i, "")
      .replace(/^suites-/, "scraped-suites-")
      .replace(/^luxsuite-/, "scraped-luxsuite-")
      .replace(/^royal-/, "scraped-royal-")
      .replace(/^cabin-/, "scraped-cabin-")
      .replace(/^home-call-to-action$/, "suites-nile-still"),
  );
  image.removeAttr("srcset");
  image.removeAttr("data-lazy-srcset");
  image.removeAttr("sizes");
  image.attr("alt", "Hathor luxury suite aboard the Nile dahabiya");
});

$("link[rel='preload'][as='image']").remove();

const replaceExactText = (from, to) => {
  $("body *")
    .contents()
    .filter((_, node) => node.type === "text" && node.data.trim() === from)
    .each((_, node) => {
      node.data = node.data.replace(from, to);
    });
};

const replaceContainedText = (from, to) => {
  $("body *")
    .contents()
    .filter((_, node) => node.type === "text" && node.data.includes(from))
    .each((_, node) => {
      node.data = node.data.replaceAll(from, to);
    });
};

$("title").text("Hathor Nile Suites");
$("meta[name='description']").attr(
  "content",
  "Luxury cabins, elegant suites, and royal suites aboard Hathor Dahabiya on the Nile.",
);
$("meta[property='og:title']").attr("content", "Hathor Nile Suites");
$("meta[property='og:site_name']").attr("content", "Hathor Dahabiya");
$("meta[property='og:description']").attr(
  "content",
  "Luxury cabins and suites aboard Hathor Dahabiya on the Nile.",
);
$(
  "link[rel='canonical'], link[rel='alternate'], link[rel='EditURI'], link[rel='shortlink'], link[rel='https://api.w.org/'], script.yoast-schema-graph",
).remove();
$("#awwwards").remove();
$(".header__menu, .header__btn.btn--menu, .mod-scroll__intro__menu").remove();
$("header .header__logo").remove();

const cloneHrefMap = [
  [/normalisboring\.es\/lasolana/i, "/luxury-cabins-Nile-Cruise"],
  [/normalisboring\.es\/plaza-espana/i, "/rooms"],
  [/normalisboring\.es\/rua-pexegueiro/i, "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise"],
  [/normalisboring\.es\/proyectos/i, "/suites"],
  [/normalisboring\.es\/conocenos/i, "/suites"],
  [/normalisboring\.es\/politica/i, "/contact"],
  [/normalisboring\.es\/aviso-legal/i, "/contact"],
  [/^https?:\/\/contacto\/?$/i, "/contact"],
  [/^https?:\/\/disponibilidad\/?$/i, "/suites?book=1"],
  [/^https?:\/\/(www\.)?normalisboring\.es\/?$/i, "/"],
];

const hathorHrefFromClone = (href) => {
  if (!href) return null;
  for (const [pattern, destination] of cloneHrefMap) {
    if (pattern.test(href)) return destination;
  }
  return null;
};

$("a[href]").each((_, element) => {
  const next = hathorHrefFromClone($(element).attr("href"));
  if (!next) return;
  $(element).attr("href", next);
  $(element).attr("target", "_top");
});
$("[data-url]").each((_, element) => {
  const next = hathorHrefFromClone($(element).attr("data-url"));
  if (next) $(element).attr("data-url", next);
});

replaceExactText("Menú", "Menu");
replaceExactText("Proyectos", "Suite Collection");
replaceExactText("Ver todos", "View All Suites");
replaceExactText("Ver todas", "View All Suites");
replaceExactText("Home", "Suites");
replaceExactText("Nosotros", "Aboard Hathor");
replaceExactText("VALORES", "SUITE LIFE");
replaceExactText("ELEGANCIA", "PANORAMIC VIEWS");
replaceExactText("AUTENTICIDAD", "PRIVATE COMFORT");
replaceExactText("FUNCIONALIDAD", "TIMELESS CRAFT");
replaceExactText("El proyecto", "Explore Suite");
replaceExactText("Próximamente", "Discover More");
replaceExactText("(Contacta)", "(Reservations)");
replaceExactText("Solicitar información", "Request Suite Availability");
replaceExactText("Explorar", "Explore");
$('[data-text="Explorar"]').attr("data-text", "Explore");
replaceExactText("INSTAGRAM", "INSTAGRAM");
replaceExactText("Política de privacidad", "Privacy Policy");
replaceExactText("Política de cookies", "Cookie Policy");
replaceExactText("Aviso legal", "Terms of Voyage");

replaceContainedText("Normal is boring ©2025", "HATHOR DAHABIYA ©2026");
replaceContainedText("NORMAL IS BORING ©2025", "HATHOR DAHABIYA ©2026");
replaceContainedText("contacto@normalisboring.es", "reservations@hathorcruise.com");

$(".mod-scroll__carousel__text").text("HATHOR");

$(".mod-scroll__intro__title").eq(0).html("Suites<br>of serenity");
$(".mod-scroll__intro__title").eq(1).html("<br>where<br>the Nile");
$(".mod-scroll__intro__title").eq(2).html("meets<br><em>luxury</em>");
$(".mod-scroll__intro__text p").text(
  "Aboard Hathor, every cabin and suite is shaped around the timeless Nile—private comfort, handcrafted detail, and panoramic river light from Luxor to Aswan.",
);
$(".logo__normal").text("Hathor");
$(".logo__is").text("Nile");
$(".logo__boring").each((_, element) => {
  $(element)
    .contents()
    .filter((__, node) => node.type === "text")
    .remove();
  $(element).prepend("Hathor");
});
$(".mod-scroll__intro__logo").html(
  '<div class="logo__boring">Hathor<div class="reg">®</div></div>',
);
if (!$("#hathor-intro-logo-wordmark").length) {
  $(".mod-scroll__intro__logo").after(`<script id="hathor-intro-logo-wordmark">
(function () {
  var el = document.querySelector(".mod-scroll__intro__logo .logo__boring");
  if (!el) return;
  var reg = el.querySelector(".reg");
  while (el.firstChild) el.removeChild(el.firstChild);
  el.appendChild(document.createTextNode("Hathor"));
  if (reg) el.appendChild(reg);
})();
</script>`);
}
$("#preloader-js-js").attr("src", "scripts/preloader.js?v=hathor-restore-motion-20260820");
if (!$("#hathor-logo-wordmark").length) {
  $("#preloader-js-js").before(`<script id="hathor-logo-wordmark">
(function () {
  function patchLogoWordmark() {
    document.querySelectorAll(".logo__boring").forEach(function (el) {
      var reg = el.querySelector(".reg");
      while (el.firstChild) el.removeChild(el.firstChild);
      el.appendChild(document.createTextNode("Hathor"));
      if (reg) el.appendChild(reg);
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", patchLogoWordmark, true);
  } else {
    patchLogoWordmark();
  }
})();
</script>`);
}
$(".header__menu__media").attr("data-text", "Explore Suite");
$(".header__menu__media__title").text("Royal Suites");
const menuSuites = [
  { title: "Luxury Cabins", place: "Nile Deck" },
  { title: "Elegant Suites", place: "Panorama Deck" },
  { title: "Royal Suites", place: "Private Balcony" },
  { title: "Suite Comfort", place: "Aboard Hathor" },
  { title: "Nile Evenings", place: "Luxor–Aswan" },
];
$(".header__menu__nav-single__proyectos__item").each((index, element) => {
  const item = menuSuites[index];
  if (!item) return;
  $(element).find(".title").text(item.title);
  $(element).find(".place").text(item.place);
});

const storyLines = $(".mod-scroll__text__title__line");
storyLines.eq(0).text("Suites that invite");
storyLines
  .eq(1)
  .html("you <span></span><span></span><span></span><span></span> to slow down");
storyLines.eq(2).text("with the Nile");
storyLines.eq(3).text("beside you");
$(".mod-scroll__text__text p").text(
  "Each Hathor suite is a private sanctuary afloat. Warm woods, soft textiles, thoughtful amenities, and river-facing windows create an intimate retreat for quiet mornings, unhurried afternoons, and elegant nights on the Nile.",
);
$(".mod-scroll__images-text__text p").text(
  "Hathor Dahabiya pairs the spirit of traditional Nile sailing with contemporary suite comfort. Every space is composed for privacy, beauty, and effortless living, with the river always present beyond the glass.",
);

const termCopy = [
  {
    title: "PANORAMIC VIEWS",
    body: "Wide river-facing windows bring the Nile into every moment, from first light over the banks to the quiet gold of sunset.",
  },
  {
    title: "PRIVATE COMFORT",
    body: "Serene interiors, refined bedding, en-suite bathrooms, and attentive service create a deeply personal retreat aboard Hathor.",
  },
  {
    title: "TIMELESS CRAFT",
    body: "Egyptian character, warm natural materials, and considered modern details give every cabin and suite an enduring sense of place.",
  },
];
$(".mod-scroll__terms__term").each((index, element) => {
  const copy = termCopy[index];
  if (!copy) return;
  $(element).find(".mod-scroll__terms__term__title__color").text(copy.title);
  $(element).find(".mod-scroll__terms__term__text__single").text(copy.body);
});
$(".mod-scroll__terms__term__title__filter").each((_, element) => {
  const $el = $(element);
  $el.replaceWith($el.html() ?? "");
});
$(".mod-scroll__terms__term__text-group .mod-scroll__terms__term__text__single").each(
  (index, element) => {
    $(element).text(termCopy[index]?.body ?? termCopy[0].body);
  },
);

$(".mod-scroll__projects__section").text("Suite Collection");
$(".mod-scroll__projects__text").text(
  "Luxury on the Nile is quiet, intimate, and deeply personal. Hathor offers cabins and suites designed not simply for sleeping, but for living beautifully between Luxor and Aswan.",
);

const suiteCards = [
  { meta: "12 CABINS", place: "NILE DECK", title: "Luxury Cabins" },
  { meta: "2 SUITES", place: "PANORAMA DECK", title: "Elegant Suites" },
  { meta: "2 ROYAL", place: "PRIVATE BALCONY", title: "Royal Suites" },
  { meta: "EN SUITE", place: "ABOARD HATHOR", title: "Suite Comfort" },
  { meta: "PRIVATE", place: "LUXOR–ASWAN", title: "Nile Evenings" },
];
const suitePanelTones = ["cream", "ink", "gold", "ivory", "ink"];
$(".mod-scroll__projects__item").each((index, element) => {
  const card = suiteCards[index];
  $(element).attr("data-suite-panel", suitePanelTones[index] ?? "gold");
  if (!card) return;
  const data = $(element).find(".mod-scroll__projects__item__text__data > div");
  data.eq(0).find("span").text(card.meta);
  data.eq(1).find("span").text(card.place);
  $(element).find(".mod-scroll__projects__item__text__title").text(card.title);
});

$(".last-item__content__section").text("Suite Collection");
const closingStoryLines = $(".last-item__content__title .line");
closingStoryLines.eq(0).text("Where every");
closingStoryLines
  .eq(1)
  .html("Nile <span></span><span></span><span></span><span></span> horizon");
closingStoryLines.eq(2).text("Becomes your");
closingStoryLines.eq(3).text("Private suite");
$(".last-item__content__text p").text(
  "We create suites for the art of river living: spaces for rest, conversation, private dining, and uninterrupted views as Hathor drifts between Egypt’s ancient shores.",
);

$(".mod-title--chapter .mod-title__intro > div").text("(Reservations)");
$(".mod-title--chapter .anima__title").html("BEGIN YOUR<br>NILE JOURNEY");
const finalTitleLines = $(".mod-title--lines .line");
finalTitleLines.eq(0).text("Luxury Upon");
finalTitleLines.eq(1).text("The Timeless");
finalTitleLines.eq(2).text("Nile");
$(".mod-content--cols .mod-content__text").html(
  "<p>Our team is ready to help you select the perfect Hathor cabin or suite and shape a private Nile journey around your preferred dates, route, and pace.</p><p><strong>reservations@hathorcruise.com</strong></p>",
);
$(".mod-content--center .mod-content__btn").text("Request Suite Availability");

$(".mod-footer__buttons-header__btn").eq(0).text("INSTAGRAM");
$(".mod-footer__buttons-header__btn")
  .eq(1)
  .text("reservations@hathorcruise.com");
$(".mod-footer__content__project__year").text("(2026)");
$(".mod-footer__content__project__name").text("ROYAL SUITES");
$(".mod-footer__content__project__text").html(
  "Privacy, panoramic light, and refined comfort<br>on the timeless Nile",
);
$(".mod-footer__footer__copyright").text("HATHOR DAHABIYA ©2026");
$(".anchors__title").text("Suites");
$(".anchors__nav__link .t-italic").text("(Reservations)");

$(".modal--contact .modal__content__pretitle").text("(RESERVATIONS)");
$(".modal--contact .modal__content__title").html("CHOOSE YOUR<br>NILE SUITE");
const formLabels = ["Name", "Phone", "Email", "Suite Request"];
$(".modal--contact .modal__content__form__label").each((index, element) => {
  $(element).text(formLabels[index] ?? "Message");
});
$(".modal--contact form").attr("aria-label", "Hathor suite enquiry");
$(".modal--contact .wpcf7-list-item-label .f-izmir").html(
  'I accept the <a class="link" href="">Privacy Policy</a> and <a class="link" href="">Terms of Voyage</a>',
);
$(".modal--contact .modal__content__legal > p").text(
  "Hathor Cruise uses the information you provide only to respond to your suite and voyage enquiry. Contact reservations@hathorcruise.com for privacy requests.",
);
$(".modal--contact input[type='submit']").attr("value", "Send Enquiry");

const cookieTextReplacements = new Map([
  ["Valoramos tu privacidad", "Your privacy aboard Hathor"],
  [
    "Usamos cookies para mejorar su experiencia de navegación, mostrarle anuncios o contenidos personalizados y analizar nuestro tráfico. Al hacer clic en “Aceptar todo” usted da su consentimiento a nuestro uso de las cookies.",
    "We use cookies to improve your experience while exploring Hathor’s Nile voyages and suites. Choose your preferences or accept all cookies to continue.",
  ],
  ["Personalizar", "Customize"],
  ["Rechazar todo", "Reject all"],
  ["Aceptar todo", "Accept all"],
  ["Personalizar las preferencias de consentimiento", "Customize your privacy preferences"],
  ["Mostrar más", "Show more"],
  ["Necesaria", "Necessary"],
  ["Siempre activas", "Always active"],
  ["Funcional", "Functional"],
  ["Analítica", "Analytics"],
  ["El rendimiento", "Performance"],
  ["Anuncio", "Advertising"],
  ["No hay cookies para mostrar.", "No cookies to display."],
  ["Duración", "Duration"],
  ["sesión", "session"],
  ["Descripción", "Description"],
  ["Pol\\u00edtica de cookies", "Cookie Policy"],
  ["Mostrar m\\u00e1s", "Show more"],
  ["Mostrar menos", "Show less"],
  ["Permitir", "Allow"],
  ["Desactivar", "Disable"],
  ["Por favor acepte el consentimiento de cookies", "Please accept cookie consent"],
  ["Guardar mis preferencias", "Save my preferences"],
  ["Preferencias de consentimiento", "Privacy preferences"],
]);

$("script").each((_, element) => {
  let scriptText = $(element).html();
  if (!scriptText) return;
  for (const [from, to] of cookieTextReplacements) {
    scriptText = scriptText.replaceAll(from, to);
  }
  $(element).html(scriptText);
});

const cookieTemplate = $("#ckyBannerTemplate");
if (cookieTemplate.length) {
  const cookie$ = cheerio.load(cookieTemplate.html() ?? "", null, false);
  cookie$(".cky-preference-title").text("Customize your privacy preferences");
  cookie$(".cky-preference-content-wrapper").html(
    "<p>Cookies help the Hathor website remember your choices and present our suites and Nile voyages clearly.</p><p>Necessary cookies support essential website functions. Optional cookies help us understand performance and improve your experience.</p><p>You may accept all cookies, reject optional cookies, or customize your preferences at any time.</p>",
  );
  const categoryDescriptions = [
    "Necessary cookies support essential website functions and do not store personal profile information.",
    "Functional cookies remember useful choices while you explore Hathor suites and voyages.",
    "Analytics cookies help us understand how visitors explore our cabins, suites, and Nile itineraries.",
    "Performance cookies help us improve speed and reliability across the Hathor website.",
    "Advertising cookies may support relevant campaign measurement when enabled.",
  ];
  cookie$(".cky-accordion-header-des p").each((index, element) => {
    cookie$(element).text(
      categoryDescriptions[index] ?? categoryDescriptions[0],
    );
  });
  cookie$(".cky-cookie-des-table").each((_, table) => {
    cookie$(table)
      .find("p")
      .text("This cookie supports the selected website preference or embedded service.");
  });
  cookie$(".cky-cookie-des-table li div").each((_, element) => {
    const value = cookie$(element).text().trim();
    const translations = {
      Duración: "Duration",
      Descripción: "Description",
      sesión: "session",
      "1 año": "1 year",
      "6 meses": "6 months",
    };
    if (translations[value]) cookie$(element).text(translations[value]);
  });
  cookie$(".cky-btn-close").attr("aria-label", "Close");
  cookieTemplate.html(cookie$.html());
}

$("head").append(`
  <style id="hathor-suites-typography">
    @font-face {
      font-family: "Bitho Luxury";
      src: url("/fonts/bitho-luxury-italic-1784552304-0/BithoLuxury-Italic-Exfont89bb.otf") format("opentype");
      font-style: italic;
      font-weight: 400;
      font-display: swap;
    }
    @font-face {
      font-family: "Rollgates Luxury Italic";
      src: url("/fonts/rollgates-luxury/Rollgates Luxury Italic.otf") format("opentype");
      font-style: italic;
      font-weight: 400;
      font-display: swap;
    }
    body {
      color: #B69F64 !important;
      -webkit-text-fill-color: #B69F64 !important;
      font-family: "Rollgates Luxury Italic", serif !important;
      font-style: italic !important;
    }
    body :where(a, button, p, li, strong, em, input, textarea) {
      color: inherit;
      -webkit-text-fill-color: currentColor;
      font-family: "Rollgates Luxury Italic", serif !important;
      font-style: italic !important;
    }
    body :is(
      .t-supertitulo,
      .t-supertitulo-l,
      .t-supertitulo-xl,
      .t-titulo-xxl,
      .mod-scroll__intro__title,
      .mod-scroll__carousel__text,
      .mod-scroll__text__title__line,
      .mod-scroll__terms__term__title,
      .mod-scroll__projects__item__text__title,
      .last-item__content__title .line,
      .anima__title,
      .mod-title--lines .line,
      .logo__normal,
      .logo__boring,
      .mod-footer__content__project__name
    ),
    body :is(
      .t-supertitulo,
      .t-supertitulo-l,
      .t-supertitulo-xl,
      .t-titulo-xxl,
      .mod-scroll__intro__title,
      .mod-scroll__carousel__text,
      .mod-scroll__text__title__line,
      .mod-scroll__terms__term__title,
      .mod-scroll__projects__item__text__title,
      .last-item__content__title .line,
      .anima__title,
      .mod-title--lines .line,
      .logo__normal,
      .logo__boring,
      .mod-footer__content__project__name
    ) * {
      font-family: "Bitho Luxury", cursive !important;
      font-style: italic !important;
      color: #B69F64 !important;
      -webkit-text-fill-color: #B69F64 !important;
    }
    body .mod-scroll__terms :is(
      .t-supertitulo-l,
      .mod-scroll__terms__term__title,
      .mod-scroll__terms__term__num,
      .mod-scroll__terms__term__text
    ),
    body .mod-scroll__terms :is(
      .t-supertitulo-l,
      .mod-scroll__terms__term__title,
      .mod-scroll__terms__term__text
    ) * {
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff !important;
      mix-blend-mode: normal !important;
      filter: none !important;
    }
    .mod-scroll__intro__title,
    .mod-scroll__text__title,
    .mod-scroll__text__title__line,
    .mod-scroll__terms__term__title,
    .mod-scroll__projects__item__text__title,
    .last-item__content__title,
    .last-item__content__title .line,
    .anima__title,
    .anima__title .line,
    .mod-title--lines .line,
    .t-titulo-xxl,
    .t-supertitulo,
    .t-supertitulo-l,
    .t-supertitulo-xl,
    .logo__normal,
    .logo__boring {
      overflow: visible !important;
      padding: 0 !important;
    }
    .last-item__content__title .line,
    .anima__title .line {
      overflow: clip !important;
      padding: 0 !important;
    }
    .mod-title--lines .line {
      overflow: hidden !important;
      padding: 0 !important;
    }

    :root {
      --black: #B69F64;
      --beige: #F4E4CC;
      --red: #B69F64;
      --blue: #CEBBA0;
      --grey: #CEBBA0;
      --green: #F4E4CC;
      --hathor-cream: #F4E4CC;
      --hathor-gold: #B69F64;
      --hathor-sand: #CEBBA0;
      --hathor-white: #FFFFFF;
    }
    html,
    body,
    main {
      background-color: var(--hathor-cream) !important;
    }
    .bg-white {
      background: var(--hathor-white) !important;
      box-shadow: 0 -1px 0 var(--hathor-white) !important;
    }
    .bg-beige,
    .bg-green {
      background: var(--hathor-cream) !important;
      box-shadow: 0 -1px 0 var(--hathor-cream) !important;
    }
    .bg-blue,
    .bg-grey,
    .bg-black,
    .bg-red {
      background: var(--hathor-gold) !important;
      box-shadow: 0 -1px 0 var(--hathor-gold) !important;
    }
    body :is(.bg-blue, .bg-grey, .bg-black, .bg-red),
    body :is(.bg-blue, .bg-grey, .bg-black, .bg-red) *,
    body .c-white,
    body .c-white * {
      color: var(--hathor-white) !important;
      -webkit-text-fill-color: var(--hathor-white) !important;
    }
    input[type="text"],
    input[type="email"],
    input[type="tel"],
    textarea {
      color: var(--hathor-gold) !important;
      -webkit-text-fill-color: var(--hathor-gold) !important;
      border-color: var(--hathor-gold) !important;
      background: transparent !important;
    }
    input[type="checkbox"] {
      border-color: var(--hathor-gold) !important;
      background: transparent !important;
    }
    input[type="checkbox"]::before {
      background: var(--hathor-gold) !important;
    }
    #awwwards .js-color-bg {
      fill: var(--hathor-gold) !important;
    }
    #awwwards .js-color-text {
      fill: var(--hathor-white) !important;
    }
    #awwwards .js-color-bg,
    #awwwards .js-color-bg path {
      fill: var(--hathor-gold) !important;
    }
    #awwwards .js-color-text,
    #awwwards .js-color-text path {
      fill: var(--hathor-white) !important;
    }
    body svg :where(path, g, rect, circle, ellipse, polygon, polyline) {
      fill: currentColor !important;
    }
    body :where(.bg-blue, .bg-grey, .bg-black, .bg-red) svg {
      color: var(--hathor-white) !important;
    }
    #mouse {
      mix-blend-mode: normal !important;
    }
    #mouse div,
    #mouse span {
      background-color: var(--hathor-gold) !important;
      color: var(--hathor-white) !important;
      -webkit-text-fill-color: var(--hathor-white) !important;
    }
    header .header,
    header .header__menu__media__title,
    main .mod-header__content__wrap-title-text,
    main .mod-scroll__logo,
    main .mod-scroll__footer-logo,
    main .mod-scroll__terms__term__title {
      mix-blend-mode: normal !important;
      filter: none !important;
    }

    .btn--bg,
    .mod-content__btn,
    .modal--contact input[type="submit"],
    .cky-btn {
      position: relative;
      overflow: hidden;
      border: 1px solid var(--hathor-gold) !important;
      border-radius: 999px !important;
      background: transparent !important;
      color: var(--hathor-gold) !important;
      -webkit-text-fill-color: var(--hathor-gold) !important;
      box-shadow: none !important;
      transition: color 0.35s cubic-bezier(0.22, 1, 0.36, 1),
        background-color 0.35s cubic-bezier(0.22, 1, 0.36, 1),
        border-color 0.35s ease,
        transform 0.35s cubic-bezier(0.22, 1, 0.36, 1) !important;
    }
    .btn--bg::before {
      background: var(--hathor-gold) !important;
    }
    .btn--bg:hover,
    .btn--bg:focus-visible,
    .mod-content__btn:hover,
    .mod-content__btn:focus-visible,
    .modal--contact input[type="submit"]:hover,
    .modal--contact input[type="submit"]:focus-visible,
    .cky-btn:hover,
    .cky-btn:focus-visible {
      background-color: var(--hathor-gold) !important;
      color: var(--hathor-white) !important;
      -webkit-text-fill-color: var(--hathor-white) !important;
      border-color: var(--hathor-gold) !important;
      transform: translateY(-2px);
    }
    .btn--bg:hover :where(span, div),
    .btn--bg:focus-visible :where(span, div) {
      color: var(--hathor-white) !important;
      -webkit-text-fill-color: var(--hathor-white) !important;
    }
    .btn--circle {
      background: transparent !important;
      border: 1px solid var(--hathor-gold) !important;
      color: var(--hathor-gold) !important;
      -webkit-text-fill-color: var(--hathor-gold) !important;
      transition: background-color 0.35s ease, color 0.35s ease !important;
    }
    .btn--circle:hover,
    .btn--circle:focus-visible {
      background: var(--hathor-gold) !important;
      color: var(--hathor-white) !important;
      -webkit-text-fill-color: var(--hathor-white) !important;
    }
    body :where(.bg-blue, .bg-grey, .bg-black, .bg-red) :where(.btn--bg, .btn--circle) {
      border-color: var(--hathor-white) !important;
      color: var(--hathor-white) !important;
      -webkit-text-fill-color: var(--hathor-white) !important;
    }
    .cky-consent-bar,
    .cky-preference-center,
    .cky-accordion-wrapper,
    .cky-footer-wrapper,
    .cky-audit-table {
      background: var(--hathor-white) !important;
      border-color: var(--hathor-sand) !important;
    }
    .cky-overlay {
      background: var(--hathor-gold) !important;
    }
    .cky-switch input::before,
    .cky-btn-revisit-wrapper {
      background: var(--hathor-gold) !important;
    }
    #awwwards,
    .header__menu,
    .header__btn.btn--menu,
    header .header__logo,
    .mod-scroll__intro__menu {
      display: none !important;
    }
    .logo__boring,
    .logo__boring .reg {
      transform: none !important;
    }

    /* Moving suite collection: 4 Suites colours, never two alike in a row. */
    .mod-scroll__projects__item[data-suite-panel="cream"] {
      --suite-panel: #ece8df;
      --suite-panel-fg: #1c1917;
    }
    .mod-scroll__projects__item[data-suite-panel="ivory"] {
      --suite-panel: #faf8f5;
      --suite-panel-fg: #1c1917;
    }
    .mod-scroll__projects__item[data-suite-panel="gold"] {
      --suite-panel: #b69f64;
      --suite-panel-fg: #1c1917;
    }
    .mod-scroll__projects__item[data-suite-panel="ink"] {
      --suite-panel: #1c1917;
      --suite-panel-fg: #faf8f5;
    }
    .mod-scroll__projects__item[data-suite-panel]:not(.last-item) {
      background: var(--suite-panel) !important;
      box-shadow: 0 -1px 0 var(--suite-panel) !important;
    }
    .mod-scroll__projects__item[data-suite-panel]:not(.last-item) .mod-scroll__projects__item__text,
    .mod-scroll__projects__item.last-item[data-suite-panel] .mod-scroll__projects__item__text {
      background: var(--suite-panel) !important;
    }
    .mod-scroll__projects__item[data-suite-panel] .mod-scroll__projects__item__text,
    .mod-scroll__projects__item[data-suite-panel] .mod-scroll__projects__item__text :is(div, span, a, p, h3, strong, em) {
      color: var(--suite-panel-fg) !important;
      -webkit-text-fill-color: var(--suite-panel-fg) !important;
    }
    .mod-scroll__projects__item[data-suite-panel] .mod-scroll__projects__item__text :is(.btn--bg, .btn--circle) {
      border-color: var(--suite-panel-fg) !important;
      color: var(--suite-panel-fg) !important;
      -webkit-text-fill-color: var(--suite-panel-fg) !important;
      background: transparent !important;
    }
    .mod-scroll__projects__item[data-suite-panel] .mod-scroll__projects__item__text .btn--bg::before {
      background: var(--suite-panel-fg) !important;
    }
    .mod-scroll__projects__item[data-suite-panel] .mod-scroll__projects__item__text :is(.btn--bg, .btn--circle):hover,
    .mod-scroll__projects__item[data-suite-panel] .mod-scroll__projects__item__text :is(.btn--bg, .btn--circle):focus-visible {
      background: var(--suite-panel-fg) !important;
      color: var(--suite-panel) !important;
      -webkit-text-fill-color: var(--suite-panel) !important;
      border-color: var(--suite-panel-fg) !important;
    }
    .mod-scroll__projects__item[data-suite-panel] .mod-scroll__projects__item__text :is(.btn--bg, .btn--circle):hover :where(span, div),
    .mod-scroll__projects__item[data-suite-panel] .mod-scroll__projects__item__text :is(.btn--bg, .btn--circle):focus-visible :where(span, div) {
      color: var(--suite-panel) !important;
      -webkit-text-fill-color: var(--suite-panel) !important;
    }
  </style>
  <style id="hathor-suites-terms-stage">
    html body main .mod-scroll__terms {
      isolation: isolate !important;
      mix-blend-mode: normal !important;
      filter: none !important;
    }
    html body main .mod-scroll__terms,
    html body main .mod-scroll__terms :is(
      .mod-scroll__terms__term__title,
      .mod-scroll__terms__term__title *,
      .mod-scroll__terms__term__num,
      .mod-scroll__terms__term__text,
      .mod-scroll__terms__term__text *,
      .t-supertitulo-l,
      .t-supertitulo-l *
    ) {
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff !important;
      mix-blend-mode: normal !important;
      filter: none !important;
    }
    html body main .mod-scroll__terms :is(
      .mod-scroll__terms__term__title,
      .mod-scroll__terms__term__title *,
      .t-supertitulo-l,
      .t-supertitulo-l *
    ) {
      transform: none !important;
    }
    @media (min-width: 951px) {
      html body main .mod-scroll > .mod-scroll__terms,
      html body main .mod-scroll__terms {
        height: 100svh !important;
        max-height: 100svh !important;
        box-sizing: border-box !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        padding-top: 9svh !important;
        padding-bottom: 3.5svh !important;
        overflow: hidden !important;
      }
      html body main .mod-scroll__terms .mod-scroll__terms__term__title,
      html body main .mod-scroll__terms .mod-scroll__terms__term__title.t-supertitulo-l,
      html body main .mod-scroll__terms .t-supertitulo-l,
      html body main .mod-scroll__terms .mod-scroll__terms__term:last-of-type .lh-less2 {
        font-size: min(8.6svh, 6.4vw) !important;
        line-height: 0.8 !important;
      }
    }
    @media (min-width: 481px) and (max-width: 950px) {
      html body main .mod-scroll__terms .mod-scroll__terms__term__title,
      html body main .mod-scroll__terms .t-supertitulo-l {
        font-size: min(7.2svh, 8vw) !important;
        line-height: 0.84 !important;
      }
    }
    @media (max-width: 480px) {
      html body main .mod-scroll__terms .mod-scroll__terms__term__title,
      html body main .mod-scroll__terms .t-supertitulo-l {
        font-size: min(9.4vw, 2.8rem) !important;
        line-height: 0.9 !important;
      }
    }
  </style>
`);

const outputHtml = stripSuitesFreezeScripts(
  $.html()
    .replaceAll(
      "https://normalisboring.es/wp-content/plugins/cookie-law-info/lite/frontend/images/",
      "assets/images/",
    )
    .replaceAll(
      "https://normalisboring.es/wp-includes/js/wp-emoji-release.min.js?ver=7.0.4",
      "scripts/vendor/wp-emoji-release.min.js",
    )
    .replace(/[ \t]+$/gm, ""),
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
