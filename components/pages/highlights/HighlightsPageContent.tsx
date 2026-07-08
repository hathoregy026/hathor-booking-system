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
      <span data-highlights-reveal>{children}</span>
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
          backgroundColor: "var(--highlights-bg-light)",
          color: "var(--highlights-ink)",
        }}
      >
        <section
          data-highlights-intro
          data-highlights-reveal-group
          className={styles.section}
        >
          <div className={styles.grid}>
            <div className={styles.introTitle}>
              <p className={styles.eyebrow} data-highlights-reveal>
                Nile Landmarks
              </p>
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

        <section
          data-highlights-sticky-scene
          className={styles.stickyScene}
        >
          <div className={styles.grid}>
            <div
              data-highlights-sticky-copy
              className={styles.stickyCopy}
            >
              <p className={styles.eyebrow} data-highlights-reveal>
                Landmark Story
              </p>
              <KineticTitle lines={["Ancient Sites,", "Private Tempo"]} />
              <div data-highlights-gold-rule className={styles.goldRule} />

              <div className={styles.landmarkCopyStack}>
                {HIGHLIGHTS_PAGE.landmarks.map((landmark, index) => (
                  <article
                    key={landmark.title}
                    data-highlights-landmark-copy
                    data-landmark-index={index}
                    data-active={index === 0 ? "true" : "false"}
                    className={styles.landmarkCopy}
                  >
                    <p className={styles.eyebrow}>
                      {String(index + 1).padStart(2, "0")} / Landmark
                    </p>
                    <KineticTitle
                      lines={splitTitleLines(landmark.title)}
                      className={styles.sectionTitle}
                    />
                    <p className={styles.bodyText} data-highlights-reveal>
                      {landmark.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className={styles.imageRail}>
              {HIGHLIGHTS_PAGE.landmarks.map((landmark, index) => (
                <article
                  key={landmark.title}
                  data-highlights-landmark-card
                  data-landmark-index={index}
                  data-active={index === 0 ? "true" : "false"}
                  className={styles.landmarkCard}
                >
                  <div
                    data-parallax-wrap
                    data-parallax-direction={index % 2 === 0 ? "up" : "down"}
                    className={styles.parallaxWrap}
                  >
                    <div data-parallax-img className={styles.parallaxInner}>
                      <ManagedImage
                        name={LANDMARK_IMAGE_NAMES[index]}
                        alt={landmark.title}
                        fill
                        className={styles.parallaxImg}
                        sizes="(max-width: 767px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                  <div className={styles.landmarkMeta}>
                    <p className={styles.eyebrow}>
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className={styles.bodyText}>{landmark.title}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section} style={{ paddingBottom: 0 }}>
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
              <p className={styles.eyebrow} data-highlights-reveal>
                Explore More
              </p>
              <KineticTitle
                lines={["Explore More", "Aboard Hathor"]}
                className={styles.displayTitle}
              />
              <p className={styles.bodyText} data-highlights-reveal>
                Every bend of the Nile reveals another chapter of Egypt&apos;s
                timeless story. Sail in privacy, comfort, and true elegance.
              </p>
              <MagneticLink href="/cruises">Discover cruises</MagneticLink>
            </div>
          </div>
        </section>
      </div>
    </PageScrollTransition>
  );
}
