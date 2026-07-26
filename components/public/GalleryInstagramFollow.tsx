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

type BurstParticle = {
  id: string;
  kind: "image" | "emoji";
  imageName?: SiteImageName;
  alt?: string;
  glyph?: string;
  delay: number;
  duration: number;
  bobDuration: number;
  p1x: number;
  p1y: number;
  p2x: number;
  p2y: number;
  p3x: number;
  p3y: number;
  p4x: number;
  p4y: number;
  rot: number;
  scale: number;
};

const EMOJI_GLYPHS = [
  { glyph: "☺", label: "smile" },
  { glyph: "♥", label: "heart" },
  { glyph: "👍", label: "thumbs" },
  { glyph: "✈", label: "plane" },
  { glyph: "🛥", label: "ship" },
  { glyph: "✨", label: "sparkles" },
] as const;

/** Continuous drift — no ease-out stall / push */
const FLOAT_EASE = "linear";

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** Soft wandering path that keeps moving (never parks mid-flight). */
function wanderPath(reachX: number, reachY: number) {
  const angle = rand(-Math.PI, Math.PI);
  const step = (t: number, wobble: number) => {
    const a = angle + rand(-0.55, 0.55) + wobble;
    const d = t * rand(0.85, 1.15);
    return {
      x: Math.cos(a) * reachX * d + rand(-28, 28),
      y: Math.sin(a) * reachY * d + rand(-24, 24) - t * rand(18, 48),
    };
  };

  const p1 = step(0.22, 0);
  const p2 = step(0.48, rand(-0.35, 0.35));
  const p3 = step(0.74, rand(-0.45, 0.45));
  const p4 = step(1.05, rand(-0.55, 0.55));
  return { p1, p2, p3, p4 };
}

function buildBurst(width: number, height: number, key: number): BurstParticle[] {
  const reachX = Math.max(width * 0.42, 180);
  const reachY = Math.max(height * 0.38, 140);
  const particles: BurstParticle[] = [];

  EX_GALLERY.followPreviews.forEach((preview, index) => {
    const path = wanderPath(reachX, reachY);
    particles.push({
      id: `img-${key}-${preview.imageName}-${index}`,
      kind: "image",
      imageName: preview.imageName,
      alt: preview.alt,
      delay: rand(0, 0.35) + index * 0.06,
      duration: rand(5.2, 7.2),
      bobDuration: rand(2.4, 3.6),
      p1x: path.p1.x,
      p1y: path.p1.y,
      p2x: path.p2.x,
      p2y: path.p2.y,
      p3x: path.p3.x,
      p3y: path.p3.y,
      p4x: path.p4.x,
      p4y: path.p4.y,
      rot: rand(-22, 22),
      scale: rand(0.94, 1.12),
    });
  });

  EMOJI_GLYPHS.forEach((item, index) => {
    const path = wanderPath(reachX * 1.05, reachY * 1.05);
    particles.push({
      id: `emo-${key}-${item.label}-${index}`,
      kind: "emoji",
      glyph: item.glyph,
      delay: rand(0.04, 0.42) + index * 0.05,
      duration: rand(4.8, 6.8),
      bobDuration: rand(2.1, 3.4),
      p1x: path.p1.x,
      p1y: path.p1.y,
      p2x: path.p2.x,
      p2y: path.p2.y,
      p3x: path.p3.x,
      p3y: path.p3.y,
      p4x: path.p4.x,
      p4y: path.p4.y,
      rot: rand(-28, 28),
      scale: rand(0.9, 1.16),
    });
  });

  return particles;
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
  const cooldownRef = useRef(false);
  const [phase, setPhase] = useState<"idle" | "bursting" | "done">("idle");
  const [particles, setParticles] = useState<BurstParticle[]>([]);
  const reducedRef = useRef(false);

  const playBurst = useCallback(() => {
    if (reducedRef.current) return;
    if (cooldownRef.current) return;

    const section = fieldRef.current?.closest(
      ".gallery-section",
    ) as HTMLElement | null;
    const width = section?.clientWidth || fieldRef.current?.clientWidth || 900;
    const height =
      section?.clientHeight || fieldRef.current?.clientHeight || 520;

    cooldownRef.current = true;
    setParticles(buildBurst(width, height, Date.now()));
    setPhase("bursting");
  }, []);

  const finishBurst = useCallback(() => {
    setPhase("done");
    setParticles([]);
    window.setTimeout(() => {
      cooldownRef.current = false;
    }, 600);
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

    let armed = false;
    const burstObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !armed) {
          armed = true;
          playBurst();
          burstObserver.unobserve(section);
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );

    burstObserver.observe(section);

    const onEnter = () => playBurst();
    section.addEventListener("mouseenter", onEnter);

    return () => {
      copyObserver.disconnect();
      burstObserver.disconnect();
      section.removeEventListener("mouseenter", onEnter);
    };
  }, [playBurst]);

  useEffect(() => {
    if (phase !== "bursting" || particles.length === 0) return;

    const maxMs =
      Math.max(...particles.map((p) => (p.delay + p.duration) * 1000)) + 120;
    const timer = window.setTimeout(finishBurst, maxMs);
    return () => window.clearTimeout(timer);
  }, [phase, particles, finishBurst]);

  return (
    <>
      <div
        ref={fieldRef}
        className={`instagram-burst-field${phase === "bursting" ? " is-active" : ""}`}
        aria-hidden="true"
      >
        {phase === "bursting" &&
          particles.map((particle) => (
            <span
              key={particle.id}
              className={
                particle.kind === "image"
                  ? "instagram-burst-particle instagram-burst-particle--image"
                  : "instagram-burst-particle instagram-burst-particle--emoji"
              }
              style={
                {
                  "--ig-p1x": `${particle.p1x}px`,
                  "--ig-p1y": `${particle.p1y}px`,
                  "--ig-p2x": `${particle.p2x}px`,
                  "--ig-p2y": `${particle.p2y}px`,
                  "--ig-p3x": `${particle.p3x}px`,
                  "--ig-p3y": `${particle.p3y}px`,
                  "--ig-p4x": `${particle.p4x}px`,
                  "--ig-p4y": `${particle.p4y}px`,
                  "--ig-rot": `${particle.rot}deg`,
                  "--ig-sc": particle.scale,
                  "--ig-delay": `${particle.delay}s`,
                  "--ig-dur": `${particle.duration}s`,
                  "--ig-bob-dur": `${particle.bobDuration}s`,
                  "--ig-ease": FLOAT_EASE,
                } as CSSProperties
              }
            >
              <span className="instagram-burst-particle__bob">
                {particle.kind === "image" && particle.imageName ? (
                  <span className="instagram-circle instagram-circle--burst">
                    <ManagedImage
                      name={particle.imageName}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                      previewAnchor={false}
                    />
                  </span>
                ) : (
                  <span className="instagram-float-emoji__inner">
                    {particle.glyph}
                  </span>
                )}
              </span>
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
              <span className="gallery-ig-link__handle">
                {indication}
              </span>
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
