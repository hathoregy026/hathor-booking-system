/**
 * Hathor selection marks — drawn to the supplied reference: a solid gold heart
 * and a gold shopping cart, both taking colour from the surrounding text
 * (currentColor) so they inherit the header's gold.
 *
 * Count badges are NOT part of these marks — the consuming component's CSS
 * draws them, so a badge can overlap the icon box without changing it.
 *
 * Server-safe: pure SVG, no hooks, no "use client" needed.
 */

type IconProps = {
  className?: string;
  /** Intrinsic size in px. CSS width/height still wins where a class sets it. */
  size?: number;
  /** Solid (active) vs outline (inactive). */
  filled?: boolean;
};

const BASE = {
  viewBox: "0 0 24 24",
  "aria-hidden": "true" as const,
  focusable: "false" as const,
};

/**
 * Favorites. Solid by default — the reference heart is a filled gold
 * silhouette. The outline variant is used on cards, where saved vs not-saved
 * must read at a glance; the silhouette is identical in both states, so
 * toggling never shifts layout.
 */
export function HathorHeartIcon({
  className,
  size = 20,
  filled = true,
}: IconProps) {
  return (
    <svg {...BASE} className={className} width={size} height={size}>
      <path
        d="M12 21.1 10.6 19.8C5.5 15.2 2.2 12.2 2.2 8.5 2.2 5.5 4.6 3.1 7.6 3.1c1.7 0 3.3.8 4.4 2.05C13.1 3.9 14.7 3.1 16.4 3.1c3 0 5.4 2.4 5.4 5.4 0 3.7-3.3 6.7-8.4 11.31L12 21.1Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * My Voyage. A classic cart, as supplied in the reference: sloping handle,
 * trapezoid basket, two solid wheels.
 */
export function HathorCartIcon({
  className,
  size = 20,
  filled = false,
}: IconProps) {
  return (
    <svg {...BASE} className={className} width={size} height={size}>
      <path
        d="M1.9 3.1h2.35a.9.9 0 0 1 .88.71l.42 2.03"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.55 5.84h16.05l-2.02 8.2a.9.9 0 0 1-.87.68H8.2a.9.9 0 0 1-.88-.7L5.55 5.84Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.4" cy="19.4" r="1.75" fill="currentColor" />
      <circle cx="17.6" cy="19.4" r="1.75" fill="currentColor" />
    </svg>
  );
}

/** @deprecated Kept so earlier imports resolve. Use HathorCartIcon. */
export const HathorAddIcon = HathorCartIcon;
