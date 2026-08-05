"use client";

import { useEffect, useRef, type RefObject } from "react";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";

const NAV_OFFSET_PX = 84;

/**
 * Lenis breaks CSS position:sticky. Pin filters with fixed/absolute so they
 * stay while listings scroll, then release at the bottom of the shell.
 */
export function useMaskRevealStickyFilters(
  shellRef: RefObject<HTMLElement | null>,
  railRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
) {
  const rafRef = useRef(0);

  useEffect(() => {
    const shell = shellRef.current;
    const rail = railRef.current;
    const panel = panelRef.current;
    if (!shell || !rail || !panel) return;

    const mq = window.matchMedia("(max-width: 480px)");
    const scroll = ensurePublicScrollController();

    const sync = () => {
      if (mq.matches) {
        rail.style.height = "";
        panel.style.position = "";
        panel.style.top = "";
        panel.style.left = "";
        panel.style.width = "";
        panel.style.bottom = "";
        return;
      }

      const results = shell.querySelector<HTMLElement>(".mr-results");
      const panelHeight = panel.offsetHeight;
      const railWidth = rail.offsetWidth;

      const contentHeight = Math.max(
        results?.offsetHeight ?? 0,
        panelHeight,
        window.innerHeight - NAV_OFFSET_PX,
      );
      rail.style.height = `${contentHeight}px`;

      const shellRect = shell.getBoundingClientRect();
      const railRect = rail.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const shellTopDoc = scrollY + shellRect.top;
      const shellBottomDoc = shellTopDoc + contentHeight;
      const viewTop = scrollY + NAV_OFFSET_PX;
      const maxPinnedTop = shellBottomDoc - panelHeight;

      panel.style.width = `${railWidth}px`;

      if (viewTop <= shellTopDoc) {
        panel.style.position = "absolute";
        panel.style.top = "0px";
        panel.style.bottom = "auto";
        panel.style.left = "0px";
      } else if (viewTop >= maxPinnedTop) {
        panel.style.position = "absolute";
        panel.style.top = "auto";
        panel.style.bottom = "0px";
        panel.style.left = "0px";
      } else {
        panel.style.position = "fixed";
        panel.style.top = `${NAV_OFFSET_PX}px`;
        panel.style.bottom = "auto";
        panel.style.left = `${railRect.left}px`;
      }
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
    ro.observe(shell);
    const resultsEl = shell.querySelector(".mr-results");
    if (resultsEl) ro.observe(resultsEl);
    ro.observe(panel);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      mq.removeEventListener("change", onScrollOrResize);
      if (typeof offLenis === "function") offLenis();
      else scroll.lenis?.off("scroll", onScrollOrResize);
      ro.disconnect();
      rail.style.height = "";
      panel.style.position = "";
      panel.style.top = "";
      panel.style.left = "";
      panel.style.width = "";
      panel.style.bottom = "";
    };
  }, [shellRef, railRef, panelRef]);
}
