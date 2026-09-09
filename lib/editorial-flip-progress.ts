const clamp = (value: number) => Math.max(0, Math.min(1, value));

const smootherstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/**
 * Image-pair wipe progress that finishes while the frame is still on screen.
 * 0 as the leading edge reaches the viewport; 1 after about half a viewport
 * of travel — not after the frame has already left.
 *
 * `anchor` picks what the curve is measured against:
 *
 *   "edge"   — the default, and what every other editorial page is timed
 *              against: 0 as the leading edge arrives, done half a viewport
 *              later.
 *   "centre" — the pair is exactly half wiped when the frame is centred on
 *              the stage, whatever its width. A fraction of the frame's own
 *              size cannot do this: a 600px frame and a full-bleed one need
 *              very different delays to land on the same beat, so the anchor
 *              has to be the centre itself.
 */
export function editorialFlipProgress(
  rect: DOMRect,
  mode: "horizontal" | "vertical",
  anchor: "edge" | "centre" = "edge",
): number {
  const viewport =
    mode === "horizontal" ? window.innerWidth : window.innerHeight;
  const start = mode === "horizontal" ? rect.left : rect.top;
  const size = mode === "horizontal" ? rect.width : rect.height;

  if (anchor === "centre") {
    const centre = start + size / 2;
    const raw = 0.5 + (viewport / 2 - centre) / (viewport * 0.9);
    return smootherstep(0.04, 0.92, clamp(raw));
  }

  const traveled = viewport - start;
  const runway = viewport * 0.5;
  return smootherstep(0.04, 0.92, clamp(traveled / Math.max(1, runway)));
}
