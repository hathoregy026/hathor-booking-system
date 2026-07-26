/**
 * Shared Lenis damping for marketing pages (home `/`, suites).
 *
 * Intentionally NOT used by cruises, PageScrollTransition, or test-scroll-reveal —
 * those keep their own tuned duration values.
 *
 * Lenis uses either `duration`+`easing` OR `lerp`. We prefer `lerp` in the
 * 0.05–0.1 luxury band for continuous silky coasting (no logic / listener changes).
 */
export const HATHOR_LENIS_PREMIUM = {
  /** ~0.08 ≈ weighted luxury inertia (lower = heavier) */
  lerp: 0.08,
  smoothWheel: true,
  /** Native touch physics — avoids fighting mobile momentum */
  syncTouch: false,
  /** Slightly heavier wheel input for editorial pacing */
  wheelMultiplier: 0.9,
} as const;
