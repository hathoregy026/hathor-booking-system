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
  const emphasisIndex = headingParts.findIndex((w) => /elegance/i.test(w));

  return (
    <section
      id="highlight-introduction"
      className="hl-intro"
      aria-labelledby="hl-intro-heading"
    >
      <div className="hl-intro__bridge" aria-hidden="true" />
      <div className="lux-ed-shell">
        <div className="lux-ed-grid hl-intro__grid" data-hl-reveal="">
          <aside className="lux-ed-rail hl-intro__rail">
            <span className="lux-ed-rail__num">02</span>
            <span>The Hathor Experience</span>
            <span>Cultural · Editorial</span>
          </aside>

          <div className="hl-intro__statement">
            <h2 id="hl-intro-heading" className="lux-ed-title">
              {emphasisIndex >= 0 ? (
                <>
                  {headingParts.slice(0, emphasisIndex).join(" ")}{" "}
                  <em className="hl-intro__em">{headingParts[emphasisIndex]}</em>
                  {headingParts.slice(emphasisIndex + 1).length
                    ? ` ${headingParts.slice(emphasisIndex + 1).join(" ")}`
                    : ""}
                </>
              ) : (
                heading
              )}
            </h2>
            <p className="lux-ed-script hl-intro__script">a slower reading of Egypt</p>
          </div>

          <div className="hl-intro__lead">
            <p className="lux-ed-copy lux-ed-copy--wide hl-intro__lead-text">{lead}</p>
          </div>

          <div className="hl-intro__columns">
            {groups.map((group, gi) => (
              <div key={gi} className="hl-intro__col">
                {group.map((sentence) => (
                  <p key={sentence.slice(0, 40)} className="lux-ed-copy">
                    {sentence}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <blockquote className="hl-intro__quote">
            <p>“{pullQuote.replace(/^["“]|["”]$/g, "")}”</p>
          </blockquote>

          <div className="hl-intro__detail">
            <div className="lux-ed-frame hl-intro__frame">
              <ManagedImage
                name="highlights-lifestyle"
                alt="Scenic Nile views from Hathor Dahabiya"
                fill
                sizes="(max-width: 768px) 80vw, 26vw"
                className="object-cover"
              />
            </div>
            <p className="hl-caption">River light · Hathor</p>
          </div>

          <div className="hl-intro__cta">
            <BookNowTrigger className="lux-ed-link">
              Book Now
              <span className="lux-ed-link__arrow" aria-hidden="true">→</span>
            </BookNowTrigger>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HighlightsManifesto() {
  return (
    <section className="hl-manifesto" aria-labelledby="hl-manifesto-heading">
      <div className="lux-ed-shell">
        <header className="hl-manifesto__head" data-hl-reveal="">
          <p className="lux-ed-label lux-ed-label--gold">What Highlights Mean</p>
          <h2 id="hl-manifesto-heading" className="lux-ed-title hl-manifesto__title">
            Three movements of a Nile day.
          </h2>
        </header>
        <div className="lux-ed-grid hl-manifesto__grid">
          {HIGHLIGHTS_MANIFESTO.map((item) => (
            <article key={item.title} className="hl-manifesto__item" data-hl-reveal="">
              <span className="hl-manifesto__numeral" aria-hidden="true">
                {item.numeral}
              </span>
              <h3>{item.title}</h3>
              <p className="lux-ed-copy lux-ed-copy--light">{item.body}</p>
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

function StoryPanel({
  landmark,
  meta,
  index,
}: {
  landmark: Landmark;
  meta: HighlightsLandmarkMeta;
  index: number;
}) {
  const num = String(index + 1).padStart(2, "0");
  const layout = index === 0 ? "a" : index === 1 ? "b" : "c";

  return (
    <article
      className={`hl-chapter hl-chapter--${layout}`}
      data-hl-chapter=""
      data-index={index}
      id={`site-image-${meta.slot}`}
      data-site-image={meta.slot}
      aria-labelledby={`hl-chapter-title-${index}`}
    >
      <div className="hl-chapter__media" data-hl-chapter-media="">
        <div className="lux-ed-frame hl-chapter__frame">
          <div
            className="hl-chapter__img-wrap"
            data-hl-chapter-img=""
            style={{ ["--hl-object-pos" as string]: meta.objectPosition }}
          >
            <ManagedImage
              name={meta.slot}
              alt={meta.caption || landmark.title}
              fill
              sizes="(max-width: 480px) calc(100vw - 28px), (max-width: 1024px) calc(100vw - 64px), 58vw"
              className="hl-chapter__img"
              loading={index === 0 ? "eager" : "lazy"}
              previewAnchor={false}
            />
          </div>
        </div>
        <p className="hl-caption hl-chapter__caption">{meta.caption}</p>
      </div>

      <div className="hl-chapter__copy" data-hl-chapter-copy="">
        <div className="hl-chapter__meta">
          <span className="hl-chapter__index">{num}</span>
          <span className="hl-chapter__category">{meta.category}</span>
        </div>
        <h3 id={`hl-chapter-title-${index}`} className="hl-chapter__title" data-hl-chapter-title="">
          <span>{landmark.title}</span>
        </h3>
        <hr className="lux-ed-rule lux-ed-rule--gold hl-chapter__rule" data-hl-chapter-rule="" />
        <p className="lux-ed-copy" data-hl-chapter-body="">
          {landmark.body}
        </p>
        <dl className="hl-chapter__facts">
          <div>
            <dt>Location</dt>
            <dd>{meta.location}</dd>
          </div>
          <div>
            <dt>Voyage</dt>
            <dd>{meta.voyage}</dd>
          </div>
          {meta.fact ? (
            <div>
              <dt>Note</dt>
              <dd>{meta.fact}</dd>
            </div>
          ) : null}
        </dl>
        <Link className="lux-ed-link" href="/cruises">
          View Route
          <span className="lux-ed-link__arrow" aria-hidden="true">→</span>
        </Link>
      </div>

      <span className="hl-chapter__divider" aria-hidden="true" data-hl-chapter-divider="" />
    </article>
  );
}

type HighlightsMovingStoriesProps = {
  landmarks: Landmark[];
};

export function HighlightsMovingStories({
  landmarks,
}: HighlightsMovingStoriesProps) {
  return (
    <section
      id="highlight-stories"
      className="hl-stories"
      aria-labelledby="hl-stories-heading"
      data-hl-stories=""
    >
      <div className="lux-ed-shell hl-stories__head-shell">
        <header className="hl-stories__head" data-hl-reveal="">
          <p className="lux-ed-label">03 · Landmark Chapters</p>
          <h2 id="hl-stories-heading" className="lux-ed-title">
            Moving stories along the Nile.
          </h2>
          <p className="lux-ed-copy">
            Large editorial chapters — image and word in measured motion —
            carrying you from Aswan granite to Luxor’s west bank.
          </p>
        </header>
      </div>

      {/* Desktop sticky stage */}
      <div className="hl-stories__pin" data-hl-stories-pin="">
        <div className="hl-stories__stage" data-hl-stories-stage="">
          <div className="hl-stories__progress" aria-hidden="true">
            {landmarks.map((landmark, index) => (
              <span key={landmark.title}>
                <i data-hl-progress-fill="" />
                <em>{String(index + 1).padStart(2, "0")}</em>
              </span>
            ))}
          </div>

          <div className="hl-stories__panels">
            {landmarks.map((landmark, index) => {
              const meta =
                HIGHLIGHTS_LANDMARK_META[index] ?? HIGHLIGHTS_LANDMARK_META[0]!;
              return (
                <StoryPanel
                  key={landmark.title}
                  landmark={landmark}
                  meta={meta}
                  index={index}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HighlightsRiverInterlude() {
  return (
    <section className="hl-interlude" aria-labelledby="hl-interlude-heading">
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
      <div className="lux-ed-shell hl-interlude__content" data-hl-reveal="">
        <div className="lux-ed-grid hl-interlude__grid">
          <div className="hl-interlude__rail">
            <span className="lux-ed-rail__num">04</span>
            <span className="lux-ed-label lux-ed-label--light">Between Monuments</span>
          </div>
          <div className="hl-interlude__copy">
            <h2 id="hl-interlude-heading" className="lux-ed-title hl-interlude__title">
              The river becomes
              <br />
              part of the story.
            </h2>
            <hr className="lux-ed-rule lux-ed-rule--gold hl-interlude__horizon" data-hl-horizon="" />
            <p className="lux-ed-copy lux-ed-copy--light">
              Between ancient landmarks, Hathor returns you to still water, open
              skies and the quiet rhythm of the Nile.
            </p>
            <p className="hl-caption hl-caption--light">The Nile · Luxor–Aswan</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HighlightsPrinciples() {
  return (
    <section className="hl-principles" aria-labelledby="hl-principles-heading">
      <div className="lux-ed-shell">
        <header className="hl-principles__head" data-hl-reveal="">
          <p className="lux-ed-label">The Hathor Difference</p>
          <h2 id="hl-principles-heading" className="lux-ed-title">
            Every highlight,
            <br />
            experienced differently.
          </h2>
        </header>
        <div className="hl-principles__bands">
          {HIGHLIGHTS_PRINCIPLES.map((item, index) => (
            <article
              key={item.title}
              className={`hl-principle hl-principle--${index % 2 === 0 ? "left" : "right"}`}
              data-hl-reveal=""
            >
              <span className="hl-principle__numeral" aria-hidden="true">
                {item.numeral}
              </span>
              <div className="hl-principle__copy">
                <h3>{item.title}</h3>
                <hr className="lux-ed-rule lux-ed-rule--short lux-ed-rule--gold" />
                <p className="lux-ed-copy">{item.body}</p>
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
    <section className="hl-journey" aria-labelledby="hl-journey-heading">
      <div className="lux-ed-shell">
        <header className="hl-journey__head" data-hl-reveal="">
          <p className="lux-ed-label lux-ed-label--gold">Follow the Nile</p>
          <h2 id="hl-journey-heading" className="lux-ed-title hl-journey__title">
            Discover where the
            <br />
            journey can lead.
          </h2>
        </header>
        <ul className="hl-journey__list">
          {HIGHLIGHTS_JOURNEY_LINKS.map((link, index) => (
            <li key={link.label} data-hl-reveal="">
              <Link href={link.href} className="hl-journey__row">
                <span className="hl-journey__num">{String(index + 1).padStart(2, "0")}</span>
                <span className="hl-journey__label">{link.label}</span>
                <span className="hl-journey__body">{link.body}</span>
                <span className="hl-journey__visual" aria-hidden="true">
                  <ManagedImage
                    name={index === 2 ? "charter-hero" : "highlights-lifestyle"}
                    alt=""
                    fill
                    sizes="160px"
                    className="object-cover"
                    previewAnchor={false}
                  />
                </span>
                <span className="hl-journey__arrow" aria-hidden="true">→</span>
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
    <section id="reserve" className="hl-final" aria-labelledby="hl-cta-heading">
      <div className="hl-final__media">
        <div className="hl-final__img-wrap" data-hl-parallax-img="">
          <ManagedImage
            name="highlights-hero"
            alt="Discover ancient places aboard Hathor Dahabiya"
            fill
            sizes="100vw"
            className="object-cover"
            previewAnchor={false}
          />
        </div>
        <div className="hl-final__shade" aria-hidden="true" />
      </div>
      <div className="lux-ed-shell hl-final__content" data-hl-reveal="">
        <div className="lux-ed-grid hl-final__grid">
          <div className="hl-final__rail">
            <span className="lux-ed-rail__num">07</span>
            <span className="lux-ed-label lux-ed-label--gold">Discovery Awaits</span>
          </div>
          <div className="hl-final__copy">
            <h2 id="hl-cta-heading" className="lux-ed-display hl-final__title">
              See ancient places
              <br />
              through Hathor.
            </h2>
            <p className="lux-ed-copy lux-ed-copy--light">
              Reserve your voyage and experience the landmarks, river landscapes
              and private hospitality that define Hathor.
            </p>
            <div className="hl-final__actions">
              <BookNowTrigger className="lux-ed-btn lux-ed-btn--ivory">
                Book Your Cruise
                <span className="lux-ed-btn__arrow" aria-hidden="true">→</span>
              </BookNowTrigger>
              <Link href="/cruises" className="lux-ed-link" style={{ color: "rgba(245,239,228,0.85)" }}>
                View Voyages
                <span className="lux-ed-link__arrow" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
