import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BULK_UPLOAD_LIMIT } from "@/lib/bulk-email-types";
import { bulkHeaders, bulkRouteError, readBulkBody, readBulkJson, requireBulkAdmin } from "@/lib/bulk-email-api";
import { importBulkRecipients } from "@/lib/bulk-email-import";
import { extractBulkRecipients } from "@/lib/bulk-email-validation";
import { PublicRequestError } from "@/lib/public-api-security";
export const runtime = "nodejs";
export const maxDuration = 30;
export async function POST(request: NextRequest) {
  try {
    await requireBulkAdmin(request, "import");
    if (request.headers.get("content-type")?.startsWith("application/json")) {
      const body = z.object({ text: z.string().max(20000) }).strict().parse(await readBulkJson(request));
      return NextResponse.json(extractBulkRecipients([body.text]), { headers: bulkHeaders });
    }
    if (!request.headers.get("content-type")?.startsWith("multipart/form-data;")) throw new PublicRequestError("Upload a recipient file.", 415);
    const bytes = await readBulkBody(request, BULK_UPLOAD_LIMIT + 16 * 1024);
    const bounded = new Request(request.url, { method: "POST", headers: { "Content-Type": request.headers.get("content-type")! }, body: Buffer.from(bytes) });
    const form = await bounded.formData();
    const file = form.get("file");
    if (!(file instanceof File) || [...form.keys()].length !== 1) throw new PublicRequestError("Upload one recipient file at a time.", 400);
    return NextResponse.json(await importBulkRecipients(file), { headers: bulkHeaders });
  } catch (error) { return bulkRouteError(error); }
}
