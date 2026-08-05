"use client";

import { useEffect, useRef, type RefObject } from "react";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";

/** Viewport Y where the panel pins (below fixed public navbar). */
const STICKY_VIEWPORT_TOP = 96;

/**
 * Residences-style sticky filters without jumping.
 * Always position:absolute inside the rail; clamp `top` so the panel
 * pins under the nav while cruises scroll, then stops flush with the
 * bottom of the cruise listings and scrolls away into the footer.
 */
export function useMaskRevealStickyFilters(
  shellRef: RefObject<HTMLElement | null>,
  railRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
) {
  const rafRef = useRef(0);
  const lastTopRef = useRef<number | null>(null);

  useEffect(() => {
    const shell = shellRef.current;
    const rail = railRef.current;
    const panel = panelRef.current;
    if (!shell || !rail || !panel) return;

    const mq = window.matchMedia("(max-width: 480px)");
    const scroll = ensurePublicScrollController();

    const clearInline = () => {
      rail.style.height = "";
      panel.style.position = "";
      panel.style.top = "";
      panel.style.left = "";
      panel.style.width = "";
      panel.style.bottom = "";
      panel.style.willChange = "";
      lastTopRef.current = null;
    };

    const sync = () => {
      if (mq.matches) {
        clearInline();
        return;
      }

      const listings = shell.querySelector<HTMLElement>(".mr-listings");
      const listingsHeight = listings?.offsetHeight ?? 0;
      const panelHeight = panel.offsetHeight;
      const railHeight = Math.max(listingsHeight, panelHeight, 1);

      if (rail.style.height !== `${railHeight}px`) {
        rail.style.height = `${railHeight}px`;
      }

      const railTop = rail.getBoundingClientRect().top;
      const maxTop = Math.max(0, railHeight - panelHeight);
      let nextTop = STICKY_VIEWPORT_TOP - railTop;
      if (nextTop < 0) nextTop = 0;
      if (nextTop > maxTop) nextTop = maxTop;

      /* Avoid sub-pixel thrash / visual jump */
      nextTop = Math.round(nextTop);
      if (lastTopRef.current === nextTop) return;
      lastTopRef.current = nextTop;

      panel.style.position = "absolute";
      panel.style.left = "0px";
      panel.style.width = "100%";
      panel.style.bottom = "auto";
      panel.style.willChange = "top";
      panel.style.top = `${nextTop}px`;
    };

    const onScrollOrResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    mq.addEventListener("change", onScrollOrResize);
    const offLenis = scroll.lenis?.on("scroll", onScrollOrResize);

    const ro = new ResizeObserver(onScrollOrResize);
    const listingsEl = shell.querySelector(".mr-listings");
    if (listingsEl) ro.observe(listingsEl);
    ro.observe(rail);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      mq.removeEventListener("change", onScrollOrResize);
      if (typeof offLenis === "function") offLenis();
      else scroll.lenis?.off("scroll", onScrollOrResize);
      ro.disconnect();
      clearInline();
    };
  }, [shellRef, railRef, panelRef]);
}
