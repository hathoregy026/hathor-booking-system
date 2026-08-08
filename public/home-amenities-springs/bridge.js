/**
 * Homepage embed bridge — PURE Springs amenities clone.
 * Scroll + height only. Does not touch preloader, not-ready, or appear/reveal.
 * Springs must finish its own intro (is-intro-seen) before we report ready.
 */
(function () {
  "use strict";

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
        if (smooth && typeof smooth.scrollTo === "function") {
          window.__hathorSmoothScroll = smooth;
          return smooth;
        }
      }
    } catch (_) {
      /* ignore */
    }
    return null;
  }

  function applyScroll(y) {
    const target = Math.max(0, Number(y) || 0);
    const smooth = findSmoothScroll();
    if (smooth) {
      try {
        smooth.scrollTo(target);
        return;
      } catch (_) {
        /* fall through */
      }
    }
    window.scrollTo(0, target);
  }

  window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || typeof data !== "object") return;
    if (data.type === "hathor-am-scroll") applyScroll(data.y);
  });

  function springsBooted() {
    const root = document.documentElement;
    return (
      root.classList.contains("is-intro-seen") ||
      (root.classList.contains("is-ready") &&
        root.classList.contains("has-scroll-smooth") &&
        !!document.querySelector('#i-intro img[data-reveal-old], #i-intro img[data-preloaded]'))
    );
  }

  function boot() {
    let reported = false;
    const finish = () => {
      if (reported) return;
      reported = true;
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
    setTimeout(reportReady, 400);
    setTimeout(reportReady, 1600);
  });
})();
