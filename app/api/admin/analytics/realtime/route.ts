import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AdminAuthError, assertAdminSession } from "@/lib/admin-server-auth";
import {
  GaAccessError,
  GaConfigError,
  fetchGaRealtimeReport,
} from "@/lib/ga-data-client";
import type { GaRealtimeResponse } from "@/lib/ga-admin-report";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export const maxDuration = 15;

const NO_STORE = { "Cache-Control": "private, no-store" };

function json(body: GaRealtimeResponse, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export async function GET() {
  try {
    await assertAdminSession();
    const report = await fetchGaRealtimeReport();
    return json({ ok: true, report });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    if (error instanceof GaConfigError || error instanceof ZodError) {
      return json(
        { ok: false, error: "Analytics is not configured on this server." },
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

    console.error("Admin analytics realtime unexpected error");
    return json({ ok: false, error: "Could not load live users." }, 503);
  }
}
