"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

const HEADLINE = "Continuing a Legacy";
const INTRO =
  "Indulge yourself in timeless luxury on the Hathor Dahabiya Nile Cruise. From panoramic Nile view suites to gourmet fine dining and tranquil spa moments, every detail is crafted for relaxation and exclusivity.";

const IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1000",
    alt: "Luxury cabin aboard Hathor Dahabiya",
    label: "Luxury Cabin",
    body: "Handsome cabins overlook iconic Nile landmarks — refined comfort and thoughtful design for every sailing.",
  },
  {
    src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1000",
    alt: "Luxury suite aboard Hathor Dahabiya",
    label: "Luxury Suite",
    body: "Expansive suites blend modern elegance with timeless Egyptian charm aboard our luxury Dahabiya.",
  },
  {
    src: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=1000",
    alt: "Royal suite aboard Hathor Dahabiya",
    label: "Royal Suite",
    body: "The pinnacle of aboard accommodation — generous space, privacy, and uninterrupted Nile vistas.",
  },
  {
    src: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1000",
    alt: "Luxury cabin interior aboard Hathor Dahabiya",
    label: "Suite Interiors",
    body: "Each room is tailored for the Nile journey — bespoke details, panoramic views, and quiet luxury.",
  },
] as const;

const SLIDE = 200;

function useLegacyTransforms(scrollYProgress: MotionValue<number>) {
  const image1Y = useTransform(scrollYProgress, [0, 0.2, 0.25], [0, 0, -SLIDE]);
  const image1Opacity = useTransform(scrollYProgress, [0, 0.2, 0.25], [1, 1, 0]);

  const image2Y = useTransform(scrollYProgress, [0.2, 0.25, 0.45, 0.5], [SLIDE, 0, 0, -SLIDE]);
  const image2Opacity = useTransform(scrollYProgress, [0.2, 0.25, 0.45, 0.5], [0, 1, 1, 0]);

  const image3Y = useTransform(scrollYProgress, [0.45, 0.5, 0.7, 0.75], [SLIDE, 0, 0, -SLIDE]);
  const image3Opacity = useTransform(scrollYProgress, [0.45, 0.5, 0.7, 0.75], [0, 1, 1, 0]);

  const image4Y = useTransform(scrollYProgress, [0.7, 0.75, 1], [SLIDE, 0, 0]);
  const image4Opacity = useTransform(scrollYProgress, [0.7, 0.75, 1], [0, 1, 1]);

  const text1Opacity = useTransform(scrollYProgress, [0, 0.2, 0.25], [1, 1, 0]);
  const text2Opacity = useTransform(scrollYProgress, [0.2, 0.25, 0.45, 0.5], [0, 1, 1, 0]);
  const text3Opacity = useTransform(scrollYProgress, [0.45, 0.5, 0.7, 0.75], [0, 1, 1, 0]);
  const text4Opacity = useTransform(scrollYProgress, [0.7, 0.75, 1], [0, 1, 1]);

  return {
    images: [
      { y: image1Y, opacity: image1Opacity },
      { y: image2Y, opacity: image2Opacity },
      { y: image3Y, opacity: image3Opacity },
      { y: image4Y, opacity: image4Opacity },
    ],
    texts: [text1Opacity, text2Opacity, text3Opacity, text4Opacity],
  };
}

export function LegacyScrollSection() {
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const { images, texts } = useLegacyTransforms(scrollYProgress);

  return (
    <section
      ref={containerRef}
      className="hathor-legacy-scroll"
      style={{ height: "400vh" }}
      aria-label="Continuing a Legacy"
    >
      <div className="hathor-legacy-scroll__sticky">
        <div className="hathor-legacy-scroll__grid">
          <div className="hathor-legacy-scroll__images">
            {IMAGES.map((image, index) => (
              <motion.div
                key={image.src}
                className="hathor-legacy-scroll__image-layer"
                style={{
                  y: images[index].y,
                  opacity: images[index].opacity,
                  zIndex: index + 1,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={image.alt}
                  className="hathor-legacy-scroll__img"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </motion.div>
            ))}
          </div>

          <div className="hathor-legacy-scroll__text-col">
            <div className="hathor-legacy-scroll__text-inner">
              <h2 className="hathor-legacy-scroll__headline">{HEADLINE}</h2>
              <p className="hathor-legacy-scroll__intro">{INTRO}</p>
              <div className="hathor-legacy-scroll__text-stack">
                {IMAGES.map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="hathor-legacy-scroll__text-block"
                    style={{
                      opacity: texts[index],
                      zIndex: index + 1,
                    }}
                  >
                    <h3 className="hathor-legacy-scroll__step-label">
                      {item.label}
                    </h3>
                    <p className="hathor-legacy-scroll__step-body">{item.body}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
