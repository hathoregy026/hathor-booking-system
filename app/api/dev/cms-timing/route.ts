import { NextResponse } from "next/server";
import { performance } from "node:perf_hooks";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { getHomepageAccordionCruisesSafe } from "@/lib/homepage-accordion-cruises";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "dev only" }, { status: 404 });
  }

  const t0 = performance.now();
  try {
    const cms = await loadPublicCmsBundle();
    const tCms = performance.now();
    const cruises = await getHomepageAccordionCruisesSafe();
    const tCruises = performance.now();
    return NextResponse.json({
      ok: true,
      cmsMs: Math.round(tCms - t0),
      cruisesMs: Math.round(tCruises - tCms),
      totalMs: Math.round(tCruises - t0),
      imageKeys: Object.keys(cms.siteImages).length,
      cruiseCount: cruises.length,
      hasTypography: Boolean(cms.typography),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        totalMs: Math.round(performance.now() - t0),
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
