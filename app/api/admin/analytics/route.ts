import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AdminAuthError, assertAdminSession } from "@/lib/admin-server-auth";
import {
  GaAccessError,
  GaConfigError,
  fetchGaAdminReport,
} from "@/lib/ga-data-client";
import type { GaAdminReportResponse } from "@/lib/ga-admin-report";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export const maxDuration = 30;

const NO_STORE = { "Cache-Control": "private, no-store" };

function json(body: GaAdminReportResponse, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export async function GET() {
  try {
    await assertAdminSession();
    const report = await fetchGaAdminReport();
    return json({ ok: true, report });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    if (error instanceof GaConfigError || error instanceof ZodError) {
      return json(
        {
          ok: false,
          error: "Analytics is not configured on this server.",
        },
        503,
      );
    }

    if (error instanceof GaAccessError) {
      return json(
        {
          ok: false,
          error: error.message,
          setupHint: error.setupHint,
        },
        403,
      );
    }

    console.error("Admin analytics unexpected error");
    return json(
      { ok: false, error: "Could not load analytics." },
      503,
    );
  }
}
