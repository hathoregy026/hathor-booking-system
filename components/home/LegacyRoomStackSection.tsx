"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { HOMEPAGE_LEGACY_ROOM_STACK } from "@/lib/homepage-sections";

const STEPS = HOMEPAGE_LEGACY_ROOM_STACK.steps;
const STEP_COUNT = STEPS.length;

const IMAGE_OFFSETS = [
  { top: "0%", left: "8%", width: "58%", rotate: 3, zIndex: 1 },
  { bottom: "0%", right: "5%", width: "42%", rotate: -4, zIndex: 2 },
  { top: "18%", left: "22%", width: "48%", rotate: 2, zIndex: 3 },
  { bottom: "12%", right: "14%", width: "44%", rotate: -3, zIndex: 4 },
] as const;

function StepOpacity({
  index,
  scrollYProgress,
  children,
}: {
  index: number;
  scrollYProgress: MotionValue<number>;
  children: React.ReactNode;
}) {
  const segment = 1 / STEP_COUNT;
  const start = index * segment;
  const revealEnd = start + segment * 0.35;
  const opacity = useTransform(scrollYProgress, [start, revealEnd], [0, 1]);
  const scale = useTransform(scrollYProgress, [start, revealEnd], [0.94, 1]);
  const y = useTransform(scrollYProgress, [start, revealEnd], [24, 0]);

  return (
    <motion.div style={{ opacity, scale, y }} className="hathor-legacy-stack__reveal">
      {children}
    </motion.div>
  );
}

function StackedImage({
  index,
  scrollYProgress,
}: {
  index: number;
  scrollYProgress: MotionValue<number>;
}) {
  const step = STEPS[index];
  const offset = IMAGE_OFFSETS[index];
  const segment = 1 / STEP_COUNT;
  const start = index * segment;
  const revealEnd = start + segment * 0.35;
  const opacity = useTransform(scrollYProgress, [start, revealEnd], [0, 1]);
  const scale = useTransform(scrollYProgress, [start, revealEnd], [0.9, 1]);

  return (
    <div
      className="hathor-legacy-stack__image"
      style={{
        zIndex: offset.zIndex,
        top: "top" in offset ? offset.top : undefined,
        left: "left" in offset ? offset.left : undefined,
        bottom: "bottom" in offset ? offset.bottom : undefined,
        right: "right" in offset ? offset.right : undefined,
        width: offset.width,
        transform: `rotate(${offset.rotate}deg)`,
      }}
    >
      <motion.div className="hathor-legacy-stack__image-inner" style={{ opacity, scale }}>
        <ManagedImage
          name={step.image.name}
          alt={step.image.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 70vw, 36vw"
        />
      </motion.div>
    </div>
  );
}

export function LegacyRoomStackSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={ref}
      className="hathor-legacy-stack"
      style={{ height: `${STEP_COUNT * 100}vh` }}
      aria-label="Continuing a Legacy — room accommodations"
    >
      <div className="hathor-legacy-stack__sticky">
        <div className="hathor-legacy-stack__layout">
          <div className="hathor-legacy-stack__images" aria-hidden>
            {STEPS.map((step, index) => (
              <StackedImage
                key={step.id}
                index={index}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>

          <div className="hathor-legacy-stack__text">
            <h2 className="hathor-legacy-stack__headline">
              {HOMEPAGE_LEGACY_ROOM_STACK.headline}
            </h2>
            <p className="hathor-legacy-stack__intro">
              {HOMEPAGE_LEGACY_ROOM_STACK.intro}
            </p>
            <div className="hathor-legacy-stack__steps">
              {STEPS.map((step, index) => (
                <StepOpacity key={step.id} index={index} scrollYProgress={scrollYProgress}>
                  <h3 className="hathor-legacy-stack__step-label">{step.label}</h3>
                  <p className="hathor-legacy-stack__step-body">{step.body}</p>
                </StepOpacity>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
