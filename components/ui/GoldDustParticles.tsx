"use client";

/**
 * Floating gold dust for heroes and homepage content.
 * Easy removal: delete `<GoldDustParticles />` usages and this file.
 *
 * Real touch devices keep the full gold field with slightly fewer dots,
 * softer blur, and slower wander — same look, cheaper for phone GPUs.
 */

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { shouldLightenMotionForDevice, isPhoneViewport, logPhonePerfDev } from "@/lib/touch-device";

const PARTICLE_COUNT_DESKTOP = 36;
const PARTICLE_COUNT_TOUCH = 28;
const PARTICLE_COUNT_PHONE = 8;
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

/** Continuous wander with a deterministic path per particle. */
function startWander(
  node: HTMLElement,
  random: () => number,
  isCancelled: () => boolean,
  light: boolean,
) {
  const travel = light ? 55 : 110;
  const step = () => {
    if (isCancelled()) return;
    gsap.to(node, {
      x: (random() - 0.5) * travel,
      y: (random() - 0.5) * (light ? 70 : 130),
      duration: (light ? 5.5 : 3.5) + random() * (light ? 5 : 4.5),
      ease: "sine.inOut",
      force3D: true,
      onComplete: step,
    });
  };
  step();
}

export function GoldDustParticles() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"desktop" | "touch" | "phone">("desktop");
  const [ready, setReady] = useState(false);
  const count =
    mode === "phone"
      ? PARTICLE_COUNT_PHONE
      : mode === "touch"
        ? PARTICLE_COUNT_TOUCH
        : PARTICLE_COUNT_DESKTOP;
  const light = mode !== "desktop";
  const particles = useMemo(() => buildParticles(count), [count]);

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setReady(false);
      return;
    }
    if (isPhoneViewport()) setMode("phone");
    else if (shouldLightenMotionForDevice()) setMode("touch");
    else setMode("desktop");
    setReady(true);
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !ready) return;

    const allNodes = root.querySelectorAll<HTMLElement>("[data-gold-dust]");
    const nodes = Array.from(allNodes);
    const tweens: gsap.core.Tween[] = [];
    let cancelled = false;
    let paused = false;

    const pauseAll = () => {
      paused = true;
      tweens.forEach((t) => t.pause());
      gsap.killTweensOf(nodes);
    };
    const resumeAll = () => {
      if (cancelled || document.visibilityState === "hidden") return;
      paused = false;
      nodes.forEach((node, i) => {
        const seed = particles[i];
        if (!seed) return;
        const random = createSeededRandom(0x44555354 + i * 97);
        startWander(node, random, () => cancelled || paused, light);
      });
    };

    nodes.forEach((node, i) => {
      const seed = particles[i];
      if (!seed) return;
      const random = createSeededRandom(0x44555354 + i * 97);

      gsap.set(node, {
        x: (random() - 0.5) * (light ? 20 : 40),
        y: (random() - 0.5) * (light ? 20 : 40),
        opacity: seed.opacity,
      });

      const kick = gsap.delayedCall(random() * (light ? 1.2 : 2.5), () => {
        if (cancelled || paused) return;
        startWander(node, random, () => cancelled || paused, light);
      });
      tweens.push(kick as unknown as gsap.core.Tween);

      if (mode !== "phone") {
        tweens.push(
          gsap.to(node, {
            opacity: Math.min(0.95, seed.opacity + (light ? 0.2 : 0.35)),
            duration: (light ? 3.6 : 2.8) + random() * 3.2,
            delay: random() * 1.5,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          }),
        );
      }
    });

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) resumeAll();
        else pauseAll();
      },
      { threshold: 0.05 },
    );
    io.observe(root);

    const onVis = () => {
      if (document.visibilityState === "hidden") pauseAll();
      else if (root.getBoundingClientRect().height > 0) resumeAll();
    };
    document.addEventListener("visibilitychange", onVis);

    logPhonePerfDev({
      surface: "gold-dust",
      mode,
      particles: nodes.length,
    });

    return () => {
      cancelled = true;
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      tweens.forEach((t) => t.kill());
      gsap.killTweensOf(allNodes);
    };
  }, [particles, ready, light, mode]);

  if (!ready) return null;

  return (
    <div
      ref={rootRef}
      className={`gold-dust-particles${light ? " gold-dust-particles--touch" : ""}${mode === "phone" ? " gold-dust-particles--phone" : ""}`}
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
            width: light ? Math.max(2, p.size * 0.85) : p.size,
            height: light ? Math.max(2, p.size * 0.85) : p.size,
            borderRadius: "50%",
            background: p.color,
            opacity: p.opacity,
            /* Phone: no blur. Touch/desktop: soft blur. */
            filter:
              mode === "phone"
                ? undefined
                : `blur(${light ? Math.min(0.85, p.blur * 0.45) : p.blur}px)`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
