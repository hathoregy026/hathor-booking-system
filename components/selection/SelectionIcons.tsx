/**
 * Hathor selection marks.
 *
 * Purpose-drawn rather than borrowed from a generic icon set: the heart is
 * softer and slightly asymmetric so it sits with the editorial script faces,
 * and the add mark is an engraved ring-and-cross rather than a compass or a
 * shopping glyph. Both share one geometry (24 box, 1.4 stroke, round caps) so
 * Save and Add always read as a matching pair wherever they appear together.
 *
 * Server-safe: pure SVG, no hooks, no "use client" needed.
 */

type IconProps = {
  className?: string;
  /** Intrinsic size in px. CSS width/height still wins where a class sets it. */
  size?: number;
  /** Solid fill for the active state. Stroke is unchanged, so nothing reflows. */
  filled?: boolean;
};

const BASE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": "true" as const,
  focusable: "false" as const,
};

/** Save to Favorites. */
export function HathorHeartIcon({ className, size = 18, filled = false }: IconProps) {
  return (
    <svg {...BASE} className={className} width={size} height={size}>
      <path
        d="M12 20.3c-.35 0-6.2-3.6-8.05-7.35C2.4 9.9 3.65 6.1 6.9 5.3c2-.5 3.9.4 5.1 2.05 1.2-1.65 3.1-2.55 5.1-2.05 3.25.8 4.5 4.6 2.95 7.65C18.2 16.7 12.35 20.3 12 20.3Z"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

/** Add to My Voyage. */
export function HathorAddIcon({ className, size = 18, filled = false }: IconProps) {
  return (
    <svg {...BASE} className={className} width={size} height={size}>
      <circle cx="12" cy="12" r="8.4" fill={filled ? "currentColor" : "none"} />
      <path d="M12 8.1v7.8" stroke={filled ? "var(--hathor-mark-inset, #ece8df)" : "currentColor"} />
      <path d="M8.1 12h7.8" stroke={filled ? "var(--hathor-mark-inset, #ece8df)" : "currentColor"} />
    </svg>
  );
}

/** Selected state for My Voyage — the ring keeps its weight, the cross becomes a tick. */
export function HathorSelectedIcon({ className, size = 18 }: IconProps) {
  return (
    <svg {...BASE} className={className} width={size} height={size}>
      <circle cx="12" cy="12" r="8.4" fill="currentColor" />
      <path
        d="m8.4 12.2 2.5 2.5 4.7-4.9"
        stroke="var(--hathor-mark-inset, #ece8df)"
      />
    </svg>
  );
}
