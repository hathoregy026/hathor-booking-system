import { NextResponse } from "next/server";
import { getHeroLogoTuneSafe } from "@/lib/hero-logo-tune";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Public read of temporary homepage logo tune (non-sensitive CSS knobs). */
export async function GET() {
  const tune = await getHeroLogoTuneSafe();
  return NextResponse.json(
    { tune },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
