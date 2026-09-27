import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { handleRouteError } from "@/lib/api";
import { PUBLIC_CMS_CACHE_TAG } from "@/lib/public-cms-bundle";
import {
  getAmenitiesTypography,
  saveAmenitiesTypography,
} from "@/lib/amenities-typography";
import { adminApiGuard } from "@/lib/admin-server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await adminApiGuard();
  if (denied) return denied;

  try {
    const [settings, settingsMobile] = await Promise.all([
      getAmenitiesTypography(),
      getAmenitiesTypography(true),
    ]);
    return NextResponse.json({ ok: true, settings, settingsMobile });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest) {
  const denied = await adminApiGuard();
  if (denied) return denied;

  try {
    const body = (await request.json()) as {
      settings?: unknown;
      device?: unknown;
    };
    const phone = body.device === "phone";
    const settings = await saveAmenitiesTypography(body.settings, phone);
    revalidateTag(PUBLIC_CMS_CACHE_TAG, "max");
    revalidatePath("/");
    revalidatePath("/admin/typography");
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return handleRouteError(error);
  }
}
