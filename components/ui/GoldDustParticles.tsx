"use client";

/**
 * Floating gold dust for the homepage hero.
 * Easy removal: delete `<GoldDustParticles />` from PublicSiteHero and this file.
 */

import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";

const PARTICLE_COUNT = 36;
const COLORS = ["#D4AF37", "#F4E5C2", "#E8C872", "#C9A227"] as const;

type ParticleSeed = {
  id: number;
  left: string;
  top: string;
  size: number;
  color: string;
  blur: number;
  opacity: number;
  duration: number;
  delay: number;
  xDrift: number;
  yDrift: number;
};

function buildParticles(count: number): ParticleSeed[] {
  return Array.from({ length: count }, (_, id) => {
    const size = 2.5 + Math.random() * 4; /* ~2.5px–6.5px */
    return {
      id,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      blur: 1 + Math.random() * 1.5,
      opacity: 0.4 + Math.random() * 0.4,
      duration: 8 + Math.random() * 6, /* 8–14s — faster, still smooth */
      delay: Math.random() * 4,
      xDrift: (Math.random() - 0.5) * 64,
      yDrift: -50 - Math.random() * 90,
    };
  });
}

export function GoldDustParticles() {
  const rootRef = useRef<HTMLDivElement>(null);
  const particles = useMemo(() => buildParticles(PARTICLE_COUNT), []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const nodes = root.querySelectorAll<HTMLElement>("[data-gold-dust]");
    const tweens: gsap.core.Tween[] = [];

    nodes.forEach((node, i) => {
      const seed = particles[i];
      if (!seed) return;

      tweens.push(
        gsap.to(node, {
          x: seed.xDrift,
          y: seed.yDrift,
          duration: seed.duration,
          delay: seed.delay,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          force3D: true,
        }),
      );

      /* Soft opacity pulse — matched ease, slightly quicker for life */
      tweens.push(
        gsap.to(node, {
          opacity: Math.min(0.95, seed.opacity + 0.3),
          duration: seed.duration * 0.7,
          delay: seed.delay,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        }),
      );
    });

    return () => {
      tweens.forEach((t) => t.kill());
    };
  }, [particles]);

  return (
    <div
      ref={rootRef}
      className="gold-dust-particles"
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          data-gold-dust=""
          style={{
            position: "absolute",
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            opacity: p.opacity,
            filter: `blur(${p.blur}px)`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
