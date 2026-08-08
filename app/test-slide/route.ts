import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Literal Springs infrastructure/amenities clone.
 * Served as a full HTML document (no Hathor PublicNavbar / public layout).
 * Source: public/springs-layout/index.html (from assets/CLONE…/infrastructure).
 * Audit manual: springs-layout.md
 */
export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "public",
    "springs-layout",
    "index.html",
  );
  const html = await readFile(filePath, "utf8");
  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
