import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/api";
import { logDbError, withDb } from "@/lib/db-safe";
import {
  getDefaultEmailTemplates,
  isEmailTemplateName,
  mergeAllEmailTemplates,
} from "@/lib/email-templates";
import { pickReliableEmailImageUrl } from "@/lib/email-branding-shared";
import { prisma } from "@/lib/prisma";

function normalizeOptionalImageUrl(
  url: string | null | undefined,
): string | null {
  return pickReliableEmailImageUrl(url);
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const rows = await withDb(() =>
      prisma.emailTemplate.findMany({ orderBy: { name: "asc" } }),
    );

    return NextResponse.json({
      templates: mergeAllEmailTemplates(rows),
    });
  } catch (error) {
    logDbError("admin.email-templates.GET", error);
    return NextResponse.json(
      {
        error: "Could not load email templates.",
        templates: getDefaultEmailTemplates(),
      },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      subject?: string;
      logoUrl?: string | null;
      heroImageUrl?: string | null;
      primaryColor?: string;
      backgroundColor?: string;
      heroHeading?: string | null;
      bodyText?: string | null;
    };

    if (!body.name || !isEmailTemplateName(body.name)) {
      return jsonError("Invalid template name", 400);
    }

    if (!body.subject?.trim()) {
      return jsonError("Subject is required", 400);
    }

    const subject = body.subject.trim();
    const name = body.name;
    const logoUrl = normalizeOptionalImageUrl(body.logoUrl);
    const heroImageUrl = normalizeOptionalImageUrl(body.heroImageUrl);

    const template = await withDb(() =>
      prisma.emailTemplate.upsert({
        where: { name },
        create: {
          name,
          subject,
          logoUrl,
          heroImageUrl,
          primaryColor: body.primaryColor?.trim() || "#C9A96E",
          backgroundColor: body.backgroundColor?.trim() || "#FAF8F5",
          heroHeading: body.heroHeading?.trim() || null,
          bodyText: body.bodyText?.trim() || null,
        },
        update: {
          subject,
          logoUrl,
          heroImageUrl,
          primaryColor: body.primaryColor?.trim() || "#C9A96E",
          backgroundColor: body.backgroundColor?.trim() || "#FAF8F5",
          heroHeading: body.heroHeading?.trim() || null,
          bodyText: body.bodyText?.trim() || null,
        },
      }),
    );

    return NextResponse.json({
      template: {
        id: template.id,
        name: template.name,
        subject: template.subject,
        logoUrl: template.logoUrl,
        heroImageUrl: template.heroImageUrl,
        primaryColor: template.primaryColor,
        backgroundColor: template.backgroundColor,
        heroHeading: template.heroHeading,
        bodyText: template.bodyText,
        updatedAt: template.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
