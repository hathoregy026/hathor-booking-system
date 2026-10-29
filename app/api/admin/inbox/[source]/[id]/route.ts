import { allowedMailboxIds } from "@/lib/admin-mailbox-access";
import { adminApiGuard } from "@/lib/admin-server-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteDashboardEmail, fetchInboxDetail, inboxIdentitySchema, inboxMutationSchema, setInboxRead, setInboxFolder } from "@/lib/dashboard-inbox";
import { assertInboxAdmin, inboxHeaders, inboxRouteError } from "@/lib/inbox-api";
import { assertTrustedPublicJsonRequest, readPublicJsonBody } from "@/lib/public-api-security";

type Context = { params: Promise<{ source: string; id: string }> };

export async function GET(request: NextRequest, context: Context) {
  const denied = await adminApiGuard("inbox.view");
  if (denied) return denied;
  try {
    const identity = await assertInboxAdmin(request);
    const allowed = allowedMailboxIds(identity);
    const { source, id } = inboxIdentitySchema.parse(await context.params);
    const message = await fetchInboxDetail(source, id, undefined, allowed);
    return NextResponse.json(message ? { message } : { error: "Not found" }, { status: message ? 200 : 404, headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}

export async function PATCH(request: NextRequest, context: Context) {
  const denied = await adminApiGuard("inbox.manage");
  if (denied) return denied;
  try {
    const identity = await assertInboxAdmin(request);
    const allowed = allowedMailboxIds(identity);
    assertTrustedPublicJsonRequest(request);
    const { source, id } = inboxIdentitySchema.parse(await context.params);
    const mutation = inboxMutationSchema.parse(await readPublicJsonBody(request));
    const updated = "read" in mutation ? await setInboxRead(source, id, mutation.read, undefined, allowed) : await setInboxFolder(source, id, mutation.folder, undefined, allowed);
    return NextResponse.json(updated ? { updated } : { error: "Not found" }, { status: updated ? 200 : 404, headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}

export async function DELETE(request: NextRequest, context: Context) {
  const denied = await adminApiGuard("inbox.manage");
  if (denied) return denied;
  try {
    const identity = await assertInboxAdmin(request);
    const allowed = allowedMailboxIds(identity);
    assertTrustedPublicJsonRequest(request);
    z.object({ confirm: z.literal(true) }).strict().parse(await readPublicJsonBody(request));
    const { source, id } = inboxIdentitySchema.parse(await context.params);
    const deleted = await deleteDashboardEmail(source, id, undefined, allowed);
    return NextResponse.json(deleted ? { deleted } : { error: "Not found" }, { status: deleted ? 200 : 404, headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}
