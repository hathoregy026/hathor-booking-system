"use client";

import "./occasions.css";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { X } from "lucide-react";
import {
  formatCountdown,
  msUntilCountdown,
  OCCASION_DISMISS_STORAGE_PREFIX,
  type Occasion,
  type OccasionStripeItem,
} from "@/lib/occasions";
import { OccasionIcon } from "@/components/occasions/OccasionIcon";
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
  const left = msUntilCountdown(occasion, now);
  const afterCountdown = left !== null && left <= 0;
  const items =
    afterCountdown && occasion.stripe.itemsAfterCountdown
      ? occasion.stripe.itemsAfterCountdown
      : occasion.stripe.items;
  const showStripe = dismissedId !== occasion.id && items.length > 0;

  return (
    <>
      {occasion.navFireworks && !reducedMotion ? (
        <OccasionNavFireworks intensity={occasion.navFireworks.intensity} />
      ) : null}
      <div className="occasion-under" data-occasion={occasion.id}>
        {showStripe ? (
          <OccasionStripe
            occasion={occasion}
            items={items}
            countdown={left !== null && left > 0 ? formatCountdown(left) : ""}
            still={reducedMotion || occasion.stripe.mode === "still"}
            onDismiss={occasion.stripe.dismissible ? dismiss : undefined}
          />
        ) : null}
        {occasion.stringLights ? <OccasionStringLights /> : null}
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
      <OccasionIcon name={item.icon} />
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

function OccasionStripe({
  occasion,
  items,
  countdown,
  still,
  onDismiss,
}: {
  occasion: Occasion;
  items: OccasionStripeItem[];
  countdown: string;
  still: boolean;
  onDismiss?: () => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLSpanElement>(null);
  const repsRef = useRef(1);
  const [glide, setGlide] = useState({ reps: 1, seconds: 60 });
  const itemsKey = items.map((item) => item.text).join("|");

  /* Fill the viewport with whole sets, then time one set's travel at the chosen speed. */
  useEffect(() => {
    if (still) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = () => {
      const group = groupRef.current;
      if (!group) return;
      const single = group.scrollWidth / repsRef.current;
      if (!single) return;
      const reps = Math.max(1, Math.ceil(viewport.clientWidth / single));
      repsRef.current = reps;
      const seconds = Math.round(((single * reps) / occasion.stripe.speed) * 10) / 10;
      setGlide((current) =>
        current.reps === reps && current.seconds === seconds ? current : { reps, seconds },
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    measure();
    return () => observer.disconnect();
  }, [still, itemsKey, occasion.stripe.speed]);

  return (
    <div className="occasion-stripe" role="region" aria-label={occasion.name}>
      <div ref={viewportRef} className="occasion-stripe__viewport">
        {still ? (
          <div className="occasion-stripe__still">
            <StripeItem item={items[0]} countdown={countdown} copy={false} />
          </div>
        ) : (
          <div
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
        )}
      </div>
      {onDismiss ? (
        <button
          type="button"
          className="occasion-stripe__close"
          onClick={onDismiss}
          aria-label={`Hide the ${occasion.name} message`}
        >
          <X aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------- string lights */

function OccasionStringLights() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new ResizeObserver(() => setWidth(Math.round(wrap.clientWidth)));
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  const phone = width <= 640;
  const seg = phone ? 56 : 96;
  const sag = phone ? 6 : 10;
  const height = sag + 12;
  const stops = phone ? [0.5] : [0.25, 0.5, 0.75];
  let wire = "M0 1";
  const bulbs: { x: number; y: number; delay: number; duration: number }[] = [];
  for (let x = 0; width > 0 && x < width; x += seg) {
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
    <div ref={wrapRef} className="occasion-lights" aria-hidden="true">
      {width > 0 ? (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} focusable="false">
          <path className="occasion-lights__wire" d={wire} />
          {bulbs.map((bulb, index) => (
            <g key={index}>
              <path className="occasion-lights__cap" d={`M${bulb.x} ${bulb.y}v2`} />
              <g
                className="occasion-lights__bulb"
                style={
                  {
                    animationDelay: `${bulb.delay.toFixed(2)}s`,
                    animationDuration: `${bulb.duration}s`,
                  } as CSSProperties
                }
              >
                <circle className="occasion-lights__glow" cx={bulb.x} cy={bulb.y + 4.5} r={4.6} />
                <circle className="occasion-lights__core" cx={bulb.x} cy={bulb.y + 4.5} r={2} />
              </g>
            </g>
          ))}
        </svg>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------- nav fireworks */

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  gravity: number;
  trail: number;
  color: string;
};

const DAY_SPARKS = ["#b39b63", "#8e7440", "#c9ae72", "#6b5a3a"];
const NIGHT_SPARKS = ["#d9c08a", "#ece4da", "#b39b63", "#f3dfa8"];
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** One burst: classic peony, an even ring, or a gold willow with drooping trails. */
function burst(sparks: Spark[], x: number, y: number, colors: string[], size: number) {
  const shape = ["classic", "ring", "willow"][Math.floor(Math.random() * 3)];
  const base = colors[Math.floor(Math.random() * colors.length)];
  const count = shape === "willow" ? 40 : shape === "ring" ? 30 : Math.round(rand(20, 34));
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + (shape === "ring" ? 0 : rand(-0.1, 0.1));
    const speed =
      (shape === "ring" ? rand(54, 58) : shape === "willow" ? rand(18, 52) : rand(28, 74)) * size;
    const life = shape === "willow" ? rand(1.8, 2.6) : rand(1, 1.6);
    sparks.push({
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
          ? colors[0]
          : Math.random() < 0.25
            ? colors[Math.floor(Math.random() * colors.length)]
            : base,
    });
  }
}

/**
 * Faded bursts painted between the header's glass and its controls (z-index -1
 * inside the header's stacking context), masked away from the logo and tools.
 * Stops while the tab is hidden.
 */
function OccasionNavFireworks({ intensity }: { intensity: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const sparks: Spark[] = [];
    let width = 0;
    let height = 0;
    let scale = 1;
    let raf = 0;
    let last = 0;
    let wait = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      scale = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const fade = 0.25 + 0.5 * intensity;
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, width, height);
      wait -= dt;
      if (wait <= 0 && height > 24) {
        const night = document.documentElement.getAttribute("data-public-theme") === "night";
        burst(
          sparks,
          rand(30, width - 30),
          rand(12, height - 12),
          night ? NIGHT_SPARKS : DAY_SPARKS,
          width <= 640 ? 0.6 : 1,
        );
        wait = (1.7 - 1.25 * intensity) * rand(0.6, 1.4);
      }
      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const p = sparks[i];
        p.life -= dt;
        if (p.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        ctx.globalAlpha = (p.life / p.max) * fade;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * p.trail, p.y - p.vy * p.trail);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
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
  }, [intensity]);

  return <canvas ref={canvasRef} className="occasion-fireworks" aria-hidden="true" />;
}
