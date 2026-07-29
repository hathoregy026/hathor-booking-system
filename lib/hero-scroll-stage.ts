/**
 * Shared home-style hero scroll stage — logo landing, gold blinds, pinned scrub.
 */
// @ts-nocheck
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";
import { logPhonePerfDev } from "@/lib/touch-device";

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
const DEFAULT_LOGO_LAND_DURATION = 2.6;

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
  const cta = hero.querySelector(".hero-cta");
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
    if (prefersReduced) {
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
  let logoReadyForScroll = false;

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

  /**
   * Tablet only: keep the existing lightweight native-scroll fallback exactly
   * as-is. Phone ≤480 gets its own scrubbed choreography below.
   */
  if (isTabletHero || prefersReduced) {
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
    if (cta) gsap.set(cta, { clearProps: "width,height,letterSpacing" });
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

    let mobileBlinds: gsap.core.Timeline | null = null;
    let mobileBlindsPlayed = false;

    const playMobileBlinds = () => {
      if (mobileBlindsPlayed || !mobileBlinds) return;
      mobileBlindsPlayed = true;
      mobileBlinds.play(0);
      window.removeEventListener("scroll", playMobileBlinds);
      window.removeEventListener("touchmove", playMobileBlinds);
    };

    if (isTabletHero && !prefersReduced) {
      const width = hero.clientWidth || window.innerWidth;
      const count = width <= 767 ? 14 : 18;
      const stripWidth = width / count;

      for (let index = 0; index < count; index += 1) {
        const strip = document.createElement("div");
        strip.classList.add("blind-strip-v", "blind-strip-v--mobile");
        strip.style.left = `${index * stripWidth - 0.5}px`;
        strip.style.width = `${stripWidth + 1}px`;
        strip.style.top = "0";
        strip.style.height = "100%";
        strip.style.position = "absolute";
        strip.style.transformOrigin = "left center";
        cover.appendChild(strip);
      }

      const strips = gsap.utils.toArray(
        cover.querySelectorAll(".blind-strip-v--mobile"),
      ) as Element[];

      gsap.set(strips, {
        rotationY: -28,
        scaleX: 0.08,
        opacity: 0,
        visibility: "hidden",
        force3D: true,
      });

      mobileBlinds = gsap
        .timeline({
          paused: true,
          onComplete: () => {
            /*
             * The sweep is a transition accent, not a permanent paint layer.
             * Removing it prevents the hero reappearing as a solid gold block
             * when mobile Safari composites the page after toolbar changes.
             */
            cover.replaceChildren();
            mobileBlinds = null;
          },
        })
        .to(strips, {
          rotationY: 0,
          scaleX: 1,
          opacity: 0.72,
          visibility: "visible",
          duration: 0.34,
          stagger: { each: 0.018, from: "start" },
          ease: "power1.out",
        })
        .to(
          strips,
          {
            rotationY: 22,
            scaleX: 0.18,
            opacity: 0,
            duration: 0.36,
            stagger: { each: 0.015, from: "start" },
            ease: "power2.in",
          },
          0.24,
        )
        .set(strips, { visibility: "hidden" });

      window.addEventListener("scroll", playMobileBlinds, { passive: true });
      window.addEventListener("touchmove", playMobileBlinds, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", playMobileBlinds);
      window.removeEventListener("touchmove", playMobileBlinds);
      mobileBlinds?.kill();
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
        stagger: 0.16,
        ease: "power2.inOut",
        delay: 0.2,
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
        stagger: 0.22,
        ease: "power2.out",
        delay: 0.2,
      });
    }

    landingTween = gsap.to(logoMark, {
      y: getLogoLandedY(),
      duration: 2.6,
      ease: "power2.inOut",
      delay: 0.2,
      onComplete: markLogoReady,
    });
  };

  const build = () => {
    killByPrefix("hero-stage");

    if (lineRight) gsap.set(lineRight, { x: 0, opacity: 1, clearProps: "transform" });
    if (lineLeft) gsap.set(lineLeft, { x: 0, opacity: 1, clearProps: "transform" });
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
    const phoneCtaScale = targetW / Math.max(baseW, 1);
    if (cta) {
      if (window.matchMedia("(max-width: 480px)").matches) {
        gsap.set(cta, {
          height: 52,
          scaleX: 1,
          transformOrigin: "50% 50%",
          force3D: true,
        });
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
    const heroTrigger = phoneRunway || hero;

    const tl = gsap.timeline({
      scrollTrigger: {
        id: "hero-stage",
        trigger: heroTrigger,
        start: "top top",
        end:
          isPhoneTouch && phoneRunway
            ? "bottom bottom"
            : isPhoneTouch
              ? "+=290%"
              : "+=130%",
        // Direct scrub on touch — laggy scrub (1.7) feels like scroll jumping
        scrub: isTouch ? true : 1.7,
        pin: !isPhoneTouch,
        pinSpacing: !isPhoneTouch,
        anticipatePin: isPhoneTouch ? 0 : 1,
        invalidateOnRefresh: !isPhoneTouch,
        onLeave: () => {
          if (!isPhoneTouch && logoMark) {
            gsap.set(logoMark, { autoAlpha: 0, y: getLogoHiddenY() });
          }
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

      /* Phone CTA: scaleX — CSS often locks width with !important on narrow */
      if (cta) {
        tl.to(
          cta,
          { scaleX: phoneCtaScale, ease: "none", duration: 0.42 },
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
        if (logoReadyForScroll || !(landingTween && landingTween.isActive())) {
          const landedY = getLogoLandedY();
          gsap.set(logoMark, {
            xPercent: -50,
            yPercent: 0,
            x: 0,
            y: landedY,
            scale: 1,
            autoAlpha: 1,
          });
        }

        const landedY = getLogoLandedY();
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
            ease: "none",
            duration: 1,
            immediateRender: false,
          },
          0,
        );
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
          return;
        }
        const img = logoMark?.querySelector("img");
        if (img && !img.complete) {
          img.addEventListener("load", playLanding, { once: true });
          setTimeout(playLanding, 500);
        } else {
          playLanding();
        }
      });
    });
  }

  const onFirstScroll = () => {
    if (isPhoneHero) return;
    if (landingTween && landingTween.isActive()) {
      landingTween.progress(1).kill();
    }
    snapLogoLanded();
    window.removeEventListener("wheel", onFirstScroll);
    window.removeEventListener("touchstart", onFirstScroll);
    if (lenis) lenis.off("scroll", onFirstScroll);
  };

  if (logoMark && !isPhoneHero) {
    window.addEventListener("wheel", onFirstScroll, { passive: true });
    window.addEventListener("touchstart", onFirstScroll, { passive: true });
    if (lenis) lenis.on("scroll", onFirstScroll);
  }

  let resizeTimer: ReturnType<typeof setTimeout>;
  let lastHeroWidth = window.innerWidth;
  let heroRebuildCount = 0;
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
        ScrollTrigger.refresh();
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
    if (lenis) lenis.off("scroll", onFirstScroll);
    landingTween?.kill();
    killByPrefix("hero-stage");
    root.classList.remove("hero-motion-ready");
  };
}
