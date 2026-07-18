import { NextResponse } from "next/server";
import { logDbError } from "@/lib/db-safe";
import {
  DEFAULT_HERO_LOGO_TUNE,
  getHeroLogoTune,
} from "@/lib/hero-logo-tune";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Public read of temporary homepage logo tune (non-sensitive CSS knobs). */
export async function GET() {
  try {
    const tune = await getHeroLogoTune();
    return NextResponse.json(
      { tune },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    logDbError("hero-logo-tune.GET", error);
    return NextResponse.json({ tune: DEFAULT_HERO_LOGO_TUNE });
  }
}
