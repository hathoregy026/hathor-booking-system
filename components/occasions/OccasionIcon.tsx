import type { ReactNode } from "react";
import type { OccasionIconName } from "@/lib/occasions";

/* 24-unit fine-line drawings; stars, sparkles and rays are computed so their geometry stays exact. */
const f2 = (n: number) => n.toFixed(2);

function polar(cx: number, cy: number, r: number, a: number): [number, number] {
  return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
}

export function starPath(cx: number, cy: number, outer: number, inner: number, points: number): string {
  let d = "";
  for (let i = 0; i < points * 2; i += 1) {
    const [x, y] = polar(cx, cy, i % 2 ? inner : outer, -Math.PI / 2 + (i * Math.PI) / points);
    d += `${i ? "L" : "M"}${f2(x)} ${f2(y)}`;
  }
  return `${d}Z`;
}

export function sparkPath(cx: number, cy: number, r: number): string {
  const q = r * 0.16;
  return (
    `M${cx} ${cy - r}Q${cx + q} ${cy - q} ${cx + r} ${cy}` +
    `Q${cx + q} ${cy + q} ${cx} ${cy + r}Q${cx - q} ${cy + q} ${cx - r} ${cy}` +
    `Q${cx - q} ${cy - q} ${cx} ${cy - r}Z`
  );
}

/** Rays from r1 to r2; with `short`, every other ray stops at `short`. */
function raysPath(cx: number, cy: number, r1: number, r2: number, n: number, short = 0): string {
  let d = "";
  for (let i = 0; i < n; i += 1) {
    const a = (i * 2 * Math.PI) / n;
    const [x1, y1] = polar(cx, cy, r1, a);
    const [x2, y2] = polar(cx, cy, i % 2 && short ? short : r2, a);
    d += `M${f2(x1)} ${f2(y1)}L${f2(x2)} ${f2(y2)}`;
  }
  return d;
}

function ringDots(cx: number, cy: number, r: number, n: number, offset: number): ReactNode {
  return Array.from({ length: n }, (_, i) => {
    const [x, y] = polar(cx, cy, r, offset + (i * 2 * Math.PI) / n);
    return <circle key={i} cx={f2(x)} cy={f2(y)} r={0.8} fill="currentColor" stroke="none" />;
  });
}

const FLUTE = "a1.6 1.6 0 0 1-3.2 0z";

const DRAWINGS: Record<OccasionIconName, () => ReactNode> = {
  sparkle: () => (
    <>
      <path d={sparkPath(10, 12, 7.6)} />
      <path d={sparkPath(18.6, 5, 2.8)} />
      <path d={sparkPath(18.4, 18.6, 2.2)} />
    </>
  ),
  star: () => <path d={starPath(12, 12.8, 9.4, 3.9, 5)} />,
  firework: () => (
    <>
      <path d={raysPath(12, 12, 3.6, 8.2, 8)} />
      {ringDots(12, 12, 10.4, 8, Math.PI / 8)}
      <circle cx="12" cy="12" r="1.1" />
    </>
  ),
  glasses: () => (
    <>
      <g transform="rotate(-12 9 12)">
        <path d={`M6.6 3h4.2l-.5 5.6${FLUTE}M8.7 10.3v8.6M6.6 19h4.2`} />
      </g>
      <g transform="rotate(12 15 12)">
        <path d={`M13.2 3h4.2l-.5 5.6${FLUTE}M15.3 10.3v8.6M13.2 19h4.2`} />
      </g>
      <path d="M12 .9v1.5M9.9 1.6l.6.9M14.1 1.6l-.6.9" />
    </>
  ),
  hourglass: () => (
    <path d="M6.5 3h11M6.5 21h11M8 3c0 4.6 4 5.4 4 9s-4 4.4-4 9M16 3c0 4.6-4 5.4-4 9s4 4.4 4 9M9.8 18.6h4.4" />
  ),
  clock: () => (
    <>
      <circle cx="12" cy="12.6" r="8" />
      <path d="M12 8.2v4.4l2.8 1.8M9.6 2.6h4.8" />
    </>
  ),
  boat: () => <path d="M2.5 16.5h19l-2.2 3.5H4.7zM9.5 16.5V3M9.5 3.8 16.8 15H9.5M9.5 6.5 4.2 15h5.3" />,
  sun: () => (
    <>
      <circle cx="12" cy="12" r="3.8" />
      <path d={raysPath(12, 12, 6.2, 9.8, 12, 8.2)} />
    </>
  ),
  hathor: () => (
    <>
      <path d="M5.4 3.2C2.6 6.4 2.4 12.2 6 16.2c1.6 1.8 3.8 2.8 6 2.8s4.4-1 6-2.8c3.6-4 3.4-9.8.6-13" />
      <circle cx="12" cy="10.6" r="4.6" />
      <path d="M9.6 21.2h4.8" />
    </>
  ),
  lotus: () => (
    <path d="M12 6c1.9 2.2 2.7 4.6 2.7 7.2S13.6 17.8 12 19c-1.6-1.2-2.7-3.2-2.7-5.8S10.1 8.2 12 6zM9.6 10.4C7.2 9.6 4.8 9.8 3 10.6c.6 3.8 3.6 7.6 9 8.4M14.4 10.4c2.4-.8 4.8-.6 6.6.2-.6 3.8-3.6 7.6-9 8.4M5 21h14" />
  ),
  crescent: () => (
    <>
      <path d="M15.6 3.4A8.9 8.9 0 1 0 20.6 15.8 7.3 7.3 0 0 1 15.6 3.4Z" />
      <path d={sparkPath(19.4, 8.8, 2.4)} />
    </>
  ),
  lantern: () => (
    <path d="M12 2.2v1.6M10 5.4a2 2 0 0 1 4 0M8.6 5.4h6.8l1.4 2.6H7.2zM7.2 8 6.2 11v5.6l1 2.4h9.6l1-2.4V11l-1-3M6.2 11h11.6M6.2 16.6h11.6M10 8.4l-.6 8M14 8.4l.6 8M9.5 19l.7 1.8h3.6l.7-1.8M12 20.8v1.4" />
  ),
  tree: () => (
    <>
      <path d="M12 5 8.4 9.4h2.2l-3.2 4.2h2.4L6 18.2h12l-3.8-4.6h2.4l-3.2-4.2h2.2zM12 18.2v3" />
      <path d={sparkPath(12, 2.6, 1.7)} />
    </>
  ),
  gift: () => (
    <path d="M4.5 10.5h15v10h-15zM3.5 7.5h17v3h-17zM12 7.5v13M12 7.5S10.8 4 8.6 4C7.3 4 6.6 5 7 6c.5 1.2 2.6 1.5 5 1.5zm0 0s1.2-3.5 3.4-3.5c1.3 0 2 1 1.6 2-.5 1.2-2.6 1.5-5 1.5z" />
  ),
  bauble: () => (
    <>
      <circle cx="12" cy="14.2" r="6.6" />
      <path d="M10.3 5.6h3.4v2.1h-3.4zM12 5.6V3.6M5.8 12.4c4.1 1.6 8.3 1.6 12.4 0" />
    </>
  ),
  bell: () => <path d="M6 16.8V11a6 6 0 0 1 12 0v5.8l1.6 1.7H4.4zM10.1 20.6a2.1 2.1 0 0 0 3.8 0M12 3v2" />,
  heart: () => (
    <path d="M12 20.2C7 16.8 3.5 13.6 3.5 9.6 3.5 7 5.5 5 8 5c1.7 0 3.1.9 4 2.3C12.9 5.9 14.3 5 16 5c2.5 0 4.5 2 4.5 4.6 0 4-3.5 7.2-8.5 10.6z" />
  ),
  flag: () => <path d="M5 21V3.5M5 4.5c2.3-1.3 4.6-1.3 7 0s4.7 1.3 7 0v8c-2.3 1.3-4.6 1.3-7 0s-4.7-1.3-7 0" />,
};

export function OccasionIcon({ name }: { name: OccasionIconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {(DRAWINGS[name] ?? DRAWINGS.sparkle)()}
    </svg>
  );
}
