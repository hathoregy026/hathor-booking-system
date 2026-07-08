"use client";

import { useRef } from "react";
import Link from "next/link";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useHighlightsGalleryMotion } from "@/hooks/useHighlightsGalleryMotion";
import { HATHOR_LOGO_DAY_SRC, HATHOR_BRAND_NAME } from "@/lib/branding";
import { HIGHLIGHTS_PAGE } from "@/lib/page-content";
import styles from "./HighlightsGallery.module.css";

const LANDMARK_IMAGES = [
  "landmark-obelisk",
  "landmark-hatshepsut",
  "landmark-valley-kings",
] as const;

/** Warm cream micro-blur for lazy-loaded gallery frames */
const HG_BLUR_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

function AtlasButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={styles.atlasLink} data-hg-reveal>
      <svg viewBox="0 0 100 100" className={styles.atlasSvg} aria-hidden>
        <defs>
          <path
            id="hg-atlas-ring"
            d="M 50,50 m -34,0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0"
          />
        </defs>
        <text className={styles.atlasText}>
          <textPath href="#hg-atlas-ring" startOffset="22%">
            {label}
          </textPath>
        </text>
      </svg>
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {label}
      </span>
    </Link>
  );
}

export function HighlightsPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  useHighlightsGalleryMotion(rootRef);

  return (
    <div ref={rootRef} data-highlights-gallery className={styles.gallery}>
      <div className={styles.halo} aria-hidden />
      <div className={styles.vignette} aria-hidden />
      <div data-hg-cursor className={styles.cursor} aria-hidden />

      <img
        src={HATHOR_LOGO_DAY_SRC}
        alt=""
        className={styles.logoWatermark}
        aria-hidden
      />

      <header className={styles.hero}>
        <h1 className={styles.marquee} data-hg-reveal>
          The Collection
        </h1>
        <p className={styles.tagline} data-hg-reveal>
          Where craft meets legacy.
        </p>
      </header>

      <section className={styles.intro} aria-label="Introduction">
        {HIGHLIGHTS_PAGE.intro.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className={styles.introText} data-hg-reveal>
            {paragraph}
          </p>
        ))}
      </section>

      <div className={styles.divider} aria-hidden>
        <div className={styles.dividerBar} />
      </div>

      <section className={styles.waterfall} aria-label="Nile landmarks">
        {HIGHLIGHTS_PAGE.landmarks.map((landmark, index) => (
          <article
            key={landmark.title}
            data-hg-plinth
            data-hg-reveal
            className={`${styles.plinth} ${
              index % 2 === 0 ? styles.plinthLeft : styles.plinthRight
            }`}
          >
            <div data-hg-parallax className={styles.imageFrame}>
              <div data-hg-parallax-img className={styles.parallaxInner}>
                <ManagedImage
                  name={LANDMARK_IMAGES[index]}
                  alt={landmark.title}
                  fill
                  className={styles.galleryImg}
                  sizes="(max-width: 767px) 94vw, 72vw"
                  loading={index === 0 ? "eager" : "lazy"}
                  placeholder="blur"
                  blurDataURL={HG_BLUR_PLACEHOLDER}
                />
              </div>
              <div className={styles.caption}>
                <p className={styles.captionIndex}>
                  {String(index + 1).padStart(2, "0")} — Landmark
                </p>
                <h2 className={styles.captionTitle}>{landmark.title}</h2>
                <p className={styles.captionBody}>{landmark.body}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <footer className={styles.closing}>
        <h2 className={styles.closingTitle} data-hg-reveal>
          Whispered Opulence
        </h2>
        <p className={styles.closingCopy} data-hg-reveal>
          Sail the Nile aboard {HATHOR_BRAND_NAME}. Silence, space, and the
          river — composed as one.
        </p>
        <AtlasButton href="/cruises" label="Explore" />
      </footer>
    </div>
  );
}
