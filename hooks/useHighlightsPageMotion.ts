"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { shouldLightenMotionForDevice } from "@/lib/touch-device";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

/** Highlights awards cinema — uses site Lenis only. Phone: no horizontal pin. */
export function useHighlightsPageMotion(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root
        .querySelectorAll<HTMLElement>("[data-aw-hero-line], [data-aw-reveal]")
        .forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "none";
        });
      return;
    }

    const light = shouldLightenMotionForDevice();
    const ease = "power3.out";

    const ctx = gsap.context(() => {
      const heroLines = gsap.utils.toArray<HTMLElement>("[data-aw-hero-line]");
      gsap.set(heroLines, { opacity: 0, y: 40 });
      gsap.to(heroLines, {
        opacity: 1,
        y: 0,
        duration: light ? 0.75 : 1,
        stagger: 0.18,
        ease,
        delay: 0.1,
      });

      const heroImg = root.querySelector<HTMLElement>("[data-aw-hero-img]");
      const hero = root.querySelector<HTMLElement>("[data-aw-hero]");
      if (hero && heroImg) {
        gsap.to(heroImg, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      root.querySelectorAll<HTMLElement>("[data-aw-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 50,
          opacity: 0,
          duration: light ? 0.75 : 1,
          ease,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });

      const templesImg = root.querySelector<HTMLElement>("[data-hl-temples-img]");
      const temples = root.querySelector<HTMLElement>("[data-hl-temples]");
      if (temples && templesImg) {
        gsap.fromTo(
          templesImg,
          { scale: 1 },
          {
            scale: 1.1,
            ease: "none",
            scrollTrigger: {
              trigger: temples,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
            },
          },
        );
      }

      ScrollTrigger.matchMedia({
        "(min-width: 1024px)": () => {
          const pin = root.querySelector<HTMLElement>("[data-hl-gallery-pin]");
          const track = root.querySelector<HTMLElement>("[data-hl-gallery-track]");
          if (!pin || !track) return;

          const getDistance = () =>
            Math.max(0, track.scrollWidth - window.innerWidth);

          gsap.to(track, {
            x: () => -getDistance(),
            ease: "none",
            scrollTrigger: {
              trigger: pin.parentElement ?? pin,
              start: "top top",
              end: () => `+=${getDistance()}`,
              pin: pin,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        },
      });
    }, root);

    const onLoad = () => requestScrollRefresh("highlights-awards-load");
    window.addEventListener("load", onLoad);
    requestAnimationFrame(() => requestScrollRefresh("highlights-awards-mount"));

    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [rootRef]);
}
