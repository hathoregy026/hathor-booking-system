import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CMS_CACHE_TAG } from "@/lib/public-cms-bundle";
import { isAdminDevicePreview } from "@/lib/admin-device-preview";
import { handleRouteError } from "@/lib/api";
import { logDbError } from "@/lib/db-safe";
import {
  DEFAULT_TYPOGRAPHY_SETTINGS,
  getTypographySettings,
  getTypographySettingsMobile,
  parseTypographySettings,
  saveTypographySettings,
  saveTypographySettingsMobile,
} from "@/lib/typography-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const REVALIDATE_PATHS = [
  "/",
  "/cruises-list",
  "/admin/typography",
  "/suites",
  "/experiences",
  "/about",
  "/blogs",
  "/contact",
  "/wellness",
  "/gastronomy",
  "/highlights",
  "/charter",
  "/rooms",
  "/royal-suites",
  "/luxury-cabins",
] as const;

export async function GET() {
  try {
    const [settings, settingsMobile] = await Promise.all([
      getTypographySettings(),
      getTypographySettingsMobile(),
    ]);
    return NextResponse.json(
      { settings, settingsMobile, ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    logDbError("admin.typography.GET", error);
    return NextResponse.json(
      {
        settings: DEFAULT_TYPOGRAPHY_SETTINGS,
        settingsMobile: DEFAULT_TYPOGRAPHY_SETTINGS,
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
    const body = (await request.json()) as {
      settings?: unknown;
      device?: unknown;
    };
    const device = isAdminDevicePreview(body.device) ? body.device : "desktop";
    const settings = parseTypographySettings(body.settings);
    const saved =
      device === "phone"
        ? await saveTypographySettingsMobile(settings)
        : await saveTypographySettings(settings);

    revalidateTag(PUBLIC_CMS_CACHE_TAG, "max");
    revalidatePath("/", "layout");
    for (const path of REVALIDATE_PATHS) {
      revalidatePath(path);
    }

    return NextResponse.json(
      {
        settings: saved,
        device,
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
    logDbError("admin.typography.PUT", error);
    return handleRouteError(error);
  }
}
