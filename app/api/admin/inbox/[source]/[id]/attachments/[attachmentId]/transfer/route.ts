import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminApiGuard } from "@/lib/admin-server-auth";
import { allowedMailboxIds } from "@/lib/admin-mailbox-access";
import { assertInboxAdmin, inboxHeaders, inboxRouteError } from "@/lib/inbox-api";
import { enforcePublicRateLimit } from "@/lib/public-api-security";
import { readAttachmentMutationJson } from "@/lib/attachment-transfer-security";
import { attachmentRemovalSchema, attachmentTransferIdentitySchema, prepareAttachmentTransfer, removeTransferredAttachment } from "@/lib/incoming-attachment-transfer";
export const runtime = "nodejs";
type Context = { params: Promise<{ source: string; id: string; attachmentId: string }> };
async function authorize(request: NextRequest) {
  const employee = await assertInboxAdmin(request);
  await enforcePublicRateLimit({ request, scope: "incoming-attachment-transfer", limit: 30, windowMs: 60000 });
  return { sessionId: employee.sessionId, mailboxIds: allowedMailboxIds(employee) };
}
export async function POST(request: NextRequest, context: Context) {
  const denied = await adminApiGuard("inbox.manage");
  if (denied) return denied;
  try {
    const access = await authorize(request);
    const identity = attachmentTransferIdentitySchema.parse(await context.params);
    z.object({}).strict().parse(await readAttachmentMutationJson(request));
    return await prepareAttachmentTransfer(identity, access);
  } catch (error) { return inboxRouteError(error); }
}
export async function DELETE(request: NextRequest, context: Context) {
  const denied = await adminApiGuard("inbox.manage");
  if (denied) return denied;
  try {
    const access = await authorize(request);
    const identity = attachmentTransferIdentitySchema.parse(await context.params);
    const confirmation = attachmentRemovalSchema.parse(await readAttachmentMutationJson(request));
    await removeTransferredAttachment(identity, access, confirmation);
    return NextResponse.json({ removed: true, resendDeleted: false }, { headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}
