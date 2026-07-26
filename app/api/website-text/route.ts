import { NextResponse } from "next/server";
import { getWebsiteTextSafe } from "@/lib/website-text";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const settings = await getWebsiteTextSafe();
  return NextResponse.json(
    { settings, ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
