/*
 * Decorative art for the "In Distinguished Company" band: the Hathor line
 * watermark, and the river that carries the partner nodes from the felucca to
 * the palms. Coordinates are the original 1024px art frame, so every piece
 * lands where the supplied artwork had it. Motion lives in
 * app/partners-company-strip.css.
 */

/** Centres of the four partner nodes on the 1024-unit frame. */
export const PARTNER_NODE_X = [219, 415, 611, 807] as const;

const RIVER_Y = 235;
const round = (value: number) => Math.round(value * 100) / 100;

/** Felucca waterline, rise to node level, a soft swell between each node, then the far bank. */
function buildRiverPath() {
  const y = RIVER_Y;
  const [first] = PARTNER_NODE_X;
  const last = PARTNER_NODE_X[PARTNER_NODE_X.length - 1];
  let d = `M24 243.5L100 243.5C118 243.5 126 ${y} 150 ${y}C176 ${y} 198 ${y} ${first} ${y}`;
  for (const x of PARTNER_NODE_X.slice(0, -1)) {
    d += `C${x + 22} ${y} ${x + 34} 230.5 ${x + 70} 230.5`;
    d += `C${x + 110} 230.5 ${x + 136} 237.5 ${x + 166} 237.5`;
    d += `C${x + 180} 237.5 ${x + 186} ${y} ${x + 196} ${y}`;
  }
  d += `C${last + 22} ${y} ${last + 38} 232.5 ${last + 60} 232.5`;
  d += `C${last + 76} 232.5 ${last + 82} ${y} ${last + 96} ${y}L1000 ${y}`;
  return d;
}

/** One palm frond: an arched, tapering leaf from the crown. */
function frond(
  cx: number,
  cy: number,
  angle: number,
  length: number,
  width: number,
  droop: number,
) {
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const tipX = cx + dx * length;
  const tipY = cy + dy * length + droop;
  const ctrlX = cx + dx * length * 0.55;
  const ctrlY = cy + dy * length * 0.55 - droop * 0.35;
  const px = -dy * width;
  const py = dx * width;
  return (
    `M${round(cx)} ${round(cy)}` +
    `Q${round(ctrlX + px)} ${round(ctrlY + py)} ${round(tipX)} ${round(tipY)}` +
    `Q${round(ctrlX - px)} ${round(ctrlY - py)} ${round(cx)} ${round(cy)}Z`
  );
}

const crown = (
  cx: number,
  cy: number,
  leaves: ReadonlyArray<readonly [number, number, number, number]>,
) => leaves.map(([a, l, w, d]) => frond(cx, cy, a, l, w, d)).join("");

const RIVER_PATH = buildRiverPath();

const TALL_PALM_CROWN = crown(967.4, 204.6, [
  [-172, 9.4, 1.8, 6.2],
  [-148, 10.2, 1.8, 5.6],
  [-118, 8.2, 1.6, 2.6],
  [-66, 8.2, 1.6, 2.6],
  [-34, 10.2, 1.8, 5.6],
  [-8, 9.4, 1.8, 6.2],
  [150, 8, 1.3, 3.2],
  [30, 8, 1.3, 3.2],
]);

const SMALL_PALM_CROWN = crown(982, 217.2, [
  [-170, 6.8, 1.1, 4.2],
  [-140, 6.2, 1.1, 3.2],
  [-105, 4.6, 0.95, 1.2],
  [-72, 4.6, 0.95, 1.2],
  [-40, 6.2, 1.1, 3.2],
  [-10, 6.8, 1.1, 4.2],
  [150, 4.6, 0.8, 2],
  [30, 4.6, 0.8, 2],
]);

function FadeGradient({ id, x1, x2 }: { id: string; x1: number; x2: number }) {
  return (
    <linearGradient
      id={id}
      gradientUnits="userSpaceOnUse"
      x1={x1}
      y1="0"
      x2={x2}
      y2="0"
    >
      <stop offset="0" className="partners-company__fade-stop" stopOpacity="0" />
      <stop offset="0.07" className="partners-company__fade-stop" />
      <stop offset="0.93" className="partners-company__fade-stop" />
      <stop offset="1" className="partners-company__fade-stop" stopOpacity="0" />
    </linearGradient>
  );
}

export function PartnersJourneyRiver() {
  return (
    <svg
      className="partners-company__river partners-company__river--wide"
      viewBox="0 195 1024 80"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <FadeGradient id="pc-river-fade" x1={20} x2={1004} />
        <filter id="pc-glint-blur" x="-50%" y="-400%" width="200%" height="900%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>

      <g className="partners-company__ripples partners-company__ripples--boat">
        <path d="M55 249.5H92" />
        <path d="M70 254H83" />
      </g>

      <path
        className="partners-company__river-line"
        d={RIVER_PATH}
        pathLength={1000}
        stroke="url(#pc-river-fade)"
      />
      <path
        className="partners-company__glint partners-company__glint--halo"
        d={RIVER_PATH}
        pathLength={1000}
        filter="url(#pc-glint-blur)"
      />
      <path
        className="partners-company__glint"
        d={RIVER_PATH}
        pathLength={1000}
      />

      <g className="partners-company__boat">
        <g className="partners-company__boat-bob">
          <path
            className="partners-company__sand"
            d="M84.6 206.3C81.2 216.4 73.4 228 63.6 237.2L87 236.4C85.5 226.4 84.8 216.4 84.6 206.3Z"
          />
          <path
            className="partners-company__mast"
            d="M74.9 222.4V237.8"
          />
          <path
            className="partners-company__sand partners-company__sand--hull"
            d="M56.6 237.6C62 238.8 86 238.8 92.2 237.4C89.8 241.2 86.4 243.4 82 243.6L66.8 243.6C62.4 243.4 58.8 241 56.6 237.6Z"
          />
        </g>
      </g>

      <g className="partners-company__desert">
        <path
          className="partners-company__ridge"
          d="M896 235C902 230.5 906 226 911 223.2C914.5 224.6 918.4 226.6 922 228.4M903 231C913 224 922 217 930 213.2C936 217.5 942 221.5 947 224.8M937 226.5C942 223.5 948 221 952.5 219.8C960 222.5 972 227.5 990 234.8"
        />
        <g className="partners-company__palm partners-company__palm--tall">
          <path
            className="partners-company__sand"
            d={`M966.9 235.2C967.2 225 967.1 214 966.9 205.4L967.9 205.4C968 214 968.4 225 968.7 235.2Z${TALL_PALM_CROWN}`}
          />
        </g>
        <g className="partners-company__palm partners-company__palm--small">
          <path
            className="partners-company__sand"
            d={`M981.3 235.2C981.5 229 981.6 222 981.6 217.6L982.4 217.6C982.5 222 982.6 229 982.7 235.2Z${SMALL_PALM_CROWN}`}
          />
        </g>
        <g className="partners-company__ripples partners-company__ripples--bank">
          <path d="M904 240H990" />
          <path d="M921 244.5H984" />
          <path d="M931 248.8H974" />
          <path d="M951 254H959" />
        </g>
      </g>
    </svg>
  );
}

export function HathorWatermark() {
  return (
    <svg
      className="partners-company__goddess"
      viewBox="0 0 200 300"
      aria-hidden="true"
      focusable="false"
    >
      <g className="partners-company__goddess-crown">
        <circle className="partners-company__goddess-disc" cx="100" cy="41" r="39.5" />
        <circle
          className="partners-company__goddess-halo"
          cx="100"
          cy="41"
          r="33"
        />
        <path
          className="partners-company__goddess-solid"
          d="M3 31C8 72 44 110 100 110C156 110 192 72 197 31C195.6 30.2 193.8 30.6 192.8 32C182 70 148 94 100 94C52 94 18 70 7.2 32C6.2 30.6 4.4 30.2 3 31Z"
        />
        <path
          className="partners-company__goddess-solid"
          d="M93 108C93.5 114 92.5 120 91 126L109 126C107.5 120 106.5 114 107 108Z"
        />
      </g>
      <g className="partners-company__goddess-lines">
        <path d="M20 300C18 240 22 184 38 158C54 134 76 125 100 125C124 125 146 134 162 158C178 184 182 240 180 300" />
        <path d="M30 300C29 250 31 206 43 178M40 300C40 262 42 230 48 204M50 300C51 270 53 248 57 230" />
        <path d="M170 300C171 250 169 206 157 178M160 300C160 262 158 230 152 204M150 300C149 270 147 248 143 230" />
        <path d="M21 256C30 259 42 260 51 258M20 276C30 279 42 280 51 278M179 256C170 259 158 260 149 258M180 276C170 279 158 280 149 278" />
        <path d="M58 138C72 130 128 130 142 138M44 152C62 138 138 138 156 152" />
        <path d="M60 150C55 184 68 219 100 225C132 219 145 184 140 150" />
        <path d="M58 163C45 157 41 173 47 185C51 193 57 195 61 190M54 169C49 172 49 181 54 184" />
        <path d="M142 163C155 157 159 173 153 185C149 193 143 195 139 190M146 169C151 172 151 181 146 184" />
        <path d="M67 157C73 152 85 152 91 156M109 156C115 152 127 152 133 157" />
        <path d="M68 165C74 160 84 160 90 165C84 169 74 169 68 165ZM68 165 63 163.5M132 165C126 160 116 160 110 165C116 169 126 169 132 165ZM132 165 137 163.5" />
        <path d="M98 166C97 176 95 184 94 190C96.5 193.5 103.5 193.5 106 190" />
        <path d="M90 206C94 203 98 203.6 100 204.6C102 203.6 106 203 110 206M90 206C96 208 104 208 110 206M92.5 207.5C96 212 104 212 107.5 207.5" />
        <path d="M84 222C84 232 83 240 82 248M116 222C116 232 117 240 118 248" />
        <path d="M56 262C74 250 126 250 144 262M50 276C70 262 130 262 150 276M46 290C68 276 132 276 154 290" />
      </g>
      <g className="partners-company__goddess-pupils">
        <circle cx="79" cy="164.6" r="2.2" />
        <circle cx="121" cy="164.6" r="2.2" />
      </g>
    </svg>
  );
}
