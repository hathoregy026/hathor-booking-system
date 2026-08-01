"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { shouldLightenMotionForDevice } from "@/lib/touch-device";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

/** Charter awards cinema — site Lenis only. Phone: stack, no pin galleries. */
export function useCharterPageMotion(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root
        .querySelectorAll<HTMLElement>(
          "[data-aw-hero-line], [data-aw-reveal], [data-ch-spec], [data-ch-dining-slide]",
        )
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
      gsap.set(heroLines, { opacity: 0, y: 50 });
      gsap.to(heroLines, {
        opacity: 1,
        y: 0,
        duration: light ? 0.75 : 1,
        stagger: 0.16,
        ease,
      });

      const heroImg = root.querySelector<HTMLElement>("[data-aw-hero-img]");
      const hero = root.querySelector<HTMLElement>("[data-aw-hero]");
      if (hero && heroImg) {
        gsap.to(heroImg, {
          yPercent: 16,
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

      const vessel = root.querySelector<HTMLElement>("[data-ch-vessel]");
      const vesselImg = root.querySelector<HTMLElement>("[data-ch-vessel-img]");
      if (vessel && vesselImg) {
        gsap.fromTo(
          vesselImg,
          { scale: 1 },
          {
            scale: 1.1,
            ease: "none",
            scrollTrigger: {
              trigger: vessel,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
            },
          },
        );
      }

      const specs = gsap.utils.toArray<HTMLElement>("[data-ch-spec]");
      const directions = [
        { x: -40, y: 0 },
        { x: 40, y: 0 },
        { x: 0, y: 40 },
        { x: 0, y: -40 },
      ];
      specs.forEach((spec, i) => {
        const from = directions[i % directions.length]!;
        gsap.from(spec, {
          ...from,
          opacity: 0,
          duration: 0.9,
          ease,
          scrollTrigger: {
            trigger: vessel ?? spec,
            start: "top 60%",
            toggleActions: "play none none reverse",
          },
        });
      });

      ScrollTrigger.matchMedia({
        "(min-width: 1024px)": () => {
          const diningPin = root.querySelector<HTMLElement>("[data-ch-dining-pin]");
          const slides = gsap.utils.toArray<HTMLElement>("[data-ch-dining-slide]");
          if (diningPin && slides.length > 1) {
            gsap.set(slides, { opacity: 0 });
            gsap.set(slides[0]!, { opacity: 1 });
            const n = slides.length;
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: diningPin.parentElement ?? diningPin,
                start: "top top",
                end: "bottom bottom",
                pin: diningPin,
                scrub: true,
              },
            });
            for (let i = 0; i < n - 1; i++) {
              const at = (i + 1) / n;
              tl.to(slides[i]!, { opacity: 0, duration: 0.2 }, at - 0.15);
              tl.to(slides[i + 1]!, { opacity: 1, duration: 0.2 }, at - 0.15);
            }
          }

          const exPin = root.querySelector<HTMLElement>("[data-ch-ex-pin]");
          const exTrack = root.querySelector<HTMLElement>("[data-ch-ex-track]");
          if (exPin && exTrack) {
            const getDistance = () =>
              Math.max(0, exTrack.scrollWidth - window.innerWidth);
            gsap.to(exTrack, {
              x: () => -getDistance(),
              ease: "none",
              scrollTrigger: {
                trigger: exPin.parentElement ?? exPin,
                start: "top top",
                end: () => `+=${getDistance()}`,
                pin: exPin,
                scrub: 1,
                invalidateOnRefresh: true,
              },
            });

            exTrack.querySelectorAll<HTMLElement>("[data-ch-ex-img]").forEach((img) => {
              gsap.fromTo(
                img,
                { scale: 1 },
                {
                  scale: 1.12,
                  ease: "none",
                  scrollTrigger: {
                    trigger: exPin.parentElement ?? exPin,
                    start: "top top",
                    end: () => `+=${getDistance()}`,
                    scrub: true,
                  },
                },
              );
            });
          }
        },
      });
    }, root);

    const onLoad = () => requestScrollRefresh("charter-awards-load");
    window.addEventListener("load", onLoad);
    requestAnimationFrame(() => requestScrollRefresh("charter-awards-mount"));

    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [rootRef]);
}
