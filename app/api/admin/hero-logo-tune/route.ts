import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { handleRouteError } from "@/lib/api";
import { logDbError } from "@/lib/db-safe";
import {
  DEFAULT_HERO_LOGO_TUNE,
  getHeroLogoTune,
  parseHeroLogoTune,
  saveHeroLogoTune,
} from "@/lib/hero-logo-tune";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const tune = await getHeroLogoTune();
    return NextResponse.json({ tune });
  } catch (error) {
    logDbError("admin.hero-logo-tune.GET", error);
    return NextResponse.json(
      { tune: DEFAULT_HERO_LOGO_TUNE, error: "Could not load logo tune." },
      { status: 503 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as { tune?: unknown };
    // Lenient parse accepts older dashboard payloads (vAlign / gapTButton, etc.)
    const tune = parseHeroLogoTune(body.tune);
    const saved = await saveHeroLogoTune(tune);
    revalidatePath("/", "layout");
    revalidatePath("/");
    return NextResponse.json({ tune: saved });
  } catch (error) {
    logDbError("admin.hero-logo-tune.PUT", error);
    return handleRouteError(error);
  }
}
