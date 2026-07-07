const EXPECTED = "dpl_GWfQR5CP2bankJirVUjRb9HEuBEr";
const BASE = "https://hathor-booking-system.vercel.app";

const res = await fetch(`${BASE}/rooms?verify=${Date.now()}`, {
  headers: { "Cache-Control": "no-cache" },
});
const html = await res.text();

const markers = {
  status: res.status,
  dataRoomsEditorial: html.includes("data-rooms-editorial"),
  kineticTitle: html.includes("data-kinetic-title"),
  parallaxWrap: html.includes("data-parallax-wrap"),
  parallaxImg: html.includes("data-parallax-img"),
  roomsBento: html.includes("data-rooms-bento"),
  ctaWrap: html.includes("data-rooms-cta-wrap"),
  noOldHathorSection: !html.includes("hathor-section hathor-section--surface"),
};

console.log(JSON.stringify(markers, null, 2));
console.log(`\nDeployment: ${EXPECTED}`);
console.log(
  Object.values(markers).every((v) => v === true || v === 200)
    ? "VERIFY: PASSED"
    : "VERIFY: CHECK MARKERS",
);
