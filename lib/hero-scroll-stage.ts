/**
 * Shared home-style hero scroll stage — logo landing, gold blinds, pinned scrub.
 */
// @ts-nocheck
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";
import { logPhonePerfDev } from "@/lib/touch-device";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

type MountHeroScrollStageOptions = {
  prefersReduced: boolean;
  lenis?: Lenis | null;
  /** Exact hero instance. Inner pages pass a ref to avoid stale route nodes. */
  hero?: HTMLElement | null;
  /** Split-letter land duration in seconds (from admin logo tune). */
  logoLandDuration?: number;
  /** Hard-refresh mid-page: skip land tween and snap to rested logo. */
  skipLanding?: boolean;
};

/** Extra downward offset at logo landing / scroll-scrub start (px). */
const LOGO_FINISH_Y_OFFSET_PX = 30;
/** Per-letter land rise duration (seconds). Kept short so land never feels stalled. */
const DEFAULT_LOGO_LAND_DURATION = 0.65;
const LOGO_LAND_STAGGER = 0.06;
const LOGO_LAND_DELAY = 0;
const LOGO_LAND_EASE = "power3.out";
/** Homepage land: hold main hero titles, then rise (seconds). Logo / CTA / blinds untouched. */
const TITLE_LAND_DELAY = 6;
const TITLE_LAND_DURATION = 1.2;
const TITLE_LAND_STAGGER = 0.22;
const TITLE_LAND_FROM_Y = 64;
const TITLE_LAND_EASE = "power3.out";
/** Desktop scrub: per-letter exit — long silk drift, one-by-one cascade. */
const LOGO_SCROLL_LETTER_DURATION = 1.05;
const LOGO_SCROLL_LETTER_STAGGER = 0.12;
const LOGO_SCROLL_LETTER_AT = 0.06;
const LOGO_SCROLL_LETTER_EASE = "power3.inOut";

export function mountHeroScrollStage({
  prefersReduced,
  lenis = null,
  hero: requestedHero = null,
  logoLandDuration = DEFAULT_LOGO_LAND_DURATION,
  skipLanding = false,
}: MountHeroScrollStageOptions): () => void {
  const heroes = Array.from(
    document.querySelectorAll<HTMLElement>(".home-hero-container"),
  );
  // Pick the hero instance that actually has the scroll cover + heading/button.
  // Some routes can momentarily keep multiple hero nodes around during transitions.
  const hero =
    requestedHero ??
    heroes.find((h) => {
      return Boolean(
        h.isConnected &&
          h.querySelector(".home-hero-cover") &&
          h.querySelector(".hero-heading") &&
          h.querySelector(".hero-button"),
      );
    }) ??
    heroes[0];
  const cover = hero?.querySelector(".home-hero-cover");
  if (!hero || !cover) return () => {};

  const readLogoLandDuration = () => {
    const fromCss = Number.parseFloat(
      getComputedStyle(hero).getPropertyValue("--hathor-logo-anim-duration"),
    );
    if (Number.isFinite(fromCss) && fromCss > 0) return fromCss;
    if (Number.isFinite(logoLandDuration) && logoLandDuration > 0) {
      return logoLandDuration;
    }
    return DEFAULT_LOGO_LAND_DURATION;
  };

  const logoMark = hero.querySelector(".hero-logo-mark");
  const lineRight = hero.querySelector(".hero-line--right");
  const lineLeft = hero.querySelector(".hero-line--left");
  /* HTMLElement (not Element) — the CTA width is driven via .style custom props. */
  const cta = hero.querySelector<HTMLElement>(".hero-cta");
  const ctaText = hero.querySelector(".hero-cta-text");
  const kicker = hero.querySelector(".hero-kicker");
  const sub = hero.querySelector(".hero-sub");
  const scrollHint = hero.querySelector(".hero-scroll-hint");
  const chrome = hero.querySelectorAll(
    ".hero-side, .hero-heading, .hero-button",
  );

  document.querySelectorAll(".hero-logo-bridge").forEach((el) => el.remove());

  const root = document.documentElement;
  const markHeroMotionReady = () => {
    root.classList.add("hero-motion-ready");
  };

  if (chrome.length) {
    const isHomeLand = document.documentElement.classList.contains("ex-home");
    /* Home: CSS owns visibility once fonts are ready — no GSAP fade that fights type. */
    if (prefersReduced || isHomeLand) {
      gsap.set(chrome, { opacity: 1, y: 0 });
      markHeroMotionReady();
    } else {
      gsap.set(chrome, { opacity: 0, y: 16 });
      markHeroMotionReady();
      gsap.to(chrome, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.15,
        stagger: 0.05,
      });
    }
  } else {
    markHeroMotionReady();
  }

  /* Hold main hero titles until the delayed land rise — do not touch logo / CTA. */
  if (
    !skipLanding &&
    !prefersReduced &&
    (lineRight || lineLeft)
  ) {
    gsap.set([lineRight, lineLeft].filter(Boolean), {
      y: TITLE_LAND_FROM_Y,
      opacity: 0,
      force3D: true,
    });
  }

  function isSplitLetterLogo() {
    return Boolean(logoMark?.querySelector(".hathor-logo-split"));
  }

  function getLogoHiddenY() {
    const logoHeight = logoMark?.offsetHeight || window.innerHeight * 0.42;
    return logoHeight * 0.78 + window.innerHeight * 0.12;
  }

  function getLogoLandedY() {
    const ctaEl = hero.querySelector(".hero-cta");
    if (!logoMark || !ctaEl) return 0;

    // Split logo + CTA share CSS vertical centering — land at y:0.
    if (isSplitLetterLogo()) return 0;

    const currentY = Number(gsap.getProperty(logoMark, "y")) || 0;
    gsap.set(logoMark, { y: 0, xPercent: -50, yPercent: 0 });
    const logoRect = logoMark.getBoundingClientRect();
    const ctaRect = ctaEl.getBoundingClientRect();
    const delta =
      ctaRect.top + ctaRect.height / 2 - (logoRect.top + logoRect.height / 2);
    gsap.set(logoMark, { y: currentY });
    return delta + LOGO_FINISH_Y_OFFSET_PX;
  }

  const killByPrefix = (prefix: string) => {
    ScrollTrigger.getAll().forEach((st) => {
      if (st.vars && String(st.vars.id || "").startsWith(prefix)) st.kill();
    });
  };

  let landingTween: gsap.core.Tween | null = null;
  let titleLandTween: gsap.core.Tween | null = null;
  let logoReadyForScroll = false;
  let titlesLanded = skipLanding || prefersReduced;

  const getTitleLines = () =>
    [lineRight, lineLeft].filter(Boolean) as Element[];

  const snapTitlesLanded = () => {
    titleLandTween?.kill();
    titleLandTween = null;
    const lines = getTitleLines();
    if (lines.length) {
      gsap.set(lines, { y: 0, opacity: 1, clearProps: "transform" });
    }
    titlesLanded = true;
  };

  const playTitleLanding = () => {
    if (titlesLanded || prefersReduced) {
      snapTitlesLanded();
      return;
    }
    const lines = getTitleLines();
    if (!lines.length) {
      titlesLanded = true;
      return;
    }
    gsap.set(lines, { y: TITLE_LAND_FROM_Y, opacity: 0, force3D: true });
    titleLandTween = gsap.to(lines, {
      y: 0,
      opacity: 1,
      duration: TITLE_LAND_DURATION,
      stagger: TITLE_LAND_STAGGER,
      ease: TITLE_LAND_EASE,
      delay: TITLE_LAND_DELAY,
      onComplete: () => {
        titlesLanded = true;
        titleLandTween = null;
      },
    });
  };

  const markLogoReady = () => {
    logoReadyForScroll = true;
    if (logoMark) {
      gsap.set(logoMark, { y: getLogoLandedY() });
    }
    ScrollTrigger.getAll().forEach((st) => {
      if (st.vars && st.vars.id === "hero-stage") st.refresh();
    });
  };

  const isPhoneHero = window.matchMedia("(max-width: 480px)").matches;
  const isTabletHero = window.matchMedia(
    "(min-width: 481px) and (max-width: 1024px)",
  ).matches;
  /* Phone + tablet both grow the Book Now pill by width, never by scaleX. */
  const isNarrowCta = isPhoneHero || isTabletHero;

  if (prefersReduced) {
    killByPrefix("hero-stage");
    cover.innerHTML = "";

    if (chrome.length) {
      gsap.set(chrome, { opacity: 1, y: 0, clearProps: "transform" });
    }
    if (lineRight) gsap.set(lineRight, { x: 0, opacity: 1, clearProps: "transform" });
    if (lineLeft) gsap.set(lineLeft, { x: 0, opacity: 1, clearProps: "transform" });
    if (kicker) gsap.set(kicker, { opacity: 1, y: 0 });
    if (sub) gsap.set(sub, { opacity: 1, y: 0 });
    if (scrollHint) gsap.set(scrollHint, { opacity: 1 });
    if (cta) {
      /* scaleX is legacy state from the old stretch; clear it defensively. */
      gsap.set(cta, { scaleX: 1, clearProps: "width,height,letterSpacing,scaleX" });
      cta.style.removeProperty("--hero-cta-w");
    }
    if (ctaText) gsap.set(ctaText, { clearProps: "letterSpacing" });

    if (logoMark) {
      gsap.set(logoMark, {
        xPercent: -50,
        yPercent: 0,
        x: 0,
        y: 0,
        scale: 1,
        autoAlpha: 1,
        force3D: true,
        transformOrigin: "50% 50%",
      });
      gsap.set(logoMark.querySelectorAll(".logo-letter-wrap"), {
        y: 0,
        opacity: 1,
        clearProps: "transform",
      });
      gsap.set(logoMark.querySelectorAll(".logo-letter"), {
        y: 0,
        opacity: 1,
        clearProps: "transform",
      });
    }

    logoReadyForScroll = true;
    markHeroMotionReady();
    document.documentElement.classList.add("ex-scroll-ready");
    document.documentElement.classList.remove("ex-pending", "ex-pending-deep");

    return () => {
      cover.replaceChildren();
      killByPrefix("hero-stage");
      root.classList.remove("hero-motion-ready");
    };
  }

  if (logoMark) {
    if (isSplitLetterLogo()) {
      // Split letters animate individually — keep the group parked at rest.
      gsap.set(logoMark, {
        xPercent: -50,
        yPercent: 0,
        x: 0,
        y: 0,
        scale: 1,
        autoAlpha: 1,
        force3D: true,
        transformOrigin: "50% 50%",
      });
      gsap.set(logoMark.querySelectorAll(".logo-letter-wrap"), {
        y: getLogoHiddenY(),
        opacity: 0,
        force3D: true,
      });
    } else {
      gsap.set(logoMark, {
        xPercent: -50,
        yPercent: 0,
        x: 0,
        y: getLogoHiddenY(),
        scale: 1,
        autoAlpha: 0,
        force3D: true,
        transformOrigin: "50% 50%",
      });
    }
  }

  const playLanding = () => {
    if (!logoMark) return;

    const letterTargets = gsap.utils.toArray(
      logoMark.querySelectorAll(".logo-letter-wrap"),
    );

    // Split wordmark: per-letter rise into the CSS end pose (same slow land as the old huge logo).
    // Do NOT move the whole .hero-logo-mark — that made every letter rise together.
    if (isSplitLetterLogo() && letterTargets.length) {
      gsap.set(logoMark, {
        xPercent: -50,
        yPercent: 0,
        x: 0,
        y: 0,
        scale: 1,
        autoAlpha: 1,
      });

      const riseFrom = getLogoHiddenY();
      gsap.set(letterTargets, { y: riseFrom, opacity: 0, force3D: true });

      landingTween = gsap.to(letterTargets, {
        y: 0,
        opacity: 1,
        duration: readLogoLandDuration(),
        stagger: LOGO_LAND_STAGGER,
        ease: LOGO_LAND_EASE,
        delay: LOGO_LAND_DELAY,
        onComplete: markLogoReady,
      });
      return;
    }

    const letters = logoMark.querySelectorAll(".logo-letter");

    gsap.set(logoMark, {
      xPercent: -50,
      yPercent: 0,
      x: 0,
      y: getLogoHiddenY(),
      scale: 1,
      autoAlpha: 1,
    });

    if (letters.length) {
      gsap.set(letters, { y: 48, opacity: 0, force3D: true });
      gsap.to(letters, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: LOGO_LAND_STAGGER,
        ease: LOGO_LAND_EASE,
        delay: LOGO_LAND_DELAY,
      });
    }

    landingTween = gsap.to(logoMark, {
      y: getLogoLandedY(),
      duration: readLogoLandDuration(),
      ease: LOGO_LAND_EASE,
      delay: LOGO_LAND_DELAY,
      onComplete: markLogoReady,
    });
  };

  const build = () => {
    killByPrefix("hero-stage");

    if (titlesLanded) {
      if (lineRight) gsap.set(lineRight, { x: 0, opacity: 1, clearProps: "transform" });
      if (lineLeft) gsap.set(lineLeft, { x: 0, opacity: 1, clearProps: "transform" });
    } else {
      /* Preserve delayed title land (y/opacity); only reset scrub x. */
      if (lineRight) gsap.set(lineRight, { x: 0 });
      if (lineLeft) gsap.set(lineLeft, { x: 0 });
    }
    if (kicker) gsap.set(kicker, { opacity: 1, y: 0 });
    if (sub) gsap.set(sub, { opacity: 1, y: 0 });
    if (scrollHint) gsap.set(scrollHint, { opacity: 1 });

    const w = window.innerWidth;
    let blindsCount = 48;
    if (w <= 480) blindsCount = 14;
    else if (w <= 767) blindsCount = 26;
    else if (w <= 1024) blindsCount = 36;

    const heroWidth = hero.clientWidth || w;
    const stripWidth = heroWidth / blindsCount;
    cover.innerHTML = "";
    for (let i = 0; i < blindsCount; i++) {
      const strip = document.createElement("div");
      strip.classList.add("blind-strip-v");
      strip.style.left = i * stripWidth - 0.5 + "px";
      strip.style.width = stripWidth + 1 + "px";
      strip.style.top = "0";
      strip.style.height = "100%";
      strip.style.position = "absolute";
      strip.style.transformOrigin = "left center";
      strip.style.transformStyle = "preserve-3d";
      gsap.set(strip, {
        rotationY: -90,
        opacity: 0,
        visibility: "hidden",
        force3D: true,
      });
      cover.appendChild(strip);
    }
    const strips = gsap.utils.toArray(
      cover.querySelectorAll(".blind-strip-v"),
    ) as Element[];

    const baseW = cta ? cta.offsetWidth || 168 : 168;
    const targetW = baseW * 4;
    /*
     * Narrow-screen Book Now stretch.
     *
     * Phone and tablet used to tween `scaleX: 4`. scaleX is a geometric
     * transform, so it stretched the pill, EVERY GLYPH and the 1px border
     * horizontally — the letters came out visibly distorted. Desktop never had
     * this because it tweens `width`, which grows the box and lets the text
     * re-centre at its natural proportions.
     *
     * scaleX was a workaround: mobile-touch.css pins the tablet width with
     * `width: ... !important`, which GSAP's inline `width` can never outrank.
     * The fix is to animate a custom property that the width expression reads
     * (see home-responsive.css section 6), so the !important rule stays in
     * place — it still anchors the resting width to the split-logo gap — while
     * the value inside it animates.
     *
     * `targetW` is also a desktop number: x4 of a 156px pill is 624px, which is
     * 160% of a 390px viewport. Cap the narrow target to the viewport less a
     * gutter so the pill grows to fill the screen instead of overflowing it.
     */
    const narrowCtaTargetW = Math.min(targetW, Math.max(baseW, w - 32));
    if (cta) {
      if (isNarrowCta) {
        gsap.set(cta, {
          height: 52,
          scaleX: 1,
          transformOrigin: "50% 50%",
          force3D: true,
        });
        cta.style.setProperty("--hero-cta-w", `${baseW}px`);
      } else {
        gsap.set(cta, { width: baseW, height: 52 });
      }
    }
    if (ctaText) gsap.set(ctaText, { letterSpacing: "0.22em" });

    const titleTravel = Math.min(w * 0.38, 420);
    const isTouch = window.matchMedia("(max-width: 1024px)").matches;
    const isPhoneTouch = window.matchMedia("(max-width: 480px)").matches;
    /*
     * Phone: sticky runway (`.home-hero-runway`) + direct scrub.
     * Avoid GSAP pin — pin-spacer + mobile browser chrome = jumpy strips.
     */
    const phoneRunway = isPhoneTouch
      ? (hero.closest(".home-hero-runway") as HTMLElement | null)
      : null;
    const tabletRunway = isTabletHero
      ? (hero.closest(".home-hero-runway") as HTMLElement | null)
      : null;
    const heroTrigger = phoneRunway || tabletRunway || hero;

    const tl = gsap.timeline({
      scrollTrigger: {
        id: "hero-stage",
        trigger: heroTrigger,
        start: "top top",
        end:
          isPhoneTouch && phoneRunway
            ? "bottom bottom"
            : isTabletHero && tabletRunway
              ? "bottom bottom" /* runway height: 360svh (100 + 260 scrub) */
              : isTabletHero
                ? "+=260%" /* fallback only if .home-hero-runway missing */
              : isPhoneTouch
              ? "+=290%"
              : "+=175%", /* desktop — restored cinematic pin runway */
        // Direct scrub on touch — laggy scrub (1.7) feels like scroll jumping
        scrub: isTouch ? true : 0.25,
        pin: !(isPhoneTouch || isTabletHero),
        pinSpacing: !(isPhoneTouch || isTabletHero),
        anticipatePin: isPhoneTouch || isTabletHero ? 0 : 1,
        invalidateOnRefresh: !(isPhoneTouch || isTabletHero),
        onLeave: () => {
          if (isPhoneTouch || !logoMark) return;
          if (isSplitLetterLogo()) {
            // Park the mark; letters stay at scrub end so reverse can rebuild.
            gsap.set(logoMark, {
              autoAlpha: 1,
              y: getLogoLandedY(),
              xPercent: -50,
              x: 0,
              yPercent: 0,
              scale: 1,
            });
            gsap.set(logoMark.querySelectorAll(".logo-letter-wrap"), {
              y: getLogoHiddenY(),
              opacity: 0,
              force3D: true,
            });
            return;
          }
          gsap.set(logoMark, { autoAlpha: 0, y: getLogoHiddenY() });
        },
        onEnterBack: () => {
          if (isPhoneTouch || !logoMark) return;
          // Re-show the container so scrubbed letter rise (reverse) is visible.
          gsap.set(logoMark, {
            autoAlpha: 1,
            y: getLogoLandedY(),
            xPercent: -50,
            x: 0,
            yPercent: 0,
            scale: 1,
          });
        },
      },
    });

    if (isPhoneTouch) {
      logPhonePerfDev({
        surface: "hero-stage",
        triggerCount: 1,
        pin: false,
        stickyRunway: Boolean(phoneRunway),
        scrub: true,
        strips: strips.length,
      });
    }

    if (isPhoneTouch) {
      const phoneStripStagger = strips.length > 1 ? 0.02 : 0;

      gsap.set(strips, {
        rotationY: -90,
        opacity: 0,
        visibility: "visible",
        force3D: true,
      });

      if (logoMark) {
        const landedY = getLogoLandedY();
        if (isSplitLetterLogo()) {
          gsap.set(logoMark, {
            xPercent: -50,
            yPercent: 0,
            x: 0,
            y: 0,
            scale: 1,
            autoAlpha: 1,
          });
          gsap.set(logoMark.querySelectorAll(".logo-letter-wrap"), {
            y: getLogoHiddenY(),
            opacity: 0,
            force3D: true,
          });
        } else {
          gsap.set(logoMark, {
            xPercent: -50,
            yPercent: 0,
            x: 0,
            y: getLogoHiddenY(),
            scale: 1,
            autoAlpha: 0,
            force3D: true,
          });
          const letters = logoMark.querySelectorAll(".logo-letter");
          if (letters.length) {
            gsap.set(letters, { y: 48, opacity: 0, force3D: true });
          }
          void landedY;
        }
      }

      tl.to(
        strips,
        {
          rotationY: 0,
          opacity: 1,
          ease: "none",
          stagger: { each: phoneStripStagger, from: "start" },
          duration: 0.82,
        },
        0.08,
      );

      if (lineRight) {
        tl.to(
          lineRight,
          { x: titleTravel, opacity: 0, ease: "none", duration: 0.52 },
          0,
        );
      }
      if (lineLeft) {
        tl.to(
          lineLeft,
          { x: -titleTravel, opacity: 0, ease: "none", duration: 0.52 },
          0,
        );
      }
      if (kicker) {
        tl.to(kicker, { opacity: 0, y: -10, ease: "none", duration: 0.42 }, 0.04);
      }
      if (sub) {
        tl.to(sub, { opacity: 0, y: 8, ease: "none", duration: 0.42 }, 0.06);
      }
      if (scrollHint) {
        tl.to(scrollHint, { opacity: 0, ease: "none", duration: 0.26 }, 0.1);
      }

      /*
       * Phone CTA: grow the real width via --hero-cta-w. Tweening scaleX here
       * stretched every glyph and the border (see narrowCtaTargetW above).
       */
      if (cta) {
        tl.to(
          cta,
          {
            "--hero-cta-w": `${narrowCtaTargetW}px`,
            ease: "none",
            duration: 0.42,
          },
          0.48,
        );
      }
      if (ctaText) {
        tl.to(
          ctaText,
          { letterSpacing: "1.15em", ease: "none", duration: 0.42 },
          0.48,
        );
      }

      if (logoMark) {
        if (isSplitLetterLogo()) {
          tl.to(
            logoMark.querySelectorAll(".logo-letter-wrap"),
            {
              y: 0,
              opacity: 1,
              ease: "power2.out",
              duration: 0.34,
              stagger: 0.085,
            },
            0.38,
          );
        } else {
          tl.to(
            logoMark,
            {
              y: getLogoLandedY(),
              autoAlpha: 1,
              ease: "power2.out",
              duration: 0.34,
            },
            0.38,
          );
          const letters = logoMark.querySelectorAll(".logo-letter");
          if (letters.length) {
            tl.to(
              letters,
              {
                y: 0,
                opacity: 1,
                ease: "power2.out",
                duration: 0.26,
                stagger: 0.09,
              },
              0.42,
            );
          }
        }
      }
    } else if (isTabletHero) {
      const tabletStripStagger = strips.length > 1 ? 0.018 : 0;
      const tabletLogoRiseAt = 0.34;
      const tabletCtaStart = 0.48;
      const tabletCtaDuration = 0.34;

      gsap.set(strips, {
        rotationY: -90,
        opacity: 0,
        visibility: "visible",
        force3D: true,
      });
      if (logoMark && isSplitLetterLogo()) {
        gsap.set(logoMark.querySelectorAll(".logo-letter-wrap"), {
          y: getLogoHiddenY(),
          opacity: 0,
          force3D: true,
        });
      }

      tl.to(
        strips,
        {
          rotationY: 0,
          opacity: 1,
          ease: "none",
          stagger: { each: tabletStripStagger, from: "start" },
          duration: 0.82,
        },
        0.1,
      );
      if (lineRight) {
        tl.to(
          lineRight,
          { x: titleTravel, opacity: 0, ease: "none", duration: 0.5 },
          0.04,
        );
      }
      if (lineLeft) {
        tl.to(
          lineLeft,
          { x: -titleTravel, opacity: 0, ease: "none", duration: 0.5 },
          0.04,
        );
      }
      if (kicker) {
        tl.to(kicker, { opacity: 0, y: -10, ease: "none", duration: 0.42 }, 0.06);
      }
      if (sub) {
        tl.to(sub, { opacity: 0, y: 8, ease: "none", duration: 0.42 }, 0.08);
      }
      if (scrollHint) {
        tl.to(scrollHint, { opacity: 0, ease: "none", duration: 0.24 }, 0.1);
      }
      if (cta) {
        gsap.set(cta, {
          scaleX: 1,
          transformOrigin: "50% 50%",
          force3D: true,
        });
        /* Width, not scaleX — same reason as the phone branch. */
        tl.to(
          cta,
          {
            "--hero-cta-w": `${narrowCtaTargetW}px`,
            ease: "none",
            duration: tabletCtaDuration,
          },
          tabletCtaStart,
        );
      }
      if (ctaText) {
        tl.to(
          ctaText,
          { letterSpacing: "1.15em", ease: "none", duration: tabletCtaDuration },
          tabletCtaStart,
        );
      }
      if (logoMark) {
        if (isSplitLetterLogo()) {
          tl.to(
            logoMark.querySelectorAll(".logo-letter-wrap"),
            {
              y: 0,
              opacity: 1,
              ease: "power2.out",
              duration: 0.32,
              stagger: 0.08,
            },
            tabletLogoRiseAt,
          );
        } else {
          tl.to(
            logoMark,
            {
              y: getLogoLandedY(),
              autoAlpha: 1,
              ease: "power2.out",
              duration: 0.32,
            },
            tabletLogoRiseAt,
          );
        }
      }
      tl.to({}, { duration: 0.08 }, 0.92);
      if (process.env.NODE_ENV !== "production") {
        console.info("[hero-tablet-stages]", {
          introStill: [0, 0.1],
          stripOpen: [0.1, 0.92],
          copyExit: [0.04, 0.58],
          logoRise: [tabletLogoRiseAt, 0.66],
          ctaExpand: [tabletCtaStart, tabletCtaStart + tabletCtaDuration],
          finalDwell: [0.92, 1],
          pin: false,
          scrub: true,
        });
      }
    } else {
      tl.to(
        strips,
        {
          rotationY: 0,
          opacity: 1,
          visibility: "visible",
          ease: "none",
          stagger: { each: 0.028, from: "start" },
          duration: 1,
        },
        0,
      );

      if (lineRight) {
        tl.to(lineRight, { x: titleTravel, opacity: 0, ease: "none", duration: 1 }, 0);
      }
      if (lineLeft) {
        tl.to(lineLeft, { x: -titleTravel, opacity: 0, ease: "none", duration: 1 }, 0);
      }
      if (kicker) tl.to(kicker, { opacity: 0, y: -10, ease: "none", duration: 0.65 }, 0);
      if (sub) tl.to(sub, { opacity: 0, y: 8, ease: "none", duration: 0.65 }, 0);
      if (scrollHint) tl.to(scrollHint, { opacity: 0, ease: "none", duration: 0.35 }, 0);

      if (cta) tl.to(cta, { width: targetW, ease: "none", duration: 1 }, 0);
      if (ctaText) tl.to(ctaText, { letterSpacing: "1.15em", ease: "none", duration: 1 }, 0);

      if (logoMark) {
        const landedY = getLogoLandedY();
        if (logoReadyForScroll || !(landingTween && landingTween.isActive())) {
          gsap.set(logoMark, {
            xPercent: -50,
            yPercent: 0,
            x: 0,
            y: landedY,
            scale: 1,
            autoAlpha: 1,
          });
        }

        // Split wordmark: exit one-by-one (same stagger language as land).
        // Keep .hero-logo-mark parked — never slide the group as one block.
        if (isSplitLetterLogo()) {
          const letterWraps = logoMark.querySelectorAll(".logo-letter-wrap");
          gsap.set(logoMark, {
            xPercent: -50,
            yPercent: 0,
            x: 0,
            y: landedY,
            scale: 1,
            autoAlpha: 1,
          });
          gsap.set(letterWraps, { y: 0, opacity: 1, force3D: true });
          // fromTo keeps start/end explicit so scroll-up reverses the same cascade.
          tl.fromTo(
            letterWraps,
            { y: 0, opacity: 1, force3D: true },
            {
              y: getLogoHiddenY(),
              opacity: 0,
              ease: LOGO_SCROLL_LETTER_EASE,
              duration: LOGO_SCROLL_LETTER_DURATION,
              stagger: LOGO_SCROLL_LETTER_STAGGER,
              immediateRender: false,
            },
            LOGO_SCROLL_LETTER_AT,
          );
          /* Hold pin a beat so the last letter can finish its slow drift. */
          tl.to(
            {},
            { duration: 0.18 },
            LOGO_SCROLL_LETTER_AT +
              LOGO_SCROLL_LETTER_DURATION +
              LOGO_SCROLL_LETTER_STAGGER * 5,
          );
        } else {
          tl.fromTo(
            logoMark,
            {
              y: landedY,
              autoAlpha: 1,
              xPercent: -50,
              x: 0,
              yPercent: 0,
              scale: 1,
            },
            {
              y: getLogoHiddenY(),
              autoAlpha: 0,
              ease: "power2.inOut",
              duration: 1,
              immediateRender: false,
            },
            0,
          );
        }
      }
    }
  };

  if (prefersReduced) {
    cover.innerHTML = "";
    if (logoMark) {
      gsap.set(logoMark, { y: getLogoLandedY(), autoAlpha: 1 });
    }
    logoReadyForScroll = true;
    return () => {
      killByPrefix("hero-stage");
      landingTween?.kill();
    };
  }

  build();

  const snapLogoLanded = () => {
    if (!logoMark) {
      logoReadyForScroll = true;
      return;
    }
    landingTween?.kill();
    gsap.set(logoMark, {
      y: getLogoLandedY(),
      xPercent: -50,
      x: 0,
      yPercent: 0,
      scale: 1,
      autoAlpha: 1,
    });
    const wraps = logoMark.querySelectorAll(".logo-letter-wrap");
    if (wraps.length) gsap.set(wraps, { y: 0, opacity: 1 });
    const letters = logoMark.querySelectorAll(".logo-letter");
    if (letters.length) gsap.set(letters, { y: 0, opacity: 1 });
    logoReadyForScroll = true;
  };

  /*
   * Phone scrub owns logo rise — never run free-landing / touchstart snap
   * (those fight the scrubbed timeline and jump strips).
   */
  let rafId = 0;
  if (isPhoneHero) {
    logoReadyForScroll = true;
    markHeroMotionReady();
    document.documentElement.classList.add("ex-scroll-ready");
    document.documentElement.classList.remove("ex-pending", "ex-pending-deep");
    playTitleLanding();
    logPhonePerfDev({
      surface: "hero-stage",
      phoneSticky: true,
      landingSkipped: true,
      rebuildDebounceMs: 250,
    });
  } else {
    rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (skipLanding) {
          snapLogoLanded();
          snapTitlesLanded();
          return;
        }
        const img = logoMark?.querySelector("img");
        if (img && !img.complete) {
          img.addEventListener("load", playLanding, { once: true });
          setTimeout(playLanding, 500);
        } else {
          playLanding();
        }
        playTitleLanding();
      });
    });
  }

  const onFirstScroll = () => {
    if (isPhoneHero) return;
    if (landingTween && landingTween.isActive()) {
      landingTween.progress(1).kill();
    }
    snapLogoLanded();
    if (!titlesLanded) snapTitlesLanded();
    window.removeEventListener("wheel", onFirstScroll);
    window.removeEventListener("touchstart", onFirstScroll);
    if (lenis) lenis.off("scroll", onFirstScroll);
  };

  /** If the guest scrolls during the 6s title hold, reveal titles so scrub is never blank. */
  const onFirstScrollTitles = () => {
    if (!titlesLanded) snapTitlesLanded();
    window.removeEventListener("wheel", onFirstScrollTitles);
    window.removeEventListener("touchstart", onFirstScrollTitles);
    if (lenis) lenis.off("scroll", onFirstScrollTitles);
  };

  if (logoMark && !isPhoneHero) {
    window.addEventListener("wheel", onFirstScroll, { passive: true });
    window.addEventListener("touchstart", onFirstScroll, { passive: true });
    if (lenis) lenis.on("scroll", onFirstScroll);
  }

  if (!titlesLanded) {
    window.addEventListener("wheel", onFirstScrollTitles, { passive: true });
    window.addEventListener("touchstart", onFirstScrollTitles, { passive: true });
    if (lenis) lenis.on("scroll", onFirstScrollTitles);
  }

  let resizeTimer: ReturnType<typeof setTimeout>;
  let lastHeroWidth = window.innerWidth;
  let heroRebuildCount = 0;
  let heroRebuildDuringActiveScroll = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(
      () => {
        if (isPhoneHero) {
          const w = window.innerWidth;
          /* Ignore height-only chrome resize — only rebuild on real width change */
          if (Math.abs(w - lastHeroWidth) < 20) return;
          lastHeroWidth = w;
          heroRebuildCount += 1;
          logPhonePerfDev({
            surface: "hero-stage",
            rebuild: heroRebuildCount,
            reason: "width-or-orientation",
          });
        }
        build();
        if (process.env.NODE_ENV !== "production") {
          const debug = (
            window as Window & {
              __hathorRefreshDebug?: { lastActiveAt?: number };
              __hathorHeroDebug?: {
                rebuilds: number;
                rebuildsDuringActiveScroll: number;
              };
            }
          ).__hathorRefreshDebug;
          if (Date.now() - Number(debug?.lastActiveAt || 0) < 180) {
            heroRebuildDuringActiveScroll += 1;
          }
          (
            window as Window & {
              __hathorHeroDebug?: {
                rebuilds: number;
                rebuildsDuringActiveScroll: number;
              };
            }
          ).__hathorHeroDebug = {
            rebuilds: heroRebuildCount,
            rebuildsDuringActiveScroll: heroRebuildDuringActiveScroll,
          };
        }
        requestScrollRefresh("hero-stage-resize");
      },
      isPhoneHero ? 250 : 200,
    );
  };
  window.addEventListener("resize", onResize);
  if (isPhoneHero) {
    window.addEventListener("orientationchange", onResize, { passive: true });
  }

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    clearTimeout(resizeTimer);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
    window.removeEventListener("wheel", onFirstScroll);
    window.removeEventListener("touchstart", onFirstScroll);
    window.removeEventListener("wheel", onFirstScrollTitles);
    window.removeEventListener("touchstart", onFirstScrollTitles);
    if (lenis) {
      lenis.off("scroll", onFirstScroll);
      lenis.off("scroll", onFirstScrollTitles);
    }
    landingTween?.kill();
    titleLandTween?.kill();
    killByPrefix("hero-stage");
    root.classList.remove("hero-motion-ready");
  };
}
