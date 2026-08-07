import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { buildStorageAnalyzeReport } from "@/lib/storage-analyze";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

export async function GET() {
  try {
    const report = await buildStorageAnalyzeReport();
    return NextResponse.json(report, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[admin.storage-analyze.GET]", error);
    return handleRouteError(error);
  }
}
