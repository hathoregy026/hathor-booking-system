"use client";

import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { ManagedImage } from "@/components/ui/ManagedImage";
import {
  HIGHLIGHTS_JOURNEY_LINKS,
  HIGHLIGHTS_LANDMARK_META,
  HIGHLIGHTS_MANIFESTO,
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
  const headingParts = heading.split(/\s+/);
  const emphasisIndex = headingParts.findIndex((w) =>
    /elegance/i.test(w),
  );

  return (
    <section
      id="highlight-introduction"
      className="hl-section hl-intro"
      aria-labelledby="hl-intro-heading"
    >
      <div className="hl-shell">
        <div className="hl-intro__grid" data-hl-reveal="">
          <div className="hl-index">
            <span className="hl-index__num">02</span>
            <span>The Hathor Experience</span>
          </div>

          <div className="hl-intro__heading-col">
            <h2 id="hl-intro-heading" className="hl-heading">
              {emphasisIndex >= 0 ? (
                <>
                  {headingParts.slice(0, emphasisIndex).join(" ")}{" "}
                  <em className="hl-heading__em">
                    {headingParts[emphasisIndex]}
                  </em>
                  {headingParts.slice(emphasisIndex + 1).length
                    ? ` ${headingParts.slice(emphasisIndex + 1).join(" ")}`
                    : ""}
                </>
              ) : (
                heading
              )}
            </h2>
            <hr className="hl-rule hl-rule--short" />
            <p className="hl-signature">Aboard the Hathor Dahabiya</p>
          </div>

          <div className="hl-intro__body-col">
            <p className="hl-lead">{lead}</p>

            {groups.map((group, gi) => (
              <div key={gi} className="hl-intro__group">
                {group.map((sentence) => (
                  <p key={sentence.slice(0, 40)} className="hl-body">
                    {sentence}
                  </p>
                ))}
              </div>
            ))}

            <blockquote className="hl-pullquote">
              <p>“{pullQuote.replace(/^["“]|["”]$/g, "")}”</p>
            </blockquote>

            <BookNowTrigger className="hl-link">
              Book Now
              <span className="hl-link__arrow" aria-hidden="true">
                →
              </span>
            </BookNowTrigger>
          </div>

          <div className="hl-intro__frame" data-hl-reveal="">
            <div className="hl-intro__frame-media">
              <ManagedImage
                name="highlights-lifestyle"
                alt="Scenic Nile views from Hathor Dahabiya"
                fill
                sizes="(max-width: 768px) 88vw, 28vw"
                className="object-cover"
              />
            </div>
            <p className="hl-caption">Quiet river light · Hathor</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HighlightsManifesto() {
  return (
    <section
      className="hl-section hl-manifesto"
      aria-labelledby="hl-manifesto-heading"
    >
      <div className="hl-shell">
        <header className="hl-manifesto__head" data-hl-reveal="">
          <p className="hl-eyebrow hl-eyebrow--gold">What Highlights Mean</p>
          <h2 id="hl-manifesto-heading" className="hl-heading hl-heading--light">
            Three movements of a Nile day.
          </h2>
        </header>

        <div className="hl-manifesto__grid">
          {HIGHLIGHTS_MANIFESTO.map((item) => (
            <article
              key={item.title}
              className="hl-manifesto__item"
              data-hl-reveal=""
            >
              <span className="hl-manifesto__numeral" aria-hidden="true">
                {item.numeral}
              </span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>

        <svg
          className="hl-nile-line"
          viewBox="0 0 1200 80"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            data-hl-nile-path=""
            d="M20 48 C 180 10, 320 70, 480 40 S 780 10, 940 50 S 1100 70, 1180 30"
            stroke="currentColor"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </section>
  );
}

type HighlightsMovingStoriesProps = {
  landmarks: Landmark[];
};

function StoryChapter({
  landmark,
  meta,
  index,
}: {
  landmark: Landmark;
  meta: HighlightsLandmarkMeta;
  index: number;
}) {
  const reverse = index % 2 === 1;
  const num = String(index + 1).padStart(2, "0");

  return (
    <article
      className={`hl-story${reverse ? " hl-story--reverse" : ""}`}
      data-hl-story=""
      id={`site-image-${meta.slot}`}
      data-site-image={meta.slot}
      aria-labelledby={`hl-story-title-${index}`}
    >
      <div className="hl-story__media" data-hl-story-media="">
        <div className="hl-story__frame">
          <div
            className="hl-story__img-wrap"
            data-hl-story-img=""
            style={{ ["--hl-object-pos" as string]: meta.objectPosition }}
          >
            <ManagedImage
              name={meta.slot}
              alt={meta.caption || landmark.title}
              fill
              sizes="(max-width: 480px) calc(100vw - 28px), (max-width: 1024px) calc(100vw - 64px), 60vw"
              className="hl-story__img"
              loading={index === 0 ? "eager" : "lazy"}
              previewAnchor={false}
            />
          </div>
          <span className="hl-story__gold-frame" aria-hidden="true" />
        </div>
        <p className="hl-caption hl-story__caption">{meta.caption}</p>
      </div>

      <div className="hl-story__copy" data-hl-story-copy="">
        <div className="hl-story__meta-row">
          <span className="hl-story__index">{num}</span>
          <span className="hl-story__category">{meta.category}</span>
        </div>

        <h3
          id={`hl-story-title-${index}`}
          className="hl-story__title"
          data-hl-story-title=""
        >
          <span>{landmark.title}</span>
        </h3>

        <hr
          className="hl-rule hl-rule--story"
          data-hl-story-rule=""
          aria-hidden="true"
        />

        <p className="hl-body" data-hl-story-body="">
          {landmark.body}
        </p>

        <dl className="hl-story__facts">
          <div>
            <dt>Location</dt>
            <dd>{meta.location}</dd>
          </div>
          <div>
            <dt>Voyage connection</dt>
            <dd>{meta.voyage}</dd>
          </div>
          {meta.fact ? (
            <div>
              <dt>Note</dt>
              <dd>{meta.fact}</dd>
            </div>
          ) : null}
        </dl>

        <Link className="hl-link" href="/cruises">
          View Route
          <span className="hl-link__arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}

export function HighlightsMovingStories({
  landmarks,
}: HighlightsMovingStoriesProps) {
  return (
    <section
      id="highlight-stories"
      className="hl-section hl-stories"
      aria-labelledby="hl-stories-heading"
    >
      <div className="hl-shell">
        <header className="hl-stories__head" data-hl-reveal="">
          <p className="hl-eyebrow">03 · Landmark Chapters</p>
          <h2 id="hl-stories-heading" className="hl-heading">
            Moving stories along the Nile.
          </h2>
          <p className="hl-body hl-stories__lead">
            Large editorial chapters — image and word in measured motion —
            carrying you from Aswan granite to Luxor’s west bank.
          </p>
        </header>

        <div
          className="hl-stories__progress"
          aria-hidden="true"
          data-hl-progress=""
        >
          {landmarks.map((landmark, index) => (
            <span key={landmark.title}>
              <i data-hl-progress-fill="" />
              <em>{String(index + 1).padStart(2, "0")}</em>
            </span>
          ))}
        </div>

        <div className="hl-stories__list">
          {landmarks.map((landmark, index) => {
            const meta =
              HIGHLIGHTS_LANDMARK_META[index] ?? HIGHLIGHTS_LANDMARK_META[0]!;
            return (
              <StoryChapter
                key={landmark.title}
                landmark={landmark}
                meta={meta}
                index={index}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HighlightsRiverInterlude() {
  return (
    <section
      className="hl-interlude"
      aria-labelledby="hl-interlude-heading"
    >
      <div className="hl-interlude__media">
        <div className="hl-interlude__img-wrap" data-hl-parallax-img="">
          <ManagedImage
            name="highlights-lifestyle"
            alt="Quiet Nile waters between Hathor destinations"
            fill
            sizes="100vw"
            className="object-cover"
            previewAnchor={false}
          />
        </div>
        <div className="hl-interlude__shade" aria-hidden="true" />
      </div>

      <div className="hl-shell hl-interlude__content" data-hl-reveal="">
        <p className="hl-eyebrow hl-eyebrow--light">Between the Monuments</p>
        <h2 id="hl-interlude-heading" className="hl-heading hl-heading--light">
          The river becomes
          <br />
          part of the story.
        </h2>
        <p className="hl-body hl-body--light">
          Between ancient landmarks, Hathor returns you to still water, open
          skies and the quiet rhythm of the Nile.
        </p>
        <p className="hl-caption hl-caption--light">The Nile · Luxor–Aswan</p>
      </div>
    </section>
  );
}

export function HighlightsPrinciples() {
  return (
    <section
      className="hl-section hl-principles"
      aria-labelledby="hl-principles-heading"
    >
      <div className="hl-shell">
        <header className="hl-principles__head" data-hl-reveal="">
          <p className="hl-eyebrow">The Hathor Difference</p>
          <h2 id="hl-principles-heading" className="hl-heading">
            Every highlight,
            <br />
            experienced differently.
          </h2>
        </header>

        <div className="hl-principles__list">
          {HIGHLIGHTS_PRINCIPLES.map((item) => (
            <article
              key={item.title}
              className="hl-principles__item"
              data-hl-reveal=""
            >
              <span className="hl-principles__numeral" aria-hidden="true">
                {item.numeral}
              </span>
              <div>
                <h3>{item.title}</h3>
                <hr className="hl-rule hl-rule--short" />
                <p className="hl-body">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HighlightsJourneyPreview() {
  return (
    <section
      className="hl-section hl-journey"
      aria-labelledby="hl-journey-heading"
    >
      <div className="hl-shell">
        <header className="hl-journey__head" data-hl-reveal="">
          <p className="hl-eyebrow hl-eyebrow--gold">Follow the Nile</p>
          <h2 id="hl-journey-heading" className="hl-heading hl-heading--light">
            Discover where the
            <br />
            journey can lead.
          </h2>
        </header>

        <ul className="hl-journey__list">
          {HIGHLIGHTS_JOURNEY_LINKS.map((link) => (
            <li key={link.label} data-hl-reveal="">
              <Link href={link.href} className="hl-journey__row">
                <span className="hl-journey__label">{link.label}</span>
                <span className="hl-journey__body">{link.body}</span>
                <span className="hl-journey__arrow" aria-hidden="true">
                  →
                </span>
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
    <section
      id="reserve"
      className="hl-final-cta"
      aria-labelledby="hl-cta-heading"
    >
      <div className="hl-final-cta__media">
        <div className="hl-final-cta__img-wrap" data-hl-parallax-img="">
          <ManagedImage
            name="highlights-hero"
            alt="Reserve your voyage aboard Hathor Dahabiya"
            fill
            sizes="100vw"
            className="object-cover"
            previewAnchor={false}
          />
        </div>
        <div className="hl-final-cta__shade" aria-hidden="true" />
      </div>

      <div className="hl-shell hl-final-cta__content" data-hl-reveal="">
        <p className="hl-eyebrow hl-eyebrow--gold">Your Voyage Awaits</p>
        <h2 id="hl-cta-heading" className="hl-display hl-display--cta">
          See the Nile
          <br />
          through Hathor.
        </h2>
        <p className="hl-body hl-body--light">
          Reserve your voyage and experience the landmarks, river landscapes
          and private hospitality that define Hathor.
        </p>
        <div className="hl-final-cta__actions">
          <BookNowTrigger className="hl-btn hl-btn--ivory">
            Book Your Cruise
            <span className="hl-btn__arrow" aria-hidden="true">
              →
            </span>
          </BookNowTrigger>
          <Link href="/cruises" className="hl-link hl-link--light">
            View Voyages
            <span className="hl-link__arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
