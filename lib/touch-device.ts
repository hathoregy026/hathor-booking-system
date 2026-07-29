/**
 * Touch / coarse-pointer helpers for mobile & tablet.
 * Desktop (fine pointer, >1024px) behavior must remain unchanged.
 *
 * Keep this module free of GSAP so it can run from the root layout (RSC).
 */

export const TOUCH_DEVICE_CLASS = "is-touch-device";

/** Coarse pointer = primary input is touch (phones, most tablets). */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  /*
   * DevTools “phone” emulation often keeps pointer:fine + a desktop GPU,
   * so it feels smooth while a real handset with pointer:coarse lags.
   * Prefer coarse; fall back to hover:none on narrow screens (iOS quirks).
   */
  if (window.matchMedia("(pointer: coarse)").matches) return true;
  return (
    window.matchMedia("(hover: none)").matches &&
    window.matchMedia("(max-width: 1024px)").matches
  );
}

/**
 * Real devices with weaker GPUs — keep the same effects, use lighter variants
 * (fewer particles, word-level text rise, stepped scrub, no CSS blur).
 * Desktop DevTools phone mode usually stays false (fine pointer + hover).
 */
export function shouldLightenMotionForDevice(): boolean {
  return isTouchDevice();
}

/** Phone + tablet viewport band. Desktop begins strictly above 1024px. */
export function isPhoneOrTabletViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 1024px)").matches;
}

/** Native scrolling avoids Lenis fighting mobile momentum or narrow emulators. */
export function shouldUseNativeScroll(): boolean {
  return isTouchDevice() || isPhoneOrTabletViewport();
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
 * Keep `--vh` current on rotate / chrome resize.
 * Do NOT bind visualViewport `scroll` — that fires constantly on iOS while
 * scrolling and causes lag + ScrollTrigger pin glitches.
 */
export function bindViewportHeightVar(): () => void {
  if (typeof window === "undefined") return () => {};

  setViewportHeightCssVar();
  const touch = isTouchDevice();

  let timer: ReturnType<typeof setTimeout> | undefined;
  const onResize = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => setViewportHeightCssVar(), 150);
  };

  /*
   * On touch browsers, URL-bar collapse emits resize during normal scrolling.
   * Updating a root CSS variable there forces full-page layout and causes jumps.
   */
  if (!touch) {
    window.addEventListener("resize", onResize, { passive: true });
    window.visualViewport?.addEventListener("resize", onResize);
  }
  window.addEventListener("orientationchange", onResize, { passive: true });

  return () => {
    if (timer) clearTimeout(timer);
    if (!touch) {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
    }
    window.removeEventListener("orientationchange", onResize);
  };
}

/**
 * Blocking head script — touch class + `--vh` before paint.
 * Kept minimal; React bootstrap continues updates after hydrate.
 */
export function getTouchDeviceBlockingScript(): string {
  return `(function(){try{var d=document.documentElement;var m=window.matchMedia;var coarse=m&&m("(pointer: coarse)").matches;var touchish=coarse||(m&&m("(hover: none)").matches&&m("(max-width: 1024px)").matches);if(touchish){d.classList.add("${TOUCH_DEVICE_CLASS}");if(document.body)document.body.classList.add("${TOUCH_DEVICE_CLASS}");else document.addEventListener("DOMContentLoaded",function(){document.body.classList.add("${TOUCH_DEVICE_CLASS}");});}var h=(window.visualViewport&&window.visualViewport.height)||window.innerHeight||0;if(h)d.style.setProperty("--vh",(h*0.01)+"px");}catch(e){}})();`;
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
