import { NextRequest, NextResponse } from "next/server";
import { bulkHeaders, bulkRouteError, readBulkJson, requireBulkAdmin } from "@/lib/bulk-email-api";
import { bulkMessageSchema } from "@/lib/bulk-email-validation";
import { bulkBranding, renderBulkMessage } from "@/lib/bulk-email-render";
import { isolateBulkPreview } from "@/lib/bulk-email-preview";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    await requireBulkAdmin(request, "preview");
    const body = bulkMessageSchema.parse(await readBulkJson(request));
    const origin = new URL(request.headers.get("origin")!).origin;
    const theme = await bulkBranding();
    const rendered = await renderBulkMessage(body.subject, body.message, theme, "https://www.hathorcruise.com/bulk-email/unsubscribe", body.template);
    rendered.html = isolateBulkPreview(rendered.html, origin);
    return NextResponse.json(rendered, { headers: bulkHeaders });
  }
  catch (error) { return bulkRouteError(error); }
}
