"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  SUITES_NATIVE_CTAS,
  SUITES_NATIVE_GALLERY_SLOTS,
  resolveSuitesImage,
  resolveSuitesNativeView,
} from "@/lib/suites-native-content";

const DURATION_MS = 30_000;

type Props = {
  images: Record<string, string>;
  hero: ReturnType<typeof resolveSuitesNativeView>["hero"];
};

export function SuitesMosaicHero({ images, hero }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sources = SUITES_NATIVE_GALLERY_SLOTS.map((slot) =>
    resolveSuitesImage(images, slot),
  );
  const rows = useMemo(
    () => [sources.slice(0, 7), sources.slice(7, 14), sources.slice(14)],
    [sources],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rows = rowRefs.current.filter(Boolean) as HTMLDivElement[];
    if (rows.length === 0) return;

    let raf = 0;
    const start = performance.now();
    let visible = true;
    let running = true;

    const apply = (elapsed: number) => {
      const timeProgress = (elapsed % DURATION_MS) / DURATION_MS;
      const heroProgress = Math.min(
        1,
        Math.max(0, -root.getBoundingClientRect().top / Math.max(1, root.offsetHeight)),
      );
      rows.forEach((row, index) => {
        const groupWidth = groupRefs.current[index]?.offsetWidth ?? 0;
        const gap = Number.parseFloat(getComputedStyle(row).columnGap) || 0;
        const cycle = groupWidth + gap;
        if (!cycle) return;
        const travel = (timeProgress * cycle * 0.7 + heroProgress * cycle * 0.42) % cycle;
        const x = index === 1 ? -cycle + travel : -travel;
        row.style.transform = `translate3d(${x}px, 0, 0)`;
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
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <section ref={rootRef} className="sn-mosaic-hero" aria-label="River Suites gallery">
      <div className="sn-mosaic-hero__sticky">
        <div className="sn-mosaic-hero__stage">
          <div className="sn-mosaic-hero__plane" aria-hidden="true">
            {rows.map((row, rowIndex) => (
              <div className="sn-mosaic-hero__rail-window" key={`rail-${rowIndex}`}>
                <div
                  className="sn-mosaic-hero__rail"
                  ref={(node) => {
                    rowRefs.current[rowIndex] = node;
                  }}
                >
                  {[0, 1].map((copyIndex) => (
                    <div
                      className="sn-mosaic-hero__rail-group"
                      key={`rail-${rowIndex}-copy-${copyIndex}`}
                      ref={copyIndex === 0 ? (node) => {
                        groupRefs.current[rowIndex] = node;
                      } : undefined}
                    >
                      {row.map((src, index) => (
                        <div key={`${src}-${index}`} className="sn-mosaic-hero__item">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt=""
                            width={360}
                            height={480}
                            decoding="async"
                            draggable={false}
                            fetchPriority={rowIndex === 0 && index < 3 ? "high" : "low"}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
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
            href="#suites-collection"
            aria-label="Explore the three accommodation types"
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
