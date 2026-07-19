import { NextResponse } from "next/server";
import { getTypographySettingsSafe } from "@/lib/typography-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const settings = await getTypographySettingsSafe();
  return NextResponse.json(
    { settings, ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
