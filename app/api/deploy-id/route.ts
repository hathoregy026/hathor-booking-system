import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function resolveDeployId(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
  if (sha) return sha.slice(0, 12);
  const deployment = process.env.VERCEL_DEPLOYMENT_ID?.trim();
  if (deployment) return deployment.slice(0, 12);
  return "dev";
}

/**
 * Live deploy fingerprint. Stale tabs compare their embedded id to this
 * and hard-reload when production has moved on.
 */
export async function GET(request: NextRequest) {
  const id = resolveDeployId();
  const pageId = request.headers.get("x-hathor-page-deploy")?.trim() || "";
  const stale = Boolean(pageId && pageId !== "dev" && id !== "dev" && pageId !== id);

  const response = NextResponse.json(
    { id, stale, ok: true },
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
    response.headers.set("Clear-Site-Data", '"cache"');
  }

  return response;
}
