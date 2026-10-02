"use client";

import Image from "next/image";
import { useId, useRef, useState, type ReactNode, type UIEvent } from "react";
import type { GuestReview, GuestReviewsData } from "@/lib/guest-reviews";
import { HandNote, PalmFrond, PalmTree, Stamp } from "@/components/public/guest-reviews/ephemera";
import { GoogleMark, Rating, SOURCE_LABEL, SourceMark, type ReviewSource } from "@/components/public/guest-reviews/marks";

/** Three reviews to a spread: one on the upper page, two on the lower. */
const PER_SPREAD = 3;

type Fallback = { googleUrl: string; tripadvisorUrl: string | null };

function External({ href, className, children, primary }: { href: string; className?: string; children: ReactNode; primary?: boolean }) {
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer" data-hathor-btn={primary ? "primary" : undefined}>
      {children}
    </a>
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/* ------------------------------------------------------------- decoration */

/** A small lotus between the two lower-page reviews. */
function Lotus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 48" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round">
        <path d="M20 40 C 14 30, 14 16, 20 6 C 26 16, 26 30, 20 40 Z" />
        <path d="M20 40 C 10 36, 5 26, 6 15 C 14 20, 18 30, 20 40" />
        <path d="M20 40 C 30 36, 35 26, 34 15 C 26 20, 22 30, 20 40" />
        <path d="M20 40 v 6 M14 46 h 12" />
      </g>
    </svg>
  );
}

/* ----------------------------------------------------------------- review */

const AVATAR_TONES = ["#7b5aa6", "#3a3631", "#4f5f6b", "#806b35", "#6b4f3a"];

function Avatar({ review }: { review: GuestReview }) {
  const tone = AVATAR_TONES[review.author.charCodeAt(0) % AVATAR_TONES.length];
  return (
    <span className="gb__avatar" aria-hidden="true" style={review.photo ? undefined : { background: tone }}>
      {review.photo ? (
        // The platform's own profile photo; next/image is not configured for these hosts.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={review.photo} alt="" width={40} height={40} loading="lazy" referrerPolicy="no-referrer" />
      ) : (
        <span>{review.author.charAt(0).toUpperCase()}</span>
      )}
    </span>
  );
}

/** One review as an entry in the book: quote mark, rating, source and date, the words, the guest. */
function ReviewNote({
  review,
  source,
  size,
  id,
}: {
  review: GuestReview;
  source: ReviewSource;
  size: "lead" | "page" | "card" | "next";
  id: string;
}) {
  const label = SOURCE_LABEL[source];
  return (
    <figure className={`gb__note gb__note--${size}`}>
      <div className="gb__note-top">
        <span className="gb__mark" aria-hidden="true">&ldquo;</span>
        <Rating value={review.rating} size="sm" id={id} source={source} />
        <span className="gb__src">
          <SourceMark source={source} className="gb__src-mark" />
          {review.url ? (
            <a href={review.url} target="_blank" rel="noopener noreferrer nofollow" className="gb__when">
              {review.when || `On ${label}`}
              <span className="gb__sr"> — read this review by {review.author} on {label}</span>
            </a>
          ) : (
            <span className="gb__when">{review.when}</span>
          )}
        </span>
      </div>
      <blockquote className="gb__words">
        {review.title ? <p className="gb__headline">{review.title}</p> : null}
        <p className="gb__text">{review.text}</p>
      </blockquote>
      <figcaption className="gb__by">
        <Avatar review={review} />
        <span className="gb__by-text">
          <cite className="gb__name">
            {review.authorUrl ? (
              <a href={review.authorUrl} target="_blank" rel="noopener noreferrer nofollow">{review.author}</a>
            ) : (
              review.author
            )}
          </cite>
          <span className="gb__on">on {label}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------- book */

function Score({ data }: { data: GuestReviewsData }) {
  if (data.rating == null) return null;
  return (
    <div className="gb__score">
      <span className="gb__figure">{data.rating.toFixed(1)}</span>
      <span className="gb__score-side">
        <Rating value={data.rating} size="lg" id={`gb-score-${data.source}`} source={data.source} />
        {data.count != null ? (
          <span className="gb__count">
            Based on {data.count.toLocaleString("en-GB")} {data.count === 1 ? "review" : "reviews"}
          </span>
        ) : null}
      </span>
    </div>
  );
}

function Actions({ data, fallback, className }: { data: GuestReviewsData | null; fallback: Fallback; className: string }) {
  return (
    <div className={`gb__actions ${className}`}>
      <External href={data?.readUrl ?? fallback.googleUrl} className="room-pill gb__btn" primary>
        Read reviews
      </External>
      {data?.writeUrl ? (
        <External href={data.writeUrl} className="room-pill gb__btn">
          Write a review
        </External>
      ) : !data && fallback.tripadvisorUrl ? (
        <External href={fallback.tripadvisorUrl} className="room-pill gb__btn">
          Tripadvisor
        </External>
      ) : null}
    </div>
  );
}

/**
 * Guest reviews as a travel journal: the title, score and source switch on
 * the left, the reviews written into an open guest book on the right. On
 * phones it becomes one journal page with the reviews as cards to swipe.
 */
export function GuestBook({
  sources,
  headingId,
  fallback,
}: {
  sources: GuestReviewsData[];
  headingId: string;
  fallback: Fallback;
}) {
  const [active, setActive] = useState<ReviewSource | null>(sources[0]?.source ?? null);
  const [spread, setSpread] = useState(0);
  const [slide, setSlide] = useState(0);
  const deck = useRef<HTMLOListElement>(null);
  const base = useId();

  const data = sources.find((source) => source.source === active) ?? null;
  const reviews = data?.reviews ?? [];
  const spreads = chunk(reviews, PER_SPREAD);
  const shown = spreads[Math.min(spread, Math.max(0, spreads.length - 1))] ?? [];
  const [lead, ...rest] = shown;

  function choose(source: ReviewSource) {
    setActive(source);
    setSpread(0);
    setSlide(0);
    deck.current?.scrollTo({ left: 0 });
  }

  function onDeckScroll(event: UIEvent<HTMLOListElement>) {
    const el = event.currentTarget;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    const step = card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
    setSlide(Math.round(el.scrollLeft / Math.max(1, step)));
  }

  function goToSlide(index: number) {
    const el = deck.current;
    const card = el?.children[index] as HTMLElement | undefined;
    const still = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: still ? "auto" : "smooth" });
  }

  const tabs =
    sources.length > 1 ? (
      <div className="gb__tabs" role="tablist" aria-label="Review source">
        {sources.map((source) => (
          <button
            key={source.source}
            type="button"
            role="tab"
            id={`${base}-tab-${source.source}`}
            aria-selected={active === source.source}
            aria-controls={`${base}-panel`}
            className="room-pill gb__tab"
            data-hathor-btn={active === source.source ? "primary" : undefined}
            onClick={() => choose(source.source)}
          >
            {SOURCE_LABEL[source.source]}
          </button>
        ))}
      </div>
    ) : null;

  const panelLabel = sources.length > 1 && active ? { role: "tabpanel", "aria-labelledby": `${base}-tab-${active}` } : {};

  return (
    <div className="gb">
      {/* ------------------------------------------------ title column */}
      <div className="gb__aside">
        <PalmTree className="gb__palm gb__palm--head" />
        <p className="gb__kicker">Guest reviews</p>
        <h2 id={headingId} className="gb__title">
          <span>In their</span>
          <span className="gb__title-accent">own words</span>
        </h2>
        <span className="gb__dash" aria-hidden="true" />
        <p className="gb__lede">
          More than a journey, a collection of memories. Here are the words of our guests, written from the heart.
        </p>
        <p className="gb__subtitle">Real journeys. Genuine stories.</p>

        <div className="gb__summary">
          {data ? (
            <Score data={data} />
          ) : (
            <p className="gb__badge-source">
              <GoogleMark className="gb__src-mark" />
              Google reviews
            </p>
          )}
        </div>
        {tabs}
        <Actions data={data} fallback={fallback} className="gb__actions--aside" />

        <figure className="gb__etching" aria-hidden="true">
          <Image src="/media/hathor/reviews/hathor-engraving.webp" alt="" width={1100} height={470} sizes="(max-width: 950px) 92vw, 34vw" />
          <HandNote
            className="gb__hand gb__hand--etching"
            width={230}
            height={210}
            rotate={-14}
            underline
            lines={[
              { text: "Different", x: 10, y: 50 },
              { text: "waters,", x: 44, y: 96, r: 2 },
              { text: "richer", x: 70, y: 142, r: -1 },
              { text: "stories", x: 92, y: 188, r: 1 },
            ]}
          />
        </figure>
      </div>

      {/* ------------------------------------------- the open guest book */}
      <div className="gb__book" id={`${base}-panel`} {...panelLabel}>
        <div className="gb__volume">
        <span className="gb__block" aria-hidden="true" />
        <div className="gb__page gb__page--upper">
          <div className="gb__sheet">
            {lead ? (
              <ReviewNote review={lead} source={data!.source} size="lead" id={`${base}-lead`} />
            ) : (
              <p className="gb__empty">
                Read what guests say after a voyage aboard Hathor, on Google{fallback.tripadvisorUrl ? " and Tripadvisor" : ""}.
              </p>
            )}
            <HandNote
              className="gb__hand gb__hand--page"
              width={300}
              height={170}
              rotate={-16}
              lines={[
                { text: "Slower", x: 12, y: 46 },
                { text: "kinder", x: 46, y: 96, r: 2 },
                { text: "more beautiful", x: 70, y: 148, r: -1 },
              ]}
            />
          </div>
          <div className="gb__postcard" aria-hidden="true">
            <Image src="/media/hathor/reviews/hathor-postcard.webp" alt="" width={560} height={680} sizes="15rem" />
            <span className="gb__gloss" />
          </div>
          <Stamp className="gb__stamp" />
          <PalmFrond className="gb__palm gb__palm--page" />
        </div>

        {rest.length ? (
          <div className="gb__page gb__page--lower">
            <div className={`gb__sheet gb__sheet--split${rest.length === 1 ? " gb__sheet--single" : ""}`}>
              {rest.map((review, index) => (
                <ReviewNote key={`${spread}-${index}`} review={review} source={data!.source} size="page" id={`${base}-p${index}`} />
              ))}
              {rest.length > 1 ? <Lotus className="gb__lotus" /> : null}
            </div>
          </div>
        ) : null}

        </div>

        {spreads.length > 1 ? (
          <nav className="gb__pager" aria-label="Review pages">
            <button
              type="button"
              className="gb__turn"
              onClick={() => setSpread((page) => Math.max(0, page - 1))}
              disabled={spread === 0}
              aria-label="Previous page of reviews"
            >
              ←
            </button>
            <span className="gb__folio" aria-live="polite">
              Page {spread + 1} of {spreads.length}
            </span>
            <button
              type="button"
              className="gb__turn"
              onClick={() => setSpread((page) => Math.min(spreads.length - 1, page + 1))}
              disabled={spread >= spreads.length - 1}
              aria-label="Next page of reviews"
            >
              →
            </button>
          </nav>
        ) : null}
        {data ? (
          <p className="gb__source">
            Ratings and reviews from {SOURCE_LABEL[data.source]}, shown as written by guests.
          </p>
        ) : null}
      </div>

      {/* ----------------------------------------- phone: journal cards */}
      <div className="gb__deck-wrap" {...(sources.length > 1 && active ? { role: "region", "aria-label": `${SOURCE_LABEL[active]} reviews` } : {})}>
        {reviews.length ? (
          <>
            <ol className="gb__deck" ref={deck} onScroll={onDeckScroll} aria-label={`Reviews from ${data ? SOURCE_LABEL[data.source] : ""}`}>
              {reviews.map((review, index) => (
                <li key={`${data!.source}-${index}`} className="gb__card">
                  <ReviewNote review={review} source={data!.source} size="card" id={`${base}-c${index}`} />
                </li>
              ))}
            </ol>
            {reviews.length > 1 ? (
              <div className="gb__dots" role="group" aria-label="Choose a review">
                {reviews.map((review, index) => (
                  <button
                    key={index}
                    type="button"
                    className="gb__dot"
                    aria-label={`Review ${index + 1} of ${reviews.length}`}
                    aria-current={slide === index ? "true" : undefined}
                    onClick={() => goToSlide(index)}
                  />
                ))}
              </div>
            ) : null}
            {reviews.length > 1 ? (
              <button
                type="button"
                className="gb__next"
                onClick={() => goToSlide((slide + 1) % reviews.length)}
                aria-label={`Next review, by ${reviews[(slide + 1) % reviews.length]!.author}`}
              >
                <ReviewNote
                  review={reviews[(slide + 1) % reviews.length]!}
                  source={data!.source}
                  size="next"
                  id={`${base}-next`}
                />
              </button>
            ) : null}
          </>
        ) : (
          <p className="gb__card gb__empty">
            Read what guests say after a voyage aboard Hathor, on Google{fallback.tripadvisorUrl ? " and Tripadvisor" : ""}.
          </p>
        )}
        <Actions data={data} fallback={fallback} className="gb__actions--deck" />
        <figure className="gb__etching gb__etching--deck" aria-hidden="true">
          <Image src="/media/hathor/reviews/hathor-engraving.webp" alt="" width={1100} height={470} sizes="92vw" />
          <HandNote
            className="gb__hand gb__hand--deck"
            width={420}
            height={190}
            rotate={-10}
            lines={[
              { text: "More than", x: 8, y: 44 },
              { text: "a cruise —", x: 30, y: 92, r: 2 },
              { text: "a story worth sharing", x: 52, y: 142, r: -1 },
            ]}
          />
        </figure>
      </div>
    </div>
  );
}
