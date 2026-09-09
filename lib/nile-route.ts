/**
 * The real course of the Nile between Luxor and Aswan.
 *
 * Waypoints are actual WGS84 coordinates traced along the river channel — the
 * same course a road map shows through Esna, Edfu, Kom Ombo and Daraw. Nothing
 * here is drawn by eye: the SVG path, the mooring positions and every distance
 * on the page are derived from these numbers at module load.
 *
 * Sailing south (upstream) puts Luxor at the top and Aswan at the foot, which
 * is how a Nile chart is conventionally read.
 */

type Point = { lat: number; lon: number };

/** River channel, north to south. */
const CHANNEL: readonly Point[] = [
  { lat: 25.7, lon: 32.6396 }, // Luxor
  { lat: 25.62, lon: 32.625 },
  { lat: 25.53, lon: 32.59 },
  { lat: 25.42, lon: 32.556 },
  { lat: 25.2934, lon: 32.554 }, // Esna
  { lat: 25.19, lon: 32.58 },
  { lat: 25.09, lon: 32.66 },
  { lat: 25.02, lon: 32.77 },
  { lat: 24.9781, lon: 32.8735 }, // Edfu
  { lat: 24.89, lon: 32.89 },
  { lat: 24.79, lon: 32.91 },
  { lat: 24.68, lon: 32.925 },
  { lat: 24.57, lon: 32.935 },
  { lat: 24.4764, lon: 32.945 }, // Kom Ombo
  { lat: 24.3667, lon: 32.9167 }, // Daraw
  { lat: 24.29, lon: 32.9 },
  { lat: 24.19, lon: 32.895 },
  { lat: 24.0889, lon: 32.8998 }, // Aswan — the voyage's last mooring, and
  // the end of the channel this chart draws. The river of course carries on to
  // the High Dam; drawing that tail put thirteen kilometres of course past the
  // final berth, so the vessel sailed on after tying up.
] as const;

/** Channel indices that are actual moorings on a Hathor sailing. */
const MOORING_AT = [0, 4, 8, 13, 17] as const;

const MOORING_COPY = [
  {
    name: "Luxor",
    arabic: "الأقصر",
    day: "Day one",
    slot: "landmark-valley-kings",
    imageAlt: "The Valley of the Kings on the west bank at Luxor",
    note: "Hathor takes on her twelve guests at dusk, with Karnak still lit on the east bank.",
    sites: [
      {
        name: "Karnak Temple",
        era: "c. 2000 BC",
        note: "Two hundred acres of sanctuaries, raised over two thousand years.",
        href: "/blogs/sailing-to-karnak-temple",
      },
      {
        name: "Valley of the Kings",
        era: "c. 1539 BC",
        note: "Sixty-three royal tombs cut into the rock of the west bank.",
        href: "/blogs/discover-the-valley-of-the-kings",
      },
      {
        name: "Temple of Hatshepsut",
        era: "c. 1479 BC",
        note: "Three colonnaded terraces set straight against the cliff at Deir el-Bahari.",
        href: "/blogs/where-history-lives-the-temple-of-hatshepsut",
      },
    ],
  },
  {
    name: "Esna",
    arabic: "إسنا",
    day: "Day two",
    slot: "highlights-lifestyle",
    imageAlt: "The Nile seen from the deck of Hathor",
    note: "Through the lock at first light. Past it the river empties of engines almost entirely.",
    sites: [
      {
        name: "Temple of Khnum",
        era: "c. 180 BC",
        note: "A hypostyle hall nine metres below the town, its painted ceiling still on it.",
        href: "/blogs/exploring-esna-temples-history-nile-charm",
      },
      {
        name: "The Esna Lock",
        era: "1906",
        note: "The one lock on this reach — the gate every dahabiya waits for.",
        href: "/blogs/secret-spots-between-luxor-and-aswan",
      },
    ],
  },
  {
    name: "Edfu",
    arabic: "إدفو",
    day: "Day three",
    slot: "home-alt-highlights",
    imageAlt: "Ancient landmarks along the Nile",
    note: "The best-preserved temple in Egypt, a short ride from where Hathor ties up.",
    sites: [
      {
        name: "Temple of Horus",
        era: "237 BC",
        note: "The most completely preserved temple in Egypt, its roof still standing.",
        href: "/blogs/discover-edfu-temple",
      },
      {
        name: "Gebel el-Silsila",
        era: "c. 1500 BC",
        note: "The sandstone quarry that built Karnak, Luxor and Edfu.",
        href: "/blogs/secret-spots-between-luxor-and-aswan",
      },
    ],
  },
  {
    name: "Kom Ombo",
    arabic: "كوم أمبو",
    day: "Day four",
    slot: "highlights-hero",
    imageAlt: "Hathor sailing past ancient Egyptian monuments",
    note: "A twin temple standing on the bank itself. Moor, walk up, and be back before dinner.",
    sites: [
      {
        name: "Temple of Sobek & Haroeris",
        era: "180 BC",
        note: "One temple in two mirrored halves — the crocodile god on one side, the falcon on the other.",
        href: "/blogs/kom-ombo-temple",
      },
      {
        name: "Crocodile Museum",
        era: "2012",
        note: "Three hundred mummified crocodiles, drawn from the temple’s own precinct.",
        href: "/blogs/kom-ombo-temple",
      },
    ],
  },
  {
    name: "Aswan",
    arabic: "أسوان",
    day: "Day five",
    slot: "landmark-obelisk",
    imageAlt: "The Unfinished Obelisk in its quarry at Aswan",
    note: "Granite islands, the softest light on the river, and the quarry that never gave up its obelisk.",
    sites: [
      {
        name: "Philae Temple",
        era: "280 BC",
        note: "Moved stone by stone to Agilkia island to save it from the rising water.",
        href: "/blogs/discovering-the-secrets-of-philae-temple",
      },
      {
        name: "The Unfinished Obelisk",
        era: "c. 1500 BC",
        note: "Still lying in its bedrock — finished, it would have stood forty-two metres.",
        href: "/blogs/golden-gems-of-aswan",
      },
      {
        name: "Elephantine Island",
        era: "c. 3000 BC",
        note: "Egypt’s southern frontier town, settled before the pyramids were raised.",
        href: "/blogs/aswan-nubian-villages",
      },
    ],
  },
] as const;

const EARTH_KM = 6371;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance between two coordinates, in kilometres. */
function haversineKm(a: Point, b: Point): number {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(s));
}

/* ---- cumulative distance along the channel ---------------------------- */
const CUMULATIVE_KM: number[] = CHANNEL.reduce<number[]>((acc, point, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + haversineKm(CHANNEL[i - 1], point));
  return acc;
}, []);

export const NILE_TOTAL_KM = Math.round(CUMULATIVE_KM[CUMULATIVE_KM.length - 1]);

/* ---- equirectangular projection --------------------------------------- */
/* At this latitude and over 1.7° the distortion is negligible, and the true
   aspect is what makes the chart read as a chart: a slender ribbon, not a
   stretched decoration. */
const LAT0 = (CHANNEL[0].lat + CHANNEL[CHANNEL.length - 1].lat) / 2;
const COS_LAT0 = Math.cos(rad(LAT0));

const raw = CHANNEL.map((p) => ({
  x: p.lon * COS_LAT0,
  y: -p.lat,
}));

const minX = Math.min(...raw.map((p) => p.x));
const maxX = Math.max(...raw.map((p) => p.x));
const minY = Math.min(...raw.map((p) => p.y));
const maxY = Math.max(...raw.map((p) => p.y));

/*
 * Padding in viewBox units. The vertical pad only clears the end caps; the
 * horizontal pad also has to hold a mooring label on either bank, so it is far
 * wider. The channel keeps its true proportions either way — only the empty
 * margin around it grows.
 */
const PAD_Y = 30;
const PAD_X = 104;
const SPAN_Y = maxY - minY;
const SPAN_X = maxX - minX;

/** True aspect: over this reach the river is ~4.9x longer than it is wide. */
export const CHART_HEIGHT = 1000;
const SCALE = (CHART_HEIGHT - PAD_Y * 2) / SPAN_Y;
export const CHART_WIDTH = Math.round(SPAN_X * SCALE + PAD_X * 2);
export const CHART_VIEWBOX = `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`;
/** Container aspect — set on the plate so `meet` never letterboxes. */
export const CHART_ASPECT = `${CHART_WIDTH} / ${CHART_HEIGHT}`;

const projected = raw.map((p) => ({
  x: PAD_X + (p.x - minX) * SCALE,
  y: PAD_Y + (p.y - minY) * SCALE,
}));

/**
 * A Catmull-Rom spline through the projected waypoints, emitted as cubic
 * béziers. The river bends; a polyline through real coordinates would read as
 * a folded ruler rather than a channel.
 */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  const d: string[] = [`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`];
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d.push(
      `C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    );
  }
  return d.join(" ");
}

export const NILE_PATH = smoothPath(projected);

export type HistoricSite = {
  name: string;
  era: string;
  /** One line on what actually stands there — the chart shows it on the card. */
  note: string;
  /** Public blog post for this landmark. */
  href: string;
};

export type Mooring = {
  name: string;
  arabic: string;
  /** Which day of the sailing this mooring falls on. */
  day: string;
  /** CMS image slot for the photograph shown with this mooring. */
  slot: string;
  /**
   * Alt text for that photograph. Written per mooring rather than derived from
   * the site list: the library holds monuments for Luxor and Aswan only, so the
   * middle three carry river photography and must not claim to be a temple.
   */
  imageAlt: string;
  note: string;
  /** What there is to walk up to from this mooring. */
  sites: readonly HistoricSite[];
  /** Projected chart position. */
  x: number;
  y: number;
  /** Fraction of the total course, 0 at Luxor to 1 at Aswan. */
  t: number;
  /** Real distance from Luxor, in kilometres. */
  km: number;
  /** Real distance from the previous mooring, in kilometres. */
  legKm: number;
  /** Which bank the leader line and name are annotated from. */
  side: "start" | "end";
};

export const NILE_MOORINGS: readonly Mooring[] = MOORING_AT.map((index, i) => {
  const km = CUMULATIVE_KM[index];
  return {
    ...MOORING_COPY[i],
    x: projected[index].x,
    y: projected[index].y,
    t: km / CUMULATIVE_KM[CUMULATIVE_KM.length - 1],
    km: Math.round(km),
    legKm: Math.round(km - (i === 0 ? 0 : CUMULATIVE_KM[MOORING_AT[i - 1]])),
    side: i % 2 === 0 ? "start" : "end",
  };
});
