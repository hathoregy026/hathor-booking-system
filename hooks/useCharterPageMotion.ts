"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { shouldLightenMotionForDevice } from "@/lib/touch-device";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

/** Charter cream editorial — count-up specs + desktop suite pin scroll. */
export function useCharterPageMotion(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root
        .querySelectorAll<HTMLElement>("[data-ce-line], [data-ce-reveal], [data-ce-image], [data-ch-count]")
        .forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "none";
          const target = el.getAttribute("data-target");
          if (target) el.textContent = target;
        });
      return;
    }

    const light = shouldLightenMotionForDevice();
    const duration = light ? 0.85 : 1.2;
    const imgDuration = light ? 1.1 : 1.8;

    const ctx = gsap.context(() => {
      const revealLines = root.querySelectorAll<HTMLElement>(".ch-reveal [data-ce-line]");
      gsap.set(revealLines, { opacity: 0, y: 40 });
      gsap.to(revealLines, {
        opacity: 1,
        y: 0,
        duration,
        stagger: 0.12,
        ease: "power3.out",
      });

      root.querySelectorAll<HTMLElement>("[data-ce-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });

      root.querySelectorAll<HTMLElement>("[data-ce-image]").forEach((img) => {
        if (light) {
          gsap.from(img, {
            opacity: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: img,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          });
          return;
        }
        gsap.from(img, {
          scale: 1.1,
          duration: imgDuration,
          ease: "power2.out",
          scrollTrigger: {
            trigger: img,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });

      const specs = root.querySelector<HTMLElement>("[data-ch-specs]");
      root.querySelectorAll<HTMLElement>("[data-ch-count]").forEach((el) => {
        const target = Number(el.getAttribute("data-target") || "0");
        const obj = { val: 0 };
        ScrollTrigger.create({
          trigger: specs ?? el,
          start: "top 75%",
          once: true,
          onEnter: () => {
            gsap.to(obj, {
              val: target,
              duration: light ? 1.2 : 1.8,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = String(Math.round(obj.val));
              },
            });
          },
        });
      });

      ScrollTrigger.matchMedia({
        "(min-width: 1024px)": () => {
          const pin = root.querySelector<HTMLElement>("[data-ch-suites-pin]");
          const track = root.querySelector<HTMLElement>("[data-ch-suites-track]");
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
              pin,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        },
      });
    }, root);

    const onLoad = () => requestScrollRefresh("charter-cream-load");
    window.addEventListener("load", onLoad);
    requestAnimationFrame(() => requestScrollRefresh("charter-cream-mount"));

    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [rootRef]);
}
