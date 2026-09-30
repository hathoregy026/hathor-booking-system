import {
  GOOGLE_REVIEWS_FALLBACK_URL,
  loadGuestReviews,
  tripadvisorUrl,
} from "@/lib/guest-reviews";
import "@/app/guest-reviews.css";

type GuestReviewsProps = {
  /** Home sits in the editorial document; room pages close on it before the footer. */
  placement: "home" | "room";
};

const STAR_PATH =
  "M12 2.6l2.82 6.06 6.63.72-4.93 4.5 1.36 6.53L12 17.1l-5.88 3.3 1.36-6.53-4.93-4.5 6.63-.72z";

function Stars({ value, size }: { value: number; size: "lg" | "sm" }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span
      className={`gr__stars gr__stars--${size}`}
      role="img"
      aria-label={`Rated ${value.toFixed(1)} out of 5`}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = rounded >= index + 1 ? "full" : rounded >= index + 0.5 ? "half" : "none";
        return (
          <svg key={index} viewBox="0 0 24 24" aria-hidden="true" data-fill={fill}>
            {fill === "half" ? (
              <defs>
                <clipPath id={`gr-half-${size}-${index}`}>
                  <rect x="0" y="0" width="12" height="24" />
                </clipPath>
              </defs>
            ) : null}
            <path className="gr__star-ground" d={STAR_PATH} />
            {fill !== "none" ? (
              <path
                className="gr__star-fill"
                d={STAR_PATH}
                clipPath={fill === "half" ? `url(#gr-half-${size}-${index})` : undefined}
              />
            ) : null}
          </svg>
        );
      })}
    </span>
  );
}

function External({
  href,
  className,
  children,
  primary,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      data-hathor-btn={primary ? "primary" : undefined}
    >
      {children}
    </a>
  );
}

/**
 * Guest reviews — the live Google rating and the reviews Google returns, set
 * as a ledger in the site's own type, with links out to read or write more on
 * Google and Tripadvisor. Without a Places key it still invites visitors to
 * read the reviews at the source.
 */
export async function GuestReviews({ placement }: GuestReviewsProps) {
  const data = await loadGuestReviews();
  const tripadvisor = tripadvisorUrl();
  const readUrl = data?.readUrl ?? GOOGLE_REVIEWS_FALLBACK_URL;
  const reviews = data?.reviews ?? [];
  const headingId = `gr-title-${placement}`;

  return (
    <section
      className={`gr gr--${placement}`}
      aria-labelledby={headingId}
      data-hathor-surface="paper"
    >
      <div className={`gr__grid${reviews.length ? "" : " gr__grid--solo"}`}>
        <header className="gr__head">
          <p className="gr__kicker">Guest reviews</p>
          <h2 id={headingId} className="gr__title">
            In their <em>own words</em>
          </h2>

          {data?.rating != null ? (
            <div className="gr__score">
              <span className="gr__figure">{data.rating.toFixed(1)}</span>
              <div className="gr__score-side">
                <Stars value={data.rating} size="lg" />
                {data.count != null ? (
                  <p className="gr__count">
                    {data.count.toLocaleString("en-GB")}{" "}
                    {data.count === 1 ? "review" : "reviews"} on Google
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="gr__lede">
              What guests say after a voyage aboard Hathor, in their own words
              on Google{tripadvisor ? " and Tripadvisor" : ""}.
            </p>
          )}

          <div className="gr__actions">
            <External href={readUrl} className="room-pill gr__btn" primary>
              Read all reviews
            </External>
            {data?.writeUrl ? (
              <External href={data.writeUrl} className="room-pill gr__btn">
                Write a review
              </External>
            ) : null}
            {tripadvisor ? (
              <External href={tripadvisor} className="room-pill gr__btn">
                Tripadvisor
              </External>
            ) : null}
          </div>

          {reviews.length ? (
            <p className="gr__source">Reviews and rating from Google Maps</p>
          ) : null}
        </header>

        {reviews.length ? (
          <ol className="gr__ledger">
            {reviews.map((review, index) => (
              <li key={`${review.author}-${index}`} className="gr__entry">
                <figure className="gr__figure-block">
                  <span className="gr__num" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <blockquote className="gr__quote">
                    <p>{review.text}</p>
                  </blockquote>
                  <figcaption className="gr__meta">
                    <Stars value={review.rating} size="sm" />
                    <cite className="gr__author">
                      {review.authorUrl ? (
                        <a href={review.authorUrl} target="_blank" rel="noopener noreferrer nofollow">
                          {review.author}
                        </a>
                      ) : (
                        review.author
                      )}
                    </cite>
                    {review.when ? <span className="gr__when">{review.when}</span> : null}
                    {review.url ? (
                      <a
                        className="gr__more"
                        href={review.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        Full review
                        <span className="gr__sr"> by {review.author} on Google</span>
                      </a>
                    ) : null}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  );
}
