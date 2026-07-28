import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { handleRouteError } from "@/lib/api";
import { logDbError } from "@/lib/db-safe";
import {
  DEFAULT_HIEROGLYPH_TUNE,
  getHieroglyphTune,
  parseHieroglyphTune,
  saveHieroglyphTune,
} from "@/lib/hieroglyph-tune";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const tune = await getHieroglyphTune();
    return NextResponse.json(
      { tune, ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    logDbError("admin.hieroglyph-tune.GET", error);
    return NextResponse.json(
      {
        tune: DEFAULT_HIEROGLYPH_TUNE,
        error: "Could not load glyph tune.",
        ok: false,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as { tune?: unknown };
    const tune = parseHieroglyphTune(body.tune);
    const saved = await saveHieroglyphTune(tune);

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin/hieroglyph-tune");

    return NextResponse.json(
      {
        tune: saved,
        ok: true,
        savedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "CDN-Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    logDbError("admin.hieroglyph-tune.PUT", error);
    return handleRouteError(error);
  }
}
