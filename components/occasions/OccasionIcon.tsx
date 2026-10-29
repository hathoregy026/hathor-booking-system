import type { OccasionIconName } from "@/lib/occasions";

/* 24-unit fine-line drawings; sparkles and rays are computed so their geometry stays exact. */
const f2 = (n: number) => n.toFixed(2);

function sparkPath(cx: number, cy: number, r: number): string {
  const q = r * 0.16;
  return (
    `M${cx} ${cy - r}Q${cx + q} ${cy - q} ${cx + r} ${cy}` +
    `Q${cx + q} ${cy + q} ${cx} ${cy + r}Q${cx - q} ${cy + q} ${cx - r} ${cy}` +
    `Q${cx - q} ${cy - q} ${cx} ${cy - r}Z`
  );
}

function raysPath(cx: number, cy: number, r1: number, r2: number, n: number): string {
  let d = "";
  for (let i = 0; i < n; i += 1) {
    const a = (i * 2 * Math.PI) / n;
    d += `M${f2(cx + Math.cos(a) * r1)} ${f2(cy + Math.sin(a) * r1)}`;
    d += `L${f2(cx + Math.cos(a) * r2)} ${f2(cy + Math.sin(a) * r2)}`;
  }
  return d;
}

const PATHS: Record<OccasionIconName, string[]> = {
  sparkle: [sparkPath(10, 12, 7.6), sparkPath(18.6, 5, 2.8), sparkPath(18.4, 18.6, 2.2)],
  hourglass: [
    "M6.5 3h11M6.5 21h11M8 3c0 4.6 4 5.4 4 9s-4 4.4-4 9M16 3c0 4.6-4 5.4-4 9s4 4.4 4 9M9.8 18.6h4.4",
  ],
  boat: ["M2.5 16.5h19l-2.2 3.5H4.7zM9.5 16.5V3M9.5 3.8 16.8 15H9.5M9.5 6.5 4.2 15h5.3"],
  glasses: [
    "M12 .9v1.5M9.9 1.6l.6.9M14.1 1.6l-.6.9",
  ],
  firework: [raysPath(12, 12, 3.6, 8.2, 8)],
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
      {name === "glasses" ? (
        <>
          <g transform="rotate(-12 9 12)">
            <path d="M6.6 3h4.2l-.5 5.6a1.6 1.6 0 0 1-3.2 0zM8.7 10.3v8.6M6.6 19h4.2" />
          </g>
          <g transform="rotate(12 15 12)">
            <path d="M13.2 3h4.2l-.5 5.6a1.6 1.6 0 0 1-3.2 0zM15.3 10.3v8.6M13.2 19h4.2" />
          </g>
        </>
      ) : null}
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
      {name === "firework" ? <circle cx="12" cy="12" r="1.1" /> : null}
    </svg>
  );
}
