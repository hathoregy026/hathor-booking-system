"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { ManagedImage } from "@/components/ui/ManagedImage";

const SILK_ROWS = ["TAKE YOUR", "VOYAGE", "TODAY"] as const;

/*
 * One linear scroll sequence:
 *  0% — 19%  gold invitation rises
 * 19% — 30%  full invitation holds briefly
 * 30% — 62%  photograph fog dissolves upward through the invitation
 * 62% — 78%  completed photograph holds (pause before copy)
 * 78% — 96%  on-image title rises slowly, button follows later
 */
const PHASE = {
  textEnd: 0.19,
  imageStart: 0.3,
  imageEnd: 0.62,
  copyStart: 0.78,
  copyEnd: 0.96,
} as const;

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function between(value: number, start: number, end: number) {
  return clamp((value - start) / (end - start));
}

function ease(value: number) {
  return value * value * (3 - 2 * value);
}

function revealCharacters(
  characters: HTMLElement[],
  progress: number,
  staggerSpan: number,
) {
  const finalIndex = Math.max(1, characters.length - 1);
  const movementSpan = 1 - staggerSpan;

  characters.forEach((character, index) => {
    const delay = (index / finalIndex) * staggerSpan;
    const localProgress = ease(clamp((progress - delay) / movementSpan));

    character.style.opacity = localProgress.toFixed(3);
    character.style.transform = `translate3d(0, ${
      (1 - localProgress) * 115
    }%, 0)`;
  });
}

type HomeCampaignSectionProps = {
  title: string;
  imageName: string;
  imageAlt: string;
  titleStyle?: CSSProperties;
  previewAnchor?: boolean;
};

export function HomeCampaignSection({
  title,
  imageName,
  imageAlt,
  titleStyle,
  previewAnchor = true,
}: HomeCampaignSectionProps) {
  const trackRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (
      !track ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const frame = track.querySelector<HTMLElement>("[data-hcta-frame]");
    const image = track.querySelector<HTMLElement>("[data-hcta-reveal]");
    const media = track.querySelector<HTMLElement>("[data-hcta-media]");
    const invitation = Array.from(
      track.querySelectorAll<HTMLElement>(".hcta-silk-char"),
    );
    const imageCopy = Array.from(
      track.querySelectorAll<HTMLElement>(".hcta-heading .hcta-char"),
    );
    const button = track.querySelector<HTMLElement>(".hcta-book");

    if (!frame || !image) return;

    let animationFrame = 0;

    const render = () => {
      animationFrame = 0;

      const travel = Math.max(1, track.offsetHeight - frame.offsetHeight);
      const progress = clamp(-track.getBoundingClientRect().top / travel);

      const textProgress = ease(between(progress, 0, PHASE.textEnd));
      revealCharacters(invitation, textProgress, 0.42);

      const imageProgress = ease(
        between(progress, PHASE.imageStart, PHASE.imageEnd),
      );
      image.style.setProperty(
        "--hcta-fog-edge",
        `${imageProgress * 140}%`,
      );
      image.style.opacity = clamp(imageProgress * 1.8).toFixed(3);

      const imageEffectProgress = ease(
        between(progress, PHASE.imageStart, PHASE.copyEnd),
      );
      if (media) {
        media.style.transform = `scale(${1.035 - imageEffectProgress * 0.035})`;
      }

      /* Soft ease-out so title/button feel lazy and elegant */
      const copyRaw = between(progress, PHASE.copyStart, PHASE.copyEnd);
      const copyProgress = 1 - Math.pow(1 - copyRaw, 2.4);
      revealCharacters(imageCopy, copyProgress, 0.52);

      if (button) {
        const buttonRaw = between(copyProgress, 0.68, 1);
        const buttonProgress = 1 - Math.pow(1 - buttonRaw, 2.2);
        button.style.opacity = buttonProgress.toFixed(3);
        button.style.transform = `translate3d(0, ${
          (1 - buttonProgress) * 22
        }px, 0)`;
      }
    };

    const requestRender = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(render);
    };

    render();
    animationFrame = window.requestAnimationFrame(render);
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);
    window.addEventListener("load", requestRender);
    window.addEventListener("pageshow", requestRender);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      window.removeEventListener("load", requestRender);
      window.removeEventListener("pageshow", requestRender);
    };
  }, []);

  return (
    <section
      ref={trackRef}
      className="hcta-track"
      id="campaign"
      aria-label="Campaign call to action"
      data-hcta-track
    >
      <div className="hcta-frame" data-hcta-frame>
        <div className="hcta-silk" data-hcta-silk>
          <div className="hcta-silk-copy" aria-hidden="true">
            {SILK_ROWS.map((row) => (
              <div className="hcta-silk-row" key={row}>
                {Array.from(row).map((character, index) => (
                  <span className="hcta-silk-letter" key={`${row}-${index}`}>
                    <span className="hcta-silk-char">
                      {character === " " ? "\u00A0" : character}
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="hcta-reveal" data-hcta-reveal>
          <div className="hcta-media" data-hcta-media>
            <ManagedImage
              name={imageName}
              alt={imageAlt}
              fill
              sizes="100vw"
              loading="eager"
              fetchPriority="low"
              className="hcta-bg object-cover"
              previewAnchor={previewAnchor}
            />
          </div>
          <div className="hcta-veil" aria-hidden="true" />
        </div>

        <div className="hcta-copy">
          <h2
            className="hcta-heading typo-on-images-title"
            style={titleStyle}
            aria-label={title}
            data-typo-role="on_images_title"
          >
            {Array.from(title).map((character, index) => (
              <span className="hcta-letter" key={`${character}-${index}`}>
                <span className="hcta-char">
                  {character === " " ? "\u00A0" : character}
                </span>
              </span>
            ))}
          </h2>
          <BookNowTrigger className="btn hcta-book">Book Now</BookNowTrigger>
        </div>
      </div>
    </section>
  );
}
