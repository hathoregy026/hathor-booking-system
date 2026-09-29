import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { adminApiGuard } from "@/lib/admin-server-auth";
import {
  getEmailHeroFrameState,
  saveEmailHeroFrame,
} from "@/lib/email-hero-frame-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — the original to frame and its saved frame. */
export async function GET() {
  const denied = await adminApiGuard();
  if (denied) return denied;

  try {
    return NextResponse.json(await getEmailHeroFrameState());
  } catch (error) {
    return handleRouteError(error);
  }
}

/** POST { x, y, zoom } — render and apply the framed banner to every email. */
export async function POST(request: NextRequest) {
  const denied = await adminApiGuard();
  if (denied) return denied;

  try {
    const body = (await request.json()) as { frame?: unknown };
    const { heroUrl } = await saveEmailHeroFrame(body.frame);
    return NextResponse.json({ ok: true, heroUrl });
  } catch (error) {
    return handleRouteError(error);
  }
}
