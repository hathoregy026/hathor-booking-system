import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { handleRouteError } from "@/lib/api";
import { logDbError } from "@/lib/db-safe";
import {
  DEFAULT_TYPOGRAPHY_SETTINGS,
  getTypographySettings,
  parseTypographySettings,
  saveTypographySettings,
} from "@/lib/typography-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getTypographySettings();
    return NextResponse.json(
      { settings, ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    logDbError("admin.typography.GET", error);
    return NextResponse.json(
      {
        settings: DEFAULT_TYPOGRAPHY_SETTINGS,
        error: "Could not load typography settings.",
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
    const body = (await request.json()) as { settings?: unknown };
    const settings = parseTypographySettings(body.settings);
    const saved = await saveTypographySettings(settings);

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin/typography");

    return NextResponse.json(
      { settings: saved, ok: true, savedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "CDN-Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    logDbError("admin.typography.PUT", error);
    return handleRouteError(error);
  }
}
