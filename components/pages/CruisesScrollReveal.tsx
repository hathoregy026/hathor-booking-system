"use client";

import React, { useEffect, useRef, type ReactNode } from "react";
import { CRUISES_PAGE } from "@/lib/page-content";

export function CruisesScrollReveal({ children }: { children: ReactNode }) {
  const domeRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const dome = domeRef.current;
    if (!section || !dome) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight));

      const scale = 1.3 - progress * 0.5;
      dome.style.transform = `scale(${scale})`;
      dome.style.opacity = String(1 - progress * 0.3);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <section ref={sectionRef} className="dome-scroll-section">
        <div className="dome-sticky-wrapper">
          <div ref={domeRef} className="dome-content">
            <img
              className="dome-content__image"
              src="/media/hathor/cruises-hero.webp"
              alt="Cruises"
              fetchPriority="high"
              decoding="async"
            />
            <div className="dome-content__copy">
              <h1>{CRUISES_PAGE.hero.title}</h1>
              {CRUISES_PAGE.hero.subtitle ? (
                <p>{CRUISES_PAGE.hero.subtitle}</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      <div className="dome-next-section">{children}</div>
    </>
  );
}
