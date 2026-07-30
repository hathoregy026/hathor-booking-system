import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CMS_CACHE_TAG } from "@/lib/public-cms-bundle";
import { isAdminDevicePreview } from "@/lib/admin-device-preview";
import { handleRouteError } from "@/lib/api";
import { logDbError } from "@/lib/db-safe";
import {
  DEFAULT_HERO_LOGO_TUNE,
  getHeroLogoTune,
  getHeroLogoTuneMobile,
  parseHeroLogoTune,
  saveHeroLogoTune,
  saveHeroLogoTuneMobile,
} from "@/lib/hero-logo-tune";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [tune, tuneMobile] = await Promise.all([
      getHeroLogoTune(),
      getHeroLogoTuneMobile(),
    ]);
    return NextResponse.json(
      { tune, tuneMobile, ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    logDbError("admin.hero-logo-tune.GET", error);
    return NextResponse.json(
      {
        tune: DEFAULT_HERO_LOGO_TUNE,
        tuneMobile: DEFAULT_HERO_LOGO_TUNE,
        error: "Could not load logo tune.",
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
      tune?: unknown;
      device?: unknown;
    };
    const device = isAdminDevicePreview(body.device) ? body.device : "desktop";
    const tune = parseHeroLogoTune(body.tune);
    const saved =
      device === "phone"
        ? await saveHeroLogoTuneMobile(tune)
        : await saveHeroLogoTune(tune);

    revalidateTag(PUBLIC_CMS_CACHE_TAG, "max");
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin/hero-logo-tune");

    return NextResponse.json(
      {
        tune: saved,
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
    logDbError("admin.hero-logo-tune.PUT", error);
    return handleRouteError(error);
  }
}
