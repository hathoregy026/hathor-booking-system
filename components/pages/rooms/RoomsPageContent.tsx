"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useRoomsEditorialMotion } from "@/hooks/useRoomsEditorialMotion";
import { ROOMS_PAGE } from "@/lib/page-content";
import styles from "./RoomsEditorial.module.css";

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
    <p className={styles.introText}>
      <span data-rooms-intro-line className={styles.lineInner}>
        {children}
      </span>
    </p>
  );
}

function MagneticDiscoverLink({
  href,
  children,
}: {
  href: string;
  children: string;
}) {
  return (
    <Link href={href} data-magnetic-link className={styles.magneticLink}>
      <span data-rooms-chapter-reveal>{children}</span>
      <ArrowRight
        data-magnetic-arrow
        className={styles.magneticArrow}
        size={16}
        aria-hidden
      />
    </Link>
  );
}

function splitTitleLines(title: string): [string, string] | [string] {
  const words = title.split(" ");
  if (words.length <= 1) return [title];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

type SuiteChapterProps = {
  chapter: string;
  title: string;
  body: string;
  imageName: string;
  imageAlt: string;
  imageLeft: boolean;
  parallaxDirection: "up" | "down";
  href?: string;
  hrefLabel?: string;
};

function SuiteChapter({
  chapter,
  title,
  body,
  imageName,
  imageAlt,
  imageLeft,
  parallaxDirection,
  href,
  hrefLabel,
}: SuiteChapterProps) {
  const titleLines = splitTitleLines(title);

  const textCol = (
    <div className={styles.chapterText} data-rooms-chapter-text>
      <p className={styles.eyebrow} data-rooms-chapter-reveal>
        {chapter}
      </p>
      <KineticTitle lines={titleLines} />
      <div data-rooms-gold-rule className={styles.goldRule} />
      <p className={styles.bodyText} data-rooms-chapter-reveal>
        {body}
      </p>
      {href && hrefLabel ? (
        <span data-rooms-chapter-reveal>
          <MagneticDiscoverLink href={href}>{hrefLabel}</MagneticDiscoverLink>
        </span>
      ) : null}
    </div>
  );

  const imageCol = (
    <div
      className={imageLeft ? styles.imageLeft : styles.imageRight}
      data-parallax-wrap
      data-parallax-direction={parallaxDirection}
    >
      <div data-parallax-img className={styles.parallaxInner}>
        <ManagedImage
          name={imageName}
          alt={imageAlt}
          fill
          className={styles.parallaxImg}
          sizes="(max-width: 767px) 100vw, 58vw"
        />
      </div>
    </div>
  );

  return (
    <section data-rooms-section data-rooms-chapter className={styles.section}>
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

export function RoomsPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  useRoomsEditorialMotion(rootRef);

  return (
    <PageScrollTransition
      title={ROOMS_PAGE.hero.title}
      subtitle={ROOMS_PAGE.hero.subtitle}
      breadcrumb="Accommodations"
      imageName="room-luxury"
      imageAlt="Luxury cabin aboard Hathor Dahabiya"
    >
      <div ref={rootRef} data-rooms-editorial className={styles.editorial}>
        {/* ─── Intro manifesto ─── */}
        <section
          data-rooms-section
          data-rooms-intro
          className={styles.section}
        >
          <div className={styles.grid}>
            <div className={styles.introBlock}>
              {ROOMS_PAGE.intro.map((paragraph) => (
                <IntroParagraph key={paragraph.slice(0, 48)}>
                  {paragraph}
                </IntroParagraph>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Our Accommodations ─── */}
        <section
          data-rooms-section
          className={styles.sectionSurface}
        >
          <div className={styles.grid}>
            <div className={styles.accommodationsHeader}>
              <KineticTitle lines={["Our", "Accommodations"]} />
              <div data-rooms-gold-rule className={styles.goldRule} />
            </div>

            <div className={styles.accommodationsIntro}>
              <p
                className={styles.bodyText}
                data-rooms-chapter-reveal
              >
                {ROOMS_PAGE.accommodations.intro}
              </p>
            </div>

            <div
              data-rooms-stats
              className={`${styles.statsFilmstrip} ${styles.statsRow}`}
            >
              {ROOMS_PAGE.accommodations.stats.map((stat) => (
                <div key={stat} data-rooms-stat className={styles.stat}>
                  <p className={styles.statValue}>
                    {stat.match(/^\d+/)?.[0]}
                  </p>
                  <p className={styles.statLabel}>
                    {stat.replace(/^\d+\s*/, "")}
                  </p>
                </div>
              ))}
            </div>

            <div className={styles.accommodationsOutro}>
              <p
                className={styles.bodyText}
                data-rooms-chapter-reveal
              >
                {ROOMS_PAGE.accommodations.outro}
              </p>
            </div>
          </div>
        </section>

        {/* ─── Suite chapters ─── */}
        {ROOMS_PAGE.categories.map((category, index) => (
          <SuiteChapter
            key={category.title}
            chapter="Accommodation"
            title={category.title}
            body={category.body}
            imageName={category.imageName}
            imageAlt={`${category.title} aboard Hathor Dahabiya`}
            imageLeft={index % 2 === 1}
            parallaxDirection={index % 2 === 0 ? "up" : "down"}
            href={"href" in category ? category.href : undefined}
            hrefLabel={"hrefLabel" in category ? category.hrefLabel : undefined}
          />
        ))}

        {/* ─── Suites bento ─── */}
        <section data-rooms-section className={styles.sectionDark}>
          <div className={styles.grid}>
            <div className={styles.span6}>
              <p className={styles.eyebrow} data-rooms-chapter-reveal>
                Suites
              </p>
              <KineticTitle
                lines={["Luxury", "Suites"]}
                className={styles.sectionTitle}
              />
              <div data-rooms-gold-rule className={styles.goldRule} />
              <p className={styles.bodyText} data-rooms-chapter-reveal>
                {ROOMS_PAGE.suites.body}
              </p>
            </div>

            <div
              data-rooms-bento
              className={`${styles.bento} ${styles.span12}`}
            >
              <div
                data-rooms-bento-cell
                className={styles.bentoFeature}
              >
                <p className={styles.eyebrow}>Signature</p>
                <p className={styles.bodyText}>
                  {ROOMS_PAGE.suites.features[0]}
                </p>
              </div>
              <div className={styles.bentoCell}>
                {ROOMS_PAGE.suites.features.slice(1).map((feature) => (
                  <div
                    key={feature}
                    data-rooms-bento-cell
                    className={styles.bentoItem}
                  >
                    <p className={styles.bodyText}>{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Welcome editorial split ─── */}
        <section
          data-rooms-section
          data-rooms-welcome
          className={styles.section}
        >
          <div className={styles.grid}>
            <div className={styles.welcomeTitle}>
              <KineticTitle
                lines={["Why Choose Our", "Accommodations"]}
              />
              <p
                className={styles.subtitle}
                data-rooms-welcome-reveal
              >
                <span className={styles.lineInner}>
                  {ROOMS_PAGE.welcome.subtitle}
                </span>
              </p>
            </div>

            <div className={styles.welcomeBody}>
              <p className={styles.bodyText}>
                <span
                  data-rooms-welcome-reveal
                  className={styles.lineInner}
                >
                  {ROOMS_PAGE.welcome.body}
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* ─── Cruises CTA closing frame ─── */}
        <section
          data-rooms-section
          className={styles.section}
          style={{ paddingBottom: 0 }}
        >
          <div data-rooms-cta-wrap className={styles.ctaFrame}>
            <div data-rooms-cta-img className={styles.ctaMedia}>
              <ManagedImage
                name="highlights-lifestyle"
                alt="Nile sailing aboard Hathor Dahabiya"
                fill
                className={styles.parallaxImg}
                sizes="100vw"
              />
            </div>
            <div className={styles.ctaScrim} aria-hidden />
            <div data-rooms-cta-copy className={styles.ctaCopy}>
              <KineticTitle
                lines={["Sail in Your", "Chosen Sanctuary"]}
                className={styles.displayTitle}
              />
              <p className={styles.bodyText} data-rooms-chapter-reveal>
                {ROOMS_PAGE.cruisesCta.body}
              </p>
              <span data-rooms-chapter-reveal>
                <MagneticDiscoverLink href="/cruises">
                  {ROOMS_PAGE.cruisesCta.hrefLabel}
                </MagneticDiscoverLink>
              </span>
            </div>
          </div>
        </section>
      </div>
    </PageScrollTransition>
  );
}
