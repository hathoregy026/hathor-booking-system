"use client";

import { useEffect } from "react";
import {
  mountSpecularButtonFx,
  type SpecularFxHandle,
} from "@/lib/specular-button-fx";

const SELECTOR = [
  ".public-site a.btn",
  ".public-site button.btn",
  ".public-site .public-btn-gold",
  ".public-site .public-btn-outline-gold",
  ".public-site .public-btn-dark",
  ".public-site .hero-cta",
].join(", ");

const SKIP_CLOSEST = [
  ".hathor-booking-modal",
  ".admin-shell",
  "[data-specular-skip]",
].join(", ");

/**
 * Progressive enhancement: attach gold specular rim FX to public CTAs.
 * Skips booking modal / admin / opt-out hosts.
 */
export function SpecularButtons() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const handles = new Map<HTMLElement, SpecularFxHandle>();

    const enhance = (root: ParentNode = document) => {
      root.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (handles.has(el) || el.dataset.specularFx === "1") return;
        if (el.closest(SKIP_CLOSEST)) return;
        if (el.matches(":disabled, [aria-disabled='true']")) return;
        handles.set(el, mountSpecularButtonFx(el));
      });
    };

    enhance();

    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches?.(SELECTOR)) enhance(node.parentElement ?? document);
          else enhance(node);
        }
      }
    });

    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      handles.forEach((handle) => handle.destroy());
      handles.clear();
    };
  }, []);

  return null;
}
