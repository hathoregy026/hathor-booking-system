import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CMS_CACHE_TAG } from "@/lib/public-cms-bundle";
import { handleRouteError } from "@/lib/api";
import {
  getSuitesTypography,
  saveSuitesTypography,
} from "@/lib/suites-typography";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [settings, settingsMobile] = await Promise.all([
      getSuitesTypography(),
      getSuitesTypography(true),
    ]);
    return NextResponse.json({ ok: true, settings, settingsMobile });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = body.device === "phone";
    const settings = await saveSuitesTypography(body.settings, phone);
    revalidateTag(PUBLIC_CMS_CACHE_TAG, "max");
    revalidatePath("/suites");
    revalidatePath("/admin/typography");
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return handleRouteError(error);
  }
}
