"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface CruisesScrollRevealProps {
  title: string;
  children?: React.ReactNode;
}

export function CruisesScrollReveal({ title, children }: CruisesScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        pin: viewportRef.current,
        pinSpacing: false,
      },
    });

    tl.to(titleRef.current, {
      opacity: 0,
      scale: 0.85,
      duration: 1,
      ease: "power1.inOut",
    }).to(
      contentRef.current,
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power1.inOut",
      },
      "-=0.4",
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div data-cruises-scroll-reveal style={{ position: "relative" }}>
      <div ref={containerRef} className="reveal-track" style={{ height: "250vh", position: "relative" }}>
        <div
          ref={viewportRef}
          className="sticky-viewport"
          style={{
            position: "sticky",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            backgroundColor: "#0b0c10",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h1
            ref={titleRef}
            style={{
              position: "absolute",
              fontSize: "7vw",
              color: "#ffffff",
              textAlign: "center",
              width: "100%",
              zIndex: 2,
              margin: 0,
            }}
          >
            {title}
          </h1>
          <div
            ref={contentRef}
            style={{
              position: "absolute",
              opacity: 0,
              transform: "translateY(60px)",
              textAlign: "center",
              maxWidth: "800px",
              zIndex: 3,
              padding: "2rem",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
