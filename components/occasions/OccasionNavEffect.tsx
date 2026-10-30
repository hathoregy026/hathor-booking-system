"use client";

import "./occasions.css";
import { useEffect, useRef } from "react";
import type { Occasion } from "@/lib/occasions";

type Effect = Occasion["navEffect"];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  gravity: number;
  trail: number;
  /** Palette index; -1 draws in the trail gold. */
  color: number;
  size: number;
  rot: number;
  spin: number;
  phase: number;
  /** Fireworks: rises to `targetY`, then bursts. */
  rocket: boolean;
  targetY: number;
  /** Flickers as it fades, like crackle. */
  twinkle: boolean;
  /** The bright bloom at the heart of a burst, gone in a blink. */
  flash: boolean;
};

/* Day colours are deep enough for the cream bar; night ones glow on dark. */
const PALETTES: Record<Effect["palette"], { day: string[]; night: string[] }> = {
  festive: {
    day: ["#d7263d", "#ef8a17", "#159a7c", "#2878d6", "#8b3fb5", "#c49a22"],
    night: ["#ff5d73", "#ffc94d", "#3ee6a0", "#5cc8ff", "#c38bff", "#fff3c4"],
  },
  jewel: {
    day: ["#9b1c31", "#0f7a5a", "#1f4e9c", "#8e7440", "#6a2c91"],
    night: ["#ef5a6f", "#34d399", "#6b9bff", "#e2c88f", "#b783f0"],
  },
  gold: {
    day: ["#b39b63", "#8e7440", "#c9ae72", "#6b5a3a"],
    night: ["#d9c08a", "#ece4da", "#b39b63", "#f3dfa8"],
  },
  champagne: {
    day: ["#a68e5c", "#8d8a82", "#bfa571", "#6f6c66"],
    night: ["#f1e6cc", "#c9c6be", "#d9c08a", "#ffffff"],
  },
  midnight: {
    day: ["#9c8450", "#2f3d6b", "#b39b63", "#4f5f94"],
    night: ["#d9c08a", "#7f93d1", "#b39b63", "#afc0ee"],
  },
};
const PETALS = ["#d9a49a", "#e7c3b8", "#c9ae72", "#b98b84"];
const TRAIL_GOLD = { day: "#a07f3c", night: "#f3d48a" };
const MAX_PARTICLES = 900;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function makeParticle(partial: Partial<Particle>): Particle {
  return {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 1,
    max: 1,
    gravity: 0,
    trail: 0,
    color: 0,
    size: 1,
    rot: 0,
    spin: 0,
    phase: rand(0, Math.PI * 2),
    rocket: false,
    targetY: 0,
    twinkle: false,
    flash: false,
    ...partial,
  };
}

/** Soft radial halo per colour, drawn behind each spark so bursts glow without per-draw blur. */
function glowSprite(cache: Map<string, HTMLCanvasElement>, colour: string): HTMLCanvasElement {
  let sprite = cache.get(colour);
  if (sprite) return sprite;
  sprite = document.createElement("canvas");
  sprite.width = sprite.height = 32;
  const ctx = sprite.getContext("2d");
  if (ctx) {
    const glow = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    glow.addColorStop(0, `${colour}d9`);
    glow.addColorStop(0.22, `${colour}73`);
    glow.addColorStop(0.55, `${colour}21`);
    glow.addColorStop(1, `${colour}00`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 32, 32);
  }
  cache.set(colour, sprite);
  return sprite;
}

/**
 * One burst: peony, even ring, willow or two-tone, fuller as density rises.
 * Willows trail gold, or their own colour in the colourful palettes.
 */
function burst(
  list: Particle[],
  x: number,
  y: number,
  colorCount: number,
  size: number,
  density: number,
  colourWillow: boolean,
) {
  const shape = ["classic", "ring", "willow", "twotone"][Math.floor(Math.random() * 4)];
  const base = Math.floor(Math.random() * colorCount);
  const second = (base + 1 + Math.floor(Math.random() * Math.max(1, colorCount - 1))) % colorCount;
  const fullness = 0.7 + 0.6 * density;
  const count = Math.round(
    (shape === "willow" ? 40 : shape === "ring" ? 30 : rand(22, 36)) * fullness,
  );
  const bloom = rand(0.28, 0.36);
  list.push(makeParticle({ x, y, life: bloom, max: bloom, size, color: base, flash: true }));
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + (shape === "ring" ? 0 : rand(-0.1, 0.1));
    const speed =
      (shape === "ring" ? rand(54, 58) : shape === "willow" ? rand(18, 52) : rand(28, 74)) * size;
    const life = shape === "willow" ? rand(1.8, 2.6) : rand(1, 1.6);
    list.push(
      makeParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        max: life,
        gravity: (shape === "willow" ? 30 : 22) * size,
        trail: shape === "willow" ? 0.14 : 0.05,
        color:
          shape === "willow"
            ? colourWillow
              ? base
              : -1
            : shape === "twotone"
              ? i % 2
                ? second
                : base
              : Math.random() < 0.2
                ? Math.floor(Math.random() * colorCount)
                : base,
        twinkle: shape === "willow" || Math.random() < 0.15,
      }),
    );
  }
}

/** Ambient effects keep a steady population scaled to the bar's width and the chosen density. */
function seed(type: Effect["type"], width: number, height: number, density: number) {
  const share = Math.max(0.25, width / 1440);
  const list: Particle[] = [];
  if (type === "dust") {
    const n = Math.round((25 + 130 * density) * share);
    for (let i = 0; i < n; i += 1) {
      list.push(
        makeParticle({
          x: rand(0, width),
          y: rand(4, height - 4),
          vx: rand(4, 14),
          vy: rand(-2, 2),
          size: rand(0.6, 1.7),
          spin: rand(1, 3),
          color: i,
        }),
      );
    }
  } else if (type === "confetti") {
    const n = Math.round((14 + 60 * density) * share);
    for (let i = 0; i < n; i += 1) {
      list.push(
        makeParticle({
          x: rand(0, width),
          y: rand(-6, height),
          vx: rand(-5, 5),
          vy: rand(8, 18),
          size: rand(3, 5.5),
          rot: rand(0, 6.3),
          spin: rand(-3, 3),
          color: i,
        }),
      );
    }
  } else if (type === "petals") {
    const n = Math.round((6 + 32 * density) * share);
    for (let i = 0; i < n; i += 1) {
      list.push(
        makeParticle({
          x: rand(0, width),
          y: rand(8, height - 8),
          vx: rand(14, 34),
          size: rand(4, 7) * (width <= 640 ? 0.75 : 1),
          rot: rand(0, 6.3),
          spin: rand(-1, 1),
          color: i,
        }),
      );
    }
  }
  return list;
}

/**
 * Atmosphere painted between the header's glass and its controls (z-index -1
 * inside the header's stacking context), masked away from the logo and tools.
 * Over the homepage hero the canvas also reaches below the bar (see CSS), and
 * fireworks launch from there; dust, confetti and petals stay in the bar.
 * `speed` scales motion, `density` how much is in the air, `intensity` how
 * bright. Stops while the tab is hidden.
 */
export function OccasionNavEffect({ effect }: { effect: Effect }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { type, intensity, palette, speed, density } = effect;

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx || type === "none") return;

    let particles: Particle[] = [];
    const sprites = new Map<string, HTMLCanvasElement>();
    let width = 0;
    /* The canvas can reach below the bar into the hero (CSS); `bar` is the bar alone. */
    let height = 0;
    let bar = 0;
    let scale = 1;
    let raf = 0;
    let last = 0;
    let wait = 0;
    let clock = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const widthChanged = Math.abs(rect.width - width) > 40;
      width = rect.width;
      height = rect.height;
      bar = Math.min(height, host.getBoundingClientRect().height);
      canvas.style.setProperty("--occ-bar-h", `${Math.round(bar)}px`);
      scale = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      if (type !== "fireworks" && (widthChanged || particles.length === 0)) {
        particles = seed(type, width, bar, density);
      }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    observer.observe(canvas);
    resize();

    const fade = 0.35 + 0.65 * intensity;
    const colourful = palette === "festive" || palette === "jewel";

    /*
     * Rockets go up in the open stretches of the bar — between the burger and
     * the countdown (its edges come from OccasionNavCountdown), and between it
     * and the tools — so bursts are seen rather than masked away.
     */
    const launchX = () => {
      const phone = width <= 640;
      const cdLeft = parseFloat(host.style.getPropertyValue("--occ-cd-l"));
      const cdRight = parseFloat(host.style.getPropertyValue("--occ-cd-r"));
      const spans = [
        [phone ? 60 : 130, Number.isFinite(cdLeft) ? cdLeft - 24 : width / 2 - 70],
        [Number.isFinite(cdRight) ? cdRight + 24 : width / 2 + 70, width - (phone ? 110 : 300)],
      ].filter(([from, to]) => to - from > 40);
      const total = spans.reduce((sum, [from, to]) => sum + to - from, 0);
      let pick = Math.random() * total;
      for (const [from, to] of spans) {
        if (pick < to - from) return from + pick;
        pick -= to - from;
      }
      return rand(30, width - 30);
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      const step = dt * speed;
      const drag = Math.pow(0.985, step * 60);
      clock += step;
      /* Night, or the homepage's clear bar over the dark hero film. */
      const dark =
        document.documentElement.getAttribute("data-public-theme") === "night" ||
        (host.classList.contains("hathor-header--home") &&
          !host.classList.contains("hathor-header--nav-compact"));
      const tone = dark ? "night" : "day";
      const colors = type === "petals" ? PETALS : PALETTES[palette][tone];
      const gold = TRAIL_GOLD[tone];
      const phone = width <= 640;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";

      if (type === "fireworks") {
        /* Over the homepage hero the canvas reaches into it: rockets rise from
           the top of the hero and burst large across it and the bar. */
        const sky = height > bar + 20;
        const burstSize = sky ? (phone ? 0.95 : 1.5) : phone ? 0.7 : 1.15;
        const halo = (phone ? 6 : 8.5) * (sky ? 1.25 : 1);
        wait -= dt;
        if (wait <= 0 && bar > 24 && particles.length < MAX_PARTICLES) {
          const launches = density > 0.75 && Math.random() < 0.35 ? 2 : 1;
          for (let k = 0; k < launches; k += 1) {
            particles.push(
              makeParticle({
                x: launchX(),
                y: height + 2,
                vx: rand(-8, 8),
                vy: -(sky ? rand(170, 235) : rand(70, 105)) * (phone ? 0.8 : 1),
                rocket: true,
                targetY: sky
                  ? rand(bar * 0.45, bar + (height - bar) * 0.42)
                  : rand(10, Math.max(14, bar * 0.5)),
              }),
            );
          }
          wait = (2 - 1.75 * density) * rand(0.6, 1.4);
        }
        ctx.lineWidth = 1.8;
        for (let i = particles.length - 1; i >= 0; i -= 1) {
          const p = particles[i];
          if (p.rocket) {
            p.x += p.vx * step;
            p.y += p.vy * step;
            p.vy += 18 * step;
            if (p.y <= p.targetY || p.vy >= -12) {
              particles.splice(i, 1);
              burst(particles, p.x, p.y, colors.length, burstSize, density, colourful);
              continue;
            }
            ctx.globalAlpha = 0.6 * fade;
            ctx.drawImage(glowSprite(sprites, gold), p.x - 4, p.y - 4, 8, 8);
            ctx.globalAlpha = 0.9 * fade;
            ctx.strokeStyle = gold;
            ctx.beginPath();
            ctx.moveTo(p.x - p.vx * 0.08, p.y - p.vy * 0.08);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            continue;
          }
          p.life -= step;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }
          const color = p.color < 0 ? gold : colors[p.color % colors.length];
          if (p.flash) {
            const left = p.life / p.max;
            const r = 40 * p.size * (0.7 + 0.3 * left);
            ctx.globalAlpha = left * left * fade * 0.6;
            ctx.drawImage(glowSprite(sprites, color), p.x - r, p.y - r, r * 2, r * 2);
            continue;
          }
          p.vx *= drag;
          p.vy = p.vy * drag + p.gravity * step;
          p.x += p.vx * step;
          p.y += p.vy * step;
          let alpha = (p.life / p.max) * fade;
          if (p.twinkle && p.life < p.max * 0.5) alpha *= 0.55 + 0.45 * Math.sin(clock * 40 + p.phase);
          alpha = Math.max(0, alpha);
          /* Sparks start stacked on one point: halos come up as they spread, so they never pile into a white disc. */
          ctx.globalAlpha = alpha * 0.95 * Math.min(1, (p.max - p.life) / 0.25);
          ctx.drawImage(glowSprite(sprites, color), p.x - halo, p.y - halo, halo * 2, halo * 2);
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.moveTo(p.x - p.vx * p.trail, p.y - p.vy * p.trail);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ctx.fillStyle = color;
          ctx.fillRect(p.x - 1.3, p.y - 1.3, 2.6, 2.6);
        }
      } else if (type === "dust") {
        for (const p of particles) {
          p.x += p.vx * step;
          p.y += p.vy * step;
          if (p.x > width + 4) p.x = -4;
          if (p.y < 2 || p.y > bar - 2) p.vy *= -1;
          ctx.globalAlpha = (0.25 + 0.75 * (Math.sin(clock * p.spin + p.phase) * 0.5 + 0.5)) * fade;
          ctx.fillStyle = colors[p.color % colors.length];
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (type === "confetti") {
        for (const p of particles) {
          p.y += p.vy * step;
          p.x += (p.vx + Math.sin(clock * 1.4 + p.phase) * 10) * step;
          p.rot += p.spin * step;
          if (p.y > bar + 6) {
            p.y = -6;
            p.x = rand(0, width);
          }
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(Math.cos(clock * 3 + p.phase), 1);
          ctx.globalAlpha = 0.55 * fade + 0.2;
          ctx.fillStyle = colors[p.color % colors.length];
          ctx.fillRect(-p.size / 2, -p.size * 0.22, p.size, p.size * 0.44);
          ctx.restore();
        }
      } else if (type === "petals") {
        for (const p of particles) {
          p.x += p.vx * step;
          p.rot += p.spin * step;
          if (p.x > width + 10) {
            p.x = -10;
            p.y = rand(8, bar - 8);
          }
          ctx.save();
          ctx.translate(p.x, p.y + Math.sin(clock * 0.9 + p.phase) * 5);
          ctx.rotate(p.rot);
          ctx.globalAlpha = 0.7 * fade + 0.15;
          ctx.fillStyle = colors[p.color % colors.length];
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.42, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      if (!document.hidden) raf = window.requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      if (!document.hidden && !raf) {
        last = 0;
        raf = window.requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    raf = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [type, intensity, palette, speed, density]);

  return <canvas ref={canvasRef} className="occasion-fireworks" aria-hidden="true" />;
}
