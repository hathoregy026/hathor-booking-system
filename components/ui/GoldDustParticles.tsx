"use client";

/**
 * Floating gold dust for heroes and homepage content.
 * Easy removal: delete `<GoldDustParticles />` usages and this file.
 *
 * Real touch devices skip this entirely — per-particle blur + perpetual
 * GSAP wander is a common cause of “smooth in DevTools, laggy on phone”.
 */

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { shouldLightenMotionForDevice } from "@/lib/touch-device";

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
  const random = createSeededRandom(0x48415448);
  return Array.from({ length: count }, (_, id) => {
    const size = 2.5 + random() * 4;
    return {
      id,
      left: `${random() * 100}%`,
      top: `${random() * 100}%`,
      size,
      color: COLORS[Math.floor(random() * COLORS.length)]!,
      blur: 1 + random() * 1.5,
      opacity: 0.4 + random() * 0.4,
    };
  });
}

/** Stable server/client output prevents particle fields causing hydration drift. */
function createSeededRandom(initialSeed: number) {
  let seed = initialSeed >>> 0;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

/** Continuous, low-cost wander with a deterministic path per particle. */
function startWander(
  node: HTMLElement,
  random: () => number,
  isCancelled: () => boolean,
) {
  const step = () => {
    if (isCancelled()) return;
    gsap.to(node, {
      x: (random() - 0.5) * 110,
      y: (random() - 0.5) * 130,
      duration: 3.5 + random() * 4.5,
      ease: "sine.inOut",
      force3D: true,
      onComplete: step,
    });
  };
  step();
}

export function GoldDustParticles() {
  const rootRef = useRef<HTMLDivElement>(null);
  const particles = useMemo(() => buildParticles(PARTICLE_COUNT), []);
  const [enabled, setEnabled] = useState(false);

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || shouldLightenMotionForDevice()) {
      setEnabled(false);
      return;
    }
    setEnabled(true);
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;

    const allNodes = root.querySelectorAll<HTMLElement>("[data-gold-dust]");
    const narrow = window.matchMedia("(max-width: 1024px)").matches;
    const nodes = Array.from(allNodes).slice(0, narrow ? 10 : PARTICLE_COUNT);
    const tweens: gsap.core.Tween[] = [];
    let cancelled = false;

    nodes.forEach((node, i) => {
      const seed = particles[i];
      if (!seed) return;
      const random = createSeededRandom(0x44555354 + i * 97);

      gsap.set(node, {
        x: (random() - 0.5) * 40,
        y: (random() - 0.5) * 40,
        opacity: seed.opacity,
      });

      /* Stagger first move so the field doesn't pulse in sync */
      const kick = gsap.delayedCall(random() * 2.5, () => {
        if (cancelled) return;
        startWander(node, random, () => cancelled);
      });
      tweens.push(kick as unknown as gsap.core.Tween);

      tweens.push(
        gsap.to(node, {
          opacity: Math.min(0.95, seed.opacity + 0.35),
          duration: 2.8 + random() * 3.2,
          delay: random() * 1.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        }),
      );
    });

    return () => {
      cancelled = true;
      tweens.forEach((t) => t.kill());
      gsap.killTweensOf(allNodes);
    };
  }, [particles, enabled]);

  if (!enabled) return null;

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
          data-gold-dust-index={p.id}
          style={{
            position: "absolute",
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            opacity: p.opacity,
            /* No CSS filter blur — soft edge via opacity only (GPU-cheap) */
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
