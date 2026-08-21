const base = "https://hathor-booking-system-9yau9pfpg-hathor1.vercel.app";
const res = await fetch(`${base}/rooms`, { signal: AbortSignal.timeout(25000) });
const html = await res.text();
const cssLinks = [...html.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g)].map((m) => m[1]);
console.log("status", res.status, "html length", html.length);
console.log("html includes rooms-awwwards-page:", html.includes("rooms-awwwards-page"));
console.log("html includes rooms-awwwards-page__stat:", html.includes("rooms-awwwards-page__stat"));
console.log("css files", cssLinks.length);

for (const link of cssLinks) {
  const css = await fetch(new URL(link, base).href, { signal: AbortSignal.timeout(25000) }).then((r) => r.text());
  if (css.includes("rooms-awwwards-page")) {
    console.log("FOUND rooms CSS in", link);
    break;
  }
}

// Search RSC payload chunks in script tags
const scripts = [...html.matchAll(/static\/chunks\/[^"]+\.js/g)].slice(0, 20).map((m) => m[0]);
for (const s of scripts) {
  try {
    const js = await fetch(`${base}/_next/${s}`, { signal: AbortSignal.timeout(15000) }).then((r) => r.text());
    if (js.includes("rooms-awwwards-page")) {
      console.log("FOUND rooms class in JS chunk", s);
      break;
    }
  } catch {}
}
