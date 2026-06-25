import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/api";
import { logDbError, withDb } from "@/lib/db-safe";
import { isEmailImageDataUrl } from "@/lib/email-image-shared";
import { urlToEmailImageDataUrl } from "@/lib/email-image-data.server";
import {
  getDefaultEmailTemplates,
  isEmailTemplateName,
  mergeAllEmailTemplates,
} from "@/lib/email-templates";
import { toAbsolutePublicUrl } from "@/lib/public-url";
import { prisma } from "@/lib/prisma";

function normalizeOptionalImageUrl(
  url: string | null | undefined,
): string | null {
  return toAbsolutePublicUrl(url?.trim() || null);
}

function normalizeOptionalDataUrl(
  dataUrl: string | null | undefined,
): string | null {
  if (!isEmailImageDataUrl(dataUrl)) return null;
  return dataUrl!.trim();
}

async function resolveStoredImagePair(input: {
  url: string | null | undefined;
  dataUrl: string | null | undefined;
}): Promise<{ url: string | null; dataUrl: string | null }> {
  const url = normalizeOptionalImageUrl(input.url);
  let dataUrl = normalizeOptionalDataUrl(input.dataUrl);

  if (!dataUrl && url) {
    dataUrl = await urlToEmailImageDataUrl(url);
  }

  return { url, dataUrl };
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
      logoDataUrl?: string | null;
      heroImageUrl?: string | null;
      heroImageDataUrl?: string | null;
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

    const logo = await resolveStoredImagePair({
      url: body.logoUrl,
      dataUrl: body.logoDataUrl,
    });
    const hero = await resolveStoredImagePair({
      url: body.heroImageUrl,
      dataUrl: body.heroImageDataUrl,
    });

    const template = await withDb(() =>
      prisma.emailTemplate.upsert({
        where: { name },
        create: {
          name,
          subject,
          logoUrl: logo.url,
          logoDataUrl: logo.dataUrl,
          heroImageUrl: hero.url,
          heroImageDataUrl: hero.dataUrl,
          primaryColor: body.primaryColor?.trim() || "#C9A96E",
          backgroundColor: body.backgroundColor?.trim() || "#FAF8F5",
          heroHeading: body.heroHeading?.trim() || null,
          bodyText: body.bodyText?.trim() || null,
        },
        update: {
          subject,
          logoUrl: logo.url,
          logoDataUrl: logo.dataUrl,
          heroImageUrl: hero.url,
          heroImageDataUrl: hero.dataUrl,
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
        logoDataUrl: template.logoDataUrl,
        heroImageUrl: template.heroImageUrl,
        heroImageDataUrl: template.heroImageDataUrl,
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
