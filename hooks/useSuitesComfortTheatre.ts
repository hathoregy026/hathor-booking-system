"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AMENITY_COUNT = 4;

type Options = {
  trackRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLElement | null>;
  layerRefs: RefObject<(HTMLElement | null)[]>;
  bodyRef: RefObject<HTMLElement | null>;
  amenityCount?: number;
  onIndexChange?: (index: number) => void;
};

/**
 * Scroll-driven Comfort theatre:
 * desktop pins + scrubs amenity layers (clip/scale/blur);
 * tablet/phone scrub without pin; rail clicks snap progress.
 */
export function useSuitesComfortTheatre({
  trackRef,
  stageRef,
  layerRefs,
  bodyRef,
  amenityCount = AMENITY_COUNT,
  onIndexChange,
}: Options) {
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const indexRef = useRef(0);
  const onIndexChangeRef = useRef(onIndexChange);
  onIndexChangeRef.current = onIndexChange;

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const layers = (layerRefs.current ?? []).filter(Boolean) as HTMLElement[];
    if (!track || !stage || layers.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mm = gsap.matchMedia();

    const applyIndex = (index: number, immediate = false) => {
      const clamped = Math.max(0, Math.min(amenityCount - 1, index));
      indexRef.current = clamped;
      setActiveIndex(clamped);
      onIndexChangeRef.current?.(clamped);

      layers.forEach((layer, i) => {
        const isActive = i === clamped;
        const isPast = i < clamped;
        gsap.killTweensOf(layer);
        if (reduced || immediate) {
          gsap.set(layer, {
            autoAlpha: isActive ? 1 : 0,
            scale: isActive ? 1 : isPast ? 1.06 : 1.08,
            filter: isActive ? "blur(0px)" : "blur(6px)",
            clipPath: isActive
              ? "inset(0% 0% 0% 0%)"
              : isPast
                ? "inset(0% 0% 100% 0%)"
                : "inset(100% 0% 0% 0%)",
            zIndex: isActive ? 3 : isPast ? 1 : 2,
          });
          return;
        }
        gsap.to(layer, {
          autoAlpha: isActive ? 1 : 0.08,
          scale: isActive ? 1 : 1.07,
          filter: isActive ? "blur(0px)" : "blur(5px)",
          clipPath: isActive
            ? "inset(0% 0% 0% 0%)"
            : isPast
              ? "inset(0% 0% 88% 0%)"
              : "inset(88% 0% 0% 0%)",
          zIndex: isActive ? 3 : isPast ? 1 : 2,
          duration: 0.85,
          ease: "power2.inOut",
          overwrite: "auto",
        });
      });

      const body = bodyRef.current;
      if (body && !immediate) {
        gsap.fromTo(
          body,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" },
        );
      }
    };

    applyIndex(0, true);

    if (reduced) {
      return () => {
        mm.revert();
      };
    }

    mm.add("(min-width: 1025px)", () => {
      const st = ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        pin: stage,
        scrub: 1.15,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const next = Math.min(
            amenityCount - 1,
            Math.floor(self.progress * amenityCount + 0.001),
          );
          if (next !== indexRef.current) applyIndex(next);
        },
      });
      triggerRef.current = st;
      return () => {
        st.kill();
        if (triggerRef.current === st) triggerRef.current = null;
      };
    });

    mm.add("(max-width: 1024px)", () => {
      const st = ScrollTrigger.create({
        trigger: track,
        start: "top 70%",
        end: "bottom 30%",
        scrub: 1.2,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const next = Math.min(
            amenityCount - 1,
            Math.floor(self.progress * amenityCount + 0.001),
          );
          if (next !== indexRef.current) applyIndex(next);
        },
      });
      triggerRef.current = st;
      return () => {
        st.kill();
        if (triggerRef.current === st) triggerRef.current = null;
      };
    });

    return () => {
      mm.revert();
      triggerRef.current = null;
    };
  }, [amenityCount, bodyRef, layerRefs, stageRef, trackRef]);

  const goToIndex = (index: number) => {
    const st = triggerRef.current;
    if (st) {
      const progress = (index + 0.5) / amenityCount;
      const y = st.start + (st.end - st.start) * progress;
      window.scrollTo({ top: y, behavior: "smooth" });
      return;
    }
    setActiveIndex(index);
  };

  return { activeIndex, goToIndex };
}
