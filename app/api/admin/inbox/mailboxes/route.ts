import { NextRequest, NextResponse } from "next/server";
import { assertInboxAdmin, inboxHeaders, inboxRouteError } from "@/lib/inbox-api";
import { mailboxSettingsSchema } from "@/lib/email-mailboxes";
import { saveMailboxHandler } from "@/lib/email-mailbox-settings";
import { assertTrustedPublicJsonRequest, readPublicJsonBody } from "@/lib/public-api-security";

export async function PATCH(request: NextRequest) {
  try {
    await assertInboxAdmin(request);
    assertTrustedPublicJsonRequest(request);
    const input = mailboxSettingsSchema.parse(await readPublicJsonBody(request));
    await saveMailboxHandler(input);
    return NextResponse.json({ updated: true }, { headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}
