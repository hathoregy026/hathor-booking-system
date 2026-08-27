/**
 * Shared remeasure wiring for LuxuryHathor horizontal-scroll forks.
 * Does not change travel math — only when measure() is called.
 * Scoped to the five repair pages; About/Contact keep their own listeners.
 */

export type EditorialRemeasureCleanup = () => void;

type AttachEditorialRemeasureOptions = {
  /** Element whose size changes should remeasure travel (usually the track). */
  observe: Element;
  /** Full remeasure + target update. */
  onRemeasure: () => void;
  /**
   * Phone height-only jitter gate (matches existing forks).
   * When false, still remeasure on resize.
   */
  shouldIgnoreHeightOnlyResize?: (prevWidth: number, nextWidth: number) => boolean;
};

/**
 * Wire fonts.ready, window resize, and ResizeObserver → onRemeasure.
 * Caller owns scroll listeners and reduced-motion.
 */
export function attachEditorialRemeasure({
  observe,
  onRemeasure,
  shouldIgnoreHeightOnlyResize = (prev, next) =>
    Math.abs(next - prev) <= 24 && next <= 950,
}: AttachEditorialRemeasureOptions): EditorialRemeasureCleanup {
  let lastWidth = typeof window !== "undefined" ? window.innerWidth : 0;
  let frame = 0;

  const schedule = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = 0;
      onRemeasure();
    });
  };

  const onResize = () => {
    const width = window.innerWidth;
    const ignore = shouldIgnoreHeightOnlyResize(lastWidth, width);
    lastWidth = width;
    if (ignore) return;
    schedule();
  };

  window.addEventListener("resize", onResize, { passive: true });

  const fontsReady = document.fonts?.ready
    ?.then(() => schedule())
    .catch(() => undefined);

  let observer: ResizeObserver | null = null;
  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(() => schedule());
    observer.observe(observe);
    // Images inside the track can change intrinsic size after decode.
    for (const img of observe.querySelectorAll("img")) {
      if (!img.complete) {
        img.addEventListener("load", schedule, { once: true });
      }
    }
  }

  return () => {
    window.removeEventListener("resize", onResize);
    if (frame) cancelAnimationFrame(frame);
    observer?.disconnect();
    void fontsReady;
  };
}
