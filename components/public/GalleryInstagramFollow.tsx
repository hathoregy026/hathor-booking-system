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
import { EX_GALLERY } from "@/lib/ex-page-content";
import type { SiteImageName } from "@/lib/site-image-slots";

type GalleryInstagramFollowProps = {
  title: string;
  handleStyle?: CSSProperties;
};

type BurstParticle =
  | {
      id: string;
      kind: "image";
      imageName: SiteImageName;
      alt: string;
      delay: number;
      duration: number;
      mx: number;
      my: number;
      ex: number;
      ey: number;
      rot: number;
      scale: number;
    }
  | {
      id: string;
      kind: "emoji";
      glyph: string;
      delay: number;
      duration: number;
      mx: number;
      my: number;
      ex: number;
      ey: number;
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

/** Soft ease-in-out — no snap, soap-bubble drift */
const BURST_EASE = "cubic-bezier(0.37, 0.01, 0.2, 1)";

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function buildBurst(width: number, height: number, key: number): BurstParticle[] {
  const reachX = Math.max(width * 0.48, 240);
  const reachY = Math.max(height * 0.42, 180);
  const particles: BurstParticle[] = [];

  EX_GALLERY.followPreviews.forEach((preview, index) => {
    // Prefer a gentle upward float with sideways wander
    const angle = rand(-Math.PI * 0.95, -Math.PI * 0.05) + rand(-0.35, 0.35);
    const dist = rand(0.55, 1.05);
    const ex = Math.cos(angle) * reachX * dist + rand(-36, 36);
    const ey = Math.sin(angle) * reachY * dist * rand(0.85, 1.15) - rand(24, 70);
    particles.push({
      id: `img-${key}-${preview.imageName}-${index}`,
      kind: "image",
      imageName: preview.imageName,
      alt: preview.alt,
      delay: rand(0.12, 0.55) + index * 0.18,
      duration: rand(5.8, 7.6),
      mx: ex * rand(0.22, 0.42) + rand(-48, 48),
      my: ey * rand(0.18, 0.38) + rand(-28, 20),
      ex,
      ey,
      rot: rand(-16, 16),
      scale: rand(0.94, 1.12),
    });
  });

  EMOJI_GLYPHS.forEach((item, index) => {
    const angle = rand(-Math.PI * 0.98, -Math.PI * 0.02) + rand(-0.4, 0.4);
    const dist = rand(0.5, 1.12);
    const ex = Math.cos(angle) * reachX * dist + rand(-40, 40);
    const ey = Math.sin(angle) * reachY * dist * rand(0.8, 1.2) - rand(20, 80);
    particles.push({
      id: `emo-${key}-${item.label}-${index}`,
      kind: "emoji",
      glyph: item.glyph,
      delay: rand(0.2, 0.75) + index * 0.14,
      duration: rand(5.4, 7.2),
      mx: ex * rand(0.2, 0.45) + rand(-56, 56),
      my: ey * rand(0.15, 0.4) + rand(-32, 24),
      ex,
      ey,
      rot: rand(-22, 22),
      scale: rand(0.9, 1.18),
    });
  });

  return particles;
}

export function GalleryInstagramFollow({
  title,
  handleStyle,
}: GalleryInstagramFollowProps) {
  const copyRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const cooldownRef = useRef(false);
  const [phase, setPhase] = useState<"idle" | "bursting" | "done">("idle");
  const [particles, setParticles] = useState<BurstParticle[]>([]);
  const reducedRef = useRef(false);

  const playBurst = useCallback(() => {
    if (reducedRef.current) return;
    if (cooldownRef.current) return;

    const section = fieldRef.current?.closest(".gallery-section") as HTMLElement | null;
    const width = section?.clientWidth || fieldRef.current?.clientWidth || 900;
    const height = section?.clientHeight || fieldRef.current?.clientHeight || 520;

    cooldownRef.current = true;
    setParticles(buildBurst(width, height, Date.now()));
    setPhase("bursting");
  }, []);

  const finishBurst = useCallback(() => {
    setPhase("done");
    setParticles([]);
    window.setTimeout(() => {
      cooldownRef.current = false;
    }, 1100);
  }, []);

  useEffect(() => {
    reducedRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const section = fieldRef.current?.closest(".gallery-section") as HTMLElement | null;
    if (!section) return;

    // Reveal copy as soon as the section is near view.
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
                  "--ig-mx": `${particle.mx}px`,
                  "--ig-my": `${particle.my}px`,
                  "--ig-hx": `${(particle.mx + particle.ex) * 0.5}px`,
                  "--ig-hy": `${(particle.my + particle.ey) * 0.5}px`,
                  "--ig-ex": `${particle.ex}px`,
                  "--ig-ey": `${particle.ey}px`,
                  "--ig-rot": `${particle.rot}deg`,
                  "--ig-sc": particle.scale,
                  "--ig-delay": `${particle.delay}s`,
                  "--ig-dur": `${particle.duration}s`,
                  "--ig-ease": BURST_EASE,
                } as CSSProperties
              }
            >
              {particle.kind === "image" ? (
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
                <span className="instagram-float-emoji__inner">{particle.glyph}</span>
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
              {EX_GALLERY.followEyebrow}
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
                {EX_GALLERY.indication}
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
