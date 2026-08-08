import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CMS_CACHE_TAG } from "@/lib/public-cms-bundle";
import { handleRouteError } from "@/lib/api";
import { logDbError } from "@/lib/db-safe";
import {
  DEFAULT_LIVE_SITE_SETTINGS,
  getLiveSiteSettings,
  parseLiveSiteSettings,
  saveLiveSiteSettings,
} from "@/lib/live-site-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getLiveSiteSettings();
    return NextResponse.json(
      { settings, ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    logDbError("admin.live-site.GET", error);
    return NextResponse.json(
      {
        settings: DEFAULT_LIVE_SITE_SETTINGS,
        error: "Could not load live site settings.",
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
    const settings = parseLiveSiteSettings(body.settings);
    const saved = await saveLiveSiteSettings(settings);

    revalidateTag(PUBLIC_CMS_CACHE_TAG, "max");
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin/live-site");
    revalidatePath("/booking", "layout");
    revalidatePath("/book", "layout");

    return NextResponse.json(
      {
        settings: saved,
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
    logDbError("admin.live-site.PUT", error);
    return handleRouteError(error);
  }
}
