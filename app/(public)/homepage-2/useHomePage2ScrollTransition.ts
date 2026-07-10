/**
 * Homepage-2 scroll transition — shared engine, Venetian handoff:
 * pin theater only; drift disabled; sheet ends full cream; sibling content section after pin.
 */
"use client";

import type { RefObject } from "react";
import { usePageScrollTransition } from "@/components/pages/pageScrollTransitionEngine";

type HomePage2ScrollTransitionRefs = {
  root: RefObject<HTMLElement | null>;
  stage: RefObject<HTMLElement | null>;
  mask: RefObject<HTMLElement | null>;
  sheet: RefObject<HTMLElement | null>;
  heroCopy: RefObject<HTMLElement | null>;
};

export function useHomePage2ScrollTransition(refs: HomePage2ScrollTransitionRefs) {
  usePageScrollTransition({
    ...refs,
    layout: "homepage-2",
  });
}
