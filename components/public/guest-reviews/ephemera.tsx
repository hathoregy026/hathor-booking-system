import { useId } from "react";

/*
 * The travel-journal ephemera around the guest book: botanical line drawings,
 * a worn postal stamp and pencilled notes. Every piece is decorative and
 * hidden from assistive technology; the reviews carry the content.
 */

const INK = "#4a3c27";

/** A sketched date palm, for the corner of the phone's journal page. */
export function PalmTree({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 260 360" aria-hidden="true" focusable="false">
      <g fill="none" stroke={INK} strokeLinecap="round">
        <path d="M150 352 C 146 290, 140 220, 132 150" strokeWidth="2.4" />
        <path d="M160 352 C 156 290, 150 220, 140 150" strokeWidth="1.4" />
        {Array.from({ length: 18 }, (_, i) => {
          const y = 340 - i * 10.5;
          const x = 149 - i * 0.95;
          return <path key={i} d={`M${x - 6} ${y} q 8 -4 16 1`} strokeWidth="0.9" />;
        })}
      </g>
      {[
        { r: -150, s: 0.62 },
        { r: -118, s: 0.7 },
        { r: -82, s: 0.66 },
        { r: -48, s: 0.7 },
        { r: -18, s: 0.62 },
        { r: 12, s: 0.52 },
        { r: 168, s: 0.5 },
      ].map(({ r, s }, i) => (
        <g key={i} transform={`translate(136 150) rotate(${r}) scale(${s}) translate(-20 -300)`}>
          <PalmFrondPaths />
        </g>
      ))}
    </svg>
  );
}

/** The frond's paths without its own svg, for composing the palm tree. */
function PalmFrondPaths() {
  const out: string[] = [];
  const at = (t: number) => ({ x: 20 + 230 * t + Math.sin(t * Math.PI) * 26, y: 300 - 270 * t - Math.sin(t * Math.PI) * 22 });
  for (let i = 1; i <= 20; i++) {
    const t = i / 21;
    const p = at(t);
    const q = at(Math.min(1, t + 0.02));
    const ang = Math.atan2(q.y - p.y, q.x - p.x);
    const len = 30 + 60 * Math.sin(Math.PI * Math.min(1, t * 1.15));
    for (const side of [-1, 1]) {
      const a = ang + side * (1.1 - t * 0.4);
      out.push(`M${p.x.toFixed(1)} ${p.y.toFixed(1)} q ${(Math.cos(a) * len * 0.5).toFixed(1)} ${(Math.sin(a) * len * 0.5).toFixed(1)} ${(Math.cos(a) * len).toFixed(1)} ${(Math.sin(a) * len + len * 0.3).toFixed(1)}`);
    }
  }
  const rachis = Array.from({ length: 21 }, (_, i) => at(i / 20)).map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  return (
    <g fill="none" stroke={INK} strokeLinecap="round">
      <path d={rachis} strokeWidth="3" />
      {out.map((d, i) => (
        <path key={i} d={d} strokeWidth="1.3" />
      ))}
    </g>
  );
}

/** A circular cancellation stamp, inked unevenly as if pressed onto the page. */
export function Stamp({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 140 140" aria-hidden="true" focusable="false">
      <defs>
        <path id={`gb-ring-${id}`} d="M70 70 m -45 0 a 45 45 0 1 1 90 0 a 45 45 0 1 1 -90 0" />
        <filter id={`gb-worn-${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="grain" />
          <feDisplacementMap in="SourceGraphic" in2="grain" scale="2.2" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="9" result="blot" />
          <feColorMatrix in="blot" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.4" result="mask" />
          <feComposite in="rough" in2="mask" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#gb-worn-${id})`} transform="rotate(-14 70 70)">
        <g fill="none" stroke={INK}>
          <circle cx="70" cy="70" r="63" strokeWidth="2.2" />
          <circle cx="70" cy="70" r="59.5" strokeWidth="0.9" />
          <circle cx="70" cy="70" r="33" strokeWidth="1.2" />
          <path d="M71 92 C 70 82, 69 70, 72 57" strokeWidth="1.6" />
          <path d="M72 57 q -10 -3 -17 6 M72 57 q 9 -5 17 2 M72 57 q -5 -9 -13 -10 M72 57 q 4 -9 12 -10 M72 57 q 0 -7 -2 -12 M72 57 q -12 3 -15 12 M72 57 q 11 2 15 11" strokeWidth="1.2" />
          <path d="M50 93 q 20 -4 42 0" strokeWidth="1" />
        </g>
        <text fill={INK} fontSize="13" fontFamily="Georgia, 'Times New Roman', serif">
          {/* Fitted to the ring's circumference (2π × 45) so the legend closes on itself. */}
          <textPath href={`#gb-ring-${id}`} textLength="276" lengthAdjust="spacing">
            NILE CRUISE · EGYPT · NILE CRUISE · EGYPT ·
          </textPath>
        </text>
      </g>
    </svg>
  );
}

/**
 * A pencilled note. Each line is placed by hand — offset, slightly turned —
 * and the graphite is roughened so it reads as written, not typeset.
 */
export function HandNote({
  lines,
  className,
  width,
  height,
  rotate = -12,
  underline = false,
}: {
  lines: { text: string; x: number; y: number; r?: number }[];
  className?: string;
  width: number;
  height: number;
  rotate?: number;
  underline?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const last = lines[lines.length - 1]!;
  return (
    <svg className={className} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
      <defs>
        <filter id={`gb-pencil-${id}`} x="-5%" y="-20%" width="110%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="3" result="g" />
          <feDisplacementMap in="SourceGraphic" in2="g" scale="1.3" result="d" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.55" result="tooth" />
          <feComposite in="d" in2="tooth" operator="in" />
        </filter>
      </defs>
      <g transform={`rotate(${rotate} ${width / 2} ${height / 2})`} filter={`url(#gb-pencil-${id})`} fill="#4f4333">
        {lines.map((line, i) => (
          <text
            key={i}
            x={line.x}
            y={line.y}
            transform={line.r ? `rotate(${line.r} ${line.x} ${line.y})` : undefined}
            fontFamily="'Gr Hand', 'Brush Script MT', cursive"
            fontSize="38"
          >
            {line.text}
          </text>
        ))}
        {underline ? (
          <path
            d={`M${last.x + 30} ${last.y + 12} q 40 -2 78 -10`}
            fill="none"
            stroke="#4f4333"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        ) : null}
      </g>
    </svg>
  );
}
