import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ContentSection } from "@/app/generated/prisma/enums";
import { handleRouteError } from "@/lib/api";
import { logDbError, withDb } from "@/lib/db-safe";
import { prisma } from "@/lib/prisma";
import { adminSiteContentSelect } from "@/lib/query-selects";
import { SITE_CONTENT_SECTIONS } from "@/lib/site-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ContentPayload = {
  section: ContentSection;
  title: string;
  subtitle?: string | null;
  bodyText?: string | null;
  imageUrl?: string | null;
};

export async function GET() {
  try {
    const content = await withDb(() =>
      prisma.siteContent.findMany({
        where: {
          section: { in: SITE_CONTENT_SECTIONS },
        },
        orderBy: { section: "asc" },
        select: adminSiteContentSelect,
      }),
    );

    return NextResponse.json({ content });
  } catch (error) {
    logDbError("admin.content.GET", error);
    return NextResponse.json(
      { error: "Could not load website content.", content: [] },
      { status: 503 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      sections?: ContentPayload[];
    };

    if (!body.sections?.length) {
      return NextResponse.json(
        { error: "At least one section is required" },
        { status: 400 },
      );
    }

    const updates = await prisma.$transaction(
      body.sections.map((section) =>
        prisma.siteContent.upsert({
          where: { section: section.section },
          create: {
            section: section.section,
            title: section.title,
            subtitle: section.subtitle ?? null,
            bodyText: section.bodyText ?? null,
            imageUrl: section.imageUrl ?? null,
          },
          update: {
            title: section.title,
            subtitle: section.subtitle ?? null,
            bodyText: section.bodyText ?? null,
            imageUrl: section.imageUrl ?? null,
          },
          select: adminSiteContentSelect,
        }),
      ),
    );

    revalidatePath("/", "layout");
    return NextResponse.json({ content: updates });
  } catch (error) {
    return handleRouteError(error);
  }
}
