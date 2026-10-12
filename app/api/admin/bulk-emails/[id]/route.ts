import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bulkHeaders, bulkRouteError, readBulkJson, requireBulkAdmin } from "@/lib/bulk-email-api";
import { cancelBulkCampaign, campaignView, deleteBulkCampaign, getBulkCampaign, processBulkCampaign } from "@/lib/bulk-email-service";
export const runtime = "nodejs";
export const maxDuration = 30;
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
