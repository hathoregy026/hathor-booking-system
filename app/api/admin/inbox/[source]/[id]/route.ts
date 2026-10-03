import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteDashboardEmail, fetchInboxDetail, inboxIdentitySchema, setInboxRead } from "@/lib/dashboard-inbox";
import { assertInboxAdmin, inboxHeaders, inboxRouteError } from "@/lib/inbox-api";
import { assertTrustedPublicJsonRequest, readPublicJsonBody } from "@/lib/public-api-security";

type Context = { params: Promise<{ source: string; id: string }> };

export async function GET(request: NextRequest, context: Context) {
  try {
    await assertInboxAdmin(request);
    const { source, id } = inboxIdentitySchema.parse(await context.params);
    const message = await fetchInboxDetail(source, id);
    return NextResponse.json(message ? { message } : { error: "Not found" }, { status: message ? 200 : 404, headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    await assertInboxAdmin(request);
    assertTrustedPublicJsonRequest(request);
    const { source, id } = inboxIdentitySchema.parse(await context.params);
    const { read } = z.object({ read: z.boolean() }).strict().parse(await readPublicJsonBody(request));
    const updated = await setInboxRead(source, id, read);
    return NextResponse.json(updated ? { updated } : { error: "Not found" }, { status: updated ? 200 : 404, headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    await assertInboxAdmin(request);
    assertTrustedPublicJsonRequest(request);
    z.object({ confirm: z.literal(true) }).strict().parse(await readPublicJsonBody(request));
    const { source, id } = inboxIdentitySchema.parse(await context.params);
    const deleted = await deleteDashboardEmail(source, id);
    return NextResponse.json(deleted ? { deleted } : { error: "Not found" }, { status: deleted ? 200 : 404, headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}
