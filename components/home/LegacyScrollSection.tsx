"use client";

import type { RefObject, SyntheticEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { LEGACY_SCROLL_IMAGES } from "@/lib/hathor-media";

const STEP_COUNT = LEGACY_SCROLL_IMAGES.length;
const STEPS = LEGACY_SCROLL_IMAGES;

const CARD_OFFSETS = [
  { rotate: -3, x: 0, y: 0, scale: 1 },
  { rotate: 2, x: 28, y: -22, scale: 0.99 },
  { rotate: -1.5, x: -18, y: -44, scale: 0.98 },
  { rotate: 2.5, x: 32, y: -66, scale: 0.97 },
] as const;

const SPRING = { stiffness: 70, damping: 26, mass: 0.8, restDelta: 0.0005 };
const ENTER_BLEND = 0.22;

const PLACEHOLDER = "/media/hathor/room-luxury.webp";

type PinState = "before" | "pinned" | "after";

/** Reliable scroll progress when Framer useScroll + sticky fails (e.g. overflow-x on ancestors). */
function useSectionScroll(
  ref: RefObject<HTMLElement | null>,
): { progress: MotionValue<number>; pinState: PinState } {
  const progress = useMotionValue(0);
  const [pinState, setPinState] = useState<PinState>("before");

  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;

      if (scrollable <= 0) {
        progress.set(0);
        setPinState("before");
        return;
      }

      const nextProgress = Math.min(1, Math.max(0, -rect.top / scrollable));
      progress.set(nextProgress);

      if (rect.top > 0) {
        setPinState("before");
      } else if (rect.bottom < window.innerHeight) {
        setPinState("after");
      } else {
        setPinState("pinned");
      }
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref, progress]);

  return { progress, pinState };
}

function handleImageError(event: SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  if (img.src !== PLACEHOLDER) img.src = PLACEHOLDER;
}

function StackImage({
  index,
  progress,
  src,
  alt,
}: {
  index: number;
  progress: MotionValue<number>;
  src: string;
  alt: string;
}) {
  const start = index / STEP_COUNT;
  const enterEnd = start + ENTER_BLEND;
  const offset = CARD_OFFSETS[index];

  const opacity = useTransform(
    progress,
    index === 0 ? [0, 0.02] : [start, enterEnd],
    index === 0 ? [1, 1] : [0, 1],
  );
  const y = useTransform(
    progress,
    index === 0 ? [0, 1] : [start, enterEnd],
    index === 0 ? [offset.y, offset.y] : [100, offset.y],
  );
  const x = useTransform(
    progress,
    index === 0 ? [0, 1] : [start, enterEnd],
    index === 0 ? [offset.x, offset.x] : [0, offset.x],
  );

  return (
    <motion.div
      className="hathor-legacy-stack__card"
      style={{
        opacity,
        y,
        x,
        scale: offset.scale,
        rotate: offset.rotate,
        zIndex: index + 1,
      }}
      transition={{ type: "spring", ...SPRING }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="hathor-legacy-stack__card-img"
        onError={handleImageError}
        loading={index === 0 ? "eager" : "lazy"}
        decoding="async"
      />
    </motion.div>
  );
}

function ScrollTextPanel({
  index,
  progress,
  headline,
  body,
}: {
  index: number;
  progress: MotionValue<number>;
  headline: string;
  body: string;
}) {
  const start = index / STEP_COUNT;
  const end = (index + 1) / STEP_COUNT;
  const blend = 0.1;

  const opacity = useTransform(
    progress,
    index === 0
      ? [0, end - blend, end]
      : index === STEP_COUNT - 1
        ? [start, start + blend, 1]
        : [start, start + blend, end - blend, end],
    index === 0
      ? [1, 1, 0]
      : index === STEP_COUNT - 1
        ? [0, 1, 1]
        : [0, 1, 1, 0],
  );

  const y = useTransform(
    progress,
    index === 0
      ? [0, end - blend, end]
      : index === STEP_COUNT - 1
        ? [start, start + blend, 1]
        : [start, start + blend, end - blend, end],
    index === 0
      ? [0, 0, -12]
      : index === STEP_COUNT - 1
        ? [12, 0, 0]
        : [12, 0, 0, -12],
  );

  return (
    <motion.div
      className="hathor-legacy-stack__text-panel"
      style={{ opacity, y, zIndex: index + 1 }}
      transition={{ type: "spring", ...SPRING }}
    >
      <h2 className="hathor-legacy-stack__headline">{headline}</h2>
      <p className="hathor-legacy-stack__eyebrow">Continuing a Legacy</p>
      <p className="hathor-legacy-stack__body">{body}</p>
    </motion.div>
  );
}

export function LegacyScrollSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { progress, pinState } = useSectionScroll(containerRef);
  const smoothProgress = useSpring(progress, SPRING);

  return (
    <section
      ref={containerRef}
      className="hathor-legacy-stack"
      style={{ height: `${STEP_COUNT * 100}vh` }}
      aria-label="Continuing a Legacy"
    >
      <div
        className={`hathor-legacy-stack__pin hathor-legacy-stack__pin--${pinState}`}
      >
        <div className="hathor-legacy-stack__grid">
          <div className="hathor-legacy-stack__images">
            {STEPS.map((step, index) => (
              <StackImage
                key={step.src}
                index={index}
                progress={smoothProgress}
                src={step.src}
                alt={step.alt}
              />
            ))}
          </div>

          <div className="hathor-legacy-stack__text-col">
            <div className="hathor-legacy-stack__text-stage">
              {STEPS.map((step, index) => (
                <ScrollTextPanel
                  key={step.headline}
                  index={index}
                  progress={smoothProgress}
                  headline={step.headline}
                  body={step.body}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
