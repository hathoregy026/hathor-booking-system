/**
 * Touch / coarse-pointer helpers for mobile & tablet.
 * Desktop (fine pointer, >1024px) behavior must remain unchanged.
 *
 * Keep this module free of GSAP so it can run from the root layout (RSC).
 */

export const TOUCH_DEVICE_CLASS = "is-touch-device";
export const PHONE_VIEWPORT_MAX = 480;
export const PHONE_VIEWPORT_MQ = `(max-width: ${PHONE_VIEWPORT_MAX}px)`;

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

/** Strict phone band (≤480px). Tablet 481–1024 is excluded. */
export function isPhoneViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(PHONE_VIEWPORT_MQ).matches;
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

/** Never create Lenis on phones (≤480) or any native-scroll surface. */
export function shouldDisableLenis(): boolean {
  return isPhoneViewport() || shouldUseNativeScroll();
}

/**
 * Dev-only performance breadcrumb — never logs in production.
 */
export function logPhonePerfDev(payload: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "production") return;
  if (typeof console === "undefined" || typeof console.info !== "function") return;
  console.info("[hathor-phone-perf]", payload);
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

export function applyTouchDeviceClass(): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (isTouchDevice()) {
    root.classList.add(TOUCH_DEVICE_CLASS);
  } else {
    root.classList.remove(TOUCH_DEVICE_CLASS);
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
  const phone = isPhoneViewport();

  let timer: ReturnType<typeof setTimeout> | undefined;
  const onResize = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => setViewportHeightCssVar(), phone ? 250 : 150);
  };

  /*
   * On touch / phone browsers, URL-bar collapse emits resize during scrolling.
   * Updating a root CSS variable there forces full-page layout and causes jumps.
   * Phones: orientationchange only. Desktop: resize + visualViewport.
   */
  if (!touch && !phone) {
    window.addEventListener("resize", onResize, { passive: true });
    window.visualViewport?.addEventListener("resize", onResize);
  }
  window.addEventListener("orientationchange", onResize, { passive: true });

  return () => {
    if (timer) clearTimeout(timer);
    if (!touch && !phone) {
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
  /*
   * Only mutate <html> before hydrate. Mutating <body> className here races
   * React hydration (body is a React-owned node). TouchDeviceBootstrap mirrors
   * the class onto body after mount. html already has suppressHydrationWarning.
   */
  return `(function(){try{var d=document.documentElement;var m=window.matchMedia;var coarse=m&&m("(pointer: coarse)").matches;var touchish=coarse||(m&&m("(hover: none)").matches&&m("(max-width: 1024px)").matches);if(touchish){d.classList.add("${TOUCH_DEVICE_CLASS}");}var h=(window.visualViewport&&window.visualViewport.height)||window.innerHeight||0;if(h)d.style.setProperty("--vh",(h*0.01)+"px");}catch(e){}})();`;
}

export function lenisMobileSafeOptions(duration: number) {
  const touch = typeof window !== "undefined" && isTouchDevice();
  return {
    duration: touch ? Math.max(1, duration * 0.9) : duration,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false as const,
  };
}
