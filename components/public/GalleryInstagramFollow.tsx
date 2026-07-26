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
};

const EMOJI_GLYPHS = [
  { glyph: "☺", label: "smile" },
  { glyph: "♥", label: "heart" },
  { glyph: "👍", label: "thumbs" },
  { glyph: "✈", label: "plane" },
  { glyph: "🛥", label: "ship" },
  { glyph: "✨", label: "sparkles" },
] as const;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function bounceAxis(
  pos: number,
  vel: number,
  min: number,
  max: number,
): { pos: number; vel: number } {
  if (pos < min) return { pos: min, vel: Math.abs(vel) * 0.82 };
  if (pos > max) return { pos: max, vel: -Math.abs(vel) * 0.82 };
  return { pos, vel };
}

function createFloaters(width: number, height: number): FloaterState[] {
  const floaters: FloaterState[] = [];
  const pad = 48;
  const w = Math.max(width, 320);
  const h = Math.max(height, 280);

  EX_GALLERY.followPreviews.forEach((preview, index) => {
    const size = rand(64, 86);
    floaters.push({
      id: `img-${preview.imageName}-${index}`,
      kind: "image",
      imageName: preview.imageName,
      alt: preview.alt,
      size,
      x: rand(pad, Math.max(pad + 1, w - size - pad)),
      y: rand(pad, Math.max(pad + 1, h - size - pad)),
      vx: rand(-0.28, 0.28) || 0.16,
      vy: rand(-0.22, 0.22) || -0.14,
      rot: rand(-8, 8),
      rotV: rand(-0.012, 0.012),
      phase: rand(0, Math.PI * 2),
    });
  });

  EMOJI_GLYPHS.forEach((item, index) => {
    const size = rand(36, 44);
    floaters.push({
      id: `emo-${item.label}-${index}`,
      kind: "emoji",
      glyph: item.glyph,
      size,
      x: rand(pad, Math.max(pad + 1, w - size - pad)),
      y: rand(pad, Math.max(pad + 1, h - size - pad)),
      vx: rand(-0.32, 0.32) || 0.18,
      vy: rand(-0.26, 0.26) || 0.12,
      rot: rand(-10, 10),
      rotV: rand(-0.018, 0.018),
      phase: rand(0, Math.PI * 2),
    });
  });

  return floaters;
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
  const [seeds, setSeeds] = useState<FloaterSeed[]>([]);
  const [active, setActive] = useState(false);
  const reducedRef = useRef(false);

  const startFloat = useCallback(() => {
    if (reducedRef.current) return;
    const section = fieldRef.current?.closest(
      ".gallery-section",
    ) as HTMLElement | null;
    const width = section?.clientWidth || fieldRef.current?.clientWidth || 900;
    const height =
      section?.clientHeight || fieldRef.current?.clientHeight || 520;
    const next = createFloaters(width, height);
    floatersRef.current = next;
    setSeeds(
      next.map(({ id, kind, imageName, alt, glyph, size }) => ({
        id,
        kind,
        imageName,
        alt,
        glyph,
        size,
      })),
    );
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
    const floatObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          startFloat();
          floatObserver.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    floatObserver.observe(section);

    return () => {
      copyObserver.disconnect();
      floatObserver.disconnect();
    };
  }, [startFloat]);

  useEffect(() => {
    if (!active || reducedRef.current || seeds.length === 0) return;

    const field = fieldRef.current;
    if (!field) return;

    /* Paint initial positions without waiting a frame */
    floatersRef.current.forEach((f) => {
      const el = nodeRefs.current.get(f.id);
      if (el) {
        el.style.transform = `translate3d(${f.x}px, ${f.y}px, 0) rotate(${f.rot}deg)`;
      }
    });

    let last = performance.now();
    timeRef.current = 0;

    const tick = (now: number) => {
      const dtMs = Math.min(32, now - last);
      last = now;
      const dt = dtMs / 16.67;
      timeRef.current += dtMs / 1000;

      const width = field.clientWidth;
      const height = field.clientHeight;
      const t = timeRef.current;

      for (const f of floatersRef.current) {
        const ax = Math.sin(t * 0.35 + f.phase) * 0.008;
        const ay = Math.cos(t * 0.28 + f.phase * 1.3) * 0.0065;

        let vx = f.vx + ax * dt;
        let vy = f.vy + ay * dt;

        const speed = Math.hypot(vx, vy);
        const maxSpeed = f.kind === "image" ? 0.55 : 0.7;
        if (speed > maxSpeed) {
          vx = (vx / speed) * maxSpeed;
          vy = (vy / speed) * maxSpeed;
        }

        let x = f.x + vx * dt * 0.92;
        let y = f.y + vy * dt * 0.92;
        const rot = f.rot + f.rotV * dt * 16.67;

        const minX = 8;
        const minY = 8;
        const maxX = Math.max(minX, width - f.size - 8);
        const maxY = Math.max(minY, height - f.size - 8);

        const bx = bounceAxis(x, vx, minX, maxX);
        const by = bounceAxis(y, vy, minY, maxY);

        f.x = bx.pos;
        f.vx = bx.vel;
        f.y = by.pos;
        f.vy = by.vel;
        f.rot = rot;

        const el = nodeRefs.current.get(f.id);
        if (el) {
          el.style.transform = `translate3d(${f.x}px, ${f.y}px, 0) rotate(${f.rot}deg)`;
        }
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
