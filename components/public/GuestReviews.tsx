import {
  GOOGLE_REVIEWS_FALLBACK_URL,
  loadGuestReviews,
  tripadvisorUrl,
  type GuestReviewsData,
} from "@/lib/guest-reviews";
import { loadTripadvisorReviews } from "@/lib/tripadvisor-reviews";
import { GuestBook } from "@/components/public/guest-reviews/GuestBook";
import "@/app/guest-reviews.css";

type GuestReviewsProps = {
  /** Home sits in the editorial document; room pages close on it before the footer. */
  placement: "home" | "room";
};

/**
 * Guest reviews — the live Google and Tripadvisor ratings and the reviews
 * each returns, written into the Hathor guest book. Without either key it
 * still invites visitors to read the reviews at the source.
 */
export async function GuestReviews({ placement }: GuestReviewsProps) {
  const [google, tripadvisor] = await Promise.all([
    loadGuestReviews(),
    loadTripadvisorReviews(),
  ]);
  const tripadvisorLink = tripadvisorUrl();
  const headingId = `gr-title-${placement}`;

  const sources = [google, tripadvisor].filter((data): data is GuestReviewsData => data !== null);

  return (
    <section className={`gr gr--${placement}`} aria-labelledby={headingId}>
      <GuestBook
        sources={sources}
        headingId={headingId}
        fallback={{ googleUrl: GOOGLE_REVIEWS_FALLBACK_URL, tripadvisorUrl: tripadvisorLink }}
      />
    </section>
  );
}
