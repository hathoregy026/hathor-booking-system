import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * One-shot browser cache purge for this origin.
 * Open once in the stuck normal tab, then you land on a fresh homepage.
 */
export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="robots" content="noindex" />
  <meta http-equiv="Cache-Control" content="no-store" />
  <title>Refreshing Hathor…</title>
  <style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:#ece8df;color:#2c2419;
      font:400 15px/1.5 Georgia,serif}
  </style>
</head>
<body>
  <p>Clearing old cached files and loading the latest site…</p>
  <script>
    (async function () {
      try {
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(function (r) { return r.unregister(); }));
        }
      } catch (e) {}
      try {
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(function (k) { return caches.delete(k); }));
        }
      } catch (e) {}
      try { localStorage.clear(); } catch (e) {}
      try { sessionStorage.clear(); } catch (e) {}
      var t = Date.now().toString(36);
      location.replace("/?fresh=" + t + "&_d=" + t);
    })();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0, must-revalidate",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
      "Cloudflare-CDN-Cache-Control": "no-store",
      "Clear-Site-Data": '"cache", "storage"',
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
