/*
 * Hathor in profile — stern left, bow right — for the charter opening.
 * The same drawing language as the deck plan (60 m general arrangement and the
 * river photographs), but static: here every deck is "taken", so the gold
 * wash sweeps the whole hull from stern to bow instead of picking one level.
 * Units: 1 ≈ 0.1 m. Levels: sun 0–24, main 24–52, lower 52–100, waterline 100.
 */

const range = (from: number, to: number, step: number) =>
  Array.from({ length: Math.floor((to - from) / step + 1e-6) + 1 }, (_, index) => from + index * step);

const MAIN_WINDOWS = range(26, 356, 22);
const CABIN_PAIRS = range(30, 446, 26);
const SUN_POSTS = range(20, 380, 12);
const TERRACE_POSTS = range(382, 470, 11);
const FORE_POSTS = range(492, 588, 12);
const PARASOLS = [176, 212, 248, 300, 336];

/* The hull silhouette, used once for the gold wash. */
const HULL = "M20 0H380V42H470V78H598C596 86 590 94 578 100H24L14 94V78H20Z";

/* One ship per page, so a fixed id is safe for the reveal clip. */
const REVEAL_ID = "chr-ship-reveal";

export function CharterShipProfile({ label }: { label: string }) {
  return (
    <svg className="chr-ship" viewBox="4 -4 604 112" role="img" aria-label={label} focusable="false">
      <defs>
        <clipPath id={REVEAL_ID}>
          <rect className="chr-ship__reveal" x="4" y="-4" width="604" height="112" />
        </clipPath>
      </defs>
      <path className="chr-ship__wash" d={HULL} clipPath={`url(#${REVEAL_ID})`} />

      <g className="chr-ship__lines">
        {/* sun deck: pergola, round bar canopy, parasols */}
        <path d="M20 0H380V24H20Z" />
        <path d="M20 12H380" />
        {SUN_POSTS.map(x => <path key={x} className="chr-ship__fine" d={`M${x} 12V24`} />)}
        <path d="M22 1H92" />
        {range(26, 88, 8).map(x => <path key={x} className="chr-ship__fine" d={`M${x} 1V4`} />)}
        {[24, 57, 90].map(x => <path key={x} d={`M${x} 1V24`} />)}
        <path d="M112 3.5H152" />
        <path className="chr-ship__fine" d="M116 3.5Q132 -1 148 3.5" />
        <path d="M132 3.5V24" />
        {PARASOLS.map(x => (
          <g key={x} className="chr-ship__fine">
            <path d={`M${x} 4V24`} />
            <path d={`M${x} 5L${x + 2.2} 11L${x} 15L${x - 2.2} 11Z`} />
          </g>
        ))}

        {/* main deck: panoramic glazing, forward terrace, stairs */}
        <path d="M20 52V24H380V52" />
        {MAIN_WINDOWS.map(x => <rect key={x} className="chr-ship__pane" x={x} y="28.5" width="18" height="19" />)}
        <path d="M380 42H470" />
        {TERRACE_POSTS.map(x => <path key={x} className="chr-ship__fine" d={`M${x} 42V52`} />)}
        <path d="M380 24L438 52" />
        <path className="chr-ship__fine" d="M380 16L438 44" />

        {/* lower deck: paired cabin windows, foredeck, wheelhouse, boot-top */}
        <path d="M20 78V52H470V78" />
        <path d="M14 78H598C596 86 590 94 578 100H24L14 94Z" />
        <path className="chr-ship__boot" d="M14 89H593C590 94 585 97 578 100H24L14 94Z" />
        {CABIN_PAIRS.map(x => (
          <g key={x}>
            <rect className="chr-ship__pane" x={x} y="58" width="8" height="12" />
            <rect className="chr-ship__pane" x={x + 11} y="58" width="8" height="12" />
          </g>
        ))}
        <path d="M470 52L486 78" />
        <path d="M490 70H592" />
        {FORE_POSTS.map(x => <path key={x} className="chr-ship__fine" d={`M${x} 70V78`} />)}
        <path d="M512 78V60H540V78" />
        <path d="M506 60H546L541 55H511Z" />
        {[515, 523, 531].map(x => <rect key={x} className="chr-ship__pane" x={x} y="63" width="5.5" height="6" />)}
      </g>

      <g className="chr-ship__water">
        <path d="M-10 100H620" />
        <path className="chr-ship__wake" d="M-10 104.5H620" />
      </g>
    </svg>
  );
}
