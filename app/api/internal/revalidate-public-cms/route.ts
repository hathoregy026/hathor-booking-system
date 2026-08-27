import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import {
  PUBLIC_CMS_CACHE_TAG,
} from "@/lib/public-cms-bundle";
import {
  ensureSiteImagePublicMap,
  rebuildSiteImagePublicMap,
} from "@/lib/site-image-public-map";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Secured post-deploy CMS initialization.
 * Auth: Authorization: Bearer <CRON_SECRET> OR x-cron-secret header.
 *
 * Ensures site-image-public-map-v2 exists, then invalidates public-cms.
 * Does not expose diagnostics or credentials.
 */
function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const bearer = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");
  const provided =
    (bearer?.toLowerCase().startsWith("bearer ")
      ? bearer.slice(7).trim()
      : null) || headerSecret?.trim() || "";

  if (!provided) return false;

  try {
    const a = Buffer.from(provided);
    const b = Buffer.from(secret);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      forceRebuildMap?: boolean;
    };

    let mapAction: "ensured" | "rebuilt" | "present" = "ensured";
    if (body.forceRebuildMap) {
      await rebuildSiteImagePublicMap();
      mapAction = "rebuilt";
    } else {
      const result = await ensureSiteImagePublicMap();
      mapAction = result.created ? "ensured" : "present";
    }

    revalidateTag(PUBLIC_CMS_CACHE_TAG, "max");
    revalidatePath("/", "layout");
    for (const path of ["/", "/cruises-list", "/rooms"] as const) {
      revalidatePath(path);
    }

    return NextResponse.json({
      ok: true,
      mapAction,
      cacheTag: PUBLIC_CMS_CACHE_TAG,
    });
  } catch (error) {
    console.error("[internal/revalidate-public-cms]", error instanceof Error ? error.name : "error");
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
