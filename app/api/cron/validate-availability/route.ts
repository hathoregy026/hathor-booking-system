import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { isCronSecretConfigured, verifyCronSecret } from "@/lib/cron-auth";
import { runCalendarAvailabilityAudit } from "@/lib/validate-calendar-availability";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Read-only audit — calendar vs search vs RAW_DATA. Requires CRON_SECRET. */
export async function GET(request: NextRequest) {
  if (!isCronSecretConfigured()) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const months = Number(request.nextUrl.searchParams.get("months") ?? "18");
    const monthsAhead =
      Number.isFinite(months) && months > 0 && months <= 24 ? months : 18;

    const result = await runCalendarAvailabilityAudit(monthsAhead);

    return NextResponse.json(result, {
      status: result.passed ? 200 : 422,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
