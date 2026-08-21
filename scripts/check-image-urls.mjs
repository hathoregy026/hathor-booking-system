const base = "https://hathor-booking-system.vercel.app";
const paths = [
  "/media/hathor/scraped/cabin-1.webp",
  "/media/hathor/scraped/suites-hero.webp",
  "/_next/image?url=%2Fmedia%2Fhathor%2Fscraped%2Fcabin-1.webp&w=1920&q=75",
  "/_next/image?url=%2Fmedia%2Fhathor%2Fscraped%2Fsuites-hero.webp&w=1920&q=75",
  "/media/hathor/r2/room-suite.webp",
];

for (const p of paths) {
  try {
    const r = await fetch(base + p, {
      headers: { Accept: "image/*,*/*" },
      redirect: "manual",
    });
    const buf = Buffer.from(await r.arrayBuffer());
    const head = buf.slice(0, 4).toString("hex");
    console.log(r.status, p.slice(0, 80), "bytes", buf.length, "head", head, "ct", r.headers.get("content-type"));
  } catch (e) {
    console.log("ERR", p, e.message);
  }
}
