import { NextRequest, NextResponse } from "next/server";
import { assertInboxAdmin, inboxHeaders, inboxRouteError } from "@/lib/inbox-api";
import { assertTrustedPublicJsonRequest, enforcePublicRateLimit } from "@/lib/public-api-security";
import { privateEmailSendSchema, readPrivateEmailJson, sendPrivateEmail } from "@/lib/private-email";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await assertInboxAdmin(request);
    assertTrustedPublicJsonRequest(request);
    await enforcePublicRateLimit({ request, scope: "dashboard-private-send", limit: 10, windowMs: 60000 });
    await enforcePublicRateLimit({ request, scope: `dashboard-private-hour-${sessionId}`, limit: 50, windowMs: 3600000 });
    const input = privateEmailSendSchema.parse(await readPrivateEmailJson(request));
    const result = await sendPrivateEmail(input, sessionId);
    return NextResponse.json(result, { status: result.status === "PENDING" ? 202 : 200, headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}
