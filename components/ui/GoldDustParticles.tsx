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
};

function buildParticles(count: number): ParticleSeed[] {
  return Array.from({ length: count }, (_, id) => {
    const size = 2.5 + Math.random() * 4;
    return {
      id,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      blur: 1 + Math.random() * 1.5,
      opacity: 0.4 + Math.random() * 0.4,
    };
  });
}

/** Continuous random wander — never the same path twice. */
function startWander(node: HTMLElement, tweens: gsap.core.Tween[]) {
  const step = () => {
    const duration = 3.5 + Math.random() * 4.5; /* 3.5–8s */
    const tween = gsap.to(node, {
      x: (Math.random() - 0.5) * 110,
      y: (Math.random() - 0.5) * 130,
      duration,
      ease: "sine.inOut",
      force3D: true,
      onComplete: step,
    });
    tweens.push(tween);
  };
  step();
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
    let cancelled = false;

    nodes.forEach((node, i) => {
      const seed = particles[i];
      if (!seed) return;

      gsap.set(node, {
        x: (Math.random() - 0.5) * 40,
        y: (Math.random() - 0.5) * 40,
        opacity: seed.opacity,
      });

      /* Stagger first move so the field doesn't pulse in sync */
      const kick = gsap.delayedCall(Math.random() * 2.5, () => {
        if (cancelled) return;
        startWander(node, tweens);
      });
      tweens.push(kick as unknown as gsap.core.Tween);

      tweens.push(
        gsap.to(node, {
          opacity: Math.min(0.95, seed.opacity + 0.35),
          duration: 2.8 + Math.random() * 3.2,
          delay: Math.random() * 1.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        }),
      );
    });

    return () => {
      cancelled = true;
      tweens.forEach((t) => t.kill());
      gsap.killTweensOf(nodes);
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
