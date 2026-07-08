"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useHighlightsEditorialMotion } from "@/hooks/useHighlightsEditorialMotion";
import { HIGHLIGHTS_PAGE } from "@/lib/page-content";
import styles from "./HighlightsEditorial.module.css";

const LANDMARK_IMAGE_NAMES = [
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

function IntroParagraph({ children }: { children: string }) {
  return (
    <div className={styles.lineMask}>
      <p data-highlights-intro-line className={styles.introText}>
        {children}
      </p>
    </div>
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
  imageName: (typeof LANDMARK_IMAGE_NAMES)[number];
  imageLeft: boolean;
  parallaxDirection: "up" | "down";
};

function LandmarkChapter({
  index,
  title,
  body,
  imageName,
  imageLeft,
  parallaxDirection,
}: LandmarkChapterProps) {
  const titleLines = splitTitleLines(title);
  const chapterLabel = `${String(index + 1).padStart(2, "0")} / Landmark`;

  const textCol = (
    <div className={styles.chapterText} data-highlights-chapter-text>
      <p className={styles.eyebrow} data-highlights-chapter-reveal>
        {chapterLabel}
      </p>
      <KineticTitle lines={titleLines} className={styles.sectionTitle} />
      <div data-highlights-gold-rule className={styles.goldRule} />
      <p className={styles.bodyText} data-highlights-chapter-reveal>
        {body}
      </p>
    </div>
  );

  const imageCol = (
    <div
      data-parallax-wrap
      data-parallax-direction={parallaxDirection}
      className={`${styles.parallaxWrap} ${
        imageLeft ? styles.imageLeft : styles.imageRight
      }`}
    >
      <div data-parallax-img className={styles.parallaxInner}>
        <ManagedImage
          name={imageName}
          alt={title}
          fill
          className={styles.parallaxImg}
          sizes="(max-width: 767px) 100vw, 58vw"
        />
      </div>
    </div>
  );

  return (
    <section data-highlights-section data-highlights-chapter className={styles.section}>
      <div className={styles.grid}>
        {imageLeft ? (
          <>
            <div className={styles.textLeft}>{textCol}</div>
            {imageCol}
          </>
        ) : (
          <>
            {imageCol}
            <div className={styles.textRight}>{textCol}</div>
          </>
        )}
      </div>
    </section>
  );
}

export function HighlightsPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  useHighlightsEditorialMotion(rootRef);

  return (
    <PageScrollTransition
      title={HIGHLIGHTS_PAGE.hero.title}
      subtitle={HIGHLIGHTS_PAGE.hero.subtitle}
      breadcrumb="Highlights"
      imageName="highlights-hero"
    >
      <div
        ref={rootRef}
        data-highlights-editorial
        className={styles.editorial}
        style={{
          backgroundColor: "#f4f1ea",
          color: "#1a1a1a",
        }}
      >
        <section data-highlights-intro className={styles.section}>
          <div className={styles.grid}>
            <div className={styles.introTitle}>
              <p className={styles.eyebrow}>Nile Landmarks</p>
              <KineticTitle lines={["Sail Through", "Living History"]} />
              <div data-highlights-gold-rule className={styles.goldRule} />
            </div>

            <div className={styles.introCopy}>
              {HIGHLIGHTS_PAGE.intro.map((paragraph) => (
                <IntroParagraph key={paragraph.slice(0, 48)}>
                  {paragraph}
                </IntroParagraph>
              ))}
            </div>
          </div>
        </section>

        <section data-highlights-section className={styles.sectionSurface}>
          <div className={styles.grid}>
            <div className={styles.landmarksHeader}>
              <p className={styles.eyebrow} data-highlights-chapter-reveal>
                Landmark Story
              </p>
              <KineticTitle lines={["Ancient Sites,", "Private Tempo"]} />
              <div data-highlights-gold-rule className={styles.goldRule} />
            </div>

            <div className={styles.landmarksIntro}>
              <p className={styles.bodyText} data-highlights-chapter-reveal>
                Each bend of the Nile opens a chapter of Egypt&apos;s living
                museum — explored at the unhurried pace only a Dahabiya allows.
              </p>
            </div>
          </div>
        </section>

        {HIGHLIGHTS_PAGE.landmarks.map((landmark, index) => (
          <LandmarkChapter
            key={landmark.title}
            index={index}
            title={landmark.title}
            body={landmark.body}
            imageName={LANDMARK_IMAGE_NAMES[index]}
            imageLeft={index % 2 === 1}
            parallaxDirection={index % 2 === 0 ? "up" : "down"}
          />
        ))}

        <section
          data-highlights-section
          className={styles.section}
          style={{ paddingBottom: 0 }}
        >
          <div data-highlights-cta-wrap className={styles.ctaStage}>
            <div data-highlights-cta-img className={styles.ctaMedia}>
              <ManagedImage
                name="highlights-lifestyle"
                alt="Scenic Nile views from Hathor Dahabiya"
                fill
                className={styles.parallaxImg}
                sizes="100vw"
              />
            </div>
            <div className={styles.ctaScrim} aria-hidden />
            <div data-highlights-cta-copy className={styles.ctaCopy}>
              <KineticTitle
                lines={["Explore More", "Aboard Hathor"]}
                className={styles.displayTitle}
              />
              <p className={styles.bodyText} data-highlights-chapter-reveal>
                Every bend of the Nile reveals another chapter of Egypt&apos;s
                timeless story. Sail in privacy, comfort, and true elegance.
              </p>
              <span data-highlights-chapter-reveal>
                <MagneticLink href="/cruises">Discover cruises</MagneticLink>
              </span>
            </div>
          </div>
        </section>
      </div>
    </PageScrollTransition>
  );
}
