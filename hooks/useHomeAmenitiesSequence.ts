"use client";

import { RefObject, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SPRINGS_AMENITIES_PATTERNS } from "@/lib/springs-amenities-patterns";
import {
  createSpringsParallax,
  sliderCaptionIndex,
} from "@/lib/springs-parallax-engine";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

/**
 * 100% Springs amenities scroll:
 * CSS sticky under-next/under-previous + Springs parallax attribute engine.
 */
export function useHomeAmenitiesSequence(
  rootRef: RefObject<HTMLElement | null>,
  sliderCount: number,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const isCompact = window.matchMedia("(max-width: 1024px)").matches;

    const engine = createSpringsParallax(root, {
      measureSelector: "[data-am-chapter]",
      patterns: SPRINGS_AMENITIES_PATTERNS,
    });

    /* Slider caption discrete open — Springs infrastructureSliderScroll */
    const captions = Array.from(
      root.querySelectorAll<HTMLElement>("[data-amenities-caption]"),
    );
    const progressLine = root.querySelector<HTMLElement>(
      "[data-amenities-progress]",
    );
    const slider = root.querySelector<HTMLElement>("[data-am-slider]");
    let activeCaption = -1;

    const openCaption = (index: number) => {
      if (index === activeCaption) return;
      activeCaption = index;
      captions.forEach((caption, i) => {
        const on = i === index;
        caption.classList.toggle("is-hidden", !on);
        caption.setAttribute("aria-hidden", on ? "false" : "true");
        gsap.to(caption, {
          autoAlpha: on ? 1 : 0,
          duration: on ? 0.45 : 0.25,
          overwrite: true,
        });
      });
    };

    if (captions.length) {
      captions.forEach((c, i) => {
        gsap.set(c, { autoAlpha: i === 0 ? 1 : 0 });
        c.classList.toggle("is-hidden", i !== 0);
      });
      openCaption(0);
    }

    /* Opening right-column caption wipe uses inline data attrs — engine handles it.
       Video caption move-up: bind extra dynamic keys if present. */
    const videoCaption = root.querySelector<HTMLElement>(
      "[data-am-video-caption]",
    );
    if (videoCaption && sliderCount >= 0) {
      /* initial closed state for caption wipe attrs already in markup */
    }

    const st = ScrollTrigger.create({
      id: "home-am-springs-parallax",
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      refreshPriority: -90,
      onUpdate: () => {
        const y = window.scrollY || window.pageYOffset;
        engine.update(y);

        if (slider && captions.length) {
          const rect = slider.getBoundingClientRect();
          const top = window.scrollY + rect.top;
          const height = slider.offsetHeight;
          /* Springs: parallax-0-0 → parallax-200-100 */
          const from = top;
          const to = top + height - 2 * window.innerHeight;
          const span = Math.max(1, to - from);
          const position = Math.min(
            1,
            Math.max(0, (y - from) / span),
          );
          openCaption(sliderCaptionIndex(position, captions.length));
          if (progressLine) {
            progressLine.style.height = `${(position * 100).toFixed(2)}%`;
          }
        }
      },
    });

    /* Helm cover after Our Voyages (accordion inside amenities sequence) */
    const voyages =
      root.querySelector<HTMLElement>("[data-am-voyages]") ??
      document.querySelector<HTMLElement>("[data-hathor-accordion]");
    const opening = root.querySelector<HTMLElement>("[data-am-opening]");
    const helmCoverTrigger = voyages ?? opening;
    const helm = document.querySelector<HTMLElement>("[data-home-helm-portal]");
    let helmSt: ScrollTrigger | undefined;
    if (helm && helmCoverTrigger) {
      gsap.set(helm, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      });
      /* Wipe only after Voyages has been on screen — not as it enters. */
      helmSt = ScrollTrigger.create({
        id: "home-am-to-helm",
        trigger: helmCoverTrigger,
        start: "bottom bottom",
        end: "bottom top",
        scrub: true,
        refreshPriority: -84,
        onUpdate: (self) => {
          const t = self.progress;
          gsap.set(helm, {
            clipPath: `polygon(0% ${100 - t * 100}%, 100% ${100 - t * 100}%, 100% 100%, 0% 100%)`,
          });
        },
      });
    }

    let active = true;

    /* Opening → Voyages: hide sticky left photo once cream enters (no bleed) */
    const openingEl = root.querySelector<HTMLElement>("[data-am-opening]");
    const sliderEl = root.querySelector<HTMLElement>("[data-am-slider]");
    const voyagesEl =
      root.querySelector<HTMLElement>("[data-am-voyages]") ??
      document.querySelector<HTMLElement>("[data-am-voyages]");
    const syncOpeningVoyagesCover = () => {
      if (!openingEl) return;
      const openingRect = openingEl.getBoundingClientRect();
      const voyTop = voyagesEl?.getBoundingClientRect().top ?? Infinity;

      /* Slider sticky must not paint through the opening gold column */
      if (sliderEl) {
        const openingActive =
          openingRect.bottom > window.innerHeight * 0.15 &&
          openingRect.top < window.innerHeight * 0.85;
        sliderEl.classList.toggle("is-opening-covering", openingActive);
      }

      /*
       * Voyages clip-path is inset(100svh): cream paints from (voyTop + 100svh).
       * Hide BOTH opening halves as soon as cream is well into view so the sticky
       * left photo leaves with the gold — not after cream has already covered it.
       */
      const creamTop = voyTop + window.innerHeight;
      const covering = creamTop < window.innerHeight * 0.7;
      openingEl.classList.toggle("is-voyages-covering", covering);
    };
    syncOpeningVoyagesCover();
    const coverSt = ScrollTrigger.create({
      id: "home-am-opening-voyages-cover",
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onUpdate: syncOpeningVoyagesCover,
      onRefresh: syncOpeningVoyagesCover,
    });

    const frame = requestAnimationFrame(() => {
      if (!active) return;
      engine.refresh();
      requestScrollRefresh("home-am-springs-layout");
    });
    void document.fonts.ready.then(() => {
      if (!active) return;
      engine.refresh();
      ScrollTrigger.refresh();
    });
    const settled = window.setTimeout(() => {
      if (!active) return;
      engine.refresh();
      ScrollTrigger.refresh();
    }, 1000);

    let lastW = window.innerWidth;
    const onViewport = () => {
      if (window.matchMedia("(max-width: 480px)").matches) {
        if (Math.abs(window.innerWidth - lastW) < 20) return;
      }
      lastW = window.innerWidth;
      engine.refresh();
      ScrollTrigger.refresh();
    };
    window.addEventListener(
      isCompact ? "orientationchange" : "resize",
      onViewport,
    );

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      clearTimeout(settled);
      window.removeEventListener(
        isCompact ? "orientationchange" : "resize",
        onViewport,
      );
      st.kill();
      coverSt?.kill();
      helmSt?.kill();
      engine.destroy();
    };
  }, [rootRef, sliderCount]);
}
