import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertInboxAdmin, inboxHeaders, inboxRouteError } from "@/lib/inbox-api";
import { createAttachmentUpload, privateEmailAttachmentScope } from "@/lib/mail-attachments";
import { assertTrustedPublicJsonRequest, enforcePublicRateLimit } from "@/lib/public-api-security";
import { readPrivateEmailJson } from "@/lib/private-email";

export const runtime = "nodejs";

const uploadSchema = z.object({ draftId: z.uuid(), name: z.string().trim().min(1).max(255), size: z.number().int().positive() }).strict();

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await assertInboxAdmin(request);
    assertTrustedPublicJsonRequest(request);
    await enforcePublicRateLimit({ request, scope: `private-attachment-upload-${sessionId}`, limit: 30, windowMs: 60000 });
    const { draftId, ...file } = uploadSchema.parse(await readPrivateEmailJson(request));
    return NextResponse.json(await createAttachmentUpload(privateEmailAttachmentScope(sessionId, draftId), file), { headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}
