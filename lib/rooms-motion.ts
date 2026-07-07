/** Shared motion tokens for /rooms editorial experience. */

export const ROOMS_EASE = "expo.out" as const;

/** GSAP scrub smoothing — heavy, premium scroll-linked motion. */
export const ROOMS_SCRUB = 1.2;

/** CSS transitions / hover curves (matches expo.out feel). */
export const ROOMS_EASE_CSS = "cubic-bezier(0.19, 1, 0.22, 1)";

export const ROOMS_MOTION = {
  lineReveal: { duration: 1.4, stagger: 0.08, yPercent: 110 },
  kineticTitle: { duration: 1.2, stagger: 0.1, yPercent: 105 },
  goldRule: { duration: 1, delay: 0.3 },
  statsFilmstrip: { duration: 1, stagger: 0.06, x: 40 },
  textColumn: { duration: 1.1, stagger: 0.08, x: 30 },
  maskReveal: { duration: 1.4 },
  parallax: { yPercent: 15 },
  bentoCell: { duration: 0.9, stagger: 0.05, y: 24 },
} as const;

export const ROOMS_SELECTORS = {
  section: "[data-rooms-section]",
  introLine: "[data-rooms-intro-line]",
  kineticTitle: "[data-kinetic-title]",
  kineticLineInner: "[data-kinetic-line]",
  goldRule: "[data-rooms-gold-rule]",
  stat: "[data-rooms-stat]",
  parallaxWrap: "[data-parallax-wrap]",
  parallaxImg: "[data-parallax-img]",
  chapterText: "[data-rooms-chapter-text]",
  chapterReveal: "[data-rooms-chapter-reveal]",
  bentoCell: "[data-rooms-bento-cell]",
  welcomeReveal: "[data-rooms-welcome-reveal]",
  ctaWrap: "[data-rooms-cta-wrap]",
  ctaImg: "[data-rooms-cta-img]",
} as const;
