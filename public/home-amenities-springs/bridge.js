/**
 * Homepage embed bridge — PURE Springs amenities clone.
 *
 * Parent Lenis → Locomotive `scroller.setScroll(0, y)`.
 * Do NOT use smoothScroll.scrollTop / lerped scrollTo for per-frame sync —
 * those skip or lag parallax and leave chapters looking static/green.
 */
(function () {
  "use strict";

  const AMENITY_SECTIONS = [
    "#i-intro",
    "#i-video",
    "#i-slider",
    "#i-opening",
    "#i-nature",
  ];

  function hideStuckPreloader() {
    const preloader = document.querySelector(".preloader, .js-preloader");
    if (preloader) {
      preloader.style.setProperty("display", "none", "important");
      preloader.style.setProperty("visibility", "hidden", "important");
      preloader.style.setProperty("pointer-events", "none", "important");
      preloader.setAttribute("aria-hidden", "true");
    }
    document.documentElement.classList.add("is-preloader-disabled");
  }

  function reportReady() {
    const height = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      document.querySelector("[data-hathor-amenities-root]")?.scrollHeight || 0,
      window.innerHeight * 14,
    );
    parent.postMessage({ type: "hathor-am-ready", height }, "*");
  }

  function findSmoothScroll() {
    if (window.__hathorSmoothScroll) return window.__hathorSmoothScroll;
    try {
      const jq = window.jQuery;
      if (jq) {
        const smooth = jq(document.body).data("smoothScroll");
        if (smooth) {
          window.__hathorSmoothScroll = smooth;
          return smooth;
        }
      }
    } catch (_) {
      /* ignore */
    }
    return null;
  }

  function hydrateAmenitiesMedia() {
    const introSeen =
      document.documentElement.classList.contains("is-intro-seen");

    for (const sel of AMENITY_SECTIONS) {
      const section = document.querySelector(sel);
      if (!section) continue;

      section.querySelectorAll("[data-srcset]").forEach((el) => {
        const value = el.getAttribute("data-srcset");
        if (!value) return;
        el.setAttribute("srcset", value);
        el.removeAttribute("data-srcset");
      });
      section.querySelectorAll("[data-src]").forEach((el) => {
        const value = el.getAttribute("data-src");
        if (!value) return;
        el.setAttribute("src", value);
        el.removeAttribute("data-src");
      });

      if (sel !== "#i-intro" || introSeen) {
        section
          .querySelectorAll(".is-invisible--js")
          .forEach((el) => el.classList.remove("is-invisible--js"));
      }
    }
  }

  function ensureIntroVisible() {
    const img = document.querySelector("#i-intro img");
    if (img) {
      img.style.setProperty("opacity", "1", "important");
      const reveal = img.getAttribute("data-reveal");
      if (reveal) {
        img.setAttribute("data-reveal-old", reveal);
        img.removeAttribute("data-reveal");
      }
    }
    document
      .querySelectorAll("#i-intro .is-invisible--js")
      .forEach((el) => el.classList.remove("is-invisible--js"));
    const bg = document.querySelector("#i-intro .background");
    if (bg) {
      const clip = getComputedStyle(bg).clipPath || "";
      /* Open only if still stuck in the boot closed state */
      if (/0px 900px|93\.|90\./.test(clip)) {
        bg.style.setProperty(
          "clip-path",
          "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          "important",
        );
      }
    }
  }

  function applyScroll(y) {
    const target = Math.max(0, Number(y) || 0);
    const introSeen =
      document.documentElement.classList.contains("is-intro-seen");

    /*
     * Parent often posts y=0 while Springs intro image-zoom is mid-flight.
     * Calling setScroll(0) freezes that reveal at ~0.005 opacity (cream void).
     */
    if (target === 0 && !introSeen) {
      return;
    }

    const smooth = findSmoothScroll();
    const scroller = smooth && smooth.scroller;

    if (scroller && typeof scroller.setScroll === "function") {
      try {
        scroller.setScroll(0, target);
      } catch (_) {
        try {
          scroller.scrollTo(target, {
            immediate: true,
            duration: 0,
            disableLerp: true,
          });
        } catch (__) {
          /* fall through */
        }
      }
    } else if (smooth && typeof smooth.scrollTo === "function") {
      try {
        smooth.scrollTo(target, { duration: 0, immediate: true });
      } catch (_) {
        smooth.scrollTo(target);
      }
    } else {
      window.scrollTo(0, target);
    }

    if (smooth && typeof smooth.update === "function") {
      try {
        smooth.update();
      } catch (_) {
        /* ignore */
      }
    }
    if (scroller && typeof scroller.update === "function") {
      try {
        scroller.update();
      } catch (_) {
        /* ignore */
      }
    }

    if (introSeen) {
      hideStuckPreloader();
      if (target === 0) ensureIntroVisible();
    }
    hydrateAmenitiesMedia();
  }

  window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || typeof data !== "object") return;
    if (data.type === "hathor-am-scroll") applyScroll(data.y);
  });

  function springsBooted() {
    const root = document.documentElement;
    return (
      root.classList.contains("is-intro-seen") &&
      root.classList.contains("has-scroll-smooth")
    );
  }

  function boot() {
    let reported = false;
    const finish = () => {
      if (reported) return;
      reported = true;
      if (document.documentElement.classList.contains("is-intro-seen")) {
        hideStuckPreloader();
        ensureIntroVisible();
      }
      hydrateAmenitiesMedia();
      reportReady();
      parent.postMessage({ type: "hathor-am-boot" }, "*");
    };

    if (springsBooted()) {
      finish();
      return;
    }

    const start = Date.now();
    const tick = window.setInterval(() => {
      if (springsBooted() || Date.now() - start > 12000) {
        window.clearInterval(tick);
        finish();
      }
    }, 80);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("load", () => {
    setTimeout(() => {
      if (document.documentElement.classList.contains("is-intro-seen")) {
        hideStuckPreloader();
        ensureIntroVisible();
      }
      hydrateAmenitiesMedia();
      reportReady();
    }, 400);
    setTimeout(() => {
      hideStuckPreloader();
      ensureIntroVisible();
      hydrateAmenitiesMedia();
      reportReady();
    }, 2000);
    setTimeout(() => {
      ensureIntroVisible();
    }, 3500);
  });
})();
