import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import {
  createSiteImage,
  listSiteImages,
  parseSiteImageInput,
} from "@/lib/image-management";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const pagePath = request.nextUrl.searchParams.get("pagePath") ?? undefined;
    const images = await listSiteImages(pagePath || undefined);
    return NextResponse.json({ images });
  } catch (error) {
    console.error("[admin.images.GET]", error);
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = parseSiteImageInput(body);
    const image = await createSiteImage(input);
    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
