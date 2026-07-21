import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import {
  deleteSiteImage,
  parseSiteImageUpdate,
  updateSiteImage,
} from "@/lib/image-management";
import { prisma } from "@/lib/prisma";
import { revalidateSiteImagePages } from "@/lib/revalidate-site-images";

type RouteContext = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const input = parseSiteImageUpdate(body);
    const image = await updateSiteImage(id, input);
    revalidateSiteImagePages(image.name ? [image.name] : undefined);
    return NextResponse.json({ image });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await prisma.siteImage.findUnique({ where: { id } });
    await deleteSiteImage(id);
    revalidateSiteImagePages(existing?.name ? [existing.name] : undefined);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { displayOrder?: number };
    const displayOrder = body.displayOrder;

    if (typeof displayOrder !== "number" || displayOrder < 0) {
      return NextResponse.json({ error: "Invalid display order" }, { status: 400 });
    }

    const image = await prisma.siteImage.update({
      where: { id },
      data: { displayOrder },
    });

    return NextResponse.json({ image });
  } catch (error) {
    return handleRouteError(error);
  }
}
