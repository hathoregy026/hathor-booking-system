import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CMS_CACHE_TAG } from "@/lib/public-cms-bundle";
import { handleRouteError } from "@/lib/api";
import { logDbError } from "@/lib/db-safe";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_WELCOME_SPLASH_SETTINGS,
  WELCOME_SPLASH_SETTINGS_KEY,
  getWelcomeSplashSettings,
  parseWelcomeSplashSettings,
  saveWelcomeSplashSettings,
} from "@/lib/welcome-splash-settings";
import { purgeReplacedWebsiteImage } from "@/lib/website-image-storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getWelcomeSplashSettings();
    return NextResponse.json(
      { settings, ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    logDbError("admin.welcome-splash.GET", error);
    return NextResponse.json(
      {
        settings: DEFAULT_WELCOME_SPLASH_SETTINGS,
        error: "Could not load welcome splash settings.",
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
    const settings = parseWelcomeSplashSettings(body.settings);
    const previousRow = await prisma.siteSetting.findUnique({
      where: { key: WELCOME_SPLASH_SETTINGS_KEY },
      select: { value: true },
    });
    let previousRaw: unknown = previousRow?.value ?? null;
    if (typeof previousRaw === "string") {
      try {
        previousRaw = JSON.parse(previousRaw) as unknown;
      } catch {
        /* keep the raw string */
      }
    }
    const previous = parseWelcomeSplashSettings(previousRaw);
    if (previous.imageUrl !== settings.imageUrl) {
      await purgeReplacedWebsiteImage({
        previousUrl: previous.imageUrl,
        nextUrl: settings.imageUrl,
      });
    }
    const saved = await saveWelcomeSplashSettings(settings);

    revalidateTag(PUBLIC_CMS_CACHE_TAG, "max");
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/preload-screen");

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
    logDbError("admin.welcome-splash.PUT", error);
    return handleRouteError(error);
  }
}
