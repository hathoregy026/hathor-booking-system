"use client";

import { type RefObject, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

function revealEditorialGroup(root: HTMLElement) {
  const groups = gsap.utils.toArray<HTMLElement>("[data-lux-reveal-group]", root);

  groups.forEach((group) => {
    const lines = group.querySelectorAll<HTMLElement>("[data-lux-line]");
    const body = group.querySelectorAll<HTMLElement>("[data-lux-body]");
    const rule = group.querySelector<HTMLElement>("[data-lux-rule]");

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: group,
        start: "top 82%",
        once: true,
      },
    });

    if (rule) {
      timeline.fromTo(
        rule,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.1,
          ease: "power3.out",
          transformOrigin: "left center",
        },
      );
    }

    if (lines.length) {
      timeline.fromTo(
        lines,
        { yPercent: 115, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.05,
          ease: "power3.out",
          stagger: 0.1,
        },
        rule ? "-=0.7" : 0,
      );
    }

    if (body.length) {
      timeline.fromTo(
        body,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
        },
        "-=0.65",
      );
    }
  });
}

function initSharedReveals(root: HTMLElement) {
  revealEditorialGroup(root);

  gsap.utils.toArray<HTMLElement>("[data-lux-media]", root).forEach((media) => {
    const image = media.querySelector("img, video");
    if (!image) return;
    gsap.fromTo(
      image,
      { scale: 1.08 },
      {
        scale: 1,
        duration: 1.4,
        ease: "power3.out",
        scrollTrigger: {
          trigger: media,
          start: "top 88%",
          once: true,
        },
      },
    );
  });
}

function initDesktopEditorialMotion(root: HTMLElement, page: "charter" | "highlights") {
  const heroImg = root.querySelector<HTMLElement>("[data-lux-hero-img]");
  if (heroImg) {
    gsap.fromTo(
      heroImg,
      { scale: 1.08 },
      { scale: 1, duration: 2.1, ease: "power3.out" },
    );

    const hero = root.querySelector<HTMLElement>("[data-lux-hero]");
    if (hero) {
      gsap.to(heroImg, {
        yPercent: 3,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }
  }

  gsap.utils.toArray<HTMLElement>("[data-lux-parallax]", root).forEach((media) => {
    const image = media.querySelector("img, video");
    if (!image) return;
    gsap.fromTo(
      image,
      { yPercent: -4 },
      {
        yPercent: 4,
        ease: "none",
        scrollTrigger: {
          trigger: media,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });

  if (page === "charter") {
    const route = root.querySelector<HTMLElement>("[data-ch-route]");
    if (route) {
      const slides = gsap.utils.toArray<HTMLElement>("[data-ch-route-slide]", route);
      const chapters = gsap.utils.toArray<HTMLElement>("[data-ch-route-chapter]", route);
      const bar = route.querySelector<HTMLElement>("[data-ch-route-bar]");
      if (slides.length) {
        ScrollTrigger.create({
          trigger: route,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            const idx = Math.min(
              slides.length - 1,
              Math.floor(self.progress * slides.length),
            );
            slides.forEach((s, i) => s.toggleAttribute("data-active", i === idx));
            chapters.forEach((c, i) => c.toggleAttribute("data-active", i === idx));
            if (bar) bar.style.transform = `scaleY(${Math.max(0.12, self.progress)})`;
          },
        });
      }
    }
  }

  if (page === "highlights") {
    const river = root.querySelector<HTMLElement>("[data-hl-river]");
    if (river) {
      const slides = gsap.utils.toArray<HTMLElement>("[data-hl-river-slide]", river);
      const overlays = gsap.utils.toArray<HTMLElement>("[data-hl-river-copy]", river);
      if (slides.length) {
        ScrollTrigger.create({
          trigger: river,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            const idx = Math.min(
              slides.length - 1,
              Math.floor(self.progress * slides.length),
            );
            slides.forEach((s, i) => s.toggleAttribute("data-active", i === idx));
            overlays.forEach((o, i) => {
              o.style.opacity = i === idx ? "1" : "0";
              o.style.pointerEvents = i === idx ? "auto" : "none";
            });
          },
        });
      }
    }
  }
}

function initTouchEditorialMotion(root: HTMLElement) {
  const heroImg = root.querySelector<HTMLElement>("[data-lux-hero-img]");
  if (heroImg) {
    gsap.fromTo(
      heroImg,
      { scale: 1.06 },
      { scale: 1, duration: 1.6, ease: "power3.out" },
    );
  }
}

export function useLuxuryEditorialMotion(
  rootRef: RefObject<HTMLElement | null>,
  page: "charter" | "highlights",
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(
          root.querySelectorAll(
            "[data-lux-line], [data-lux-body], [data-lux-rule], [data-lux-media] img",
          ),
          { clearProps: "all", opacity: 1, y: 0, yPercent: 0, scale: 1, scaleX: 1 },
        );
        return;
      }

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1025px)", () => {
        initSharedReveals(root);
        initDesktopEditorialMotion(root, page);
      });

      mm.add("(min-width: 481px) and (max-width: 1024px)", () => {
        initSharedReveals(root);
        initTouchEditorialMotion(root);
      });

      mm.add("(max-width: 480px)", () => {
        initSharedReveals(root);
        initTouchEditorialMotion(root);
      });
    }, root);

    const onLoad = () => requestScrollRefresh(`${page}-lux-load`);
    window.addEventListener("load", onLoad);
    requestAnimationFrame(() => requestScrollRefresh(`${page}-lux-mount`));

    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [page, rootRef]);
}
