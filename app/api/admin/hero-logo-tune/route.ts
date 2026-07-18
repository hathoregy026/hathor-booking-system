import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { handleRouteError } from "@/lib/api";
import { logDbError } from "@/lib/db-safe";
import {
  DEFAULT_HERO_LOGO_TUNE,
  getHeroLogoTune,
  heroLogoTuneSchema,
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
    const parsed = heroLogoTuneSchema.safeParse(body.tune);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid logo tune values." },
        { status: 400 },
      );
    }

    const tune = await saveHeroLogoTune(parsed.data);
    revalidatePath("/", "layout");
    revalidatePath("/");
    return NextResponse.json({ tune });
  } catch (error) {
    return handleRouteError(error);
  }
}
