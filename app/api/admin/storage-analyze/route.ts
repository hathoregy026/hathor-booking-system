import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { buildStorageAnalyzeReport } from "@/lib/storage-analyze";
import { adminApiGuard } from "@/lib/admin-server-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

export async function GET() {
  const denied = await adminApiGuard();
  if (denied) return denied;

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
