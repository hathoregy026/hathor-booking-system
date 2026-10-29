"use client";

import "./occasions.css";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { X } from "lucide-react";
import {
  formatCountdown,
  msUntilCountdown,
  OCCASION_DISMISS_STORAGE_PREFIX,
  stripeItemsAt,
  type Occasion,
  type OccasionStripeItem,
} from "@/lib/occasions";
import { OccasionIcon, sparkPath, starPath } from "@/components/occasions/OccasionIcon";
import {
  useActiveOccasion,
  usePrefersReducedMotion,
} from "@/components/occasions/useActiveOccasion";

/**
 * Lives inside the fixed header (components/layout/Header.tsx), so it follows
 * the nav as it compacts. Everything here overlays the page — nothing pushes
 * content — so pinned editorial stages keep their layout math.
 */
export function OccasionHeaderLayer() {
  const active = useActiveOccasion();
  const reducedMotion = usePrefersReducedMotion();
  const occasionId = active?.occasion.id ?? null;
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  useEffect(() => {
    if (!occasionId) return;
    const read = window.setTimeout(() => {
      try {
        if (window.localStorage.getItem(OCCASION_DISMISS_STORAGE_PREFIX + occasionId)) {
          setDismissedId(occasionId);
        }
      } catch {
        /* storage blocked — the stripe simply stays */
      }
    }, 0);
    return () => window.clearTimeout(read);
  }, [occasionId]);

  const dismiss = useCallback(() => {
    if (!occasionId) return;
    setDismissedId(occasionId);
    try {
      window.localStorage.setItem(OCCASION_DISMISS_STORAGE_PREFIX + occasionId, "1");
    } catch {
      /* storage blocked — dismissed for this page view only */
    }
  }, [occasionId]);

  if (!active) return null;
  const { occasion, now } = active;
  const items = stripeItemsAt(occasion, now);
  const left = msUntilCountdown(occasion, now);
  const showStripe =
    occasion.stripe.enabled && dismissedId !== occasion.id && items.length > 0;

  return (
    <>
      {occasion.navEffect.type !== "none" && !reducedMotion ? (
        <OccasionNavEffect effect={occasion.navEffect} />
      ) : null}
      <div className="occasion-under" data-occasion={occasion.id}>
        {showStripe ? (
          <OccasionStripe
            name={occasion.name}
            stripe={occasion.stripe}
            items={items}
            countdown={left !== null && left > 0 ? formatCountdown(left) : ""}
            reducedMotion={reducedMotion}
            onDismiss={occasion.stripe.dismissible ? dismiss : undefined}
          />
        ) : null}
        {occasion.hanging !== "none" ? <OccasionHanging kind={occasion.hanging} /> : null}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ stripe */

function StripeItem({
  item,
  countdown,
  copy,
}: {
  item: OccasionStripeItem;
  countdown: string;
  /** Repeats that only fill the marquee: hidden from assistive tech and tab order. */
  copy: boolean;
}) {
  const [before, after] = item.text.split("{countdown}");
  const text =
    after === undefined ? (
      item.text
    ) : (
      <>
        {before}
        <span className="occasion-stripe__count">{countdown}</span>
        {after}
      </>
    );
  const body = (
    <>
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- dashboard-uploaded icon, 15px
        <img className="occasion-stripe__img" src={item.imageUrl} alt="" />
      ) : (
        <OccasionIcon name={item.icon} />
      )}
      <span>{text}</span>
    </>
  );
  if (item.href) {
    return (
      <Link
        href={item.href}
        className="occasion-stripe__item occasion-stripe__item--link"
        tabIndex={copy ? -1 : undefined}
        aria-hidden={copy || undefined}
      >
        {body}
      </Link>
    );
  }
  return (
    <span className="occasion-stripe__item" aria-hidden={copy || undefined}>
      {body}
    </span>
  );
}

function StripeSet({
  items,
  countdown,
  copy,
}: {
  items: OccasionStripeItem[];
  countdown: string;
  copy: boolean;
}) {
  return (
    <>
      {items.map((item, index) => (
        <span key={`${item.text}-${index}`} className="occasion-stripe__cell">
          <StripeItem item={item} countdown={countdown} copy={copy} />
          <span className="occasion-stripe__sep" aria-hidden="true" />
        </span>
      ))}
    </>
  );
}

function GlideTrack({
  items,
  countdown,
  speed,
}: {
  items: OccasionStripeItem[];
  countdown: string;
  speed: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLSpanElement>(null);
  const repsRef = useRef(1);
  const [glide, setGlide] = useState({ reps: 1, seconds: 60 });
  const itemsKey = items.map((item) => item.text).join("|");

  /* Fill the viewport with whole sets, then time one set's travel at the chosen speed. */
  useEffect(() => {
    const viewport = trackRef.current?.parentElement;
    if (!viewport) return;
    const measure = () => {
      const group = groupRef.current;
      if (!group) return;
      const single = group.scrollWidth / repsRef.current;
      if (!single) return;
      const reps = Math.max(1, Math.ceil(viewport.clientWidth / single));
      repsRef.current = reps;
      const seconds = Math.round(((single * reps) / speed) * 10) / 10;
      setGlide((current) =>
        current.reps === reps && current.seconds === seconds ? current : { reps, seconds },
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    measure();
    return () => observer.disconnect();
  }, [itemsKey, speed]);

  return (
    <div
      ref={trackRef}
      className="occasion-stripe__track"
      style={{ "--occ-glide": `${glide.seconds}s` } as CSSProperties}
    >
      <span ref={groupRef} className="occasion-stripe__group">
        {Array.from({ length: glide.reps }, (_, rep) => (
          <StripeSet key={rep} items={items} countdown={countdown} copy={rep > 0} />
        ))}
      </span>
      <span className="occasion-stripe__group" aria-hidden="true">
        {Array.from({ length: glide.reps }, (_, rep) => (
          <StripeSet key={rep} items={items} countdown={countdown} copy />
        ))}
      </span>
    </div>
  );
}

/** One message at a time, cross-faded; pauses while hovered or focused. */
function RotateSlots({
  items,
  countdown,
  speed,
}: {
  items: OccasionStripeItem[];
  countdown: string;
  speed: number;
}) {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const count = items.length;

  useEffect(() => {
    if (count < 2) return;
    const id = window.setInterval(
      () => {
        if (!pausedRef.current) setIndex((current) => (current + 1) % count);
      },
      Math.max(2500, 8000 - speed * 50),
    );
    return () => window.clearInterval(id);
  }, [count, speed]);

  const shown = index % Math.max(1, count);
  return (
    <div
      className="occasion-stripe__slots"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onFocus={() => (pausedRef.current = true)}
      onBlur={() => (pausedRef.current = false)}
    >
      {items.map((item, i) => (
        <div
          key={`${item.text}-${i}`}
          className={`occasion-stripe__still${i === shown ? " is-shown" : ""}`}
          aria-hidden={i !== shown || undefined}
        >
          <StripeItem item={item} countdown={countdown} copy={i !== shown} />
        </div>
      ))}
    </div>
  );
}

export function OccasionStripe({
  name,
  stripe,
  items,
  countdown,
  reducedMotion,
  onDismiss,
}: {
  name: string;
  stripe: Occasion["stripe"];
  items: OccasionStripeItem[];
  countdown: string;
  reducedMotion: boolean;
  onDismiss?: () => void;
}) {
  const mode = reducedMotion ? "still" : stripe.mode;
  return (
    <div
      className={`occasion-stripe occasion-stripe--${stripe.style}`}
      role="region"
      aria-label={name}
    >
      <div className="occasion-stripe__viewport">
        {mode === "glide" ? (
          <GlideTrack items={items} countdown={countdown} speed={stripe.speed} />
        ) : mode === "rotate" ? (
          <RotateSlots items={items} countdown={countdown} speed={stripe.speed} />
        ) : (
          <div className="occasion-stripe__still is-shown">
            <StripeItem item={items[0]} countdown={countdown} copy={false} />
          </div>
        )}
      </div>
      {onDismiss ? (
        <button
          type="button"
          className="occasion-stripe__close"
          onClick={onDismiss}
          aria-label={`Hide the ${name} message`}
        >
          <X aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

/* --------------------------------------------- hanging decorations under the nav */

function useHostWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const observer = new ResizeObserver(() => setWidth(Math.round(host.clientWidth)));
    observer.observe(host);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Distances from each side edge, mirrored, so decorations stay clear of the centred logo. */
function mirrored(width: number, fromEdge: number[]): number[] {
  return [...fromEdge, ...fromEdge.map((x) => width - x).reverse()];
}

function StringLights({ width }: { width: number }) {
  const phone = width <= 640;
  const seg = phone ? 56 : 96;
  const sag = phone ? 6 : 10;
  const height = sag + 12;
  const stops = phone ? [0.5] : [0.25, 0.5, 0.75];
  let wire = "M0 1";
  const bulbs: { x: number; y: number; delay: number; duration: number }[] = [];
  for (let x = 0; x < width; x += seg) {
    wire += `Q${x + seg / 2} ${1 + sag * 2} ${x + seg} 1`;
    for (const t of stops) {
      const n = bulbs.length;
      bulbs.push({
        x: x + seg * t,
        y: 1 + 4 * sag * t * (1 - t),
        delay: -((n * 0.37) % 2.6),
        duration: 2 + (n % 3) * 0.5,
      });
    }
  }
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} focusable="false">
      <path className="occasion-lights__wire" d={wire} />
      {bulbs.map((bulb, index) => (
        <g key={index}>
          <path className="occasion-lights__cap" d={`M${bulb.x} ${bulb.y}v2`} />
          <g
            className="occasion-lights__bulb"
            style={{
              animationDelay: `${bulb.delay.toFixed(2)}s`,
              animationDuration: `${bulb.duration}s`,
            }}
          >
            <circle className="occasion-lights__glow" cx={bulb.x} cy={bulb.y + 4.5} r={4.6} />
            <circle className="occasion-lights__core" cx={bulb.x} cy={bulb.y + 4.5} r={2} />
          </g>
        </g>
      ))}
    </svg>
  );
}

function Lantern() {
  return (
    <svg viewBox="0 0 24 44" width="24" height="44" focusable="false">
      <path d="M8 2h8l2.5 5h-13z" className="occasion-hang__metal" />
      <path
        d="M5.5 7h13l1.8 6v13l-1.8 6h-13l-1.8-6V13z"
        className="occasion-hang__glass"
      />
      <ellipse className="occasion-hang__flame" cx="12" cy="19.5" rx="5" ry="8" />
      <path
        d="M12 7v25M3.7 19.5h16.6M7 7l-1 25M17 7l1 25"
        className="occasion-hang__ribs"
      />
      <path d="M6.5 32h11l-1.5 4.5h-8z" className="occasion-hang__metal" />
      <path d="M12 36.5V43" className="occasion-hang__ribs" />
    </svg>
  );
}

const LANTERN_STRINGS = [30, 52, 18];
const STAR_STRINGS = [16, 40, 26, 54, 20, 34];

function Garland({ kind, width }: { kind: "lanterns" | "stars"; width: number }) {
  const phone = width <= 640;
  const scale = phone ? 0.62 : 1;
  const positions =
    kind === "lanterns"
      ? mirrored(width, phone ? [26, 64] : [150, 212, 272])
      : mirrored(width, phone ? [22, 46, 72, 98] : [96, 148, 204, 258, 314, 366]);
  const strings = kind === "lanterns" ? LANTERN_STRINGS : STAR_STRINGS;

  return (
    <>
      {positions.map((x, i) => {
        const size =
          kind === "lanterns" ? 24 * scale * (i % 2 ? 0.85 : 1) : (i % 3 === 1 ? 17 : 12) * scale;
        return (
          <div
            key={i}
            className="occasion-hang__drop"
            style={{
              left: x - size / 2,
              width: size,
              animationDuration: `${3.4 + (i % 4) * 0.6}s`,
              animationDelay: `${-i * 0.7}s`,
            }}
          >
            <div
              className="occasion-hang__string"
              style={{ height: strings[i % strings.length] * scale }}
            />
            {kind === "lanterns" ? (
              <div style={{ width: size, height: (size * 44) / 24 }}>
                <Lantern />
              </div>
            ) : (
              <svg
                className="occasion-hang__twinkle"
                style={{ animationDelay: `${-i * 0.4}s` }}
                viewBox="0 0 24 24"
                width={size}
                height={size}
                focusable="false"
              >
                <path
                  className="occasion-hang__star"
                  d={i % 2 ? sparkPath(12, 12, 11.5) : starPath(12, 12.8, 11, 4.6, 5)}
                />
              </svg>
            )}
          </div>
        );
      })}
    </>
  );
}

export function OccasionHanging({ kind }: { kind: Exclude<Occasion["hanging"], "none"> }) {
  const [ref, width] = useHostWidth();
  return (
    <div ref={ref} className={`occasion-hang occasion-hang--${kind}`} aria-hidden="true">
      {width > 0 ? (
        kind === "lights" ? (
          <StringLights width={width} />
        ) : (
          <Garland kind={kind} width={width} />
        )
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------- nav atmosphere */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  gravity: number;
  trail: number;
  color: number;
  size: number;
  rot: number;
  spin: number;
  phase: number;
};

const PALETTES: Record<Occasion["navEffect"]["palette"], { day: string[]; night: string[] }> = {
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
    ...partial,
  };
}

/** One burst: classic peony, an even ring, or a gold willow with drooping trails. */
function burst(list: Particle[], x: number, y: number, colorCount: number, size: number) {
  const shape = ["classic", "ring", "willow"][Math.floor(Math.random() * 3)];
  const base = Math.floor(Math.random() * colorCount);
  const count = shape === "willow" ? 40 : shape === "ring" ? 30 : Math.round(rand(20, 34));
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
            ? 0
            : Math.random() < 0.25
              ? Math.floor(Math.random() * colorCount)
              : base,
      }),
    );
  }
}

/** Ambient effects keep a steady population scaled to the bar's width. */
function seed(type: Occasion["navEffect"]["type"], width: number, height: number, intensity: number) {
  const share = Math.max(0.25, width / 1440);
  const list: Particle[] = [];
  if (type === "dust") {
    const n = Math.round((20 + 90 * intensity) * share);
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
    const n = Math.round((14 + 40 * intensity) * share);
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
    const n = Math.round((6 + 22 * intensity) * share);
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
 * Faded atmosphere painted between the header's glass and its controls
 * (z-index -1 inside the header's stacking context), masked away from the
 * logo and tools. Stops while the tab is hidden.
 */
export function OccasionNavEffect({ effect }: { effect: Occasion["navEffect"] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { type, intensity, palette } = effect;

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx || type === "none") return;

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let scale = 1;
    let raf = 0;
    let last = 0;
    let wait = 0;
    let clock = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const widthChanged = Math.abs(rect.width - width) > 40;
      width = rect.width;
      height = rect.height;
      scale = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      if (type !== "fireworks" && (widthChanged || particles.length === 0)) {
        particles = seed(type, width, height, intensity);
      }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const fade = 0.25 + 0.5 * intensity;
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      clock += dt;
      const night = document.documentElement.getAttribute("data-public-theme") === "night";
      const colors = type === "petals" ? PETALS : PALETTES[palette][night ? "night" : "day"];
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, width, height);

      if (type === "fireworks") {
        wait -= dt;
        if (wait <= 0 && height > 24) {
          burst(particles, rand(30, width - 30), rand(12, height - 12), colors.length, width <= 640 ? 0.6 : 1);
          wait = (1.7 - 1.25 * intensity) * rand(0.6, 1.4);
        }
        for (let i = particles.length - 1; i >= 0; i -= 1) {
          const p = particles[i];
          p.life -= dt;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }
          p.vx *= 0.985;
          p.vy = p.vy * 0.985 + p.gravity * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          ctx.globalAlpha = (p.life / p.max) * fade;
          ctx.strokeStyle = colors[p.color % colors.length];
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(p.x - p.vx * p.trail, p.y - p.vy * p.trail);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      } else if (type === "dust") {
        for (const p of particles) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.x > width + 4) p.x = -4;
          if (p.y < 2 || p.y > height - 2) p.vy *= -1;
          ctx.globalAlpha = (0.25 + 0.75 * (Math.sin(clock * p.spin + p.phase) * 0.5 + 0.5)) * fade;
          ctx.fillStyle = colors[p.color % colors.length];
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (type === "confetti") {
        for (const p of particles) {
          p.y += p.vy * dt;
          p.x += (p.vx + Math.sin(clock * 1.4 + p.phase) * 10) * dt;
          p.rot += p.spin * dt;
          if (p.y > height + 6) {
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
          p.x += p.vx * dt;
          p.rot += p.spin * dt;
          if (p.x > width + 10) {
            p.x = -10;
            p.y = rand(8, height - 8);
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
  }, [type, intensity, palette]);

  return <canvas ref={canvasRef} className="occasion-fireworks" aria-hidden="true" />;
}
