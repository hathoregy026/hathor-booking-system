import { NextResponse } from "next/server";
import {
  getWebsiteTextSafe,
  getWebsiteTextMobileSafe,
} from "@/lib/website-text";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const [settings, settingsMobile] = await Promise.all([
    getWebsiteTextSafe(),
    getWebsiteTextMobileSafe(),
  ]);
  return NextResponse.json(
    { settings, settingsMobile, ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
