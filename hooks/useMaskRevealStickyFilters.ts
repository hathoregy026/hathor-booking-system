"use client";

import { useEffect, useRef, type RefObject } from "react";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";

const STICKY_TOP = 96;

/**
 * Keep filters fixed on the left while cruises scroll; release at the
 * bottom of the cruise pin-row so filters scroll away before the footer.
 * Uses position:fixed (CSS sticky is broken by site overflow-x:clip / Lenis).
 */
export function useMaskRevealStickyFilters(
  pinRowRef: RefObject<HTMLElement | null>,
  filtersRef: RefObject<HTMLElement | null>,
) {
  const rafRef = useRef(0);
  const modeRef = useRef<"start" | "fixed" | "end" | "">("");

  useEffect(() => {
    const pinRow = pinRowRef.current;
    const filters = filtersRef.current;
    if (!pinRow || !filters) return;

    const mq = window.matchMedia("(max-width: 480px)");
    ensurePublicScrollController();

    let spacer: HTMLDivElement | null = null;

    const ensureSpacer = () => {
      if (spacer) return spacer;
      spacer = document.createElement("div");
      spacer.setAttribute("aria-hidden", "true");
      spacer.className = "mr-filters-spacer";
      pinRow.insertBefore(spacer, filters);
      return spacer;
    };

    const clear = () => {
      modeRef.current = "";
      filters.classList.remove("is-fixed", "is-end");
      filters.style.position = "";
      filters.style.top = "";
      filters.style.left = "";
      filters.style.width = "";
      filters.style.bottom = "";
      if (spacer) {
        spacer.remove();
        spacer = null;
      }
    };

    const sync = () => {
      if (mq.matches) {
        clear();
        return;
      }

      const pinRect = pinRow.getBoundingClientRect();
      const filtersHeight = filters.offsetHeight;
      const filtersWidth = filters.offsetWidth;
      const pinLeft = pinRect.left;
      const pinBottom = pinRect.bottom;
      const releaseLine = pinBottom - filtersHeight;

      let mode: "start" | "fixed" | "end";
      if (pinRect.top >= STICKY_TOP) {
        mode = "start";
      } else if (releaseLine <= STICKY_TOP) {
        mode = "end";
      } else {
        mode = "fixed";
      }

      if (mode === "start") {
        if (modeRef.current !== "start") {
          modeRef.current = "start";
          filters.classList.remove("is-fixed", "is-end");
          filters.style.position = "relative";
          filters.style.top = "0px";
          filters.style.left = "0px";
          filters.style.width = "";
          filters.style.bottom = "auto";
          if (spacer) {
            spacer.style.height = "0px";
            spacer.style.width = "0px";
            spacer.style.flex = "0 0 0";
          }
        }
        return;
      }

      const sp = ensureSpacer();
      sp.style.flex = `0 0 ${filtersWidth}px`;
      sp.style.width = `${filtersWidth}px`;
      sp.style.height = "0px";
      sp.style.alignSelf = "stretch";
      sp.style.flexShrink = "0";

      if (mode === "fixed") {
        modeRef.current = "fixed";
        filters.classList.add("is-fixed");
        filters.classList.remove("is-end");
        filters.style.position = "fixed";
        filters.style.top = `${STICKY_TOP}px`;
        filters.style.left = `${pinLeft}px`;
        filters.style.width = `${filtersWidth}px`;
        filters.style.bottom = "auto";
        return;
      }

      /* end — dock to bottom of pin row, then scroll away with cruises */
      modeRef.current = "end";
      filters.classList.remove("is-fixed");
      filters.classList.add("is-end");
      filters.style.position = "absolute";
      filters.style.top = "auto";
      filters.style.bottom = "0px";
      filters.style.left = "0px";
      filters.style.width = `${filtersWidth}px`;
    };

    const onFrame = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onFrame, { passive: true });
    window.addEventListener("resize", onFrame, { passive: true });
    mq.addEventListener("change", onFrame);

    const scroll = ensurePublicScrollController();
    const offLenis = scroll.lenis?.on("scroll", onFrame);

    const ro = new ResizeObserver(onFrame);
    ro.observe(pinRow);
    const listings = pinRow.querySelector(".mr-listings");
    if (listings) ro.observe(listings);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onFrame);
      window.removeEventListener("resize", onFrame);
      mq.removeEventListener("change", onFrame);
      if (typeof offLenis === "function") offLenis();
      else scroll.lenis?.off("scroll", onFrame);
      ro.disconnect();
      clear();
    };
  }, [pinRowRef, filtersRef]);
}
