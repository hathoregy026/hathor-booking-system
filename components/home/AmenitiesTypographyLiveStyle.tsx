"use client";

import { useLayoutEffect } from "react";

const STYLE_ID = "hathor-amenities-typo-live";

/**
 * Inject amenities typography CSS at the end of <head> after site typography
 * live CSS, so on-image / on-bg colours always win inside .home-am-sequence.
 */
export function AmenitiesTypographyLiveStyle({ css }: { css: string }) {
  useLayoutEffect(() => {
    if (typeof document === "undefined" || !css.trim()) return;
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
      el =
        (document.querySelector(
          "style[data-hathor-amenities-typo-ssr]",
        ) as HTMLStyleElement | null) ?? null;
    }
    if (!el) {
      el = document.createElement("style");
      document.head.appendChild(el);
    }
    el.id = STYLE_ID;
    el.setAttribute("data-hathor-amenities-typo-ssr", "");
    el.textContent = css;
    /* Keep last in <head> so it beats #hathor-typography-live. */
    document.head.appendChild(el);
  }, [css]);

  return (
    <style
      id={STYLE_ID}
      data-hathor-amenities-typo-ssr
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}
