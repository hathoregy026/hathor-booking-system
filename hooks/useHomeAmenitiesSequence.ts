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
      /* Springs shared.js default measure for infrastructure sticky chapters */
      measureSelector: ".sticky",
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

    const natureEl = root.querySelector<HTMLElement>("[data-am-nature]");
    const voyagesEl =
      root.querySelector<HTMLElement>("[data-am-voyages]") ??
      document.querySelector<HTMLElement>("[data-hathor-accordion]");
    const openingEl = root.querySelector<HTMLElement>("[data-am-opening]");

    /*
     * Springs loco: data-scroll-sticky + data-scroll-target="#i-opening"
     * (CSS sticky → position:relative under .has-scroll-smooth).
     * Hathor Lenis + overflow-x:clip break sticky. Manual fixed pin keeps the
     * Springs grid siblings intact (ST pin wrappers would leave the grid).
     */
    const desktopMq = window.matchMedia("(min-width: 1025px)");
    const openingStage = openingEl?.querySelector<HTMLElement>(
      ".home-am-chapter__stage, .sticky__layer--sticky",
    );
    const natureStage = natureEl?.querySelector<HTMLElement>(
      ".home-am-nature__stage, .home-am-chapter__stage",
    );
    type PinMode = "start" | "fixed" | "end";
    const pinMode = { opening: "" as PinMode | "", nature: "" as PinMode | "" };

    const clearPin = (
      el: HTMLElement | null | undefined,
      key: "opening" | "nature",
    ) => {
      if (!el) return;
      pinMode[key] = "";
      el.style.position = "";
      el.style.top = "";
      el.style.left = "";
      el.style.width = "";
      el.style.height = "";
      el.style.bottom = "";
      el.style.zIndex = "";
    };

    const syncChapterPin = (
      chapter: HTMLElement | null | undefined,
      stage: HTMLElement | null | undefined,
      key: "opening" | "nature",
    ) => {
      if (!chapter || !stage || !desktopMq.matches) {
        clearPin(stage, key);
        return;
      }
      const rect = chapter.getBoundingClientRect();
      const vh = window.innerHeight;
      let mode: PinMode;
      if (rect.top >= 0) mode = "start";
      else if (rect.bottom <= vh) mode = "end";
      else mode = "fixed";

      if (mode === pinMode[key]) {
        if (mode === "fixed") {
          stage.style.left = `${rect.left}px`;
          stage.style.width = `${rect.width}px`;
        }
        return;
      }
      pinMode[key] = mode;

      if (mode === "start") {
        stage.style.position = "relative";
        stage.style.top = "0px";
        stage.style.left = "";
        stage.style.width = "";
        stage.style.height = `${vh}px`;
        stage.style.bottom = "";
        stage.style.zIndex = "2";
        return;
      }
      if (mode === "end") {
        stage.style.position = "absolute";
        stage.style.top = "auto";
        stage.style.bottom = "0px";
        stage.style.left = "0px";
        stage.style.width = "100%";
        stage.style.height = `${vh}px`;
        stage.style.zIndex = "2";
        return;
      }
      stage.style.position = "fixed";
      stage.style.top = "0px";
      stage.style.bottom = "";
      stage.style.left = `${rect.left}px`;
      stage.style.width = `${rect.width}px`;
      stage.style.height = `${vh}px`;
      stage.style.zIndex = "2";
    };

    const syncPins = () => {
      syncChapterPin(openingEl, openingStage, "opening");
      syncChapterPin(natureEl, natureStage, "nature");
    };

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
        syncPins();

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
      onRefresh: syncPins,
    });

    /* Helm cover after accordion (follows Springs i-nature image chapter) */
    const helmCoverTrigger = voyagesEl ?? natureEl ?? openingEl;
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

    const frame = requestAnimationFrame(() => {
      if (!active) return;
      engine.refresh();
      syncPins();
      requestScrollRefresh("home-am-springs-layout");
    });
    void document.fonts.ready.then(() => {
      if (!active) return;
      engine.refresh();
      syncPins();
      ScrollTrigger.refresh();
    });
    const settled = window.setTimeout(() => {
      if (!active) return;
      engine.refresh();
      syncPins();
      ScrollTrigger.refresh();
    }, 1000);

    let lastW = window.innerWidth;
    const onViewport = () => {
      if (window.matchMedia("(max-width: 480px)").matches) {
        if (Math.abs(window.innerWidth - lastW) < 20) return;
      }
      lastW = window.innerWidth;
      engine.refresh();
      syncPins();
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
      clearPin(openingStage, "opening");
      clearPin(natureStage, "nature");
      st.kill();
      helmSt?.kill();
      engine.destroy();
    };
  }, [rootRef, sliderCount]);
}
