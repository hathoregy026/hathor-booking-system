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
import { isHeroLogoTuneEqual } from "@/lib/hero-logo-tune-shared";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const tune = await getHeroLogoTune();
    return NextResponse.json(
      { tune, ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    logDbError("admin.hero-logo-tune.GET", error);
    return NextResponse.json(
      { tune: DEFAULT_HERO_LOGO_TUNE, error: "Could not load logo tune.", ok: false },
      { status: 503 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as { tune?: unknown };
    const tune = parseHeroLogoTune(body.tune);
    const saved = await saveHeroLogoTune(tune);

    /* Verify the row actually persisted — do not report success on a silent miss. */
    const verified = await getHeroLogoTune();
    if (!isHeroLogoTuneEqual(saved, verified)) {
      logDbError(
        "admin.hero-logo-tune.PUT.verify",
        new Error("Saved tune does not match DB read-back"),
      );
      return NextResponse.json(
        {
          error: "Save wrote but could not verify. Try again.",
          tune: verified,
          ok: false,
        },
        { status: 500 },
      );
    }

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin/hero-logo-tune");

    return NextResponse.json(
      { tune: verified, ok: true, verified: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    logDbError("admin.hero-logo-tune.PUT", error);
    return handleRouteError(error);
  }
}
