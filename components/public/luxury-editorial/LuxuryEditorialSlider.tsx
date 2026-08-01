"use client";

import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { ManagedImage } from "@/components/ui/ManagedImage";

export type LuxuryEditorialSlide = {
  id: string;
  label: string;
  title: string;
  body: string;
  imageSlot: string;
  imageAlt: string;
  meta?: string;
};

type Props = {
  slides: LuxuryEditorialSlide[];
  eyebrow?: string;
  enquiryHref?: string;
};

export function LuxuryEditorialSlider({
  slides,
  eyebrow = "PRIVATE SPACES",
  enquiryHref = "#charter-request",
}: Props) {
  const [active, setActive] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const hoverTimer = useRef<number | null>(null);

  const safeSlides = slides.filter(
    (slide) => slide?.id && slide?.title && slide?.imageSlot,
  );
  const count = safeSlides.length;
  const current = safeSlides[active];

  useEffect(() => {
    if (!stageRef.current || !current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-slider-media]",
        { autoAlpha: 0, scale: 1.025, y: 18 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.9, ease: "power3.out" },
      );
      gsap.fromTo(
        "[data-slider-copy] > *",
        { autoAlpha: 0, yPercent: 35 },
        {
          autoAlpha: 1,
          yPercent: 0,
          duration: 0.75,
          stagger: 0.055,
          ease: "power3.out",
        },
      );
    }, stageRef);
    return () => ctx.revert();
  }, [active, current]);

  useEffect(() => {
    return () => {
      if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    };
  }, []);

  if (!current || count === 0) return null;

  const go = (index: number) => {
    setActive((index + count) % count);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(active + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(active - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      go(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      go(count - 1);
    }
  };

  return (
    <section
      className="lux-slider"
      aria-labelledby={titleId}
      onKeyDown={onKeyDown}
      ref={stageRef}
    >
      <div className="lux-slider__tabs" role="tablist" aria-label={eyebrow}>
        {safeSlides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-controls={`${titleId}-panel`}
            className="lux-slider__tab"
            data-active={index === active ? "true" : "false"}
            onClick={() => go(index)}
            onMouseEnter={() => {
              if (
                window.matchMedia("(hover: hover) and (pointer: fine)").matches
              ) {
                if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
                hoverTimer.current = window.setTimeout(() => go(index), 140);
              }
            }}
          >
            <span>{slide.label}</span>
          </button>
        ))}
      </div>

      <div className="lux-slider__body" id={`${titleId}-panel`} role="tabpanel">
        <div className="lux-slider__copy" data-slider-copy="">
          <p className="lux-kicker">{eyebrow}</p>
          <h2 id={titleId}>{current.title}</h2>
          <p>{current.body}</p>
          {current.meta ? (
            <p className="lux-slider__meta">{current.meta}</p>
          ) : null}
          <a className="lux-textLink" href={enquiryHref}>
            <span>Enquire privately</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <figure className="lux-slider__media" data-slider-media="">
          <ManagedImage
            key={current.imageSlot}
            name={current.imageSlot}
            alt={current.imageAlt}
            fill
            priority={active === 0}
            sizes="(max-width: 900px) 100vw, 56vw"
            className="object-cover"
            previewAnchor={false}
          />
        </figure>
      </div>

      <div className="lux-slider__footer">
        <span aria-live="polite">
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(count).padStart(2, "0")}
        </span>
        <div className="lux-slider__progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${(active + 1) / count})` }} />
        </div>
        <div className="lux-slider__arrows">
          <button
            type="button"
            onClick={() => go(active - 1)}
            aria-label="Previous slide"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            aria-label="Next slide"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
