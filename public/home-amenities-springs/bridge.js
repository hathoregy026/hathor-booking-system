/**
 * Hathor bridge for the Springs amenities clone iframe.
 * - Does NOT alter Springs sticky / parallax / loco
 * - Injects CMS images + copy from parent postMessage
 * - Reports document scroll height for parent runway sizing
 */
(function () {
  "use strict";

  const GOLD = "#b69f64";

  function applyImages(images) {
    if (!images || typeof images !== "object") return;
    Object.entries(images).forEach(([slot, src]) => {
      if (!src) return;
      document
        .querySelectorAll(`[data-hathor-img-slot="${slot}"]`)
        .forEach((img) => {
          img.removeAttribute("srcset");
          img.setAttribute("src", src);
          img.setAttribute("data-src", src);
          const picture = img.closest("picture");
          if (picture) {
            picture.querySelectorAll("source").forEach((source) => {
              source.removeAttribute("srcset");
              source.setAttribute("srcset", src);
            });
          }
        });
    });
  }

  function applyText(text) {
    if (!text || typeof text !== "object") return;

    const setHtml = (sel, value) => {
      if (value == null || value === "") return;
      document.querySelectorAll(sel).forEach((el) => {
        el.innerHTML = value;
      });
    };

    /* Springs selectors → Hathor CMS fields (content only). */
    if (text.introTitle) {
      setHtml("#i-intro h1.h0", text.introTitle);
      setHtml("#i-intro .h0.leading-trim", text.introTitle);
    }
    if (text.introBody) {
      setHtml("#i-intro .text-c1 p", text.introBody);
      setHtml("#i-next-mobile p", text.introBody);
    }
    if (text.videoTitle) {
      setHtml("#i-video .i-video__title h2", text.videoTitle);
    }
    if (text.videoBody) {
      setHtml("#i-video .i-video__text p", text.videoBody);
    }
    if (text.videoCaptionTitle) {
      setHtml("#i-video .i-video__caption__title h3", text.videoCaptionTitle);
    }
    if (text.videoCaptionBody) {
      setHtml("#i-video .i-video__caption__text p", text.videoCaptionBody);
    }
    if (Array.isArray(text.sliderCaptions)) {
      const blocks = document.querySelectorAll(
        "#i-slider .js-slider-content [data-content-animation-item], #i-slider .i-slider__caption .js-slider-content > div",
      );
      /* Fallback: sequential title/body pairs inside caption stack */
      const titles = document.querySelectorAll(
        "#i-slider .i-slider__caption h3, #i-slider .i-slider__caption .h3",
      );
      text.sliderCaptions.forEach((cap, i) => {
        if (titles[i] && cap.title) titles[i].innerHTML = cap.title;
      });
      const bodies = document.querySelectorAll(
        "#i-slider .i-slider__caption .text-t1 p, #i-slider .i-slider__caption p.text-t1",
      );
      text.sliderCaptions.forEach((cap, i) => {
        if (bodies[i] && cap.body) bodies[i].innerHTML = cap.body;
      });
      void blocks;
    }
    if (text.openingTitle) {
      setHtml("#i-opening .i-opening__caption__title h3", text.openingTitle);
    }
    if (text.openingBody) {
      setHtml("#i-opening .i-opening__caption__text p", text.openingBody);
    }
    if (Array.isArray(text.openingCards)) {
      const labels = document.querySelectorAll(
        "#i-opening .i-opening__list-item__text",
      );
      text.openingCards.forEach((label, i) => {
        if (labels[i] && label) labels[i].textContent = label;
      });
    }
    if (text.natureCaption) {
      setHtml("#i-nature .i-nature__caption p", text.natureCaption);
      setHtml("#i-nature .i-nature__caption", text.natureCaption);
    }
  }

  function reportReady() {
    const height = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      document.querySelector("[data-hathor-amenities-root]")?.scrollHeight || 0,
    );
    parent.postMessage(
      {
        type: "hathor-am-ready",
        height,
        gold: GOLD,
      },
      "*",
    );
  }

  function findLoco() {
    if (window.__hathorLoco) return window.__hathorLoco;
    try {
      for (const key of Object.keys(window)) {
        const value = window[key];
        if (
          value &&
          typeof value === "object" &&
          typeof value.scrollTo === "function" &&
          typeof value.setScroll === "function" &&
          value.scroll
        ) {
          window.__hathorLoco = value;
          return value;
        }
      }
    } catch (_) {
      /* ignore */
    }
    return null;
  }

  function applyScroll(y) {
    const target = Math.max(0, Number(y) || 0);
    const loco = findLoco();
    if (loco) {
      try {
        if (typeof loco.setScroll === "function") {
          loco.setScroll(0, target);
          return;
        }
        loco.scrollTo(target, { immediate: true, duration: 0 });
        return;
      } catch (_) {
        /* fall through */
      }
    }
    try {
      if (window.jQuery && typeof window.jQuery.fn.scrollTo === "function") {
        window.jQuery(window).scrollTo(target, 0);
        return;
      }
    } catch (_) {
      /* fall through */
    }
    window.scrollTo(0, target);
  }

  window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || typeof data !== "object") return;
    if (data.type === "hathor-am-content") {
      applyImages(data.images);
      applyText(data.text);
      requestAnimationFrame(reportReady);
      setTimeout(reportReady, 400);
      setTimeout(reportReady, 1200);
    }
    if (data.type === "hathor-am-scroll") {
      applyScroll(data.y);
    }
  });

  function boot() {
    document.documentElement.classList.add("hathor-am-bridge");
    reportReady();
    parent.postMessage({ type: "hathor-am-boot" }, "*");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("load", () => {
    reportReady();
    setTimeout(reportReady, 800);
  });
})();
