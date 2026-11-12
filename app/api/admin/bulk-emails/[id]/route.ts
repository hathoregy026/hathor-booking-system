import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bulkHeaders, bulkRouteError, readBulkJson, requireBulkAdmin } from "@/lib/bulk-email-api";
import { cancelBulkCampaign, campaignView, deleteBulkCampaign, getBulkCampaign, processBulkCampaign } from "@/lib/bulk-email-service";
export const runtime = "nodejs";
// Up to three Resend batch requests for a 300-recipient campaign. Must stay
// below the 60-second send lease in processBulkCampaign, so a second request
// can never send while this one is still running.
export const maxDuration = 55;
type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, context: Context) {
  try { await requireBulkAdmin(request); return NextResponse.json({ campaign: campaignView(await getBulkCampaign((await context.params).id)) }, { headers: bulkHeaders }); }
  catch (error) { return bulkRouteError(error); }
}
export async function POST(request: NextRequest, context: Context) {
  try { await requireBulkAdmin(request, "send"); const body = z.object({ action: z.enum(["send", "cancel"]) }).strict().parse(await readBulkJson(request)); const id = (await context.params).id; const campaign = body.action === "send" ? await processBulkCampaign(id) : await cancelBulkCampaign(id); return NextResponse.json({ campaign: campaignView(campaign) }, { headers: bulkHeaders }); }
  catch (error) { return bulkRouteError(error); }
}
export async function DELETE(request: NextRequest, context: Context) {
  try {
    await requireBulkAdmin(request, "delete");
    await deleteBulkCampaign((await context.params).id);
    return NextResponse.json({ deleted: true }, { headers: bulkHeaders });
  } catch (error) { return bulkRouteError(error); }
}
