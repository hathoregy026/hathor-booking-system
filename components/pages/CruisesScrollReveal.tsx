"use client";

import React, { useEffect, useRef, type ReactNode } from "react";
import { CRUISES_PAGE } from "@/lib/page-content";

export function CruisesScrollReveal({ children }: { children: ReactNode }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const content = contentRef.current;
    if (!hero || !content) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;

      const opacity = Math.max(0, 1 - scrollY / heroHeight);
      hero.style.opacity = String(opacity);

      const translateY = Math.min(0, -scrollY * 0.3);
      content.style.transform = `translateY(${translateY}px)`;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 },
    );

    content.querySelectorAll(".content-wrapper > *").forEach((el) => {
      observer.observe(el);
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="scroll-reveal-container">
      <div ref={heroRef} className="scroll-hero">
        <div className="dome-content">
          <img
            className="scroll-hero__image"
            src="/media/hathor/cruises-hero.webp"
            alt="Cruises"
            fetchPriority="high"
            decoding="async"
          />
          <div className="scroll-hero__copy">
            <h1>{CRUISES_PAGE.hero.title}</h1>
            {CRUISES_PAGE.hero.subtitle ? (
              <p>{CRUISES_PAGE.hero.subtitle}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div ref={contentRef} className="scroll-content">
        <div className="content-wrapper">{children}</div>
      </div>
    </div>
  );
}
