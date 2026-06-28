"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

const STEP_COUNT = 4;
const SEGMENT = 1 / STEP_COUNT;
const SLIDE_PX = 120;

const HEADLINE = "Continuing a Legacy";
const INTRO =
  "Indulge yourself in timeless luxury on the Hathor Dahabiya Nile Cruise. From panoramic Nile view suites to gourmet fine dining and tranquil spa moments, every detail is crafted for relaxation and exclusivity.";

const LEGACY_STEPS = [
  {
    id: "cabin",
    label: "Luxury Cabin",
    body: "Handsome cabins overlook iconic Nile landmarks — refined comfort and thoughtful design for every sailing.",
    src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1000",
    alt: "Luxury cabin aboard Hathor Dahabiya",
  },
  {
    id: "suite",
    label: "Luxury Suite",
    body: "Expansive suites blend modern elegance with timeless Egyptian charm aboard our luxury Dahabiya.",
    src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1000",
    alt: "Luxury suite aboard Hathor Dahabiya",
  },
  {
    id: "royal",
    label: "Royal Suite",
    body: "The pinnacle of aboard accommodation — generous space, privacy, and uninterrupted Nile vistas.",
    src: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=1000",
    alt: "Royal suite aboard Hathor Dahabiya",
  },
  {
    id: "interior",
    label: "Suite Interiors",
    body: "Each room is tailored for the Nile journey — bespoke details, panoramic views, and quiet luxury.",
    src: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1000",
    alt: "Luxury cabin interior aboard Hathor Dahabiya",
  },
] as const;

function segmentKeyframes(index: number) {
  const start = index * SEGMENT;
  const fadeInEnd = start + SEGMENT * 0.18;
  const fadeOutStart = (index + 1) * SEGMENT - SEGMENT * 0.18;
  const end = (index + 1) * SEGMENT;

  if (index === 0) {
    return {
      opacity: { input: [0, fadeOutStart, end], output: [1, 1, 0] },
      y: { input: [0, fadeOutStart, end], output: [0, 0, -SLIDE_PX] },
    };
  }

  if (index === STEP_COUNT - 1) {
    return {
      opacity: { input: [start, fadeInEnd, 1], output: [0, 1, 1] },
      y: { input: [start, fadeInEnd, 1], output: [SLIDE_PX, 0, 0] },
    };
  }

  return {
    opacity: {
      input: [start, fadeInEnd, fadeOutStart, end],
      output: [0, 1, 1, 0],
    },
    y: {
      input: [start, fadeInEnd, fadeOutStart, end],
      output: [SLIDE_PX, 0, 0, -SLIDE_PX],
    },
  };
}

function CurtainImage({
  index,
  scrollYProgress,
  src,
  alt,
}: {
  index: number;
  scrollYProgress: MotionValue<number>;
  src: string;
  alt: string;
}) {
  const keys = segmentKeyframes(index);
  const opacity = useTransform(
    scrollYProgress,
    keys.opacity.input,
    keys.opacity.output,
  );
  const y = useTransform(scrollYProgress, keys.y.input, keys.y.output);

  return (
    <motion.div
      className="hathor-legacy-scroll__image-layer"
      style={{ opacity, y, zIndex: index + 1 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="hathor-legacy-scroll__img"
        loading={index === 0 ? "eager" : "lazy"}
        decoding="async"
      />
    </motion.div>
  );
}

function CrossfadeTextBlock({
  index,
  scrollYProgress,
  label,
  body,
}: {
  index: number;
  scrollYProgress: MotionValue<number>;
  label: string;
  body: string;
}) {
  const keys = segmentKeyframes(index);
  const opacity = useTransform(
    scrollYProgress,
    keys.opacity.input,
    keys.opacity.output,
  );
  const y = useTransform(
    scrollYProgress,
    keys.opacity.input,
    keys.opacity.output.map((value) => (1 - value) * 20),
  );

  return (
    <motion.div
      className="hathor-legacy-scroll__text-block"
      style={{ opacity, y, zIndex: index + 1 }}
    >
      <h3 className="hathor-legacy-scroll__step-label">{label}</h3>
      <p className="hathor-legacy-scroll__step-body">{body}</p>
    </motion.div>
  );
}

export function LegacyScrollSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={ref}
      className="hathor-legacy-scroll"
      style={{ height: `${STEP_COUNT * 100}vh` }}
      aria-label="Continuing a Legacy"
    >
      <div className="hathor-legacy-scroll__sticky">
        <div className="hathor-legacy-scroll__grid">
          <div className="hathor-legacy-scroll__images">
            {LEGACY_STEPS.map((step, index) => (
              <CurtainImage
                key={step.id}
                index={index}
                scrollYProgress={scrollYProgress}
                src={step.src}
                alt={step.alt}
              />
            ))}
          </div>

          <div className="hathor-legacy-scroll__text-col">
            <div className="hathor-legacy-scroll__text-sticky">
              <h2 className="hathor-legacy-scroll__headline">{HEADLINE}</h2>
              <p className="hathor-legacy-scroll__intro">{INTRO}</p>
              <div className="hathor-legacy-scroll__text-stack">
                {LEGACY_STEPS.map((step, index) => (
                  <CrossfadeTextBlock
                    key={step.id}
                    index={index}
                    scrollYProgress={scrollYProgress}
                    label={step.label}
                    body={step.body}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
