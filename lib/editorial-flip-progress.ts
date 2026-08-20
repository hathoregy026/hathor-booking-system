const clamp = (value: number) => Math.max(0, Math.min(1, value));

const smootherstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/**
 * Image-pair wipe progress that finishes while the frame is still on screen.
 * 0 as the leading edge reaches the viewport; 1 after about half a viewport
 * of travel — not after the frame has already left.
 */
export function editorialFlipProgress(
  rect: DOMRect,
  mode: "horizontal" | "vertical",
): number {
  const viewport =
    mode === "horizontal" ? window.innerWidth : window.innerHeight;
  const start = mode === "horizontal" ? rect.left : rect.top;
  const traveled = viewport - start;
  const runway = viewport * 0.5;
  return smootherstep(0.04, 0.92, clamp(traveled / Math.max(1, runway)));
}
