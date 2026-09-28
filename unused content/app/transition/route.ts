import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Serves the Venetian reference HTML verbatim at /transition (not in site nav). */
export async function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "transition", "index.html"),
    "utf-8",
  );

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
