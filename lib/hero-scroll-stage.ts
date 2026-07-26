/**
 * Shared home-style hero scroll stage — logo landing, gold blinds, pinned scrub.
 */
// @ts-nocheck
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

type MountHeroScrollStageOptions = {
  prefersReduced: boolean;
  lenis?: Lenis | null;
  /** Split-letter land duration in seconds (from admin logo tune). */
  logoLandDuration?: number;
};

/** Extra downward offset at logo landing / scroll-scrub start (px). */
const LOGO_FINISH_Y_OFFSET_PX = 30;
const DEFAULT_LOGO_LAND_DURATION = 2.6;

export function mountHeroScrollStage({
  prefersReduced,
  lenis = null,
  logoLandDuration = DEFAULT_LOGO_LAND_DURATION,
}: MountHeroScrollStageOptions): () => void {
  const hero = document.querySelector(".home-hero-container");
  const cover = document.querySelector(".home-hero-cover");
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

  if (!prefersReduced && chrome.length) {
    gsap.from(chrome, {
      opacity: 0,
      y: 16,
      duration: 0.8,
      ease: "power2.out",
      delay: 0.15,
      stagger: 0.05,
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

  let landingTween: gsap.core.Tween | null = null;
  let logoReadyForScroll = false;

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

  const killByPrefix = (prefix: string) => {
    ScrollTrigger.getAll().forEach((st) => {
      if (st.vars && String(st.vars.id || "").startsWith(prefix)) st.kill();
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
    if (w <= 767) blindsCount = 26;
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
    if (cta) gsap.set(cta, { width: baseW, height: 52 });
    if (ctaText) gsap.set(ctaText, { letterSpacing: "0.22em" });

    const titleTravel = Math.min(w * 0.38, 420);

    const tl = gsap.timeline({
      scrollTrigger: {
        id: "hero-stage",
        trigger: hero,
        start: "top top",
        end: "+=130%",
        scrub: 1.2,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onLeave: () => {
          if (logoMark) gsap.set(logoMark, { autoAlpha: 0, y: getLogoHiddenY() });
        },
      },
    });

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

  const rafId = requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const img = logoMark?.querySelector("img");
      if (img && !img.complete) {
        img.addEventListener("load", playLanding, { once: true });
        setTimeout(playLanding, 500);
      } else {
        playLanding();
      }
    });
  });

  const onFirstScroll = () => {
    if (landingTween && landingTween.isActive()) {
      landingTween.progress(1).kill();
    }
    logoReadyForScroll = true;
    if (logoMark) {
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
    }
    window.removeEventListener("wheel", onFirstScroll);
    window.removeEventListener("touchstart", onFirstScroll);
    if (lenis) lenis.off("scroll", onFirstScroll);
  };

  if (logoMark) {
    window.addEventListener("wheel", onFirstScroll, { passive: true });
    window.addEventListener("touchstart", onFirstScroll, { passive: true });
    if (lenis) lenis.on("scroll", onFirstScroll);
  }

  let resizeTimer: ReturnType<typeof setTimeout>;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      ScrollTrigger.refresh();
    }, 200);
  };
  window.addEventListener("resize", onResize);

  return () => {
    cancelAnimationFrame(rafId);
    clearTimeout(resizeTimer);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("wheel", onFirstScroll);
    window.removeEventListener("touchstart", onFirstScroll);
    if (lenis) lenis.off("scroll", onFirstScroll);
    landingTween?.kill();
    killByPrefix("hero-stage");
  };
}
