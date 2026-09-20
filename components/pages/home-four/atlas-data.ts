import geometry from "./nile-geometry.json";

/** Natural Earth 1:10m, public domain. See SOURCES.md; no spline interpolation. */
export const H4_CHANNEL = geometry as [number, number][];
const rad = (v: number) => v * Math.PI / 180;
export function h4Distance(a: number[], b: number[]) {
  const s = Math.sin(rad(b[1] - a[1]) / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(rad(b[0] - a[0]) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(s));
}
const latitude = 24.9;
const scale = 480 / (H4_CHANNEL[0][1] - H4_CHANNEL.at(-1)![1]);
export function h4Project([lon, lat]: number[]) {
  return { x: 110 + (lon - 32.48) * Math.cos(rad(latitude)) * scale, y: 42 + (25.698927 - lat) * scale };
}
export const H4_POINTS = H4_CHANNEL.map(h4Project);
export const H4_PATH = H4_POINTS.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(" ");
export const H4_KM = H4_CHANNEL.reduce((sum, p, i) => sum + (i ? h4Distance(H4_CHANNEL[i - 1], p) : 0), 0);
export const H4_ESTIMATE_KM = Math.round(H4_KM / 10) * 10;
const lengths = H4_POINTS.map((p, i) => i ? Math.hypot(p.x - H4_POINTS[i-1].x, p.y - H4_POINTS[i-1].y) : 0);
const total = lengths.reduce((a, b) => a + b, 0);

/** City coordinates remain off-channel. A dotted leader connects to nearest route point. */
const places = [
  { name: "Luxor", coordinate: [32.642097, 25.698927], kind: "Embarkation city", day: "Days 1–2", title: "Begin among the temples", copy: "East-bank temples, then the west bank before sailing towards Esna.", slot: "landmark-valley-kings", alt: "The Valley of the Kings near Luxor" },
  { name: "Esna", coordinate: [32.55402, 25.29336], kind: "River town", day: "Day 2", title: "The first evening upriver", copy: "The published passage continues to Esna for the night. Your boarding and mooring arrangements are confirmed separately.", slot: "highlights-lifestyle", alt: "Guests aboard Hathor" },
  { name: "Edfu", coordinate: [32.877224, 24.979163], kind: "Town · temple excursion", day: "Day 3", title: "A shore day at Edfu", copy: "Visit the Temple of Horus, then continue towards El Ramady Island for the evening.", slot: "home-alt-highlights", alt: "A view of the Nile journey" },
  { name: "Kom Ombo", coordinate: [32.946262, 24.476687], kind: "Town · temple excursion", day: "Day 4", title: "Stone beside the water", copy: "Gebel el-Silsila precedes the Kom Ombo temple visit. The voyage continues to Aswan that day.", slot: "highlights-hero", alt: "Guests relaxing in Hathor's lounge" },
  { name: "Aswan", coordinate: [32.89942, 24.09082], kind: "Arrival city", day: "Days 4–5", title: "Arrive in Aswan", copy: "A final evening aboard, followed by breakfast and disembarkation. Confirm the final sightseeing arrangements with reservations.", slot: "landmark-obelisk", alt: "The Unfinished Obelisk at Aswan" },
] as const;

export const H4_STOPS = places.map((place, index) => {
  const point = h4Project([...place.coordinate]);
  let best = { distance: Infinity, x: 0, y: 0, t: 0 };
  let walked = 0;
  for (let i = 1; i < H4_POINTS.length; i++) {
    const a = H4_POINTS[i - 1], b = H4_POINTS[i];
    const dx = b.x-a.x, dy = b.y-a.y;
    const q = Math.max(0, Math.min(1, ((point.x-a.x)*dx+(point.y-a.y)*dy)/(dx*dx+dy*dy)));
    const x=a.x+q*dx, y=a.y+q*dy, distance=Math.hypot(point.x-x,point.y-y);
    if (distance < best.distance) best={distance,x,y,t:(walked+q*lengths[i])/total};
    walked += lengths[i];
  }
  return { ...place, ...point, route: best, t: index === 0 ? 0 : index === places.length - 1 ? 1 : best.t };
});
