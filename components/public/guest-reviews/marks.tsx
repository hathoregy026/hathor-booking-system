/** Platform marks and rating glyphs for guest reviews; usable from server and client components. */

import type { GuestReviewsData } from "@/lib/guest-reviews";

export type ReviewSource = GuestReviewsData["source"];

export const SOURCE_LABEL: Record<ReviewSource, string> = {
  google: "Google",
  tripadvisor: "Tripadvisor",
};

const STAR_PATH =
  "M12 2.6l2.82 6.06 6.63.72-4.93 4.5 1.36 6.53L12 17.1l-5.88 3.3 1.36-6.53-4.93-4.5 6.63-.72z";

/** Google's "G" mark, used as the source attribution the Places terms ask for. */
export function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/** Tripadvisor's rating bubble in its green, as a small source mark beside the name. */
export function TripadvisorMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="#00AA6C" strokeWidth="2" />
      <circle cx="12" cy="12" r="6.5" fill="#00AA6C" />
    </svg>
  );
}

export function SourceMark({ source, className }: { source: ReviewSource; className?: string }) {
  return source === "google" ? (
    <GoogleMark className={className} />
  ) : (
    <TripadvisorMark className={className} />
  );
}

/** Google shows stars; Tripadvisor shows its five bubbles. Same reading either way. */
export function Rating({
  value,
  size,
  id,
  source,
}: {
  value: number;
  size: "lg" | "sm";
  id: string;
  source: ReviewSource;
}) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span
      className={`gr__stars gr__stars--${size} gr__stars--${source}`}
      role="img"
      aria-label={`Rated ${value.toFixed(1)} out of 5 on ${SOURCE_LABEL[source]}`}
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
            {source === "google" ? (
              <>
                <path className="gr__star-ground" d={STAR_PATH} />
                {fill !== "none" ? (
                  <path
                    className="gr__star-fill"
                    d={STAR_PATH}
                    clipPath={fill === "half" ? `url(#${clip})` : undefined}
                  />
                ) : null}
              </>
            ) : (
              <>
                <circle className="gr__bubble-ring" cx="12" cy="12" r="9.5" />
                {fill !== "none" ? (
                  <circle
                    className="gr__bubble-fill"
                    cx="12"
                    cy="12"
                    r="9.5"
                    clipPath={fill === "half" ? `url(#${clip})` : undefined}
                  />
                ) : null}
              </>
            )}
          </svg>
        );
      })}
    </span>
  );
}
