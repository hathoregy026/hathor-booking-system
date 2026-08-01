"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { shouldLightenMotionForDevice } from "@/lib/touch-device";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP = "(min-width: 1025px)";
const TABLET = "(min-width: 481px) and (max-width: 1024px)";
const PHONE = "(max-width: 480px)";

export function useHighlightsPageMotion(
  rootRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root
        .querySelectorAll<HTMLElement>(
          "[data-hl-reveal], [data-hl-hero-line] span, [data-hl-hero-eyebrow], [data-hl-hero-script], [data-hl-hero-copy], [data-hl-hero-actions], [data-hl-hero-marker], [data-hl-hero-scroll], [data-hl-hero-curtain], [data-hl-chapter]",
        )
        .forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "none";
          el.style.visibility = "visible";
        });
      return;
    }

    const light = shouldLightenMotionForDevice();
    const ease = "power3.out";

    const ctx = gsap.context(() => {
      /* Hero */
      const heroImg = root.querySelector<HTMLElement>("[data-hl-hero-img]");
      const curtain = root.querySelector<HTMLElement>("[data-hl-hero-curtain]");
      const overlay = root.querySelector<HTMLElement>("[data-hl-hero-overlay]");
      const plane = root.querySelector<HTMLElement>("[data-hl-hero-plane]");
      const eyebrow = root.querySelector<HTMLElement>("[data-hl-hero-eyebrow]");
      const lines = gsap.utils.toArray<HTMLElement>("[data-hl-hero-line]");
      const script = root.querySelector<HTMLElement>("[data-hl-hero-script]");
      const copy = root.querySelector<HTMLElement>("[data-hl-hero-copy]");
      const actions = root.querySelector<HTMLElement>("[data-hl-hero-actions]");
      const marker = root.querySelector<HTMLElement>("[data-hl-hero-marker]");
      const scrollCue = root.querySelector<HTMLElement>("[data-hl-hero-scroll]");

      if (heroImg) gsap.set(heroImg, { scale: 1.04 });
      if (curtain) gsap.set(curtain, { scaleY: 1 });
      if (overlay) gsap.set(overlay, { opacity: 0.75 });
      if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 14 });
      lines.forEach((line) => {
        const inner = line.querySelector("span") ?? line;
        gsap.set(inner, { yPercent: 110, opacity: 0 });
      });
      if (script) gsap.set(script, { opacity: 0, clipPath: "inset(0 100% 0 0)" });
      if (copy) gsap.set(copy, { opacity: 0, y: 18 });
      if (actions) gsap.set(actions, { opacity: 0, y: 14 });
      if (marker) gsap.set(marker, { opacity: 0 });
      if (scrollCue) gsap.set(scrollCue, { opacity: 0 });

      const heroTl = gsap.timeline({ defaults: { ease } });
      if (curtain) {
        heroTl.to(curtain, { scaleY: 0, duration: light ? 0.85 : 1.15, ease: "power4.inOut" }, 0);
      }
      if (heroImg) heroTl.to(heroImg, { scale: 1, duration: light ? 1.15 : 1.55 }, 0.12);
      if (overlay) heroTl.to(overlay, { opacity: 1, duration: 1 }, 0.15);
      if (eyebrow) heroTl.to(eyebrow, { opacity: 1, y: 0, duration: 0.6 }, 0.4);
      lines.forEach((line, i) => {
        const inner = line.querySelector("span") ?? line;
        heroTl.to(inner, { yPercent: 0, opacity: 1, duration: light ? 0.7 : 0.9 }, 0.5 + i * 0.12);
      });
      if (script) {
        heroTl.to(script, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8 }, 0.75);
      }
      if (copy) heroTl.to(copy, { opacity: 1, y: 0, duration: 0.7 }, 1);
      if (actions) heroTl.to(actions, { opacity: 1, y: 0, duration: 0.65 }, 1.15);
      if (marker) heroTl.to(marker, { opacity: 1, duration: 0.5 }, 1.2);
      if (scrollCue) heroTl.to(scrollCue, { opacity: 1, duration: 0.5 }, 1.3);

      if (plane) {
        gsap.fromTo(
          plane,
          { yPercent: 40 },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: root.querySelector(".hl-hero"),
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }

      root.querySelectorAll<HTMLElement>("[data-hl-reveal]").forEach((el) => {
        gsap.set(el, { opacity: 0, y: light ? 20 : 36 });
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: light ? 0.65 : 0.9,
          ease,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      const nilePath = root.querySelector<SVGPathElement>("[data-hl-nile-path]");
      if (nilePath) {
        const length = nilePath.getTotalLength();
        gsap.set(nilePath, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(nilePath, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: nilePath.closest("section") ?? nilePath,
            start: "top 80%",
            end: "top 35%",
            scrub: true,
          },
        });
      }

      const horizon = root.querySelector<HTMLElement>("[data-hl-horizon]");
      if (horizon) {
        gsap.fromTo(
          horizon,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: horizon.closest("section") ?? horizon,
              start: "top 70%",
              end: "top 40%",
              scrub: true,
            },
          },
        );
      }

      ScrollTrigger.matchMedia({
        [DESKTOP]: () => setupDesktopStories(root),
        [TABLET]: () => setupFlowStories(root, false),
        [PHONE]: () => setupFlowStories(root, true),
      });

      ScrollTrigger.matchMedia({
        "(min-width: 481px)": () => {
          root.querySelectorAll<HTMLElement>("[data-hl-parallax-img]").forEach((img) => {
            gsap.fromTo(
              img,
              { scale: 1.04, yPercent: -2 },
              {
                scale: 1,
                yPercent: 3,
                ease: "none",
                scrollTrigger: {
                  trigger: img.closest("section") ?? img,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              },
            );
          });
        },
      });
    }, root);

    const onLoad = () => requestScrollRefresh("highlights-load");
    window.addEventListener("load", onLoad);
    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(
        () => requestScrollRefresh("highlights-resize"),
        200,
      );
    };
    window.addEventListener("resize", onResize);
    requestAnimationFrame(() => requestScrollRefresh("highlights-mount"));

    return () => {
      window.removeEventListener("load", onLoad);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      ctx.revert();
    };
  }, [rootRef]);
}

/** Desktop: one pin, direct timeline progress — no chase tweens. */
function setupDesktopStories(root: HTMLElement) {
  const pin = root.querySelector<HTMLElement>("[data-hl-stories-pin]");
  const stage = root.querySelector<HTMLElement>("[data-hl-stories-stage]");
  const chapters = gsap.utils.toArray<HTMLElement>("[data-hl-chapter]");
  const fills = root.querySelectorAll<HTMLElement>("[data-hl-progress-fill]");
  if (!pin || !stage || chapters.length < 2) {
    setupFlowStories(root, false);
    return;
  }

  chapters.forEach((ch, i) => {
    gsap.set(ch, {
      autoAlpha: i === 0 ? 1 : 0,
      zIndex: i === 0 ? 2 : 1,
    });
  });

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: pin,
      start: "top top",
      end: () => `+=${Math.round(window.innerHeight * 2.8)}`,
      pin: true,
      pinSpacing: true,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const n = chapters.length;
        const raw = self.progress * n;
        const active = Math.min(n - 1, Math.floor(raw));
        const seg = raw - active;
        fills.forEach((fill, i) => {
          let sx = 0;
          if (i < active) sx = 1;
          else if (i === active) sx = seg;
          gsap.set(fill, { scaleX: sx });
        });
      },
    },
  });

  chapters.forEach((ch, i) => {
    if (i === 0) return;
    const prev = chapters[i - 1]!;
    const start = (i - 0.35) / chapters.length;

    tl.to(
      prev,
      {
        autoAlpha: 0,
        y: -36,
        duration: 0.35 / chapters.length,
      },
      start,
    );
    tl.fromTo(
      ch,
      { autoAlpha: 0, y: 48 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.35 / chapters.length,
        zIndex: 3,
      },
      start,
    );

    const img = ch.querySelector<HTMLElement>("[data-hl-chapter-img]");
    if (img) {
      tl.fromTo(
        img,
        { scale: 1.06, yPercent: 4 },
        { scale: 1, yPercent: 0, duration: 0.4 / chapters.length },
        start,
      );
    }
  });

  /* subtle continuous depth on active-ish images via timeline scrub already */
}

function setupFlowStories(root: HTMLElement, phone: boolean) {
  const chapters = root.querySelectorAll<HTMLElement>("[data-hl-chapter]");
  const fills = root.querySelectorAll<HTMLElement>("[data-hl-progress-fill]");

  chapters.forEach((ch, index) => {
    gsap.set(ch, { clearProps: "opacity,visibility,transform,zIndex" });

    const img = ch.querySelector<HTMLElement>("[data-hl-chapter-img]");
    const rule = ch.querySelector<HTMLElement>("[data-hl-chapter-rule]");
    const title = ch.querySelector<HTMLElement>("[data-hl-chapter-title] span");

    if (img) {
      gsap.fromTo(
        img,
        { scale: phone ? 1.025 : 1.04, y: phone ? 28 : 20 },
        {
          scale: 1,
          y: phone ? -22 : -12,
          ease: "none",
          scrollTrigger: {
            trigger: ch,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }

    if (title) {
      gsap.fromTo(
        title,
        { yPercent: phone ? 40 : 30, opacity: 0.4 },
        {
          yPercent: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ch,
            start: "top 85%",
            end: "top 55%",
            scrub: true,
          },
        },
      );
    }

    if (rule) {
      gsap.fromTo(
        rule,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ch,
            start: "top 78%",
            end: "top 50%",
            scrub: true,
          },
        },
      );
    }

    if (!phone) {
      const media = ch.querySelector<HTMLElement>("[data-hl-chapter-media]");
      if (media) {
        /* tablet: brief sticky media */
        media.style.position = "sticky";
        media.style.top = "5.5rem";
      }
    }

    ScrollTrigger.create({
      trigger: ch,
      start: "top 60%",
      end: "bottom 40%",
      onUpdate: (self) => {
        const fill = fills[index];
        if (fill) gsap.set(fill, { scaleX: self.progress });
        fills.forEach((f, i) => {
          if (i < index) gsap.set(f, { scaleX: 1 });
          if (i > index) gsap.set(f, { scaleX: 0 });
        });
      },
    });
  });
}
