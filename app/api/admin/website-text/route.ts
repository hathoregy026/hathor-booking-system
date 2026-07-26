import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { handleRouteError } from "@/lib/api";
import { logDbError } from "@/lib/db-safe";
import {
  DEFAULT_WEBSITE_TEXT,
  getWebsiteText,
  parseWebsiteText,
  saveWebsiteText,
} from "@/lib/website-text";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getWebsiteText();
    return NextResponse.json(
      { settings, ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    logDbError("admin.website-text.GET", error);
    return NextResponse.json(
      {
        settings: DEFAULT_WEBSITE_TEXT,
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
    const body = (await request.json()) as { settings?: unknown };
    const settings = parseWebsiteText(body.settings);
    const saved = await saveWebsiteText(settings);

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/cruises");
    revalidatePath("/highlights");
    revalidatePath("/gastronomy");
    revalidatePath("/wellness");
    revalidatePath("/charter");
    revalidatePath("/contact");
    revalidatePath("/blogs");
    revalidatePath("/partners");
    revalidatePath("/rooms");
    revalidatePath("/luxury-cabins-Nile-Cruise");
    revalidatePath("/Luxury-Royal-Suites-Nile-Dahabiya-Cruise");
    revalidatePath("/admin/website-text");
    revalidatePath("/admin/content");

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
    logDbError("admin.website-text.PUT", error);
    return handleRouteError(error);
  }
}
