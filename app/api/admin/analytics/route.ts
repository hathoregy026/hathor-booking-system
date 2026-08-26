import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { AdminAuthError, assertAdminSession } from "@/lib/admin-server-auth";
import {
  GaAccessError,
  GaConfigError,
  fetchGaAdminReport,
} from "@/lib/ga-data-client";
import {
  GA_ADMIN_RANGE_IDS,
  type GaAdminRangeId,
  type GaAdminReportResponse,
} from "@/lib/ga-admin-report";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export const maxDuration = 30;

const NO_STORE = { "Cache-Control": "private, no-store" };

const rangeQuerySchema = z.enum(GA_ADMIN_RANGE_IDS);

function json(body: GaAdminReportResponse, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

function parseRange(request: NextRequest): GaAdminRangeId {
  const raw = request.nextUrl.searchParams.get("range") ?? "7d";
  const parsed = rangeQuerySchema.safeParse(raw);
  return parsed.success ? parsed.data : "7d";
}

export async function GET(request: NextRequest) {
  try {
    await assertAdminSession();
    const report = await fetchGaAdminReport(parseRange(request));
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
