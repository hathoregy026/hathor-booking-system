"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/** One page of the book, as fractions of the book's width and height. */
export type PageRect = { x0: number; y0: number; x1: number; y1: number };

type Point = { x: number; y: number };

const DURATION = 1250;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** The part of a convex polygon on one side of a line (n · p ≥ c, or ≤ c). */
function clipToHalfPlane(poly: Point[], n: Point, c: number, keepPositive: boolean): Point[] {
  const side = (p: Point) => (n.x * p.x + n.y * p.y - c) * (keepPositive ? 1 : -1);
  const out: Point[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!;
    const b = poly[(i + 1) % poly.length]!;
    const sa = side(a);
    const sb = side(b);
    if (sa >= 0) out.push(a);
    if (sa * sb < 0) {
      const t = sa / (sa - sb);
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  return out;
}

const toClip = (poly: Point[]) =>
  poly.length < 3 ? "polygon(0 0, 0 0, 0 0)" : `polygon(${poly.map((p) => `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`).join(", ")})`;

/**
 * A page peeled from its bottom-right corner, the way a sheet is turned by
 * hand: the corner lifts and folds back across the page, showing the paper's
 * reverse with its shadow, until the whole leaf has turned away and the page
 * beneath is read. Played backwards, an earlier page is laid back down.
 *
 * The fold is the perpendicular bisector between the corner and where the
 * hand has drawn it; the leaf is the page on the far side of the fold, and
 * the flap is the near side reflected across it.
 */
export function PageCurl({
  rect,
  reverse,
  delay = 0,
  onDone,
  children,
}: {
  rect: PageRect;
  reverse: boolean;
  delay?: number;
  onDone?: () => void;
  children: ReactNode;
}) {
  const leaf = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const flapWrap = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  useLayoutEffect(() => {
    done.current = onDone;
  });

  useLayoutEffect(() => {
    const leafEl = leaf.current;
    const flapEl = flap.current;
    const wrapEl = flapWrap.current;
    const box = leafEl?.parentElement;
    if (!leafEl || !flapEl || !wrapEl || !box) return;

    const W = box.clientWidth;
    const H = box.clientHeight;
    const x0 = rect.x0 * W;
    const y0 = rect.y0 * H;
    const x1 = rect.x1 * W;
    const y1 = rect.y1 * H;
    const page: Point[] = [
      { x: x0, y: y0 },
      { x: x1, y: y0 },
      { x: x1, y: y1 },
      { x: x0, y: y1 },
    ];
    const corner = { x: x1, y: y1 };
    const far = { x: x0, y: y0 };
    const ph = y1 - y0;

    const draw = (p: number) => {
      if (p <= 0.0001) {
        leafEl.style.clipPath = toClip(page);
        wrapEl.style.opacity = "0";
        return;
      }
      // The hand draws the corner up and across, a little above the diagonal.
      const lift = Math.sin(p * Math.PI) * ph * 0.18;
      const m = {
        x: corner.x + (far.x - corner.x) * 2.02 * p,
        y: corner.y + (far.y - corner.y) * 2.02 * p - lift,
      };
      const dx = m.x - corner.x;
      const dy = m.y - corner.y;
      const len = Math.hypot(dx, dy) || 1;
      const n = { x: dx / len, y: dy / len };
      const q = { x: (corner.x + m.x) / 2, y: (corner.y + m.y) / 2 };
      const c = n.x * q.x + n.y * q.y;

      leafEl.style.clipPath = toClip(clipToHalfPlane(page, n, c, true));

      // The folded-over part, but only what still lies over the page: a real
      // sheet folded back covers the page, it never sails off the book.
      const folded = clipToHalfPlane(page, n, c, false);
      const mirrored = folded.map((pt) => {
        const k = 2 * (n.x * pt.x + n.y * pt.y - c);
        return { x: pt.x - k * n.x, y: pt.y - k * n.y };
      });
      let onPage = mirrored;
      for (const [nx, ny, cc] of [
        [1, 0, x0],
        [-1, 0, -x1],
        [0, 1, y0],
        [0, -1, -y1],
      ] as const) {
        onPage = clipToHalfPlane(onPage, { x: nx, y: ny }, cc, true);
      }
      // Back into the flap's own (unreflected) coordinates.
      const unmirrored = onPage.map((pt) => {
        const k = 2 * (n.x * pt.x + n.y * pt.y - c);
        return { x: pt.x - k * n.x, y: pt.y - k * n.y };
      });
      flapEl.style.clipPath = toClip(unmirrored);
      // Reflection across the fold: x' = x − 2((x − q) · n) n.
      const a = 1 - 2 * n.x * n.x;
      const b = -2 * n.x * n.y;
      const d = 1 - 2 * n.y * n.y;
      flapEl.style.transform = `matrix(${a}, ${b}, ${b}, ${d}, ${2 * c * n.x}, ${2 * c * n.y})`;
      // Light falls across the reverse of the paper from the fold outwards.
      const angle = (Math.atan2(n.y, n.x) * 180) / Math.PI + 90;
      flapEl.style.setProperty("--gb-flap-angle", `${angle}deg`);
      wrapEl.style.opacity = String(p > 0.85 ? Math.max(0, (1 - p) / 0.15) : 1);
      // The roll of the paper near the fold: a light band then a shadow.
      flapEl.style.setProperty("--gb-fold-x", `${(q.x / W) * 100}%`);
      flapEl.style.setProperty("--gb-fold-y", `${(q.y / H) * 100}%`);
    };

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      draw(reverse ? 0 : 1);
      done.current?.();
      return;
    }

    let frame = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, Math.max(0, (now - start - delay) / DURATION));
      const p = ease(t);
      draw(reverse ? 1 - p : p);
      if (t < 1) frame = requestAnimationFrame(tick);
      else done.current?.();
    };
    draw(reverse ? 1 : 0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [rect, reverse, delay]);

  return (
    <>
      <div ref={leaf} className="gb__curl" aria-hidden="true">
        {children}
      </div>
      <div ref={flapWrap} className="gb__flap-wrap" aria-hidden="true">
        <div ref={flap} className="gb__flap" />
      </div>
    </>
  );
}
