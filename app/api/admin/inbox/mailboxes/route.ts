import { assertMailboxAccess } from "@/lib/admin-mailbox-guard";
import { adminApiGuard } from "@/lib/admin-server-auth";
import { NextRequest, NextResponse } from "next/server";
import { assertInboxAdmin, inboxHeaders, inboxRouteError } from "@/lib/inbox-api";
import { mailboxSettingsSchema } from "@/lib/email-mailboxes";
import { saveMailboxHandler } from "@/lib/email-mailbox-settings";
import { assertTrustedPublicJsonRequest, readPublicJsonBody } from "@/lib/public-api-security";

export async function PATCH(request: NextRequest) {
  const denied = await adminApiGuard("inbox.manage");
  if (denied) return denied;
  try {
    const identity = await assertInboxAdmin(request);
    assertTrustedPublicJsonRequest(request);
    const input = mailboxSettingsSchema.parse(await readPublicJsonBody(request));
    assertMailboxAccess(identity, input.mailboxId);
    await saveMailboxHandler(input);
    return NextResponse.json({ updated: true }, { headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}
