/**
 * Touch / coarse-pointer helpers for mobile & tablet.
 * Desktop (fine pointer, ≥1024px) behavior must remain unchanged.
 *
 * Keep this module free of GSAP so it can run from the root layout (RSC).
 */

export const TOUCH_DEVICE_CLASS = "is-touch-device";

/** Coarse pointer = primary input is touch (phones, most tablets). */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/** Phone + tablet viewport band (does not include desktop ≥1024). */
export function isPhoneOrTabletViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 1023px)").matches;
}

/**
 * Parallax intensity multiplier.
 * Desktop: 1. Phone/tablet (or coarse pointer): 0.5 (−50%).
 */
export function parallaxIntensityScale(): number {
  if (typeof window === "undefined") return 1;
  if (isTouchDevice() || isPhoneOrTabletViewport()) return 0.5;
  return 1;
}

export function applyTouchDeviceClass(root: HTMLElement = document.body): void {
  if (isTouchDevice()) {
    root.classList.add(TOUCH_DEVICE_CLASS);
    document.documentElement.classList.add(TOUCH_DEVICE_CLASS);
  } else {
    root.classList.remove(TOUCH_DEVICE_CLASS);
    document.documentElement.classList.remove(TOUCH_DEVICE_CLASS);
  }
}

/** Sets `--vh` to 1% of the visual viewport (iOS 100vh fallback). */
export function setViewportHeightCssVar(): void {
  if (typeof window === "undefined") return;
  const height = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty("--vh", `${height * 0.01}px`);
}

/**
 * Keep `--vh` current across rotate / URL bar show-hide.
 * Returns cleanup.
 */
export function bindViewportHeightVar(): () => void {
  if (typeof window === "undefined") return () => {};

  setViewportHeightCssVar();

  const onResize = () => setViewportHeightCssVar();
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });
  window.visualViewport?.addEventListener("resize", onResize);
  window.visualViewport?.addEventListener("scroll", onResize);

  return () => {
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
    window.visualViewport?.removeEventListener("resize", onResize);
    window.visualViewport?.removeEventListener("scroll", onResize);
  };
}

/**
 * Blocking head script — touch class + `--vh` before paint.
 * Kept minimal; React bootstrap continues updates after hydrate.
 */
export function getTouchDeviceBlockingScript(): string {
  return `(function(){try{var d=document.documentElement;var coarse=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches;if(coarse){d.classList.add("${TOUCH_DEVICE_CLASS}");if(document.body)document.body.classList.add("${TOUCH_DEVICE_CLASS}");else document.addEventListener("DOMContentLoaded",function(){document.body.classList.add("${TOUCH_DEVICE_CLASS}");});}var h=(window.visualViewport&&window.visualViewport.height)||window.innerHeight||0;if(h)d.style.setProperty("--vh",(h*0.01)+"px");}catch(e){}})();`;
}

/** Shared Lenis options: never sync touch (avoids fighting iOS rubber-band). */
export function lenisMobileSafeOptions(duration: number) {
  const touch = typeof window !== "undefined" && isTouchDevice();
  return {
    duration: touch ? Math.max(1, duration * 0.9) : duration,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false as const,
  };
}
