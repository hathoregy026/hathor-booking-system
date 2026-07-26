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
const FLOAT_SPEED_CAP_IMG = 0.48;
const FLOAT_SPEED_CAP_EMO = 0.62;

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

function buildSeeds(): FloaterSeed[] {
  const seeds: FloaterSeed[] = [];

  EX_GALLERY.followPreviews.forEach((preview, index) => {
    seeds.push({
      id: `img-${preview.imageName}-${index}`,
      kind: "image",
      imageName: preview.imageName,
      alt: preview.alt,
      size: rand(64, 86),
    });
  });

  EMOJI_GLYPHS.forEach((item, index) => {
    seeds.push({
      id: `emo-${item.label}-${index}`,
      kind: "emoji",
      glyph: item.glyph,
      size: rand(36, 44),
    });
  });

  return seeds;
}

function seedsToFloaters(
  seeds: FloaterSeed[],
  width: number,
  height: number,
): FloaterState[] {
  const cx = width * 0.5;
  const cy = height * 0.34;
  const n = Math.max(seeds.length, 1);

  return seeds.map((seed, index) => {
    const angle = (index / n) * Math.PI * 2 + rand(-0.28, 0.28);
    const impulse = seed.kind === "image" ? rand(2.6, 4.1) : rand(2.9, 4.6);
    return {
      ...seed,
      x: cx - seed.size / 2,
      y: cy - seed.size / 2,
      vx: Math.cos(angle) * impulse,
      vy: Math.sin(angle) * impulse * 0.92,
      rot: rand(-12, 12),
      rotV: rand(-0.02, 0.02),
      phase: rand(0, Math.PI * 2),
      mode: "pop" as const,
      popAge: -index * 0.045,
      opacity: 0,
    };
  });
}

/** Re-aim an existing set from the IG hotspot — pop again, keep same nodes. */
function reburstFloaters(
  floaters: FloaterState[],
  width: number,
  height: number,
) {
  const cx = width * 0.5;
  const cy = height * 0.34;
  const n = Math.max(floaters.length, 1);

  floaters.forEach((f, index) => {
    const angle = (index / n) * Math.PI * 2 + rand(-0.3, 0.3);
    const impulse = f.kind === "image" ? rand(2.5, 4.0) : rand(2.8, 4.5);
    f.x = cx - f.size / 2;
    f.y = cy - f.size / 2;
    f.vx = Math.cos(angle) * impulse;
    f.vy = Math.sin(angle) * impulse * 0.92;
    f.rot = rand(-14, 14);
    f.rotV = rand(-0.022, 0.022);
    f.mode = "pop";
    f.popAge = -index * 0.04;
    f.opacity = 0;
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
    el.style.transform = `translate3d(${f.x}px, ${f.y}px, 0) rotate(${f.rot}deg)`;
    el.style.opacity = String(f.opacity);
  };

  const playPop = useCallback(() => {
    if (reducedRef.current) return;
    if (cooldownRef.current) return;

    const field = fieldRef.current;
    const section = field?.closest(".gallery-section") as HTMLElement | null;
    const width = section?.clientWidth || field?.clientWidth || 900;
    const height = section?.clientHeight || field?.clientHeight || 520;

    cooldownRef.current = true;
    window.setTimeout(() => {
      cooldownRef.current = false;
    }, POP_COOLDOWN_MS);

    if (!seedsRef.current.length) {
      const nextSeeds = buildSeeds();
      seedsRef.current = nextSeeds;
      floatersRef.current = seedsToFloaters(nextSeeds, width, height);
      setSeeds(nextSeeds);
      setActive(true);
      return;
    }

    reburstFloaters(floatersRef.current, width, height);
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

          /* Outward pop with smooth drag — no bob */
          f.vx *= Math.pow(0.965, dt);
          f.vy *= Math.pow(0.965, dt);
          f.x += f.vx * dt * 0.95;
          f.y += f.vy * dt * 0.95;
          f.rot += f.rotV * dt * 18;

          const bx = bounceAxis(f.x, f.vx, minX, maxX);
          const by = bounceAxis(f.y, f.vy, minY, maxY);
          f.x = bx.pos;
          f.vx = bx.vel;
          f.y = by.pos;
          f.vy = by.vel;

          const speed = Math.hypot(f.vx, f.vy);
          if (f.popAge > 1.15 || speed < 0.55) {
            f.mode = "float";
            /* Hand off to gentle float speed */
            const cap =
              f.kind === "image" ? FLOAT_SPEED_CAP_IMG : FLOAT_SPEED_CAP_EMO;
            if (speed > cap) {
              f.vx = (f.vx / speed) * cap;
              f.vy = (f.vy / speed) * cap;
            } else if (speed < 0.12) {
              const a = rand(0, Math.PI * 2);
              f.vx = Math.cos(a) * cap * 0.55;
              f.vy = Math.sin(a) * cap * 0.55;
            }
            f.opacity = 1;
          }

          paintFloater(f);
          continue;
        }

        /* Elegant float — soft sine drift, bounce only at edges */
        const ax = Math.sin(t * 0.32 + f.phase) * 0.007;
        const ay = Math.cos(t * 0.26 + f.phase * 1.25) * 0.0055;
        let vx = f.vx + ax * dt;
        let vy = f.vy + ay * dt;

        const speed = Math.hypot(vx, vy);
        const maxSpeed =
          f.kind === "image" ? FLOAT_SPEED_CAP_IMG : FLOAT_SPEED_CAP_EMO;
        if (speed > maxSpeed) {
          vx = (vx / speed) * maxSpeed;
          vy = (vy / speed) * maxSpeed;
        }

        f.x += vx * dt * 0.9;
        f.y += vy * dt * 0.9;
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
                  sizes="88px"
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
