import { NextRequest, NextResponse } from "next/server";
import { bulkHeaders, bulkRouteError, requireBulkAdmin } from "@/lib/bulk-email-api";
import { getBulkCampaign } from "@/lib/bulk-email-service";
import { bulkBranding, renderBulkMessage } from "@/lib/bulk-email-render";
import { isolateBulkPreview } from "@/lib/bulk-email-preview";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function POST(request: NextRequest, context: Context) {
  try {
    await requireBulkAdmin(request, "preview");
    const campaign = await getBulkCampaign((await context.params).id);
    // Prefer the frozen template, even if branding has changed since sending.
    let html = campaign.previewHtml || campaign.payload[0]?.html;
    if (!html) html = (await renderBulkMessage(campaign.subject, campaign.message, await bulkBranding(), "https://www.hathorcruise.com/bulk-email/unsubscribe", campaign.template)).html;
    const personalLink = campaign.payload[0]?.headers["List-Unsubscribe"];
    if (personalLink) html = html.replaceAll(personalLink.slice(1, -1), "https://www.hathorcruise.com/bulk-email/unsubscribe");
    return NextResponse.json({ html: isolateBulkPreview(html, new URL(request.headers.get("origin")!).origin) }, { headers: bulkHeaders });
  } catch (error) { return bulkRouteError(error); }
}
