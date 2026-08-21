const base = process.argv[2] ?? "https://hathor-booking-system.vercel.app";

const res = await fetch(`${base}/cruises`, {
  headers: { "Cache-Control": "no-cache" },
  signal: AbortSignal.timeout(30000),
});
const html = await res.text();
const links = [...html.matchAll(/\/_next\/static\/chunks\/[^"]+\.js/g)]
  .map((m) => m[0])
  .slice(0, 25);

let deployed = false;
for (const link of links) {
  const js = await fetch(`${base}${link}`, {
    headers: { "Cache-Control": "no-cache" },
    signal: AbortSignal.timeout(15000),
  }).then((r) => r.text());
  if (
    js.includes("gapSealStart") ||
    js.includes("syncContentHandoff") ||
    js.includes("bakeContentLayerPosition")
  ) {
    console.log("DEPLOYED", link);
    deployed = true;
    break;
  }
}

if (!deployed) {
  console.log("NOT_YET", links.length, "chunks checked");
  process.exit(1);
}
