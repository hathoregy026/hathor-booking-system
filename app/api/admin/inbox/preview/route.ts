import { assertMailboxAccess } from "@/lib/admin-mailbox-guard";
import { adminApiGuard } from "@/lib/admin-server-auth";
import { NextRequest } from "next/server";
import { assertInboxAdmin, inboxRouteError } from "@/lib/inbox-api";
import { assertTrustedPublicJsonRequest } from "@/lib/public-api-security";
import { privateEmailContentSchema, readPrivateEmailJson, renderPrivateEmail } from "@/lib/private-email";
import { buildEmailHtmlDocument, emailFrameHeaders } from "@/lib/email-html-view";
import { fetchMailboxHandlers } from "@/lib/email-mailbox-settings";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const denied = await adminApiGuard("inbox.send");
  if (denied) return denied;
  try {
    const identity = await assertInboxAdmin(request);
    assertTrustedPublicJsonRequest(request);
    const input = privateEmailContentSchema.parse(await readPrivateEmailJson(request));
    assertMailboxAccess(identity, input.mailboxId, "send");
    const handlers = await fetchMailboxHandlers();
    return new Response(buildEmailHtmlDocument(await renderPrivateEmail(input, handlers[input.mailboxId])), { headers: emailFrameHeaders(false) });
  } catch (error) { return inboxRouteError(error); }
}
