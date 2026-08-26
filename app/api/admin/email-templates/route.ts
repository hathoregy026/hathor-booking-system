import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/api";
import { logDbError, withDb } from "@/lib/db-safe";
import { pickReliableEmailImageUrl } from "@/lib/email-branding-shared";
import { HATHOR_EMAIL_LOGO_URL } from "@/lib/email-branding-urls";
import {
  EMAIL_TEMPLATE_NAMES,
  getDefaultEmailTemplate,
  getDefaultEmailTemplates,
  isEmailTemplateName,
  mergeAllEmailTemplates,
  type EmailTemplateName,
} from "@/lib/email-templates";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function resolvePersistedImageUrl(
  incoming: string | null | undefined,
  previous: string | null | undefined,
  fallback: string,
): string {
  return (
    pickReliableEmailImageUrl(incoming, previous, fallback) ?? fallback
  );
}

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

/** Save shared branding + all template copy in one request. */
export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      shared?: {
        logoUrl?: string | null;
        heroImageUrl?: string | null;
        primaryColor?: string;
        backgroundColor?: string;
      };
      templates?: Array<{
        name?: string;
        subject?: string;
        heroHeading?: string | null;
        bodyText?: string | null;
      }>;
    };

    const shared = body.shared ?? {};
    const primaryColor = shared.primaryColor?.trim() || "#b69f64";
    const backgroundColor = shared.backgroundColor?.trim() || "#ece4da";

    const incoming = body.templates ?? [];
    if (!incoming.length) {
      return jsonError("templates array is required", 400);
    }

    await withDb(async () => {
      const existingRows = await prisma.emailTemplate.findMany();

      for (const name of EMAIL_TEMPLATE_NAMES) {
        const patch = incoming.find((entry) => entry.name === name);
        const defaults = getDefaultEmailTemplate(name);
        const existing = existingRows.find((row) => row.name === name);

        const logoUrl = HATHOR_EMAIL_LOGO_URL;
        const heroImageUrl = resolvePersistedImageUrl(
          shared.heroImageUrl,
          existing?.heroImageUrl,
          defaults.heroImageUrl ?? "",
        );

        if (!patch) {
          await prisma.emailTemplate.upsert({
            where: { name },
            create: {
              name,
              subject: defaults.subject,
              logoUrl,
              heroImageUrl,
              primaryColor,
              backgroundColor,
              heroHeading: defaults.heroHeading,
              bodyText: defaults.bodyText,
            },
            update: { logoUrl, heroImageUrl, primaryColor, backgroundColor },
          });
          continue;
        }

        if (!isEmailTemplateName(patch.name ?? "")) {
          throw new Error(`Invalid template name: ${patch.name}`);
        }

        const subject = patch.subject?.trim();
        if (!subject) {
          throw new Error(`Subject is required for ${name}`);
        }

        await prisma.emailTemplate.upsert({
          where: { name },
          create: {
            name,
            subject,
            logoUrl,
            heroImageUrl,
            primaryColor,
            backgroundColor,
            heroHeading: patch.heroHeading?.trim() || null,
            bodyText: patch.bodyText?.trim() || null,
          },
          update: {
            subject,
            logoUrl,
            heroImageUrl,
            primaryColor,
            backgroundColor,
            heroHeading: patch.heroHeading?.trim() || null,
            bodyText: patch.bodyText?.trim() || null,
          },
        });
      }
    });

    const rows = await withDb(() =>
      prisma.emailTemplate.findMany({ orderBy: { name: "asc" } }),
    );

    return NextResponse.json({
      templates: mergeAllEmailTemplates(rows),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("required")) {
      return jsonError(error.message, 400);
    }
    return handleRouteError(error);
  }
}

/** @deprecated Use PUT to save all templates at once. */
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

    return PUT(
      new NextRequest(request.url, {
        method: "PUT",
        headers: request.headers,
        body: JSON.stringify({
          shared: {
            logoUrl: body.logoUrl,
            heroImageUrl: body.heroImageUrl,
            primaryColor: body.primaryColor,
            backgroundColor: body.backgroundColor,
          },
          templates: EMAIL_TEMPLATE_NAMES.map((name) =>
            name === body.name
              ? {
                  name,
                  subject: body.subject,
                  heroHeading: body.heroHeading,
                  bodyText: body.bodyText,
                }
              : {
                  name,
                  subject: getDefaultEmailTemplate(name).subject,
                  heroHeading: getDefaultEmailTemplate(name).heroHeading,
                  bodyText: getDefaultEmailTemplate(name).bodyText,
                },
          ),
        }),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
