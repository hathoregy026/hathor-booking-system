import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import {
  getGastronomyTypography,
  saveGastronomyTypography,
} from "@/lib/gastronomy-typography";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [settings, settingsMobile] = await Promise.all([
      getGastronomyTypography(),
      getGastronomyTypography(true),
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
    const settings = await saveGastronomyTypography(body.settings, phone);
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return handleRouteError(error);
  }
}
