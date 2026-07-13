"use client";

import { PublicSiteHero } from "@/components/pages/PublicSiteHero";
import { splitHeroTitle } from "@/lib/split-hero-title";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useHighlightsEditorialMotion } from "@/hooks/useHighlightsEditorialMotion";
import { HIGHLIGHTS_PAGE } from "@/lib/page-content";
import styles from "./HighlightsEditorial.module.css";

const LANDMARK_IMAGES = [
  "landmark-obelisk",
  "landmark-hatshepsut",
  "landmark-valley-kings",
] as const;

function KineticTitle({
  lines,
  className,
}: {
  lines: readonly string[];
  className?: string;
}) {
  return (
    <h2 data-kinetic-title className={className ?? styles.kineticTitle}>
      {lines.map((line) => (
        <span key={line} className={styles.lineMask}>
          <span data-kinetic-line className={styles.lineInner}>
            {line}
          </span>
        </span>
      ))}
    </h2>
  );
}

function MagneticLink({
  href,
  children,
}: {
  href: string;
  children: string;
}) {
  return (
    <a href={href} data-magnetic-link className={styles.magneticLink}>
      <span data-highlights-chapter-reveal>{children}</span>
      <ArrowRight
        data-magnetic-arrow
        className={styles.magneticArrow}
        size={16}
        aria-hidden
      />
    </a>
  );
}

function splitTitleLines(title: string): [string, string] | [string] {
  const words = title.split(" ");
  if (words.length <= 1) return [title];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

type LandmarkChapterProps = {
  index: number;
  title: string;
  body: string;
  imageName: (typeof LANDMARK_IMAGES)[number];
};

function LandmarkChapter({ index, title, body, imageName }: LandmarkChapterProps) {
  const even = index % 2 === 0;
  const titleLines = splitTitleLines(title);

  const textCol = (
    <div className={styles.chapterText}>
      <p className={styles.chapterIndex} data-highlights-chapter-reveal>
        {String(index + 1).padStart(2, "0")} — Nile Landmark
      </p>
      <KineticTitle lines={titleLines} />
      <div data-highlights-gold-rule className={styles.goldRule} />
      <p className={styles.bodyText} data-highlights-chapter-reveal>
        {body}
      </p>
    </div>
  );

  const imageCol = (
    <div data-parallax-wrap className={styles.parallaxWrap}>
      <div data-parallax-img className={styles.parallaxInner}>
        <ManagedImage
          name={imageName}
          alt={title}
          fill
          className={styles.parallaxImg}
          sizes="(max-width: 767px) 100vw, 50vw"
          loading={index === 0 ? "eager" : "lazy"}
        />
      </div>
    </div>
  );

  return (
    <section data-highlights-chapter className={styles.section}>
      <div className={styles.grid}>
        {even ? (
          <>
            <div className={styles.landmarkImageEven}>{imageCol}</div>
            <div className={styles.landmarkTextEven}>{textCol}</div>
          </>
        ) : (
          <>
            <div className={styles.landmarkTextOdd}>{textCol}</div>
            <div className={styles.landmarkImageOdd}>{imageCol}</div>
          </>
        )}
      </div>
    </section>
  );
}

export function HighlightsPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [lineRight, lineLeft] = splitHeroTitle(HIGHLIGHTS_PAGE.hero.title);
  useHighlightsEditorialMotion(rootRef);

  return (
    <div
      ref={rootRef}
      data-highlights-editorial
      className={styles.editorial}
      style={{
        backgroundColor: "#ECE8DF",
        color: "#1A1A1A",
        minHeight: "100vh",
      }}
    >
      <PublicSiteHero
        lineRight={lineRight}
        lineLeft={lineLeft}
        subtitle={HIGHLIGHTS_PAGE.hero.subtitle}
      />

      <section data-highlights-intro className={styles.section}>
        <div className={styles.grid}>
          <div className={styles.introBlock}>
            <p className={styles.eyebrow} data-highlights-intro-reveal>
              The Hathor Experience
            </p>
            <h1 className={styles.displayTitle} data-highlights-intro-reveal>
              Dahabiya Cruise
              <br />
              <span className={styles.goldItalic}>Highlights</span>
            </h1>
            <div className={styles.introBody}>
              {HIGHLIGHTS_PAGE.intro.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className={styles.bodyText}
                  data-highlights-intro-reveal
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {HIGHLIGHTS_PAGE.landmarks.map((landmark, index) => (
        <LandmarkChapter
          key={landmark.title}
          index={index}
          title={landmark.title}
          body={landmark.body}
          imageName={LANDMARK_IMAGES[index]}
        />
      ))}

      <section className={styles.ctaSection} aria-label="Explore cruises">
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle} data-highlights-intro-reveal>
            Explore the Nile
          </h2>
          <p className={styles.ctaBody} data-highlights-intro-reveal>
            Every bend of the river reveals another chapter of Egypt&apos;s
            timeless story. Sail in privacy, comfort, and true elegance aboard
            Hathor Dahabiya.
          </p>
          <MagneticLink href="/cruises">Discover cruises</MagneticLink>
        </div>
      </section>
    </div>
  );
}
