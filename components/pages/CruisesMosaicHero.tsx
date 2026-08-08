"use client";

import { useEffect, useRef } from "react";
import { shouldLightenMotionForDevice } from "@/lib/touch-device";

/**
 * Suites Springs gallery hero — same sticky mosaic layout as /suites:
 * tilted moving cards, gold title, gradient wash, scroll-next control.
 * Duration matches suites landing.js (55s).
 */
const MOSAIC_IMAGES = [
  "/media/hathor/scraped/suites-hero.webp",
  "/media/hathor/scraped/royal-5.webp",
  "/media/hathor/scraped/luxsuite-2.webp",
  "/media/hathor/scraped/suites-royal.webp",
  "/media/hathor/scraped/suites-hero.webp",
  "/media/hathor/scraped/luxsuite-1.webp",
  "/media/hathor/scraped/suites-luxury-rooms.webp",
  "/media/hathor/scraped/royal-1.webp",
  "/media/hathor/scraped/suites-hero.webp",
  "/media/hathor/scraped/cabin-3.webp",
  "/media/hathor/scraped/cabin-1.webp",
  "/media/hathor/scraped/royal-3.webp",
  "/media/hathor/scraped/luxsuite-3.webp",
  "/media/hathor/scraped/luxsuite-4.webp",
  "/media/hathor/scraped/cabin-5.webp",
  "/media/hathor/scraped/suites-luxury-suites.webp",
  "/media/hathor/scraped/luxsuite-5.webp",
  "/media/hathor/r2/room-suite.webp",
  "/media/hathor/scraped/suites-hero.webp",
] as const;

const DURATION_MS = 55_000;

function rowForIndex(index: number): 1 | 2 | 3 {
  if (index >= 13) return 3;
  if (index >= 6) return 2;
  return 1;
}

export function CruisesMosaicHero() {
  const rootRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardHeightRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const light = shouldLightenMotionForDevice();
    const items = itemsRef.current.filter(Boolean) as HTMLDivElement[];
    if (items.length === 0) return;

    let raf = 0;
    let start = performance.now();
    let visible = true;
    let running = true;

    const measure = () => {
      cardHeightRef.current = items[0]?.offsetHeight ?? 0;
    };
    measure();

    const mqDesktop = window.matchMedia("(min-width: 980px)");
    const params = () => {
      const desktop = mqDesktop.matches;
      return {
        stepVw: desktop ? 125 : light ? 220 : 300,
        perRow: desktop ? 5 : 6,
      };
    };

    const apply = (elapsed: number) => {
      const e = (elapsed % DURATION_MS) / DURATION_MS;
      const { stepVw, perRow } = params();
      const f = cardHeightRef.current;

      items.forEach((el, t) => {
        const row = rowForIndex(t);
        const cycle = (row === 2 ? 7 : 6) / perRow;
        const r = (t / perRow + e) % cycle;
        if (row === 2) {
          el.style.transform = `translateX(${r * -stepVw}vw) translateY(${f}px)`;
        } else if (row === 3) {
          el.style.transform = `translateX(${r * stepVw}vw) translateY(${2 * f}px)`;
        } else {
          el.style.transform = `translateX(${r * stepVw}vw)`;
        }
      });
    };

    const tick = (now: number) => {
      if (!running) return;
      if (visible && !reduced) {
        apply(now - start);
      }
      raf = requestAnimationFrame(tick);
    };

    if (reduced) {
      apply(0);
    } else {
      raf = requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
      },
      { threshold: 0.05 },
    );
    io.observe(root);

    const onVisibility = () => {
      if (document.hidden) {
        visible = false;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onResize = () => {
      measure();
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="cruises-mosaic-hero"
      aria-label="Cruises gallery"
    >
      <div className="cruises-mosaic-hero__sticky">
        <div className="cruises-mosaic-hero__stage">
          <div className="cruises-mosaic-hero__plane" aria-hidden="true">
            {MOSAIC_IMAGES.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="cruises-mosaic-hero__item"
                ref={(node) => {
                  itemsRef.current[index] = node;
                }}
              >
                {/* Decorative mosaic — empty alt; section has aria-label */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  width={360}
                  height={480}
                  decoding="async"
                  draggable={false}
                  fetchPriority={index < 4 ? "high" : "low"}
                />
              </div>
            ))}
          </div>

          <div className="cruises-mosaic-hero__caption">
            <h1 className="cruises-mosaic-hero__title">
              River
              <br />
              Cruises
            </h1>
          </div>

          <a
            className="cruises-mosaic-hero__next"
            href="#cruises-listing"
            aria-label="Scroll to cruises listing"
          >
            <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
              <path
                d="M7 1v12.5M2.5 9.5 7 14l4.5-4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>

          <div className="cruises-mosaic-hero__gradient" aria-hidden="true">
            <div />
            <div />
            <div />
            <div />
            <div />
          </div>
        </div>
      </div>
    </section>
  );
}
