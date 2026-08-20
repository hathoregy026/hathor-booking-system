import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CMS_CACHE_TAG } from "@/lib/public-cms-bundle";
import { handleRouteError } from "@/lib/api";
import { logDbError } from "@/lib/db-safe";
import {
  DEFAULT_PAGE_VISIBILITY_SETTINGS,
  MANAGED_PUBLIC_PAGES,
  getPageVisibilitySettings,
  parsePageVisibilitySettings,
  savePageVisibilitySettings,
} from "@/lib/page-visibility";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getPageVisibilitySettings();
    return NextResponse.json(
      { settings, pages: MANAGED_PUBLIC_PAGES, ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    logDbError("admin.page-visibility.GET", error);
    return NextResponse.json(
      {
        settings: DEFAULT_PAGE_VISIBILITY_SETTINGS,
        pages: MANAGED_PUBLIC_PAGES,
        error: "Could not load page visibility settings.",
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
    const settings = parsePageVisibilitySettings(body.settings);
    const saved = await savePageVisibilitySettings(settings);

    revalidateTag(PUBLIC_CMS_CACHE_TAG, "max");
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin/pages");

    for (const page of MANAGED_PUBLIC_PAGES) {
      revalidatePath(page.path);
      for (const alias of page.aliases ?? []) {
        revalidatePath(alias);
      }
    }

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
    logDbError("admin.page-visibility.PUT", error);
    return handleRouteError(error);
  }
}
