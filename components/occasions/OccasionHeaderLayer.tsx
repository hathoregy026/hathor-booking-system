"use client";

import "./occasions.css";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { X } from "lucide-react";
import {
  countdownCaption,
  formatCountdown,
  msUntilCountdown,
  OCCASION_DISMISS_STORAGE_PREFIX,
  stripeItemsAt,
  type Occasion,
  type OccasionStripeItem,
} from "@/lib/occasions";
import { OccasionIcon, sparkPath, starPath } from "@/components/occasions/OccasionIcon";
import { OccasionNavCountdown } from "@/components/occasions/OccasionNavCountdown";
import { OccasionNavEffect } from "@/components/occasions/OccasionNavEffect";
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
  const occasion = active?.occasion ?? null;
  const occasionId = occasion?.id ?? null;
  const draft = Boolean(active?.draft);
  /* A visitor's choice is the id; in the dashboard preview it is that one edit,
     so the stripe returns with the next change. */
  const [dismissed, setDismissed] = useState<string | Occasion | null>(null);

  useEffect(() => {
    if (!occasionId || draft) return;
    const read = window.setTimeout(() => {
      try {
        if (window.localStorage.getItem(OCCASION_DISMISS_STORAGE_PREFIX + occasionId)) {
          setDismissed(occasionId);
        }
      } catch {
        /* storage blocked — the stripe simply stays */
      }
    }, 0);
    return () => window.clearTimeout(read);
  }, [occasionId, draft]);

  const dismiss = useCallback(() => {
    if (!occasion) return;
    if (draft) {
      setDismissed(occasion);
      return;
    }
    setDismissed(occasion.id);
    try {
      window.localStorage.setItem(OCCASION_DISMISS_STORAGE_PREFIX + occasion.id, "1");
    } catch {
      /* storage blocked — dismissed for this page view only */
    }
  }, [occasion, draft]);

  if (!active || !occasion) return null;
  const { now } = active;
  const items = stripeItemsAt(occasion, now);
  const left = msUntilCountdown(occasion, now);
  const isDismissed = draft ? dismissed === occasion : dismissed === occasion.id;
  const showStripe = occasion.stripe.enabled && !isDismissed && items.length > 0;
  const { hanging } = occasion;

  return (
    <>
      {occasion.navEffect.type !== "none" && !reducedMotion ? (
        <OccasionNavEffect effect={occasion.navEffect} />
      ) : null}
      {occasion.heroCountdown && left !== null && left > 0 ? (
        <OccasionNavCountdown ms={left} caption={countdownCaption(occasion)} />
      ) : null}
      {/* Top of the screen: the header makes room for the stripe, and every
          decoration hangs from it (or from the screen's edge without one). */}
      {showStripe || hanging !== "none" ? (
        <div className="occasion-top" data-occasion={occasion.id}>
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
          {hanging !== "none" ? <OccasionHanging kind={hanging} /> : null}
        </div>
      ) : null}
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

function OccasionStripe({
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

/* --------------------------------------------- decorations hanging from the top */

type BarLayout = {
  width: number;
  /** From where the decorations start down to the menu bar's bottom edge. */
  drop: number;
  /** Open stretches of the bar, as [from, to] px, clear of its controls. */
  spans: [number, number][];
};

/**
 * Measures the live menu bar: strings run down through it, so they need its
 * height and the gaps between the menu button, logo, countdown and tools. The
 * countdown reports its edges on the header's style (OccasionNavCountdown).
 */
function useBarLayout() {
  const ref = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<BarLayout>({ width: 0, drop: 0, spans: [] });

  useEffect(() => {
    const host = ref.current;
    const header = host?.closest<HTMLElement>(".hathor-header");
    if (!host || !header) return;
    const box = (selector: string) => header.querySelector(selector)?.getBoundingClientRect();
    const measure = () => {
      const width = Math.round(host.clientWidth);
      const logo = box(".hathor-header__logo");
      const countdownLeft = parseFloat(header.style.getPropertyValue("--occ-cd-l"));
      const countdownRight = parseFloat(header.style.getPropertyValue("--occ-cd-r"));
      const middleLeft = Math.min(logo?.left ?? width / 2, countdownLeft || Infinity);
      const middleRight = Math.max(logo?.right ?? width / 2, countdownRight || 0);
      const gap = width <= 640 ? 10 : 28;
      const spans: [number, number][] = [
        [(box(".hathor-header__menu-btn--left")?.right ?? 0) + gap, middleLeft - gap],
        [middleRight + gap, (box(".hathor-header__col--right")?.left ?? width) - gap],
      ];
      const next: BarLayout = {
        width,
        drop: Math.round(header.getBoundingClientRect().bottom - host.getBoundingClientRect().top),
        spans: spans.map(([from, to]) => [Math.round(from), Math.round(to)]),
      };
      setLayout((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
    };
    const resizes = new ResizeObserver(measure);
    resizes.observe(host);
    resizes.observe(header);
    const edges = new MutationObserver(measure);
    edges.observe(header, { attributes: true, attributeFilter: ["style"] });
    measure();
    return () => {
      resizes.disconnect();
      edges.disconnect();
    };
  }, []);

  return [ref, layout] as const;
}

/** Evenly along an open stretch, as many as fit at `spacing`; none if it has no room. */
function spread([from, to]: [number, number], most: number, spacing: number): number[] {
  const room = to - from;
  if (room < 0) return [];
  const count = Math.min(most, Math.floor(room / spacing) + 1);
  if (count === 1) return [(from + to) / 2];
  return Array.from({ length: count }, (_, i) => from + (room * i) / (count - 1));
}

/* Festive bulb colours, repeating along the wire: warm gold, red, green, blue, amber, violet. */
const BULB_COLOURS = ["#ffd36b", "#ff5a5f", "#4fe0a0", "#5cb8ff", "#ff9a3c", "#d88bff"];

function StringLights({ width }: { width: number }) {
  const id = useId().replace(/:/g, "");
  const phone = width <= 640;
  const seg = phone ? 56 : 96;
  const sag = phone ? 6 : 10;
  const glow = phone ? 6 : 8;
  const height = sag + 8 + glow;
  const stops = phone ? [0.5] : [0.25, 0.5, 0.75];
  let wire = "M0 1";
  const bulbs: { x: number; y: number; colour: number; delay: number; duration: number }[] = [];
  for (let x = 0; x < width; x += seg) {
    wire += `Q${x + seg / 2} ${1 + sag * 2} ${x + seg} 1`;
    for (const t of stops) {
      const n = bulbs.length;
      bulbs.push({
        x: x + seg * t,
        y: 1 + 4 * sag * t * (1 - t),
        colour: n % BULB_COLOURS.length,
        delay: -((n * 0.37) % 2.6),
        duration: 1.8 + (n % 4) * 0.45,
      });
    }
  }
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} focusable="false">
      <defs>
        {BULB_COLOURS.map((colour, index) => (
          <radialGradient key={colour} id={`${id}-bulb-${index}`}>
            <stop offset="0%" stopColor={colour} stopOpacity={0.95} />
            <stop offset="35%" stopColor={colour} stopOpacity={0.55} />
            <stop offset="100%" stopColor={colour} stopOpacity={0} />
          </radialGradient>
        ))}
      </defs>
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
            <circle cx={bulb.x} cy={bulb.y + 5} r={glow} fill={`url(#${id}-bulb-${bulb.colour})`} />
            <circle cx={bulb.x} cy={bulb.y + 5} r={phone ? 2 : 2.4} fill={BULB_COLOURS[bulb.colour]} />
            <circle className="occasion-lights__shine" cx={bulb.x - 0.6} cy={bulb.y + 4.3} r={0.8} />
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

/** Each string starts at the top and runs down an open stretch of the bar; what it carries hangs below. */
function Garland({ kind, layout }: { kind: "lanterns" | "stars"; layout: BarLayout }) {
  const phone = layout.width <= 640;
  const scale = phone ? 0.62 : 1;
  const lanterns = kind === "lanterns";
  const positions = layout.spans.flatMap((span) =>
    spread(span, lanterns ? 3 : 6, (lanterns ? 70 : 46) * scale),
  );
  const strings = lanterns ? LANTERN_STRINGS : STAR_STRINGS;

  return (
    <>
      {positions.map((x, i) => {
        const size = lanterns ? 24 * scale * (i % 2 ? 0.85 : 1) : (i % 3 === 1 ? 17 : 12) * scale;
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
              style={{ height: layout.drop + strings[i % strings.length] * scale }}
            />
            {lanterns ? (
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

function OccasionHanging({ kind }: { kind: Exclude<Occasion["hanging"], "none"> }) {
  const [ref, layout] = useBarLayout();
  return (
    <div ref={ref} className={`occasion-hang occasion-hang--${kind}`} aria-hidden="true">
      {layout.width > 0 ? (
        kind === "lights" ? (
          <StringLights width={layout.width} />
        ) : (
          <Garland kind={kind} layout={layout} />
        )
      ) : null}
    </div>
  );
}

