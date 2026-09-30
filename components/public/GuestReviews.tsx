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

/** Google's "G" mark, used as the source attribution the Places terms ask for. */
function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function Stars({ value, size, id }: { value: number; size: "lg" | "sm"; id: string }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span
      className={`gr__stars gr__stars--${size}`}
      role="img"
      aria-label={`Rated ${value.toFixed(1)} out of 5`}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = rounded >= index + 1 ? "full" : rounded >= index + 0.5 ? "half" : "none";
        const clip = `gr-half-${id}-${index}`;
        return (
          <svg key={index} viewBox="0 0 24 24" aria-hidden="true">
            {fill === "half" ? (
              <defs>
                <clipPath id={clip}>
                  <rect x="0" y="0" width="12" height="24" />
                </clipPath>
              </defs>
            ) : null}
            <path className="gr__star-ground" d={STAR_PATH} />
            {fill !== "none" ? (
              <path
                className="gr__star-fill"
                d={STAR_PATH}
                clipPath={fill === "half" ? `url(#${clip})` : undefined}
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
 * in the house type with Google's own marks as the source, and links out to
 * read or write more on Google and Tripadvisor. Without a Places key it still
 * invites visitors to read the reviews at the source.
 */
export async function GuestReviews({ placement }: GuestReviewsProps) {
  const data = await loadGuestReviews();
  const tripadvisor = tripadvisorUrl();
  const readUrl = data?.readUrl ?? GOOGLE_REVIEWS_FALLBACK_URL;
  const reviews = data?.reviews ?? [];
  const headingId = `gr-title-${placement}`;

  return (
    <section className={`gr gr--${placement}`} aria-labelledby={headingId}>
      <div className={`gr__grid${reviews.length ? "" : " gr__grid--solo"}`}>
        <header className="gr__head">
          <p className="gr__kicker">Guest reviews</p>
          <h2 id={headingId} className="gr__title">
            <span>In their</span>
            <span className="gr__title-accent">own words</span>
          </h2>

          <div className="gr__badge">
            <div className="gr__badge-source">
              <GoogleMark className="gr__g" />
              <span>Google Reviews</span>
            </div>
            {data?.rating != null ? (
              <div className="gr__score">
                <span className="gr__figure">{data.rating.toFixed(1)}</span>
                <div className="gr__score-side">
                  <Stars value={data.rating} size="lg" id={`${placement}-score`} />
                  {data.count != null ? (
                    <p className="gr__count">
                      Based on {data.count.toLocaleString("en-GB")}{" "}
                      {data.count === 1 ? "review" : "reviews"}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="gr__lede">
                Read what guests say after a voyage aboard Hathor, on Google
                {tripadvisor ? " and Tripadvisor" : ""}.
              </p>
            )}
          </div>

          <div className="gr__actions">
            <External href={readUrl} className="room-pill gr__btn" primary>
              Read reviews
            </External>
            {data?.writeUrl ? (
              <External href={data.writeUrl} className="room-pill gr__btn">
                Write a review
              </External>
            ) : null}
          </div>

          {tripadvisor ? (
            <a
              className="gr__also"
              href={tripadvisor}
              target="_blank"
              rel="noopener noreferrer"
            >
              Also reviewed on Tripadvisor
            </a>
          ) : null}
        </header>

        {reviews.length ? (
          <ol className="gr__ledger" aria-label="Recent reviews from Google">
            {reviews.map((review, index) => (
              <li key={`${review.author}-${index}`} className="gr__entry">
                <figure className="gr__card">
                  <figcaption className="gr__who">
                    <span className="gr__avatar" aria-hidden="true">
                      {review.photo ? (
                        // Google's own profile photo; next/image is not configured for this host.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={review.photo}
                          alt=""
                          width={40}
                          height={40}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span>{review.author.charAt(0).toUpperCase()}</span>
                      )}
                    </span>
                    <span className="gr__who-text">
                      <cite className="gr__author">
                        {review.authorUrl ? (
                          <a
                            href={review.authorUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                          >
                            {review.author}
                          </a>
                        ) : (
                          review.author
                        )}
                      </cite>
                      <span className="gr__rating-line">
                        <Stars value={review.rating} size="sm" id={`${placement}-${index}`} />
                        {review.when ? <span className="gr__when">{review.when}</span> : null}
                      </span>
                    </span>
                    <GoogleMark className="gr__g gr__g--entry" />
                  </figcaption>
                  <blockquote className="gr__quote">
                    <p>{review.text}</p>
                  </blockquote>
                  {review.url ? (
                    <a
                      className="gr__more"
                      href={review.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      Read on Google
                      <span className="gr__sr"> — review by {review.author}</span>
                    </a>
                  ) : null}
                </figure>
              </li>
            ))}
          </ol>
        ) : null}
      </div>

      {reviews.length ? (
        <p className="gr__source">
          Ratings and reviews from Google Maps, shown as written by guests.
        </p>
      ) : null}
    </section>
  );
}
