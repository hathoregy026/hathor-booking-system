/** Shared motion tokens for the /rooms editorial experience. */

export const ROOMS_EASE = "expo.out" as const;

/** CSS Expo Out curve used by the rooms CSS module. */
export const ROOMS_EASE_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

/** Heavy scroll-linked inertia for GSAP ScrollTrigger scrubbed motion. */
export const ROOMS_SCRUB = 1;

export const ROOMS_MOTION = {
  splitReveal: { duration: 1.25, stagger: 0.05, yPercent: 100 },
  lineReveal: { duration: 1.15, stagger: 0.06, yPercent: 100 },
  goldRule: { duration: 1.1, delay: 0.22 },
  statsFilmstrip: { duration: 1.1, stagger: 0.07, y: 34 },
  textColumn: { duration: 1.1, stagger: 0.07, y: 26 },
  maskReveal: { duration: 1.35 },
  parallax: { yPercent: 15 },
  bentoCell: { duration: 1, stagger: 0.06, y: 32 },
  ctaParallax: { yPercent: 12 },
} as const;

export const ROOMS_SELECTORS = {
  editorial: "[data-rooms-editorial]",
  intro: "[data-rooms-intro]",
  introLine: "[data-rooms-intro-line]",
  kineticTitle: "[data-kinetic-title]",
  kineticLineInner: "[data-kinetic-line]",
  goldRule: "[data-rooms-gold-rule]",
  stat: "[data-rooms-stat]",
  parallaxWrap: "[data-parallax-wrap]",
  parallaxImg: "[data-parallax-img]",
  chapter: "[data-rooms-chapter]",
  chapterText: "[data-rooms-chapter-text]",
  chapterReveal: "[data-rooms-chapter-reveal]",
  bento: "[data-rooms-bento]",
  bentoCell: "[data-rooms-bento-cell]",
  welcome: "[data-rooms-welcome]",
  welcomeReveal: "[data-rooms-welcome-reveal]",
  ctaWrap: "[data-rooms-cta-wrap]",
  ctaImg: "[data-rooms-cta-img]",
  ctaCopy: "[data-rooms-cta-copy]",
  magneticLink: "[data-magnetic-link]",
  magneticArrow: "[data-magnetic-arrow]",
} as const;
