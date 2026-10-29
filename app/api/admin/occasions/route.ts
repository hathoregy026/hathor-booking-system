import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { ZodError } from "zod";
import { PUBLIC_CMS_CACHE_TAG } from "@/lib/public-cms-bundle";
import { handleRouteError } from "@/lib/api";
import { logDbError } from "@/lib/db-safe";
import { DEFAULT_OCCASIONS_SETTINGS } from "@/lib/occasions";
import { describeOccasionsError } from "@/lib/occasions-schema";
import { getOccasionsSettings, saveOccasionsSettings } from "@/lib/occasions-settings";
import { adminApiGuard } from "@/lib/admin-server-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE = { "Cache-Control": "no-store, max-age=0", "CDN-Cache-Control": "no-store" };

export async function GET() {
  const denied = await adminApiGuard("website.view");
  if (denied) return denied;

  try {
    const settings = await getOccasionsSettings();
    return NextResponse.json({ settings, ok: true }, { headers: NO_STORE });
  } catch (error) {
    logDbError("admin.occasions.GET", error);
    return NextResponse.json(
      { settings: DEFAULT_OCCASIONS_SETTINGS, error: "Could not load occasions.", ok: false },
      { status: 503, headers: NO_STORE },
    );
  }
}

export async function PUT(request: NextRequest) {
  const denied = await adminApiGuard("website.manage");
  if (denied) return denied;

  try {
    const body = (await request.json()) as { settings?: unknown };
    const saved = await saveOccasionsSettings(body.settings);

    /* The menu-bar layer reads occasions from the public CMS bundle. */
    revalidateTag(PUBLIC_CMS_CACHE_TAG, "max");
    revalidatePath("/", "layout");
    revalidatePath("/");

    return NextResponse.json(
      { settings: saved, ok: true, savedAt: new Date().toISOString() },
      { headers: NO_STORE },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: describeOccasionsError(error), ok: false },
        { status: 400, headers: NO_STORE },
      );
    }
    logDbError("admin.occasions.PUT", error);
    return handleRouteError(error);
  }
}
