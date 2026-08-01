"use client";

import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { ManagedImage } from "@/components/ui/ManagedImage";
import {
  HIGHLIGHTS_JOURNEY_LINKS,
  HIGHLIGHTS_LANDMARK_META,
  HIGHLIGHTS_PRINCIPLES,
  extractHighlightsPullQuote,
  layoutHighlightsIntro,
  type HighlightsLandmarkMeta,
} from "@/lib/highlights-content";

type Landmark = { title: string; body: string };

type HighlightsIntroductionProps = {
  heading: string;
  intro: string[];
};

export function HighlightsIntroduction({
  heading,
  intro,
}: HighlightsIntroductionProps) {
  const { lead, groups } = layoutHighlightsIntro(intro);
  const pullQuote = extractHighlightsPullQuote(intro);
  const supporting = groups
    .flat()
    .slice(0, 2)
    .join(" ");

  return (
    <section
      id="highlight-introduction"
      className="hl-intro"
      aria-labelledby="hl-intro-heading"
      data-hl-intro=""
    >
      <div className="lx-shell">
        <div className="lx-grid hl-intro__grid">
          <div className="hl-intro__text" data-hl-reveal="">
            <p className="lx-label">The Experience</p>
            <h2 id="hl-intro-heading" className="lx-title hl-intro__title">
              <span className="lx-mask" data-hl-intro-line="">
                <span>{heading}</span>
              </span>
            </h2>
            <p className="lx-copy hl-intro__lead" data-hl-reveal="">
              {lead}
            </p>
            {supporting ? (
              <p className="lx-copy hl-intro__body" data-hl-reveal="">
                {supporting}
              </p>
            ) : null}
            <blockquote className="hl-intro__quote" data-hl-reveal="">
              <p>“{pullQuote.replace(/^["“]|["”]$/g, "")}”</p>
            </blockquote>
          </div>

          <div className="hl-intro__media" data-hl-intro-curtain="">
            <ManagedImage
              name="cruises-hero"
              alt="Hathor Dahabiya sailing the Nile"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              previewAnchor={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

type HighlightsMovingStoriesProps = {
  landmarks: Landmark[];
};

export function HighlightsMovingStories({
  landmarks,
}: HighlightsMovingStoriesProps) {
  const items = landmarks.length
    ? landmarks
    : [
        {
          title: "The Unfinished Obelisk",
          body: "Walk the quarry where ancient craftsmen began a monument larger than any completed stone.",
        },
        {
          title: "Temple of Hatshepsut",
          body: "Terraces rising into the cliffs — a queen’s mortuary temple encountered with time and grace.",
        },
        {
          title: "Valley of the Kings",
          body: "The royal necropolis of the New Kingdom, held in desert silence above the west bank.",
        },
      ];

  return (
    <section
      id="highlight-stories"
      className="hl-stories"
      aria-labelledby="hl-stories-heading"
      data-hl-stories=""
    >
      <div className="lx-shell hl-stories__head">
        <p className="lx-label">Landmark Chapters</p>
        <h2 id="hl-stories-heading" className="lx-title">
          Along the Nile.
        </h2>
      </div>

      {/* Desktop sticky cinema */}
      <div className="hl-stories__desktop" data-hl-stories-desktop="">
        <div className="hl-stories__runway">
          <div className="hl-stories__sticky" data-hl-stories-sticky="">
            <div className="hl-stories__stage lx-shell">
              <div className="hl-stories__media" data-hl-stories-media="">
                {items.map((landmark, index) => {
                  const meta =
                    HIGHLIGHTS_LANDMARK_META[index] ??
                    HIGHLIGHTS_LANDMARK_META[0]!;
                  return (
                    <div
                      key={meta.slot}
                      className="hl-stories__slide"
                      data-hl-slide=""
                      data-index={index}
                      id={`site-image-${meta.slot}`}
                      data-site-image={meta.slot}
                    >
                      <ManagedImage
                        name={meta.slot}
                        alt={meta.caption || landmark.title}
                        fill
                        sizes="65vw"
                        className="object-cover"
                        loading={index === 0 ? "eager" : "lazy"}
                        previewAnchor={false}
                        style={{
                          objectPosition: meta.objectPosition,
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="hl-stories__copy">
                <div className="hl-stories__counter" aria-hidden="true">
                  <span data-hl-counter="">01</span>
                  <span>/</span>
                  <span>{String(items.length).padStart(2, "0")}</span>
                </div>
                <div className="hl-stories__progress" aria-hidden="true">
                  <span data-hl-progress="" />
                </div>
                {items.map((landmark, index) => (
                  <div
                    key={landmark.title}
                    className="hl-stories__chapter"
                    data-hl-chapter=""
                    data-index={index}
                  >
                    <h3 className="hl-stories__title">{landmark.title}</h3>
                    <p className="lx-copy">{landmark.body}</p>
                    <Link href="/cruises" className="lx-link">
                      View Route
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet / phone stacked chapters */}
      <div className="hl-stories__stack lx-shell" data-hl-stories-stack="">
        {items.map((landmark, index) => {
          const meta =
            HIGHLIGHTS_LANDMARK_META[index] ?? HIGHLIGHTS_LANDMARK_META[0]!;
          return (
            <LandmarkChapter
              key={landmark.title}
              landmark={landmark}
              meta={meta}
              index={index}
            />
          );
        })}
      </div>
    </section>
  );
}

function LandmarkChapter({
  landmark,
  meta,
  index,
}: {
  landmark: Landmark;
  meta: HighlightsLandmarkMeta;
  index: number;
}) {
  return (
    <article
      className="hl-chapter"
      data-hl-stack-chapter=""
      data-index={index}
      aria-labelledby={`hl-chapter-title-${index}`}
    >
      <div className="hl-chapter__media" data-hl-stack-media="">
        <ManagedImage
          name={meta.slot}
          alt={meta.caption || landmark.title}
          fill
          sizes="(max-width: 480px) 100vw, 100vw"
          className="object-cover"
          loading={index === 0 ? "eager" : "lazy"}
          previewAnchor={false}
          style={{ objectPosition: meta.objectPosition }}
        />
      </div>
      <div className="hl-chapter__copy">
        <span className="hl-chapter__num">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 id={`hl-chapter-title-${index}`} className="hl-chapter__title">
          <span className="lx-mask" data-hl-stack-title="">
            <span>{landmark.title}</span>
          </span>
        </h3>
        <p className="lx-copy">{landmark.body}</p>
        <Link href="/cruises" className="lx-link">
          View Route
        </Link>
      </div>
    </article>
  );
}

export function HighlightsRiverInterlude() {
  return (
    <section
      className="hl-interlude"
      aria-labelledby="hl-interlude-heading"
      data-hl-interlude=""
    >
      <div className="hl-interlude__media" data-hl-interlude-media="">
        <ManagedImage
          name="cruises-hero"
          alt="Quiet Nile waters between destinations"
          fill
          sizes="100vw"
          className="object-cover"
          previewAnchor={false}
        />
        <div className="hl-interlude__shade" aria-hidden="true" />
      </div>
      <div className="lx-shell hl-interlude__content" data-hl-reveal="">
        <h2 id="hl-interlude-heading" className="lx-title hl-interlude__title">
          Between the monuments,
          <br />
          the river continues.
        </h2>
        <p className="lx-copy lx-copy--light">
          After each landmark, Hathor returns you to still water, open sky and
          the quiet rhythm of the Nile.
        </p>
      </div>
    </section>
  );
}

export function HighlightsPrinciples() {
  return (
    <section className="hl-values" aria-labelledby="hl-values-heading">
      <div className="lx-shell">
        <h2 id="hl-values-heading" className="lx-sr">
          The Hathor difference
        </h2>
        <div className="hl-values__bands">
          {HIGHLIGHTS_PRINCIPLES.map((item, index) => (
            <article
              key={item.title}
              className="hl-values__band"
              data-hl-reveal=""
            >
              <span className="hl-values__num" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="hl-values__title">{item.title}</h3>
              <p className="lx-copy">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HighlightsJourneyPreview() {
  return (
    <section className="hl-journey" aria-labelledby="hl-journey-heading">
      <div className="lx-shell">
        <div className="lx-grid hl-journey__grid">
          <div className="hl-journey__intro" data-hl-reveal="">
            <p className="lx-label">Follow the Nile</p>
            <h2 id="hl-journey-heading" className="lx-title">
              Where the journey can lead.
            </h2>
          </div>
          <div className="hl-journey__media" data-hl-reveal="">
            <ManagedImage
              name="about-hero"
              alt="Nile banks along Hathor itineraries"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
              previewAnchor={false}
            />
          </div>
        </div>
        <ul className="hl-journey__list">
          {HIGHLIGHTS_JOURNEY_LINKS.map((link) => (
            <li key={link.label} data-hl-journey-row="">
              <Link href={link.href} className="hl-journey__row">
                <span className="hl-journey__label">{link.label}</span>
                <span className="hl-journey__body">{link.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HighlightsFinalCta() {
  return (
    <section id="reserve" className="hl-close" aria-labelledby="hl-cta-heading">
      <div className="hl-close__media" data-hl-close-media="">
        <ManagedImage
          name="charter-hero"
          alt="Discover the Nile aboard Hathor Dahabiya"
          fill
          sizes="100vw"
          className="object-cover"
          previewAnchor={false}
        />
        <div className="hl-close__shade" aria-hidden="true" />
      </div>
      <div className="lx-shell hl-close__inner" data-hl-reveal="">
        <h2 id="hl-cta-heading" className="lx-display hl-close__title">
          See ancient places
          <br />
          through Hathor.
        </h2>
        <p className="lx-copy lx-copy--light">
          Reserve your voyage and experience the landmarks, river landscapes and
          private hospitality that define Hathor.
        </p>
        <div className="hl-close__actions">
          <BookNowTrigger className="lx-btn lx-btn--ivory">
            Book Your Cruise
          </BookNowTrigger>
          <Link href="/cruises" className="lx-link">
            View Voyages
          </Link>
        </div>
      </div>
    </section>
  );
}
