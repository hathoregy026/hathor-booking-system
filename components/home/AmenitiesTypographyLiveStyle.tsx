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
      el = document.createElement("style");
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = css;
    /* Keep last in <head> so it beats #hathor-typography-live. */
    document.head.appendChild(el);
  }, [css]);

  return (
    <style
      data-hathor-amenities-typo-ssr
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}
