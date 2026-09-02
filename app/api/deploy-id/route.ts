import { NextRequest, NextResponse } from "next/server";
import { resolveDeployId } from "@/lib/deploy-id";
import { getProductionOrigin } from "@/lib/public-url";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/**
 * Live deploy fingerprint. Stale tabs compare their embedded id to this
 * and hard-reload when production has moved on.
 */
export async function GET(request: NextRequest) {
  const id = resolveDeployId();
  const pageId = request.headers.get("x-hathor-page-deploy")?.trim() || "";
  const stale = Boolean(pageId && pageId !== "dev" && id !== "dev" && pageId !== id);
  const productionUrl = (() => {
    const canonical = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
    if (canonical) {
      return canonical.startsWith("http")
        ? canonical.replace(/\/$/, "")
        : `https://${canonical.replace(/\/$/, "")}`;
    }
    return getProductionOrigin();
  })();

  const response = NextResponse.json(
    {
      id,
      stale,
      ok: true,
      productionUrl,
      gitSha: process.env.VERCEL_GIT_COMMIT_SHA?.trim() || null,
      vercelEnv: process.env.VERCEL_ENV?.trim() || null,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
        "Cloudflare-CDN-Cache-Control": "no-store",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );

  /* Wipe HTTP cache for this origin so the next navigation cannot reuse old HTML/JS. */
  if (stale) {
    response.headers.set("Clear-Site-Data", '"cache", "storage"');
  }

  return response;
}
