import { NextRequest, NextResponse } from "next/server";
import { isCronSecretConfigured, verifyCronSecret } from "@/lib/cron-auth";
import { ensureWeeklySailings } from "@/lib/weekly-sailings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (!isCronSecretConfigured()) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await ensureWeeklySailings(), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("[cron/extend-booking-calendar] failed", error);
    return NextResponse.json({ error: "Could not extend booking calendar" }, { status: 503 });
  }
}
