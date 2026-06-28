"use client";

import { ManagedImage } from "@/components/ui/ManagedImage";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { HomeChapter } from "@/lib/homepage-sections";

type ScrollPinnedSectionProps = {
  chapters: readonly HomeChapter[];
  variant: "story" | "split" | "alternating";
  id?: string;
};

function StoryChapter({
  chapter,
  opacity,
}: {
  chapter: HomeChapter;
  opacity: MotionValue<number>;
}) {
  return (
    <motion.div className="hathor-scroll-story__chapter" style={{ opacity }}>
      <div className="hathor-scroll-story__images">
        <div className="hathor-scroll-story__image hathor-scroll-story__image--primary">
          <ManagedImage
            name={chapter.image.name}
            alt={chapter.image.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 80vw, 40vw"
          />
        </div>
        {chapter.imageSecondary ? (
          <div className="hathor-scroll-story__image hathor-scroll-story__image--secondary">
            <ManagedImage
              name={chapter.imageSecondary.name}
              alt={chapter.imageSecondary.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 60vw, 28vw"
            />
          </div>
        ) : null}
      </div>
      <div className="hathor-scroll-story__text">
        <h2 className="hathor-scroll-story__headline">{chapter.headline}</h2>
        <p className="hathor-scroll-story__body">{chapter.body}</p>
      </div>
    </motion.div>
  );
}

function SplitChapter({
  chapter,
  opacity,
  imageLeft = true,
}: {
  chapter: HomeChapter;
  opacity: MotionValue<number>;
  imageLeft?: boolean;
}) {
  return (
    <motion.div
      className={`hathor-split-scroll__chapter ${imageLeft ? "" : "hathor-split-scroll__chapter--reverse"}`}
      style={{ opacity }}
    >
      <div className="hathor-split-scroll__image">
        <ManagedImage
          name={chapter.image.name}
          alt={chapter.image.alt}
          fill
          className="object-cover"
          sizes="50vw"
        />
      </div>
      <div className="hathor-split-scroll__text">
        <h2 className="hathor-split-scroll__headline">{chapter.headline}</h2>
        <p className="hathor-split-scroll__body">{chapter.body}</p>
        {chapter.discoverHref && chapter.discoverLabel ? (
          <Link
            href={chapter.discoverHref}
            className="hathor-split-scroll__discover cursor-hover"
          >
            {chapter.discoverLabel}
          </Link>
        ) : null}
      </div>
    </motion.div>
  );
}

function ChapterOpacityLayer({
  index,
  total,
  scrollYProgress,
  chapter,
  variant,
}: {
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  chapter: HomeChapter;
  variant: ScrollPinnedSectionProps["variant"];
}) {
  const segment = 1 / total;
  const start = index * segment;
  const end = (index + 1) * segment;
  const pad = segment * 0.15;
  const opacity = useTransform(
    scrollYProgress,
    [start, start + pad, end - pad, end],
    [0, 1, 1, 0],
  );
  const imageLeft = variant === "alternating" ? index % 2 === 1 : true;

  if (variant === "story") {
    return <StoryChapter chapter={chapter} opacity={opacity} />;
  }

  return (
    <SplitChapter chapter={chapter} opacity={opacity} imageLeft={imageLeft} />
  );
}

export function ScrollPinnedSection({
  chapters,
  variant,
  id,
}: ScrollPinnedSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const sectionClass =
    variant === "story"
      ? "hathor-scroll-story"
      : variant === "alternating"
        ? "hathor-alt-split"
        : "hathor-split-scroll";

  return (
    <section
      id={id}
      ref={ref}
      className={sectionClass}
      style={{ height: `${chapters.length * 100}vh` }}
      aria-label="Scroll experience"
    >
      <div className={`${sectionClass}__sticky`}>
        {chapters.map((chapter, index) => (
          <ChapterOpacityLayer
            key={chapter.id}
            index={index}
            total={chapters.length}
            scrollYProgress={scrollYProgress}
            chapter={chapter}
            variant={variant}
          />
        ))}
      </div>
    </section>
  );
}
