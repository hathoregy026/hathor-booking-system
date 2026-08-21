const urls = [
  "https://hathor-booking-system.vercel.app/cruises",
  "https://www.hathorcruise.com/cruises",
];

for (const url of urls) {
  const res = await fetch(url, {
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    redirect: "follow",
    signal: AbortSignal.timeout(25000),
  });
  const html = await res.text();
  const finalUrl = res.url;
  console.log("\n===", url, "===");
  console.log("finalUrl", finalUrl);
  console.log("status", res.status);
  console.log("x-vercel-id", res.headers.get("x-vercel-id"));
  console.log("x-vercel-cache", res.headers.get("x-vercel-cache"));
  console.log("age", res.headers.get("age"));
  console.log("cruises-scroll-route", html.includes("cruises-scroll-route"));
  console.log("data-cruises-transition", html.includes("data-cruises-transition"));
  console.log("cruises-sheet-follower", html.includes("cruises-sheet-follower"));
  console.log("cruises-reveal-follower", html.includes("cruises-reveal-follower"));
  console.log("cruises-content-section", html.includes("cruises-content-section"));
  console.log("cruises-sheet-runway", html.includes("cruises-sheet-runway"));
  console.log("homepage-2-root", html.includes("homepage-2-root"));
}
