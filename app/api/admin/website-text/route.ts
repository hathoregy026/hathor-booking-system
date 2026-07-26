import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminDevicePreview } from "@/lib/admin-device-preview";
import { handleRouteError } from "@/lib/api";
import { logDbError } from "@/lib/db-safe";
import {
  DEFAULT_WEBSITE_TEXT,
  getWebsiteText,
  getWebsiteTextMobile,
  parseWebsiteText,
  saveWebsiteText,
  saveWebsiteTextMobile,
} from "@/lib/website-text";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const REVALIDATE_PATHS = [
  "/",
  "/about",
  "/cruises",
  "/highlights",
  "/gastronomy",
  "/wellness",
  "/charter",
  "/contact",
  "/blogs",
  "/partners",
  "/rooms",
  "/luxury-cabins-Nile-Cruise",
  "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
  "/admin/website-text",
  "/admin/content",
] as const;

export async function GET() {
  try {
    const [settings, settingsMobile] = await Promise.all([
      getWebsiteText(),
      getWebsiteTextMobile(),
    ]);
    return NextResponse.json(
      { settings, settingsMobile, ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    logDbError("admin.website-text.GET", error);
    return NextResponse.json(
      {
        settings: DEFAULT_WEBSITE_TEXT,
        settingsMobile: DEFAULT_WEBSITE_TEXT,
        error: "Could not load website text settings.",
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
    const settings = parseWebsiteText(body.settings);
    const saved =
      device === "phone"
        ? await saveWebsiteTextMobile(settings)
        : await saveWebsiteText(settings);

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
    logDbError("admin.website-text.PUT", error);
    return handleRouteError(error);
  }
}
