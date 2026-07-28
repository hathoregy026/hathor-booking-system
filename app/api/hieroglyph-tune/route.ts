import { NextResponse } from "next/server";
import { getHieroglyphTuneSafe } from "@/lib/hieroglyph-tune";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Public read of background glyph opacity / tile size (non-sensitive). */
export async function GET() {
  const tune = await getHieroglyphTuneSafe();
  return NextResponse.json(
    { tune },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
