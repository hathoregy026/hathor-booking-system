"use client";

import { useLayoutEffect, type RefObject } from "react";
import { useHathorLuxBodyMotion } from "@/hooks/useHathorLuxBodyMotion";
import { useImmersiveVoyageMotion } from "@/hooks/useImmersiveVoyageMotion";

/** Voyages page motion — lux reveals + river rhythm scrub. */
export function useVoyagesPageMotion(rootRef: RefObject<HTMLElement | null>) {
  useHathorLuxBodyMotion(rootRef);
  useImmersiveVoyageMotion(rootRef);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const tabs = Array.from(
      root.querySelectorAll<HTMLElement>(".voy-features__tab"),
    );
    const panelTitle = root.querySelector<HTMLElement>(
      ".voy-features__panel-title",
    );
    const panelBody = root.querySelector<HTMLElement>(
      ".voy-features__panel-body",
    );

    if (tabs.length === 0 || !panelTitle || !panelBody) return;

    const bodies = tabs.map((tab) => tab.dataset.body ?? "");

    const activate = (index: number) => {
      tabs.forEach((tab, i) => {
        tab.classList.toggle("is-active", i === index);
      });
      const label = tabs[index]?.dataset.label;
      if (label) panelTitle.textContent = label;
      panelBody.textContent = bodies[index] ?? "";
    };

    const onEnter = (event: Event) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>(
        ".voy-features__tab",
      );
      if (!target) return;
      const index = tabs.indexOf(target);
      if (index >= 0) activate(index);
    };

    const rail = root.querySelector(".voy-features__tabs");
    rail?.addEventListener("mouseenter", onEnter, true);

    return () => {
      rail?.removeEventListener("mouseenter", onEnter, true);
    };
  }, [rootRef]);
}
