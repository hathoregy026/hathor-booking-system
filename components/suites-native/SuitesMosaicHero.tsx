"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  SUITES_NATIVE_CONTENT,
  SUITES_NATIVE_CTAS,
  SUITES_NATIVE_GALLERY_SLOTS,
  resolveSuitesImage,
} from "@/lib/suites-native-content";

const DURATION_MS = 30_000;

function rowForIndex(index: number): 1 | 2 | 3 {
  if (index >= 13) return 3;
  if (index >= 6) return 2;
  return 1;
}

type Props = {
  images: Record<string, string>;
};

export function SuitesMosaicHero({ images }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardHeightRef = useRef(0);
  const { hero } = SUITES_NATIVE_CONTENT;
  const sources = SUITES_NATIVE_GALLERY_SLOTS.map((slot) =>
    resolveSuitesImage(images, slot),
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
        stepVw: desktop ? 125 : 300,
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
      if (visible && !reduced) apply(now - start);
      raf = requestAnimationFrame(tick);
    };

    if (reduced) apply(0);
    else raf = requestAnimationFrame(tick);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
      },
      { threshold: 0.05 },
    );
    io.observe(root);

    const onVisibility = () => {
      if (document.hidden) visible = false;
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section ref={rootRef} className="sn-mosaic-hero" aria-label="River Suites gallery">
      <div className="sn-mosaic-hero__sticky">
        <div className="sn-mosaic-hero__stage">
          <div className="sn-mosaic-hero__plane" aria-hidden="true">
            {sources.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="sn-mosaic-hero__item"
                ref={(node) => {
                  itemsRef.current[index] = node;
                }}
              >
                {/* Decorative mosaic */}
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

          <div className="sn-mosaic-hero__caption">
            <p className="sn-mosaic-hero__eyebrow">{hero.eyebrow}</p>
            <h1 className="sn-display sn-display--hero">
              {hero.titleLines[0]}
              <br />
              {hero.titleLines[1]}
            </h1>
            <p className="sn-mosaic-hero__support">{hero.support}</p>
            <div className="sn-mosaic-hero__actions">
              <Link
                href={SUITES_NATIVE_CTAS.exploreSuites.href}
                className="sn-btn sn-btn--on-photo"
              >
                {SUITES_NATIVE_CTAS.exploreSuites.label}
              </Link>
              <Link
                href={SUITES_NATIVE_CTAS.concierge.href}
                className="sn-btn sn-btn--on-photo-ghost"
              >
                {SUITES_NATIVE_CTAS.concierge.label}
              </Link>
            </div>
          </div>

          <a
            className="sn-mosaic-hero__next"
            href="#suites-unrivaled"
            aria-label="Scroll to Unrivaled Views"
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

          <div className="sn-mosaic-hero__gradient" aria-hidden="true">
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
