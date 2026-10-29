import { NextRequest, NextResponse } from "next/server";
import { bulkHeaders, bulkRouteError, readBulkJson, requireBulkAdmin } from "@/lib/bulk-email-api";
import { bulkHistory, bulkSettings, campaignView, createBulkCampaign } from "@/lib/bulk-email-service";
import { bulkBranding, bulkTemplateDefaults } from "@/lib/bulk-email-render";
import { standardBulkBannerPreviewUrl } from "@/lib/bulk-email-images";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  let stage = "authorization";
  try {
    await requireBulkAdmin(request);
    stage = "history";
    const [campaigns, theme] = await Promise.all([bulkHistory(), bulkBranding()]);
    stage = "settings";
    return NextResponse.json({ settings: bulkSettings(), campaigns, template: bulkTemplateDefaults(theme), standardBannerUrl: standardBulkBannerPreviewUrl(theme.heroImageUrl) }, { headers: bulkHeaders });
  } catch (error) {
    const response = bulkRouteError(error);
    if (response.status >= 500) console.error("[bulk-email] overview failed", { stage });
    return response;
  }
}
export async function POST(request: NextRequest) {
  try { const session = await requireBulkAdmin(request, "create"); const campaign = await createBulkCampaign(await readBulkJson(request), session, request.headers.get("origin")!); return NextResponse.json({ campaign: campaignView(campaign) }, { headers: bulkHeaders }); }
  catch (error) { return bulkRouteError(error); }
}
