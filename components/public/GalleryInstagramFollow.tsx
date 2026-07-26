"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { SocialBrandIcon } from "@/components/public/SocialBrandIcon";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { EX_GALLERY } from "@/lib/ex-page-content";
import type { SiteImageName } from "@/lib/site-image-slots";

type GalleryInstagramFollowProps = {
  title: string;
  indication?: string;
  followEyebrow?: string;
  handleStyle?: CSSProperties;
};

type FloaterKind = "image" | "emoji";

type FloaterSeed = {
  id: string;
  kind: FloaterKind;
  imageName?: SiteImageName;
  alt?: string;
  glyph?: string;
  size: number;
};

type FloaterState = FloaterSeed & {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotV: number;
  phase: number;
  mode: "pop" | "float";
  /** Seconds since pop started; negative = stagger wait at origin */
  popAge: number;
  opacity: number;
};

const EMOJI_GLYPHS = [
  { glyph: "☺", label: "smile" },
  { glyph: "♥", label: "heart" },
  { glyph: "👍", label: "thumbs" },
  { glyph: "✈", label: "plane" },
  { glyph: "🛥", label: "ship" },
  { glyph: "✨", label: "sparkles" },
] as const;

const POP_COOLDOWN_MS = 1100;
/** After pop, keep roaming farther across the section */
const FLOAT_SPEED_CAP_IMG = 0.92;
const FLOAT_SPEED_CAP_EMO = 1.15;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function bounceAxis(
  pos: number,
  vel: number,
  min: number,
  max: number,
): { pos: number; vel: number } {
  if (pos < min) return { pos: min, vel: Math.abs(vel) * 0.78 };
  if (pos > max) return { pos: max, vel: -Math.abs(vel) * 0.78 };
  return { pos, vel };
}

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = items[i]!;
    items[i] = items[j]!;
    items[j] = tmp;
  }
  return items;
}

/**
 * Fresh random pop directions each time.
 * Angles are shuffled so images and icons are mixed — never typed into arcs.
 */
function randomPopPlan(count: number): Array<{
  angle: number;
  impulse: number;
  stagger: number;
}> {
  const n = Math.max(count, 1);
  const spin = rand(0, Math.PI * 2);
  const angles = Array.from({ length: n }, (_, i) => {
    const base = spin + (i / n) * Math.PI * 2;
    return base + rand(-0.65, 0.65);
  });
  shuffleInPlace(angles);

  const staggers = Array.from({ length: n }, () => rand(0, 0.35));
  shuffleInPlace(staggers);

  return angles.map((angle, i) => ({
    angle,
    impulse: rand(5.6, 10.8),
    stagger: staggers[i] ?? rand(0, 0.3),
  }));
}

/** Center of the IG icon + @handle, in field-local coordinates. */
function getPopOrigin(
  field: HTMLElement,
  hotspot: HTMLElement | null,
): { cx: number; cy: number } {
  const fieldRect = field.getBoundingClientRect();
  if (hotspot) {
    const r = hotspot.getBoundingClientRect();
    return {
      cx: r.left + r.width / 2 - fieldRect.left,
      cy: r.top + r.height / 2 - fieldRect.top,
    };
  }
  return {
    cx: fieldRect.width * 0.5,
    cy: Math.min(fieldRect.height * 0.28, 220),
  };
}

function buildSeeds(): FloaterSeed[] {
  const seeds: FloaterSeed[] = [];

  EX_GALLERY.followPreviews.forEach((preview, index) => {
    seeds.push({
      id: `img-${preview.imageName}-${index}`,
      kind: "image",
      imageName: preview.imageName,
      alt: preview.alt,
      size: rand(96, 128),
    });
  });

  EMOJI_GLYPHS.forEach((item, index) => {
    seeds.push({
      id: `emo-${item.label}-${index}`,
      kind: "emoji",
      glyph: item.glyph,
      size: rand(48, 60),
    });
  });

  return shuffleInPlace(seeds);
}

function applyRandomPop(
  floater: FloaterState,
  origin: { cx: number; cy: number },
  plan: { angle: number; impulse: number; stagger: number },
) {
  floater.size =
    floater.kind === "image" ? rand(96, 128) : rand(48, 60);
  floater.x = origin.cx - floater.size / 2;
  floater.y = origin.cy - floater.size / 2;
  floater.vx = Math.cos(plan.angle) * plan.impulse;
  floater.vy = Math.sin(plan.angle) * plan.impulse;
  floater.rot = rand(-18, 18);
  floater.rotV = rand(-0.028, 0.028);
  floater.phase = rand(0, Math.PI * 2);
  floater.mode = "pop";
  floater.popAge = -plan.stagger;
  floater.opacity = 0;
}

function seedsToFloaters(
  seeds: FloaterSeed[],
  origin: { cx: number; cy: number },
): FloaterState[] {
  const plan = randomPopPlan(seeds.length);
  return seeds.map((seed, index) => {
    const floater: FloaterState = {
      ...seed,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      rot: 0,
      rotV: 0,
      phase: 0,
      mode: "pop",
      popAge: 0,
      opacity: 0,
    };
    applyRandomPop(floater, origin, plan[index]!);
    return floater;
  });
}

/** Re-aim from the IG hotspot — fully random directions each time. */
function reburstFloaters(
  floaters: FloaterState[],
  origin: { cx: number; cy: number },
) {
  const plan = randomPopPlan(floaters.length);
  const order = shuffleInPlace(floaters.map((_, i) => i));
  order.forEach((floaterIndex, planIndex) => {
    applyRandomPop(floaters[floaterIndex]!, origin, plan[planIndex]!);
  });
}

export function GalleryInstagramFollow({
  title,
  indication: indicationProp,
  followEyebrow: followEyebrowProp,
  handleStyle,
}: GalleryInstagramFollowProps) {
  const websiteText = useWebsiteText();
  const indication =
    indicationProp ?? websiteText.home.gallery.indication;
  const followEyebrow =
    followEyebrowProp ?? websiteText.home.gallery.followEyebrow;
  const copyRef = useRef<HTMLDivElement>(null);
  const igLinkRef = useRef<HTMLAnchorElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const floatersRef = useRef<FloaterState[]>([]);
  const nodeRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const rafRef = useRef(0);
  const timeRef = useRef(0);
  const cooldownRef = useRef(false);
  const seedsRef = useRef<FloaterSeed[]>([]);
  const [seeds, setSeeds] = useState<FloaterSeed[]>([]);
  const [active, setActive] = useState(false);
  const reducedRef = useRef(false);

  const paintFloater = (f: FloaterState) => {
    const el = nodeRefs.current.get(f.id);
    if (!el) return;
    el.style.width = `${f.size}px`;
    el.style.height = `${f.size}px`;
    el.style.transform = `translate3d(${f.x}px, ${f.y}px, 0) rotate(${f.rot}deg)`;
    el.style.opacity = String(f.opacity);
  };

  const playPop = useCallback(() => {
    if (reducedRef.current) return;
    if (cooldownRef.current) return;

    const field = fieldRef.current;
    if (!field) return;

    const origin = getPopOrigin(field, igLinkRef.current);

    cooldownRef.current = true;
    window.setTimeout(() => {
      cooldownRef.current = false;
    }, POP_COOLDOWN_MS);

    if (!seedsRef.current.length) {
      const nextSeeds = buildSeeds();
      seedsRef.current = nextSeeds;
      floatersRef.current = seedsToFloaters(nextSeeds, origin);
      setSeeds(nextSeeds);
      setActive(true);
      return;
    }

    reburstFloaters(floatersRef.current, origin);
    floatersRef.current.forEach(paintFloater);
    setActive(true);
  }, []);

  useEffect(() => {
    reducedRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const section = fieldRef.current?.closest(
      ".gallery-section",
    ) as HTMLElement | null;
    if (!section) return;

    const copyObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          copyRef.current?.classList.add("is-visible");
          copyObserver.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" },
    );
    copyObserver.observe(section);

    if (reducedRef.current) {
      copyRef.current?.classList.add("is-visible");
      return () => copyObserver.disconnect();
    }

    let started = false;
    const popObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          playPop();
          popObserver.disconnect();
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" },
    );
    popObserver.observe(section);

    return () => {
      copyObserver.disconnect();
      popObserver.disconnect();
    };
  }, [playPop]);

  useEffect(() => {
    if (!active || reducedRef.current || seeds.length === 0) return;

    const field = fieldRef.current;
    if (!field) return;

    /* Sync first paint after nodes mount */
    floatersRef.current.forEach(paintFloater);

    let last = performance.now();
    timeRef.current = 0;

    const tick = (now: number) => {
      const dtMs = Math.min(32, now - last);
      last = now;
      const dt = dtMs / 16.67;
      timeRef.current += dtMs / 1000;
      const t = timeRef.current;

      const width = field.clientWidth;
      const height = field.clientHeight;
      const minX = 8;
      const minY = 8;

      for (const f of floatersRef.current) {
        const maxX = Math.max(minX, width - f.size - 8);
        const maxY = Math.max(minY, height - f.size - 8);

        if (f.mode === "pop") {
          f.popAge += dtMs / 1000;

          if (f.popAge < 0) {
            /* Stagger hold at origin */
            f.opacity = 0;
            paintFloater(f);
            continue;
          }

          f.opacity = Math.min(1, f.popAge * 4);

          /* Outward pop with light drag — travels far from the IG handle */
          f.vx *= Math.pow(0.988, dt);
          f.vy *= Math.pow(0.988, dt);
          f.x += f.vx * dt * 1.15;
          f.y += f.vy * dt * 1.15;
          f.rot += f.rotV * dt * 18;

          const bx = bounceAxis(f.x, f.vx, minX, maxX);
          const by = bounceAxis(f.y, f.vy, minY, maxY);
          f.x = bx.pos;
          f.vx = bx.vel;
          f.y = by.pos;
          f.vy = by.vel;

          const speed = Math.hypot(f.vx, f.vy);
          if (f.popAge > 1.85 || speed < 0.9) {
            f.mode = "float";
            const cap =
              f.kind === "image" ? FLOAT_SPEED_CAP_IMG : FLOAT_SPEED_CAP_EMO;
            if (speed > cap) {
              f.vx = (f.vx / speed) * cap;
              f.vy = (f.vy / speed) * cap;
            } else if (speed < 0.2) {
              const a = rand(0, Math.PI * 2);
              f.vx = Math.cos(a) * cap * 0.7;
              f.vy = Math.sin(a) * cap * 0.7;
            }
            f.opacity = 1;
          }

          paintFloater(f);
          continue;
        }

        /* Elegant float — soft sine drift, bounce only at edges */
        const ax = Math.sin(t * 0.28 + f.phase) * 0.01;
        const ay = Math.cos(t * 0.22 + f.phase * 1.25) * 0.008;
        let vx = f.vx + ax * dt;
        let vy = f.vy + ay * dt;

        const speed = Math.hypot(vx, vy);
        const maxSpeed =
          f.kind === "image" ? FLOAT_SPEED_CAP_IMG : FLOAT_SPEED_CAP_EMO;
        if (speed > maxSpeed) {
          vx = (vx / speed) * maxSpeed;
          vy = (vy / speed) * maxSpeed;
        }

        f.x += vx * dt * 1.05;
        f.y += vy * dt * 1.05;
        f.rot += f.rotV * dt * 14;

        const bx = bounceAxis(f.x, vx, minX, maxX);
        const by = bounceAxis(f.y, vy, minY, maxY);
        f.x = bx.pos;
        f.vx = bx.vel;
        f.y = by.pos;
        f.vy = by.vel;
        f.opacity = 1;

        paintFloater(f);
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [active, seeds]);

  return (
    <>
      <div
        ref={fieldRef}
        className={`instagram-burst-field${active ? " is-active" : ""}`}
        aria-hidden="true"
      >
        {seeds.map((floater) => (
          <span
            key={floater.id}
            ref={(el) => {
              if (el) nodeRefs.current.set(floater.id, el);
              else nodeRefs.current.delete(floater.id);
            }}
            className={
              floater.kind === "image"
                ? "instagram-burst-particle instagram-burst-particle--image"
                : "instagram-burst-particle instagram-burst-particle--emoji"
            }
            style={{
              width: floater.size,
              height: floater.size,
              opacity: 0,
            }}
          >
            {floater.kind === "image" && floater.imageName ? (
              <span className="instagram-circle instagram-circle--burst">
                <ManagedImage
                  name={floater.imageName}
                  alt=""
                  fill
                  sizes="128px"
                  className="object-cover"
                  previewAnchor={false}
                />
              </span>
            ) : (
              <span className="instagram-float-emoji__inner">
                {floater.glyph}
              </span>
            )}
          </span>
        ))}
      </div>

      <div className="gallery-header">
        <div className="gallery-h2">
          <h2>{title}</h2>
          <div
            ref={copyRef}
            className="instagram-follow"
            aria-label="Follow Hathor on Instagram"
            onMouseEnter={playPop}
            onFocusCapture={playPop}
          >
            <p className="instagram-follow__eyebrow instagram-follow__copy">
              {followEyebrow}
            </p>

            <a
              ref={igLinkRef}
              className="gallery-ig-link typo-page-subtitle instagram-follow__copy"
              href={EX_GALLERY.indicationHref}
              target="_blank"
              rel="noopener noreferrer"
              style={handleStyle}
              aria-label="Hathor Cruise on Instagram"
            >
              <SocialBrandIcon
                platform="instagram"
                className="gallery-ig-link__icon"
              />
              <span className="gallery-ig-link__handle">{indication}</span>
            </a>

            <div
              className="instagram-follow__divider instagram-follow__copy"
              aria-hidden="true"
            >
              <span className="instagram-follow__divider-line" />
              <span className="instagram-follow__divider-mark">✦</span>
              <span className="instagram-follow__divider-line" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
