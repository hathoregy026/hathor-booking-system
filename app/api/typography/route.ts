import { NextResponse } from "next/server";
import {
  getTypographySettingsSafe,
  getTypographySettingsMobileSafe,
} from "@/lib/typography-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const [settings, settingsMobile] = await Promise.all([
    getTypographySettingsSafe(),
    getTypographySettingsMobileSafe(),
  ]);
  return NextResponse.json(
    { settings, settingsMobile, ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
