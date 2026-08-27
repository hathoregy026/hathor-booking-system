import { NextRequest, NextResponse } from "next/server";
import { isCronSecretConfigured, verifyCronSecret } from "@/lib/cron-auth";
import {
  buildAnalyticsDigestHtml,
  buildAnalyticsDigestText,
} from "@/lib/ga-admin-csv";
import { fetchGaAdminReport } from "@/lib/ga-data-client";
import {
  getAdminNotificationEmail,
  getResendFromAddress,
} from "@/lib/resend-config";
import { Resend } from "resend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 45;

const NO_STORE = { "Cache-Control": "private, no-store" };

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
}

async function sendWeeklyDigest(): Promise<{ sent: boolean; skipped?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { sent: false, skipped: "email_unconfigured" };

  const report = await fetchGaAdminReport("7d");
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from: getResendFromAddress(),
    to: getAdminNotificationEmail(),
    subject: `Hathor weekly analytics · ${report.range.startIso}–${report.range.endIso}`,
    text: buildAnalyticsDigestText(report),
    html: buildAnalyticsDigestHtml(report),
  });

  if (result.error) {
    console.error("[cron/analytics-digest] send failed");
    throw new Error("digest_send_failed");
  }

  return { sent: true };
}

async function handle(request: NextRequest) {
  if (!isCronSecretConfigured()) {
    console.error("[cron/analytics-digest] CRON_SECRET is not configured");
    return NextResponse.json({ error: "Service unavailable" }, { status: 503, headers: NO_STORE });
  }

  if (!verifyCronSecret(request)) return unauthorized();

  try {
    const result = await sendWeeklyDigest();
    return NextResponse.json(result, { headers: NO_STORE });
  } catch {
    return NextResponse.json(
      { error: "Could not send analytics digest." },
      { status: 503, headers: NO_STORE },
    );
  }
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
